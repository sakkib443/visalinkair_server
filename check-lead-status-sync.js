// ===================================================================
// Guard: lead status তালিকা backend আর frontend-এ এক আছে কিনা মিলিয়ে দেখে।
//
//   backend : src/app/modules/lead/lead.constants.ts   (LEAD_STATUS_META)
//   frontend: ../aerovista_client/src/utils/leadStatus.js (LEAD_STATUS_META)
//
// দুইটা আলাদা হয়ে গেলে UI এমন status পাঠাবে যেটা server চেনে না — আগে
// ঠিক এই ভুলেই source dropdown ("facebook", "instagram") কাজ করত না।
//
// চালাতে:  npm run check:lead-status     (exit 1 = মিলছে না)
// ===================================================================

const fs = require('fs');
const path = require('path');

const BACKEND = path.join(__dirname, 'src/app/modules/lead/lead.constants.ts');
const FRONTEND = path.join(__dirname, '../aerovista_client/src/utils/leadStatus.js');

// LEAD_STATUS_META ব্লক থেকে key + stage তুলে আনে
const parse = (file) => {
    const src = fs.readFileSync(file, 'utf8');
    // declaration-টাই ধরতে হবে — কমেন্টে LEAD_STATUS_META লেখা থাকতে পারে,
    // শুধু indexOf() দিলে সেটাই ধরে ফেলে আর ভুল ব্লক পার্স হয়।
    const decl = /export\s+const\s+LEAD_STATUS_META\s*(?::[^=]+)?=\s*\{/.exec(src);
    if (!decl) throw new Error(`export const LEAD_STATUS_META not found in ${file}`);
    const open = decl.index + decl[0].length - 1; // the '{'
    // ব্লকের শেষ খুঁজি — brace গুনে
    let depth = 0;
    let end = open;
    for (let i = open; i < src.length; i++) {
        if (src[i] === '{') depth++;
        else if (src[i] === '}') {
            depth--;
            if (depth === 0) { end = i; break; }
        }
    }
    const body = src.slice(open + 1, end);

    const out = [];
    // key: { ... stage: 'open' ... confirmed: true ... }  (field order free)
    const entry = /(\w+)\s*:\s*\{([^}]*)\}/g;
    let m;
    while ((m = entry.exec(body)) !== null) {
        const stage = /stage\s*:\s*['"](\w+)['"]/.exec(m[2]);
        if (!stage) continue; // stage নেই = এটা status entry নয়
        const confirmed = /confirmed\s*:\s*(true|false)/.exec(m[2]);
        out.push({
            status: m[1],
            stage: stage[1],
            confirmed: confirmed ? confirmed[1] : 'MISSING',
        });
    }
    return out;
};

const be = parse(BACKEND);
const fe = parse(FRONTEND);

const fmt = (list) => list.map((x) => `${x.status}(${x.stage}${x.confirmed === 'true' ? ',confirmed' : ''})`);
const beSet = new Map(be.map((x) => [x.status, x]));
const feSet = new Map(fe.map((x) => [x.status, x]));

const problems = [];
for (const [s, b] of beSet) {
    const f = feSet.get(s);
    if (!f) { problems.push(`missing in FRONTEND: ${s}`); continue; }
    if (f.stage !== b.stage)
        problems.push(`stage differs for ${s}: backend=${b.stage} frontend=${f.stage}`);
    if (f.confirmed !== b.confirmed)
        problems.push(`confirmed differs for ${s}: backend=${b.confirmed} frontend=${f.confirmed}`);
    if (b.confirmed === 'MISSING')
        problems.push(`backend ${s} has no 'confirmed' field`);
}
for (const s of feSet.keys()) {
    if (!beSet.has(s)) problems.push(`missing in BACKEND (server will reject it): ${s}`);
}
// ক্রমও মিলুক — UI-তে dropdown-এর সাজানো এটার উপর নির্ভর করে
if (!problems.length && be.map((x) => x.status).join(',') !== fe.map((x) => x.status).join(',')) {
    problems.push(`order differs:\n  backend : ${fmt(be).join(', ')}\n  frontend: ${fmt(fe).join(', ')}`);
}

if (problems.length) {
    console.error('✖ lead status lists are OUT OF SYNC:\n');
    problems.forEach((p) => console.error('  - ' + p));
    console.error('\nFix both files, then re-run.');
    process.exit(1);
}

console.log(`✔ lead statuses in sync (${be.length}): ${fmt(be).join(', ')}`);
