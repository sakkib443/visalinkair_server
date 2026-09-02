/**
 * Seed Thailand's E-Visa document requirements, split by the applicant's profession.
 * Source: the client's requirement sheets in aerovista_client/public/visainfo.
 *
 * Additive and re-runnable:
 *   - existing requirements are kept, only matched by title and re-tagged
 *   - a document with an empty `professions` tag applies to everyone
 *   - writes a JSON backup next to this file before touching anything
 *
 * Usage:  node seed-thailand-profession-docs.js [--dry]
 */

const fs = require('fs');
const path = require('path');

const API = process.env.API_URL || 'http://localhost:5000';
const EMAIL = process.env.ADMIN_EMAIL || 'admin@gmail.com';
const PASSWORD = process.env.ADMIN_PASSWORD || 'admin@gmail.com';
const DRY = process.argv.includes('--dry');

// Everyone applying for a Thai e-visa needs these.
const COMMON = [
    {
        title: 'Passport Information Page Scan Copy',
        titleBn: 'পাসপোর্টের তথ্য পাতার স্ক্যান কপি',
        description: 'Must have at least 6 months validity.',
        descriptionBn: 'ন্যূনতম ৬ মাসের মেয়াদ থাকতে হবে।',
        isRequired: true,
    },
    {
        title: 'Old Passport Scan Copy',
        titleBn: 'পুরোনো পাসপোর্টের স্ক্যান কপি',
        description: 'Information page of your old passport, if you have one.',
        descriptionBn: 'পুরোনো পাসপোর্ট থাকলে তার তথ্য পাতা।',
        isRequired: false,
    },
    {
        title: 'Recent Photograph',
        titleBn: 'সাম্প্রতিক ছবি',
        description: 'Taken within the last 3 months. White background, 35mm x 45mm.',
        descriptionBn: 'গত ৩ মাসের মধ্যে তোলা। সাদা ব্যাকগ্রাউন্ড, ৩৫ x ৪৫ মিমি।',
        isRequired: true,
    },
    {
        title: 'Marriage Certificate',
        titleBn: 'ম্যারেজ সার্টিফিকেট',
        description: "Only if your spouse's name is not mentioned in your passport.",
        descriptionBn: 'পাসপোর্টে স্বামী/স্ত্রীর নাম না থাকলে প্রয়োজন।',
        isRequired: false,
    },
    {
        title: 'Bank Solvency Certificate',
        titleBn: 'ব্যাংক সলভেন্সি সার্টিফিকেট',
        description: 'With balance.',
        descriptionBn: 'ব্যালেন্সসহ।',
        isRequired: true,
    },
    {
        title: 'Bank Statement',
        titleBn: 'ব্যাংক স্টেটমেন্ট',
        description: 'Personal account, last 3 or 6 months, with bank seal and the signature of a bank officer.',
        descriptionBn: 'ব্যক্তিগত হিসাব, শেষ ৩ বা ৬ মাস, ব্যাংক সিল ও কর্মকর্তার স্বাক্ষরসহ।',
        isRequired: true,
    },
    {
        title: 'Proof of Residence',
        titleBn: 'বসবাসের প্রমাণ',
        description: 'Electricity, water or gas bill copy — not more than 3 months old.',
        descriptionBn: 'বিদ্যুৎ, পানি বা গ্যাস বিলের কপি — ৩ মাসের বেশি পুরোনো নয়।',
        isRequired: true,
    },
];

