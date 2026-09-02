/* eslint-disable no-console */
// ===================================================================
// Aerovista — Cloudinary → self-hosted uploads migration
//
// পুরোনো সব ছবি/ভিডিও Cloudinary থেকে নামিয়ে নিজের UPLOAD_DIR-এ রাখে,
// আর DB-র সব res.cloudinary.com লিংক relative path (/uploads/...) দিয়ে
// বদলে দেয়।
//
// ফিল্ডের নাম হার্ডকোড করা হয়নি — প্রতিটা collection-এর প্রতিটা document
// পুরোটা ঘুরে যেকোনো জায়গায় থাকা Cloudinary URL ধরা হয়। ফলে blog.content
// এর HTML-এর ভেতরে <img src="..."> বা nested array/object-ও বাদ যায় না।
//
// চালানোর নিয়ম (backend ফোল্ডার থেকে):
//   node migrate-cloudinary-to-local.js --dry-run   # কী বদলাবে শুধু দেখায়
//   node migrate-cloudinary-to-local.js             # সত্যিকারে বদলায়
//
// DATABASE_URL আর UPLOAD_DIR .env থেকে নেয়। প্রোডাকশনের ডেটা মাইগ্রেট করতে
// হলে প্রোডাকশন DATABASE_URL + আসল volume path দিয়ে চালাতে হবে।
//
// স্ক্রিপ্টটা বারবার চালানো নিরাপদ: যে URL আগেই বদলে গেছে সেটা আর
// Cloudinary URL নয়, তাই দ্বিতীয়বার সে ধরা পড়বে না। একই ছবি দুবার
// নামানোও হয় না — manifest ফাইলে ম্যাপিং জমা থাকে।
// ===================================================================

const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
require('dotenv').config();

const DRY_RUN = process.argv.includes('--dry-run');

const DATABASE_URL = process.env.DATABASE_URL;
const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'));
const PUBLIC_PATH = '/uploads';
const TARGET_FOLDER = 'migrated';

// একই ছবি একাধিক document-এ থাকতে পারে — এই ম্যাপ রাখলে দ্বিতীয়বার আর
// ডাউনলোড হয় না, এবং স্ক্রিপ্ট মাঝপথে থামলে পরেরবার কাজে লাগে।
const MANIFEST_PATH = path.join(UPLOAD_DIR, '.migration-manifest.json');

