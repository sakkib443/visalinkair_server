// ===================================================================
// Home content cleanup — hero is a picture slider only
// -------------------------------------------------------------------
// হিরো সেকশনে আগে badge text, heading, দুইটা বাটন আর WhatsApp message
// ফিল্ড ছিল — কিন্তু Hero কম্পোনেন্ট ওগুলোর একটাও কখনো render করেনি।
// এখন হিরোতে শুধু ব্যাকগ্রাউন্ড ছবির স্লাইডার (slides) আর স্লাইড
// ইন্টারভাল (slideSeconds) থাকে।
//
// এই script `homecontents` কালেকশনের hero ডকুমেন্ট থেকে বাকি key গুলো
// মুছে দেয় এবং slides-এর order ঠিক করে দেয়:
//
//   removed: badgeText, heading, ctaButton1Text, ctaButton1Link,
//            ctaButton2Text, ctaButton2Link, whatsappMessage,
//            videoUrl, isActive
//
// চালাতে:  node migrate-hero-slides-only.js [--dry-run]
// DATABASE_URL .env থেকে নেয়; না পেলে MIGRATE_DB_URL env var দিন।
// ===================================================================

require('dotenv').config();
const mongoose = require('mongoose');

const DRY = process.argv.includes('--dry-run');
const URI = process.env.DATABASE_URL || process.env.MIGRATE_DB_URL;

// hero.data-তে যা টিকে থাকে — এর বাইরের সব key বাদ।
const KEEP = new Set(['slides', 'slideSeconds']);

(async () => {
    if (!URI) {
        console.error('✖ DATABASE_URL not set (check .env or pass MIGRATE_DB_URL).');
        process.exit(1);
    }

    await mongoose.connect(URI);
    const col = mongoose.connection.db.collection('homecontents');

    const doc = await col.findOne({ section: 'hero' });
    if (!doc) {
        console.log('No hero document in homecontents — nothing to clean.');
        await mongoose.disconnect();
        process.exit(0);
    }

    const data = doc.data || {};
    const dropped = Object.keys(data).filter((k) => !KEEP.has(k));

    // slides: শুধু image + order, ফাঁকা row বাদ, order নতুন করে বসানো
    const slides = Array.isArray(data.slides)
        ? data.slides
            .filter((s) => s && s.image)
            .map((s, i) => ({ image: s.image, order: i }))
        : [];

    const seconds = Number(data.slideSeconds) > 0 ? Number(data.slideSeconds) : 4;
    const next = { slides, slideSeconds: seconds };

    console.log(`${DRY ? '[dry-run] ' : ''}hero document found`);
    console.log(`  slides kept   : ${slides.length}`);
    console.log(`  slideSeconds  : ${seconds}`);
    console.log(`  fields removed: ${dropped.length ? dropped.join(', ') : '(none)'}`);

    if (DRY) {
        console.log('');
        console.log('Nothing written (--dry-run).');
    } else {
        await col.updateOne({ _id: doc._id }, { $set: { data: next, updatedAt: new Date() } });
        console.log('');
        console.log('✅ Hero cleaned — picture slider only.');
    }

    await mongoose.disconnect();
    process.exit(0);
})().catch((err) => {
    console.error('✖ Migration failed:', err);
    process.exit(1);
});