// Only these professions must supply these.
const BY_PROFESSION = [
    // ── Job Holder ──
    {
        title: 'No Objection Certificate (NOC)',
        titleBn: 'অনাপত্তি পত্র (NOC)',
        description: 'From your office, on official letterhead.',
        descriptionBn: 'অফিস থেকে, অফিসিয়াল লেটারহেডে।',
        isRequired: true,
        professions: ['job-holder'],
    },
    {
        title: 'Salary Certificate / Pay Slip',
        titleBn: 'বেতন সার্টিফিকেট / পে স্লিপ',
        isRequired: true,
        professions: ['job-holder'],
    },
    {
        title: 'Employee ID Card',
        titleBn: 'কর্মচারী পরিচয়পত্র',
        isRequired: true,
        professions: ['job-holder'],
    },
    // ── Govt. Job Holder ──
    {
        title: 'GO (Government Order)',
        titleBn: 'জিও (সরকারি আদেশ)',
        description: 'For an official passport.',
        descriptionBn: 'অফিসিয়াল পাসপোর্টের জন্য।',
        isRequired: true,
        professions: ['govt-job-holder'],
    },
    // ── Businessperson ──
    {
        title: 'Renewed Trade License',
        titleBn: 'নবায়নকৃত ট্রেড লাইসেন্স',
        description: 'Notarised and translated into English.',
        descriptionBn: 'নোটারি ও ইংরেজিতে অনূদিত।',
        isRequired: true,
        professions: ['businessperson'],
    },
    {
        title: 'Company Letterhead Pad',
        titleBn: 'কোম্পানির লেটারহেড প্যাড',
        description: 'Blank scan copy.',
        descriptionBn: 'খালি স্ক্যান কপি।',
        isRequired: true,
        professions: ['businessperson'],
    },
    {
        title: 'Company Memorandum & Article — Schedule XII',
        titleBn: 'কোম্পানির মেমোরেন্ডাম ও আর্টিকেল — শিডিউল XII',
        isRequired: true,
        professions: ['businessperson'],
    },
    // ── Doctor ──
    {
        title: 'BMDC Certificate',
        titleBn: 'বিএমডিসি সার্টিফিকেট',
        isRequired: true,
        professions: ['doctor'],
    },
    // ── Advocate ──
    {
        title: 'Bar Council Certificate',
        titleBn: 'বার কাউন্সিল সার্টিফিকেট',
        isRequired: true,
        professions: ['advocate'],
    },
    // ── Student ──
    {
        title: 'Approved Leave Letter from School / College',
        titleBn: 'স্কুল/কলেজ থেকে অনুমোদিত ছুটির চিঠি',
        description: 'Original copy.',
        descriptionBn: 'মূল কপি।',
        isRequired: true,
        professions: ['student'],
    },
    // ── Retired ──
    {
        title: 'Retirement Documents',
        titleBn: 'অবসরের কাগজপত্র',
        description: 'Notarised, translated into English.',
        descriptionBn: 'নোটারি ও ইংরেজিতে অনূদিত।',
        isRequired: true,
        professions: ['retired'],
    },
    // ── Unemployed ──
    {
        title: 'NID / Birth Certificate',
        titleBn: 'এনআইডি / জন্ম নিবন্ধন',
        isRequired: true,
        professions: ['unemployed'],
    },
    // ── House Wife ──
    {
        title: 'Hotel Booking (Level-1)',
        titleBn: 'হোটেল বুকিং (লেভেল-১)',
        isRequired: true,
        professions: ['housewife'],
    },
    // ── Shared by several ──
    {
        title: 'Office ID Card',
        titleBn: 'অফিস পরিচয়পত্র',
        isRequired: true,
        professions: ['govt-job-holder', 'doctor'],
    },
    {
        title: 'ID Card',
        titleBn: 'পরিচয়পত্র',
        isRequired: true,
        professions: ['advocate', 'student', 'housewife'],
    },
    {
        title: 'Visiting Card',
        titleBn: 'ভিজিটিং কার্ড',
        isRequired: true,
        professions: ['job-holder', 'govt-job-holder', 'businessperson', 'doctor', 'advocate'],
    },
    {
        title: "Sponsor's Documents",
        titleBn: 'স্পনসরের কাগজপত্র',
        description: "Sponsor's NID, ID card, passport copy, bank solvency certificate and bank statement.",
        descriptionBn: 'স্পনসরের এনআইডি, পরিচয়পত্র, পাসপোর্ট কপি, ব্যাংক সলভেন্সি ও ব্যাংক স্টেটমেন্ট।',
        isRequired: true,
        professions: ['student', 'child', 'housewife'],
    },
];