const CLOUDINARY_URL_RE = /https?:\/\/res\.cloudinary\.com\/[^\s"'<>)\\]+/gi;

const stats = { docsUpdated: 0, urlsFound: 0, downloaded: 0, reused: 0, failed: 0 };
const failures = [];

// ==================== helpers ====================

const loadManifest = async () => {
    try {
        return JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf8'));
    } catch {
        return {};
    }
};

const saveManifest = async (manifest) => {
    if (DRY_RUN) return;
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
};

const buildFilename = (cloudinaryUrl) => {
    const pathname = new URL(cloudinaryUrl).pathname;
    const raw = path.basename(pathname);
    const ext = path.extname(raw) || '.jpg';
    const base =
        raw
            .replace(/\.[^.]+$/, '')
            .replace(/[^a-zA-Z0-9_-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .slice(0, 40)
            .toLowerCase() || 'file';

    // URL-এর hash যোগ করা হয় যাতে দুটো আলাদা ছবির নাম এক হয়ে একটা আরেকটাকে
    // চাপা না দেয় (Cloudinary-তে আলাদা ফোল্ডারে একই নাম থাকতে পারে)।
    const hash = crypto.createHash('sha1').update(cloudinaryUrl).digest('hex').slice(0, 8);
    return `${base}-${hash}${ext}`;
};

const downloadToDisk = async (cloudinaryUrl, manifest) => {
    if (manifest[cloudinaryUrl]) {
        stats.reused++;
        return manifest[cloudinaryUrl];
    }

    const filename = buildFilename(cloudinaryUrl);
    const relUrl = `${PUBLIC_PATH}/${TARGET_FOLDER}/${filename}`;

    if (DRY_RUN) {
        manifest[cloudinaryUrl] = relUrl;
        return relUrl;
    }

    const res = await fetch(cloudinaryUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

    const buffer = Buffer.from(await res.arrayBuffer());
    const dir = path.join(UPLOAD_DIR, TARGET_FOLDER);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, filename), buffer);

    stats.downloaded++;
    manifest[cloudinaryUrl] = relUrl;
    return relUrl;
};

/**
 * যেকোনো value (string / array / object) গভীরে ঘুরে Cloudinary URL বদলায়।
 * বদল হলে { changed: true, value } ফেরত দেয়।
 */
const walkAndReplace = async (value, manifest) => {
    if (typeof value === 'string') {
        const matches = value.match(CLOUDINARY_URL_RE);
        if (!matches) return { changed: false, value };

        let out = value;
        let changed = false;

        for (const url of [...new Set(matches)]) {
            stats.urlsFound++;
            try {
                const local = await downloadToDisk(url, manifest);
                out = out.split(url).join(local);
                changed = true;
            } catch (err) {
                // একটা ছবি নামাতে না পারলে ওই URL-টা DB-তে অক্ষত রেখে দেওয়া হয়,
                // যাতে অন্তত ভাঙা লিংক না বসে। শেষে রিপোর্টে দেখানো হবে।
                stats.failed++;
                failures.push({ url, reason: err.message });
            }
        }

        return { changed, value: out };
    }

    if (Array.isArray(value)) {
        let changed = false;
        const out = [];
        for (const item of value) {
            const r = await walkAndReplace(item, manifest);
            changed = changed || r.changed;
            out.push(r.value);
        }
        return { changed, value: out };
    }

    if (value && typeof value === 'object' && value.constructor === Object) {
        let changed = false;
        const out = {};
        for (const [k, v] of Object.entries(value)) {
            const r = await walkAndReplace(v, manifest);
            changed = changed || r.changed;
            out[k] = r.value;
        }
        return { changed, value: out };
    }

    // number / Date / ObjectId / null — ছোঁয়ার দরকার নেই।
    return { changed: false, value };
};

// ==================== main ====================

const run = async () => {
    if (!DATABASE_URL) {
        console.error('❌ DATABASE_URL is not set (check your .env).');
        process.exit(1);
    }

    console.log(DRY_RUN ? '🔍 DRY RUN — কিছুই বদলাবে না\n' : '🚀 Migration শুরু\n');
    console.log(`   Upload dir : ${UPLOAD_DIR}`);

    await mongoose.connect(DATABASE_URL);
    const db = mongoose.connection.db;
    console.log(`   Database   : ${db.databaseName}\n`);

    const manifest = await loadManifest();
    const collections = await db.listCollections().toArray();

    for (const { name } of collections) {
        if (name.startsWith('system.')) continue;

        const collection = db.collection(name);
        // পুরো collection স্ক্যান করা হয়। সার্ভার-সাইডে ফিল্টার (যেমন $where) দিয়ে
        // ছাঁকা যেত, কিন্তু Atlas-এর shared/free ক্লাস্টারে server-side JavaScript
        // বন্ধ থাকে — আর এই আকারের ডেটায় পুরো স্ক্যানই যথেষ্ট দ্রুত।
        const cursor = collection.find({});

        let touched = 0;

        for await (const doc of cursor) {
            const { _id, ...rest } = doc;
            const { changed, value } = await walkAndReplace(rest, manifest);
            if (!changed) continue;

            if (!DRY_RUN) {
                await collection.updateOne({ _id }, { $set: value });
            }

            touched++;
            stats.docsUpdated++;
        }

        if (touched) console.log(`   ${name}: ${touched} document আপডেট হয়েছে`);
    }

    await saveManifest(manifest);
    await mongoose.disconnect();

    console.log('\n─────────── সারসংক্ষেপ ───────────');
    console.log(`   Document আপডেট      : ${stats.docsUpdated}`);
    console.log(`   URL পাওয়া গেছে      : ${stats.urlsFound}`);
    console.log(`   ফাইল ডাউনলোড        : ${stats.downloaded}`);
    console.log(`   আগেই ছিল (skip)     : ${stats.reused}`);
    console.log(`   ব্যর্থ               : ${stats.failed}`);

    if (failures.length) {
        console.log('\n⚠️  যেগুলো নামানো যায়নি (DB-তে পুরোনো URL অক্ষত আছে):');
        for (const f of failures.slice(0, 20)) console.log(`   - ${f.url}\n     ${f.reason}`);
        if (failures.length > 20) console.log(`   ... আরও ${failures.length - 20} টি`);
    }

    if (DRY_RUN) {
        console.log('\n👉 ঠিক মনে হলে --dry-run ছাড়া আবার চালান।');
    } else {
        console.log('\n✅ শেষ। Cloudinary অ্যাকাউন্ট বন্ধ করার আগে সাইটটা ঘুরে দেখে নিন।');
    }
};

run().catch(async (err) => {
    console.error('\n❌ Migration ব্যর্থ:', err);
    await mongoose.disconnect().catch(() => { });
    process.exit(1);
});
