/**
 * Bring the hero document in line with the Hero the site actually renders.
 *
 * The saved hero came from a previous project: it still said "VISAPRO", and
 * carried a videoUrl for a background video the Hero has never shown. The real
 * Hero is an image slider whose pictures were hardcoded in the component.
 *
 * This:
 *   - renames VISAPRO -> AEROVISTA in the heading
 *   - moves the four hardcoded slides into the document
 *   - drops videoUrl and search — fields the Hero never read
 *   - seeds the WhatsApp message that was hardcoded (the number itself stays in
 *     Settings, so there is only ever one of it)
 *
 * Re-runnable and non-destructive: anything already set is left alone, and a
 * backup of the current hero document is written next to this file first.
 *
 * Usage:  node migrate-hero-content.js [--dry]
 */

const fs = require('fs');
const path = require('path');

const API = process.env.API_URL || 'http://localhost:5000';
const EMAIL = process.env.ADMIN_EMAIL || 'admin@gmail.com';
const PASSWORD = process.env.ADMIN_PASSWORD || 'admin@gmail.com';
const DRY = process.argv.includes('--dry');

// The slides that were hardcoded in Hero.jsx
const DEFAULT_SLIDES = ['/hero.jpg', '/2.jpg', '/3.jpg', '/4.jpg'];

const main = async () => {
    const lr = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    const token = (await lr.json())?.data?.tokens?.accessToken;
    if (!token) return console.error('Login failed');
    const H = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    const res = await fetch(`${API}/api/home-content/hero`);
    const json = await res.json();
    const current = json?.data?.data || {};

    const backup = path.join(__dirname, 'hero-content-backup.json');
    fs.writeFileSync(backup, JSON.stringify(current, null, 2));
    console.log(`Backed up the current hero document -> ${backup}\n`);

    const next = { ...current };

    // 1. VISAPRO -> AEROVISTA
    const rename = (s) => (typeof s === 'string' ? s.replace(/visapro/gi, 'AEROVISTA') : s);
    if (next.heading) {
        next.heading = { en: rename(next.heading.en), bn: rename(next.heading.bn) };
    }

    // 2. Slides: adopt the ones that were hardcoded, unless already set
    if (!next.slides?.length) {
        next.slides = DEFAULT_SLIDES.map((image, order) => ({ image, order }));
    }
    if (next.slideSeconds == null) next.slideSeconds = 4;

    // 3. Fields the Hero never read — drop them.
    //    videoUrl: the Hero has always been an image slider.
    //    search:   the search card's wording is driven by the visa/hotel/tour
    //              data, not by page content, so it isn't editable here.
    delete next.videoUrl;
    delete next.search;

    // 4. The WhatsApp message used to be hardcoded; the number itself stays in
    //    Settings so there is only ever one of it.
    if (!next.whatsappMessage) {
        next.whatsappMessage = {
            en: 'I need help with visa/tour services',
            bn: 'ভিসা/ট্যুর সম্পর্কে জানতে চাই',
        };
    }

    console.log('heading   :', JSON.stringify(next.heading));
    console.log('slides    :', next.slides.map((s) => s.image).join(', '));
    console.log('videoUrl  :', 'videoUrl' in next ? 'STILL PRESENT' : 'removed');
    console.log('search    :', 'search' in next ? 'STILL PRESENT' : 'removed');
    console.log('whatsapp  :', JSON.stringify(next.whatsappMessage?.en));

    if (DRY) return console.log('\n--dry: nothing written.');

    const up = await fetch(`${API}/api/home-content/hero`, {
        method: 'PUT',
        headers: H,
        body: JSON.stringify(next),
    });
    const uj = await up.json();
    console.log(`\nPUT -> ${up.status} ${uj.success ? 'saved' : 'FAILED: ' + uj.message}`);

    const check = await (await fetch(`${API}/api/home-content/hero`)).json();
    const saved = check?.data?.data || {};
    console.log('verify: heading =', JSON.stringify(saved.heading?.en));
    console.log('verify: slides  =', (saved.slides || []).length);
    console.log("verify: videoUrl gone =", !("videoUrl" in saved));
    console.log("verify: search gone   =", !("search" in saved));
};

main().catch((e) => console.error('ERR', e));