/**
 * The country already had a generic list written before professions existed.
 * Several of those rows are the same document under a shorter name — mapping
 * them keeps whatever the admin typed instead of leaving a near-duplicate pair
 * (e.g. "Valid Passport" and "Passport Information Page Scan Copy") in the list.
 * Anything not mapped here is left exactly as it was.
 */
const ALIASES = {
    'Valid Passport': 'Passport Information Page Scan Copy',
    'Passport Size Photos': 'Recent Photograph',
    'NOC / Leave Letter': 'No Objection Certificate (NOC)',
    'Hotel Booking': 'Hotel Booking (Level-1)',
};

const main = async () => {
    const lr = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    const token = (await lr.json())?.data?.tokens?.accessToken;
    if (!token) return console.error('Login failed');
    const H = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    const cr = await fetch(`${API}/api/countries/slug/thailand`);
    const cj = await cr.json();
    if (!cj.success) return console.error('Thailand not found');
    const country = cj.data;
    const existing = country.documentRequirements || [];

    // Backup first — this rewrites a live country's requirement list.
    const backup = path.join(__dirname, 'thailand-docs-backup.json');
    fs.writeFileSync(backup, JSON.stringify(existing, null, 2));
    console.log(`Backed up ${existing.length} existing requirements -> ${backup}\n`);

    const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    // title -> canonical title, so an old row resolves onto its new equivalent
    const aliasOf = new Map(Object.entries(ALIASES).map(([from, to]) => [norm(from), norm(to)]));
    const canon = (title) => aliasOf.get(norm(title)) || norm(title);

    const merged = [];
    const seen = new Set();

    const push = (doc) => {
        const key = canon(doc.title);
        if (seen.has(key)) return;
        seen.add(key);
        // Keep whatever the admin already wrote; only fill gaps and set the tag.
        const prior = existing.find((e) => canon(e.title) === key);
        merged.push({
            title: doc.title,
            titleBn: doc.titleBn || prior?.titleBn || '',
            description: doc.description || prior?.description || '',
            descriptionBn: doc.descriptionBn || prior?.descriptionBn || '',
            isRequired: doc.isRequired !== false,
            professions: doc.professions || [],
        });
    };

    COMMON.forEach(push);
    BY_PROFESSION.forEach(push);

    // Anything the admin already had that we didn't cover stays, untouched.
    existing.forEach((e) => {
        const key = canon(e.title);
        if (seen.has(key)) return;
        seen.add(key);
        merged.push({
            title: e.title,
            titleBn: e.titleBn || '',
            description: e.description || '',
            descriptionBn: e.descriptionBn || '',
            isRequired: e.isRequired !== false,
            professions: e.professions || [],
        });
    });

    console.log(`${existing.length} existing -> ${merged.length} after merge\n`);
    merged.forEach((d, i) => {
        const who = d.professions.length ? d.professions.join(', ') : 'everyone';
        console.log(`  ${String(i + 1).padStart(2)}. ${d.title.padEnd(45)} [${who}]`);
    });

    if (DRY) return console.log('\n--dry: nothing written.');

    const up = await fetch(`${API}/api/countries/${country._id}`, {
        method: 'PATCH',
        headers: H,
        body: JSON.stringify({ documentRequirements: merged }),
    });
    const uj = await up.json();
    console.log(`\nPATCH -> ${up.status} ${uj.success ? 'saved' : 'FAILED: ' + uj.message}`);

    const check = await (await fetch(`${API}/api/countries/slug/thailand`)).json();
    console.log(`Thailand now has ${check.data.documentRequirements.length} requirements.`);
};

main().catch((e) => console.error('ERR', e));
