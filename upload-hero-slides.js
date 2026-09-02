/**
 * Move the hero's background pictures out of the client repo and into storage.
 *
 * The slider originally pointed at /hero.jpg, /2.jpg … — files bundled in the
 * client's public/ folder. They render fine, but they can't be managed: remove
 * one from the dashboard and there's no way to add it back without knowing the
 * path. Uploading them through the normal image endpoint makes them ordinary
 * pictures the admin can reorder, replace or restore like any other.
 *
 * Adds them alongside whatever is already in the slider — nothing is replaced.
 * Re-running skips any picture that has already been uploaded.
 *
 * Usage:  node upload-hero-slides.js [--dry]
 */

const fs = require('fs');
const path = require('path');

const API = process.env.API_URL || 'http://localhost:5000';
const EMAIL = process.env.ADMIN_EMAIL || 'admin@gmail.com';
const PASSWORD = process.env.ADMIN_PASSWORD || 'admin@gmail.com';
const DRY = process.argv.includes('--dry');

// Where the client keeps them, relative to this repo
const PUBLIC_DIR = path.resolve(__dirname, '..', 'aerovista_client', 'public');
const SOURCES = ['hero.jpg', '2.jpg', '3.jpg', '4.jpg'];

const main = async () => {
    const lr = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    const token = (await lr.json())?.data?.tokens?.accessToken;
    if (!token) return console.error('Login failed');

    const heroRes = await (await fetch(`${API}/api/home-content/hero`)).json();
    const hero = heroRes?.data?.data || {};
    const slides = [...(hero.slides || [])];

    const backup = path.join(__dirname, 'hero-slides-backup.json');
    fs.writeFileSync(backup, JSON.stringify(slides, null, 2));
    console.log(`Backed up ${slides.length} current slide(s) -> ${backup}\n`);

    for (const name of SOURCES) {
        const file = path.join(PUBLIC_DIR, name);
        if (!fs.existsSync(file)) {
            console.log(`  ${name.padEnd(10)} SKIPPED — not found in ${PUBLIC_DIR}`);
            continue;
        }

        // Already uploaded on an earlier run? The stored filename keeps the
        // original name, so a match means we'd only be duplicating it.
        const base = name.replace(/\.[^.]+$/, '');
        if (slides.some((s) => s.image?.includes(`-${base}.`))) {
            console.log(`  ${name.padEnd(10)} already uploaded — skipping`);
            continue;
        }

        if (DRY) {
            console.log(`  ${name.padEnd(10)} would upload (${(fs.statSync(file).size / 1024).toFixed(0)} KB)`);
            continue;
        }

        const fd = new FormData();
        fd.append('image', new Blob([fs.readFileSync(file)], { type: 'image/jpeg' }), name);
        const up = await fetch(`${API}/api/upload/single`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: fd,
        });
        const uj = await up.json();
        if (!up.ok || !uj.success) {
            console.log(`  ${name.padEnd(10)} UPLOAD FAILED: ${uj.message}`);
            continue;
        }

        // Replace the /public path with the uploaded one, keeping its position
        const at = slides.findIndex((s) => s.image === `/${name}`);
        if (at >= 0) slides[at] = { image: uj.data.url, order: at };
        else slides.push({ image: uj.data.url, order: slides.length });

        console.log(`  ${name.padEnd(10)} -> ${uj.data.url}`);
    }

    if (DRY) return console.log('\n--dry: nothing written.');

    const ordered = slides.map((s, i) => ({ image: s.image, order: i }));
    const put = await fetch(`${API}/api/home-content/hero`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...hero, slides: ordered }),
    });
    const pj = await put.json();
    console.log(`\nPUT -> ${put.status} ${pj.success ? 'saved' : 'FAILED: ' + pj.message}`);

    const check = await (await fetch(`${API}/api/home-content/hero`)).json();
    const saved = check?.data?.data?.slides || [];
    console.log(`\nHero now has ${saved.length} slide(s):`);
    saved.forEach((s, i) => console.log(`  ${i + 1}. ${s.image}`));
};

main().catch((e) => console.error('ERR', e));
