/* ===================================================================
 * Aerovista — Visa Guide Seeder
 *
 * Populates the `visaguides` collection with real, current visa
 * requirements for Bangladeshi passport holders.
 *
 *   npm run seed:visa-guides            # upsert (keeps admin edits to
 *                                       # countries not in this file)
 *   npm run seed:visa-guides -- --force # overwrite existing rows too
 *
 * Idempotent: matches on (category, countrySlug). Without --force an
 * existing row is left alone, so re-running never clobbers content an
 * admin has since rewritten in the dashboard.
 * =================================================================== */

require('dotenv').config();
const mongoose = require('mongoose');

const DB_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/aerovista';
const FORCE = process.argv.includes('--force');

// ── Minimal schema mirror. The real schema lives in
//    src/app/modules/visaGuide/visaGuide.model.ts; this seeder only needs
//    enough shape to write valid documents.
const visaGuideSchema = new mongoose.Schema(
    {
        category: { type: String, enum: ['tourist', 'student'], required: true },
        country: { type: String, required: true },
        countryBn: String,
        countrySlug: { type: String, required: true },
        flag: String,
        visaType: String,
        processingTime: String,
        processingFee: String,
        embassyFee: String,
        validity: String,
        stayDuration: String,
        entryType: String,
        content: String,
        isActive: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
        metaTitle: String,
        metaDescription: String,
    },
    { timestamps: true, versionKey: false }
);
const VisaGuide = mongoose.model('VisaGuide', visaGuideSchema);

const slugify = (s) =>
    s.normalize('NFD').replace(/[̀-ͯ]/g, '')
        .toLowerCase().replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

// ── HTML helpers ────────────────────────────────────────────────────
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const h2 = (t) => `<h2>${esc(t)}</h2>`;
const h3 = (t) => `<h3>${esc(t)}</h3>`;
const p = (t) => `<p>${t}</p>`;
const ul = (items) => `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
const ol = (items) => `<ol>${items.map((i) => `<li>${i}</li>`).join('')}</ol>`;
const b = (t) => `<strong>${esc(t)}</strong>`;

/** Notes every applicant needs to read, regardless of destination. */
const COMMON_NOTES = [
    'It is advisable to refrain from booking flight tickets until the visa confirmation letter has been received.',
    'Aerovista cannot guarantee visa approval, as the decision rests solely with the embassy or high commission.',
    'The applicant is advised to provide accurate documents and share only true information. Do not withhold any information.',
    'Visa processing times may vary and are determined by the embassy. Aerovista has no authority over the visa decision process.',
    'It is your responsibility to follow visa terms and depart on time. Any overstay penalties are solely the applicant’s responsibility.',
    'Aerovista cannot be held accountable for any issues arising from visa refusal or rejection.',
    'Emergency modifications or cancellations may incur extra charges.',
    'If travelling with children, ensure they have the necessary travel documents, including passports and visas, as required by the destination country.',
    'Visa service fees and charges are non-refundable once the application has been submitted.',
];

/** Paperwork blocks that repeat across most destinations. */
const docsJobHolder = (minBalance) => [
    'A passport valid for at least six (6) months, along with all old passports (if applicable).',
    'Two recent photographs taken within the last 3 months (white background, 35 mm × 45 mm, matt paper).',
    `Bank statement for the last six (6) months with a bank solvency certificate (minimum balance ${b(minBalance)} per applicant).`,
    'Visiting card.',
    'No Objection Certificate (NOC) from the employer on official letterhead, mentioning the travel dates.',
    'Copy of office / organization ID card.',
    'Occupational verification document where applicable (BMDC certificate for doctors, BAR Council certificate for advocates).',
];
const docsBusinessOwner = (minBalance) => [
    'A passport valid for at least six (6) months, along with all old passports (if applicable).',
    'Two recent photographs taken within the last 3 months (white background, 35 mm × 45 mm, matt paper).',
    `Bank statement for the last six (6) months with a bank solvency certificate (minimum balance ${b(minBalance)} per applicant).`,
    'Notarised and updated trade licence (if issued in Bangla, submit a notarised English translation alongside the original).',
    'Memorandum of Association for a limited company.',
    'Blank page of the company letterhead / business pad.',
    'Visiting card.',
];
const docsStudentApplicant = (minBalance) => [
    'A passport valid for at least six (6) months, along with all old passports (if applicable).',
    'Two recent photographs taken within the last 3 months (white background, 35 mm × 45 mm, matt paper).',
    `Parent’s or guardian’s bank statement for the last six (6) months with a solvency certificate (minimum balance ${b(minBalance)}).`,
    'Copy of student ID card (if issued in Bangla, submit a notarised English translation).',
    'Birth certificate (for children and infants).',
    'Supporting documents of the sponsoring parent (NID / passport copy, visiting card, trade licence and business pad for businesspersons).',
];
const docsOtherRelations = (minBalance) => [
    'A passport valid for at least six (6) months, along with all old passports (if applicable).',
    'Two recent photographs taken within the last 3 months (white background, 35 mm × 45 mm, matt paper).',
    `Bank statement for the last six (6) months with a bank solvency certificate (minimum balance ${b(minBalance)}).`,
    'Marriage certificate or Nikahnama copy if the spouse’s name is not mentioned in the passport (with a notarised English translation if in Bangla).',
];

/**
 * Compose a full tourist-visa body from the country-specific bits.
 * Keeps every destination page structurally identical, which is what
 * makes the public layout predictable.
 */
function buildTouristContent({ country, intro, minBalance, extraNotes = [], extraDocs = [], submission }) {
    return [
        h2('Overview'),
        p(intro),

        h2('Important Notes'),
        ul([...extraNotes, ...COMMON_NOTES]),

        h2('List of Documents Needed'),
        h3('Documents Needed for Job Holders'),
        ol([...docsJobHolder(minBalance), ...extraDocs]),
        h3('Documents Needed for Business Owners'),
        ol([...docsBusinessOwner(minBalance), ...extraDocs]),
        h3('Documents Needed for Students'),
        ol([...docsStudentApplicant(minBalance), ...extraDocs]),
        h3('Documents Needed for Other Relations (Spouse / Dependants)'),
        ol([...docsOtherRelations(minBalance), ...extraDocs]),

        p(`<strong>N.B:</strong> ${esc(submission)}`),
    ].join('');
}

/** Student-visa bodies vary far more per country, so they are authored inline. */
function buildStudentContent({ intro, keySteps, financial, documents, notes, submission }) {
    return [
        h2('Overview'),
        p(intro),

        h2('Application Process — Step by Step'),
        ol(keySteps),

        h2('Financial Requirement'),
        ul(financial),

        h2('List of Documents Needed'),
        ol(documents),

        h2('Important Notes'),
        ul([...notes, ...COMMON_NOTES]),

        p(`<strong>N.B:</strong> ${esc(submission)}`),
    ].join('');
}

// ── TOURIST VISAS ───────────────────────────────────────────────────
const TOURIST = [
    {
        country: 'India', countryBn: 'ভারত', flag: '🇮🇳', order: 1,
        visaType: 'Tourist Visa (Sticker)',
        processingTime: '07 to 15 working days',
        processingFee: 'BDT 5,500 (Aerovista service charge)',
        embassyFee: 'No visa fee for Bangladeshi nationals — IVAC service charge BDT 824 applies',
        validity: 'Up to 1 year', stayDuration: 'Up to 90 days per visit', entryType: 'Multiple Entry',
        content: buildTouristContent({
            country: 'India',
            intro: 'India does not charge a visa fee to Bangladeshi nationals — only the IVAC service charge applies. Applications are submitted online through the Indian Visa Online portal, after which the applicant books an appointment and submits the physical file at their designated Indian Visa Application Centre (IVAC). Biometric enrolment is mandatory for first-time applicants.',
            minBalance: 'BDT 25,000',
            extraNotes: [
                'The online application must be completed on the official Indian Visa Online portal before an IVAC appointment can be booked.',
                'Your IVAC is assigned by your permanent address — you cannot submit at a centre outside your assigned district.',
                'The port of entry selected in the application (by air, land or rail) is printed on the visa and must be respected.',
            ],
            extraDocs: [
                'Printed and signed online visa application form with the photograph affixed.',
                'Copy of National ID card (NID) or birth certificate.',
                'Utility bill (electricity / gas / water) from the last three months as proof of address.',
            ],
            submission: 'All documents must be submitted in physical form, in person, at your assigned IVAC on the appointment date.',
        }),
    },
    {
        country: 'Malaysia', countryBn: 'মালয়েশিয়া', flag: '🇲🇾', order: 2,
        visaType: 'Tourist Visa (eVISA)',
        processingTime: '07 to 10 working days',
        processingFee: 'BDT 7,500 (Aerovista service charge)',
        embassyFee: 'BDT 4,500 approx.',
        validity: '3 months from issue', stayDuration: 'Up to 30 days', entryType: 'Single Entry',
        content: buildTouristContent({
            country: 'Malaysia',
            intro: 'Malaysia issues an electronic visa (eVISA) to Bangladeshi passport holders. The application is filed online and no passport submission or interview is required — the approved eVISA is emailed as a PDF that must be printed and carried while travelling.',
            minBalance: 'BDT 1,00,000',
            extraNotes: [
                'The eVISA must be printed in colour and presented at both departure and arrival immigration.',
                'A confirmed return air ticket and confirmed hotel booking for the full duration of stay are mandatory.',
                'Immigration at the Malaysian port of entry makes the final admission decision — a valid eVISA alone does not guarantee entry.',
            ],
            extraDocs: [
                'Confirmed return air ticket.',
                'Confirmed hotel booking covering the entire duration of the stay.',
                'Scanned copy of the passport bio-data page (clear, colour).',
            ],
            submission: 'This is a fully online process — no physical document submission is required. Clear scanned copies must be emailed to our team.',
        }),
    },
    {
        country: 'Thailand', countryBn: 'থাইল্যান্ড', flag: '🇹🇭', order: 3,
        visaType: 'Tourist Visa (e-Visa)',
        processingTime: '10 to 15 working days',
        processingFee: 'BDT 6,500 (Aerovista service charge)',
        embassyFee: 'BDT 4,000 approx.',
        validity: '3 months from issue', stayDuration: 'Up to 60 days', entryType: 'Single Entry',
        content: buildTouristContent({
            country: 'Thailand',
            intro: 'Thailand has moved entirely to an e-Visa system — paper applications are no longer accepted at the Royal Thai Embassy in Dhaka. The application is submitted through the official Thai e-Visa portal and the approved visa is issued electronically.',
            minBalance: 'BDT 80,000',
            extraNotes: [
                'Thailand no longer accepts walk-in or paper applications; every application must go through the official e-Visa portal.',
                'The bank statement must show a healthy transaction history, not a single lump-sum deposit made just before applying.',
                'A confirmed return ticket and full hotel booking are mandatory and are checked closely.',
            ],
            extraDocs: [
                'Confirmed return air ticket.',
                'Confirmed hotel booking for the entire duration of the stay.',
                'Day-by-day travel itinerary.',
            ],
            submission: 'This is a fully online process. Clear scanned copies of every document must be provided to our team for portal submission.',
        }),
    },
    {
        country: 'Singapore', countryBn: 'সিঙ্গাপুর', flag: '🇸🇬', order: 4,
        visaType: 'Tourist Visa (E-Visa)',
        processingTime: '07 to 10 working days',
        processingFee: 'BDT 6,500 (Without Airport Transfer)',
        embassyFee: 'SGD 30 approx.',
        validity: 'Up to 2 years', stayDuration: 'Up to 30 days per visit', entryType: 'Multiple Entry',
        content: buildTouristContent({
            country: 'Singapore',
            intro: 'Bangladeshi passport holders cannot apply for a Singapore visa individually — the application must be filed by an authorised visa agent or a local Singaporean sponsor through the ICA SAVE system. Aerovista is an authorised submitting agent, so your file is lodged directly on your behalf.',
            minBalance: 'BDT 1,50,000',
            extraNotes: [
                'Individual applications are not accepted by the ICA — every application must be submitted by an authorised agent or a local sponsor.',
                'Form 14A must be completed accurately; a mismatch between the form and the supporting documents is a common refusal reason.',
                'Singapore issues an electronic visa. Print the approved e-Visa and carry it with your passport.',
            ],
            extraDocs: [
                'Completed and signed Form 14A.',
                'Confirmed return air ticket.',
                'Confirmed hotel booking covering the full duration of the stay.',
            ],
            submission: 'Documents may be submitted digitally, but the original passport is required if a sticker visa is issued. Our team will confirm which applies to your case.',
        }),
    },
    {
        country: 'United Arab Emirates', countryBn: 'সংযুক্ত আরব আমিরাত', flag: '🇦🇪', order: 5,
        visaType: 'Tourist Visa (e-Visa)',
        processingTime: '05 to 07 working days',
        processingFee: 'BDT 8,000 (Aerovista service charge)',
        embassyFee: 'BDT 14,000 – 22,000 depending on duration',
        validity: '60 days from issue', stayDuration: '14 / 30 / 60 days options', entryType: 'Single Entry',
        content: buildTouristContent({
            country: 'the United Arab Emirates',
            intro: 'The UAE issues electronic tourist visas to Bangladeshi nationals through airlines, hotels and authorised travel agents. No embassy visit or interview is required — the approved visa is delivered by email.',
            minBalance: 'BDT 1,50,000',
            extraNotes: [
                'UAE visa policy for Bangladeshi passport holders changes frequently and approval rates fluctuate — current conditions will be confirmed before your file is lodged.',
                'A confirmed return ticket and confirmed hotel booking are mandatory.',
                'The visa duration (14, 30 or 60 days) must be chosen at the time of application and cannot be changed afterwards.',
            ],
            extraDocs: [
                'Confirmed return air ticket.',
                'Confirmed hotel booking for the entire duration of the stay.',
                'Scanned copy of the passport bio-data page in colour.',
            ],
            submission: 'This is a fully online process — clear scanned copies emailed to our team are sufficient.',
        }),
    },
    {
        country: 'United Kingdom', countryBn: 'যুক্তরাজ্য', flag: '🇬🇧', order: 6,
        visaType: 'Standard Visitor Visa',
        processingTime: '03 weeks (standard) / 05 working days (priority)',
        processingFee: 'BDT 12,000 (Aerovista service charge)',
        embassyFee: '£127 for a 6-month visitor visa',
        validity: '6 months / 2 / 5 / 10 years', stayDuration: 'Up to 6 months per visit', entryType: 'Multiple Entry',
        content: buildTouristContent({
            country: 'the United Kingdom',
            intro: 'The UK Standard Visitor visa is applied for online through the UKVI portal, followed by a biometric appointment at the VFS Global centre in Dhaka or Sylhet. The decision is made by a UKVI caseworker and the passport is returned through VFS.',
            minBalance: 'BDT 5,00,000',
            extraNotes: [
                'The financial evidence is the single most important element of a UK visitor application — sudden large deposits without a documented source are a frequent refusal reason.',
                'A clear, credible reason to return to Bangladesh (employment, business, property, family ties) must be evidenced.',
                'Biometric enrolment at VFS Global is mandatory for every applicant, including children.',
                'Priority and Super Priority services are available at additional cost, subject to availability.',
            ],
            extraDocs: [
                'Printed UKVI online application form and appointment confirmation.',
                'Cover letter explaining the purpose of travel and your ties to Bangladesh.',
                'Proof of accommodation and a day-by-day travel itinerary.',
                'Income tax return (TIN certificate and latest acknowledgement slip).',
                'If sponsored: sponsor’s invitation letter, passport / BRP copy and six months of their bank statements.',
            ],
            submission: 'Biometrics must be given in person at VFS Global, Dhaka or Sylhet, on the booked appointment date.',
        }),
    },
    {
        country: 'United States', countryBn: 'যুক্তরাষ্ট্র', flag: '🇺🇸', order: 7,
        visaType: 'B1/B2 Visitor Visa',
        processingTime: 'Depends on interview appointment availability',
        processingFee: 'BDT 12,000 (Aerovista service charge)',
        embassyFee: 'USD 185 (MRV fee, non-refundable)',
        validity: 'Up to 5 years', stayDuration: 'Determined by CBP at entry (typically up to 6 months)', entryType: 'Multiple Entry',
        content: buildTouristContent({
            country: 'the United States',
            intro: 'The US B1/B2 visitor visa requires a completed DS-160 form, payment of the MRV fee, and a personal interview at the US Embassy in Dhaka. The consular officer makes the decision at the interview — no agent can influence or guarantee the outcome.',
            minBalance: 'BDT 5,00,000',
            extraNotes: [
                'A personal interview at the US Embassy, Dhaka is mandatory for nearly all applicants. Interview slots can be booked months in advance.',
                'The MRV fee of USD 185 is non-refundable and non-transferable, whether or not the visa is granted.',
                'Under section 214(b) the applicant must demonstrate strong ties to Bangladesh. This is the most common ground for refusal.',
                'Aerovista assists with DS-160 preparation, fee payment and interview coaching only. The visa decision rests entirely with the consular officer.',
            ],
            extraDocs: [
                'DS-160 confirmation page with the barcode.',
                'MRV fee payment receipt.',
                'Interview appointment confirmation letter.',
                'Income tax return (TIN certificate and latest acknowledgement slip).',
                'Property documents, if any, as evidence of ties to Bangladesh.',
            ],
            submission: 'The applicant must attend the embassy interview in person. Aerovista handles the paperwork; we cannot attend the interview on your behalf.',
        }),
    },
    {
        country: 'Canada', countryBn: 'কানাডা', flag: '🇨🇦', order: 8,
        visaType: 'Visitor Visa (Temporary Resident Visa)',
        processingTime: '30 to 90 days',
        processingFee: 'BDT 12,000 (Aerovista service charge)',
        embassyFee: 'CAD 100 visa fee + CAD 85 biometrics',
        validity: 'Up to 10 years (or passport expiry)', stayDuration: 'Up to 6 months per visit', entryType: 'Multiple Entry',
        content: buildTouristContent({
            country: 'Canada',
            intro: 'The Canadian Temporary Resident Visa is applied for online through an IRCC account, followed by biometric enrolment at VFS Global in Dhaka. Processing times vary considerably and IRCC publishes no guaranteed turnaround.',
            minBalance: 'BDT 6,00,000',
            extraNotes: [
                'Biometrics are valid for 10 years — if you have given biometrics for a Canadian application within that window, you do not need to repeat them.',
                'IRCC processing times are estimates only and are frequently exceeded. Do not make non-refundable travel plans.',
                'A detailed cover letter setting out your travel purpose, funding and ties to Bangladesh materially strengthens the application.',
            ],
            extraDocs: [
                'IRCC online application submission confirmation.',
                'Biometric Instruction Letter (BIL).',
                'Cover letter explaining the purpose of travel and your ties to Bangladesh.',
                'Income tax return (TIN certificate and latest acknowledgement slip).',
                'If sponsored: sponsor’s invitation letter, status document in Canada and their bank statements.',
            ],
            submission: 'The application is filed online; biometrics must be given in person at VFS Global, Dhaka.',
        }),
    },
    {
        country: 'Australia', countryBn: 'অস্ট্রেলিয়া', flag: '🇦🇺', order: 9,
        visaType: 'Visitor Visa (Subclass 600)',
        processingTime: '25 to 60 days',
        processingFee: 'BDT 12,000 (Aerovista service charge)',
        embassyFee: 'AUD 210 approx.',
        validity: '3 / 6 / 12 months', stayDuration: 'Up to 3 months per visit (typical)', entryType: 'Single or Multiple Entry',
        content: buildTouristContent({
            country: 'Australia',
            intro: 'The Australian Visitor visa (Subclass 600) is lodged online through an ImmiAccount. Biometrics are collected at the Australian Visa Application Centre in Dhaka, and health examinations may be requested depending on your circumstances.',
            minBalance: 'BDT 6,00,000',
            extraNotes: [
                'A health examination may be requested by the Department of Home Affairs after lodgement, which extends processing time.',
                'Applicants must satisfy the genuine visitor criterion — evidence of employment, business or family ties in Bangladesh is essential.',
                'The visa application charge is payable at lodgement and is not refunded if the application is refused.',
            ],
            extraDocs: [
                'ImmiAccount lodgement confirmation and Transaction Reference Number (TRN).',
                'Form 1419 (Application for a Visitor visa) where required.',
                'Cover letter explaining the purpose of travel and your ties to Bangladesh.',
                'Income tax return (TIN certificate and latest acknowledgement slip).',
            ],
            submission: 'The application is lodged online; biometrics must be given at the Australian Visa Application Centre, Dhaka.',
        }),
    },
    {
        country: 'Turkey', countryBn: 'তুরস্ক', flag: '🇹🇷', order: 10,
        visaType: 'Tourist Visa (Sticker)',
        processingTime: '15 to 25 working days',
        processingFee: 'BDT 7,500 (Aerovista service charge)',
        embassyFee: 'USD 60 approx.',
        validity: '180 days from issue', stayDuration: 'Up to 30 days', entryType: 'Single Entry',
        content: buildTouristContent({
            country: 'Türkiye',
            intro: 'Türkiye requires Bangladeshi nationals to obtain a sticker visa from the Turkish Embassy in Dhaka. The application starts online on the Turkish e-Visa/appointment portal, followed by document submission at the embassy on the assigned appointment date.',
            minBalance: 'BDT 1,50,000',
            extraNotes: [
                'The e-Visa facility is not available to ordinary Bangladeshi passport holders — a sticker visa from the embassy is required.',
                'Embassy appointment slots are limited and are typically booked several weeks in advance.',
                'A confirmed return ticket and full hotel booking must be presented at the appointment.',
            ],
            extraDocs: [
                'Printed and signed online application form.',
                'Confirmed return air ticket.',
                'Confirmed hotel booking covering the full duration of the stay.',
                'Travel medical insurance with a minimum coverage of EUR 30,000.',
            ],
            submission: 'All documents must be submitted in physical form at the Turkish Embassy, Dhaka, on the booked appointment date.',
        }),
    },
];

// ── STUDENT VISAS ───────────────────────────────────────────────────
const STUDENT = [
    {
        country: 'United Kingdom', countryBn: 'যুক্তরাজ্য', flag: '🇬🇧', order: 1,
        visaType: 'Student Visa (Student Route)',
        processingTime: '03 weeks from biometric appointment',
        processingFee: 'BDT 25,000 (Aerovista service charge)',
        embassyFee: '£524 + Immigration Health Surcharge £776 per year',
        validity: 'Course duration + 4 months', stayDuration: 'Full course duration', entryType: 'Multiple Entry',
        content: buildStudentContent({
            intro: 'The UK Student Route visa requires an unconditional offer and a Confirmation of Acceptance for Studies (CAS) from a licensed student sponsor. The application is made online through UKVI, followed by biometrics at VFS Global in Dhaka or Sylhet.',
            keySteps: [
                'Secure an unconditional offer from a UK institution holding a Student Sponsor licence.',
                'Pay the required tuition deposit and receive your CAS number.',
                'Complete the mandatory TB test at an IOM-approved clinic in Bangladesh.',
                'Complete the online UKVI application and pay the visa fee plus the Immigration Health Surcharge (IHS).',
                'Book and attend a biometric appointment at VFS Global, Dhaka or Sylhet.',
                'Submit supporting documents and await the decision.',
            ],
            financial: [
                'Tuition fees for the first academic year, less any deposit already paid.',
                `Living costs: ${b('£1,483 per month')} for up to 9 months in London, or ${b('£1,136 per month')} for up to 9 months outside London.`,
                'Funds must have been held in an eligible account for a consecutive 28-day period, and the closing balance must be dated within 31 days of the application.',
                'A bank loan is acceptable only if it is from a government or a bank regulated by Bangladesh Bank, and the funds are available before travel.',
            ],
            documents: [
                'Passport valid for the duration of the intended stay, plus all old passports.',
                'CAS statement from your UK institution.',
                'Unconditional offer letter and tuition fee payment receipt.',
                'All academic transcripts and certificates (SSC, HSC, Bachelor’s where applicable).',
                'IELTS / UKVI-approved English language test certificate, where required by the sponsor.',
                'TB test certificate from an IOM-approved clinic.',
                'Bank statement and solvency certificate meeting the 28-day maintenance rule.',
                'Sponsor’s income documents, tax returns and relationship proof (birth certificate showing parentage).',
                'Two recent photographs (white background, 35 mm × 45 mm).',
                'ATAS certificate for certain science and technology courses.',
            ],
            notes: [
                'The 28-day maintenance rule is applied strictly — if the balance drops below the required amount on any single day of that window, the application will be refused.',
                'The Immigration Health Surcharge must be paid in full for the entire visa duration at the time of application.',
                'Dependants may accompany you only on postgraduate research programmes or government-sponsored courses.',
                'The TB test certificate is valid for six months from the date of issue.',
            ],
            submission: 'Biometrics must be given in person at VFS Global, Dhaka or Sylhet, on the booked appointment date.',
        }),
    },
    {
        country: 'United States', countryBn: 'যুক্তরাষ্ট্র', flag: '🇺🇸', order: 2,
        visaType: 'F-1 Student Visa',
        processingTime: 'Depends on interview appointment availability',
        processingFee: 'BDT 25,000 (Aerovista service charge)',
        embassyFee: 'USD 185 (MRV) + USD 350 (SEVIS I-901)',
        validity: 'Up to 5 years', stayDuration: 'Duration of Status (D/S)', entryType: 'Multiple Entry',
        content: buildStudentContent({
            intro: 'The F-1 visa requires admission to a SEVP-certified US institution and a Form I-20. After paying the SEVIS fee and completing the DS-160, the applicant attends a visa interview at the US Embassy in Dhaka, where the consular officer makes the decision.',
            keySteps: [
                'Secure admission to a SEVP-certified US institution and receive your Form I-20.',
                'Pay the SEVIS I-901 fee of USD 350 and print the receipt.',
                'Complete the DS-160 online non-immigrant visa application form.',
                'Pay the USD 185 MRV visa fee.',
                'Book and attend the visa interview at the US Embassy, Dhaka.',
            ],
            financial: [
                'Proof of funds covering the first year of tuition and living expenses exactly as stated on your I-20.',
                'Evidence of a credible, documented source of funds for the remaining years of study.',
                'Sponsor affidavit of support with their bank statements, income documents and tax returns.',
                'Scholarship or assistantship award letters, where applicable.',
            ],
            documents: [
                'Passport valid for at least six months beyond the intended period of stay.',
                'Form I-20 signed by both the student and the Designated School Official.',
                'SEVIS I-901 fee payment receipt.',
                'DS-160 confirmation page with barcode.',
                'MRV fee payment receipt and interview appointment letter.',
                'All academic transcripts and certificates.',
                'TOEFL / IELTS / Duolingo and GRE / GMAT / SAT scores as required by the institution.',
                'Bank statements and solvency certificate for the sponsor.',
                'Sponsor’s income documents, trade licence or salary certificate, and tax returns.',
                'One recent photograph (2 in × 2 in, white background).',
            ],
            notes: [
                'The consular officer decides at the interview. No agent can influence or guarantee the outcome, and any promise to the contrary should be treated as fraudulent.',
                'You must demonstrate non-immigrant intent under section 214(b) — that you intend to return to Bangladesh after your studies.',
                'The SEVIS fee and MRV fee are both non-refundable, whether or not the visa is issued.',
                'You may enter the US no earlier than 30 days before the programme start date shown on your I-20.',
            ],
            submission: 'The applicant must attend the embassy interview in person. Aerovista assists with documentation and interview preparation only.',
        }),
    },
    {
        country: 'Canada', countryBn: 'কানাডা', flag: '🇨🇦', order: 3,
        visaType: 'Study Permit',
        processingTime: '08 to 16 weeks',
        processingFee: 'BDT 25,000 (Aerovista service charge)',
        embassyFee: 'CAD 150 study permit + CAD 85 biometrics',
        validity: 'Course duration + 90 days', stayDuration: 'Full course duration', entryType: 'Multiple Entry',
        content: buildStudentContent({
            intro: 'A Canadian study permit requires a Letter of Acceptance from a Designated Learning Institution (DLI) and, for most applicants, a Provincial Attestation Letter (PAL) or Territorial Attestation Letter (TAL). The application is filed online through IRCC.',
            keySteps: [
                'Secure a Letter of Acceptance (LOA) from a Designated Learning Institution.',
                'Obtain a Provincial or Territorial Attestation Letter (PAL / TAL) from the relevant province, where required.',
                'Purchase a Guaranteed Investment Certificate (GIC) and pay the first-year tuition.',
                'Complete the online IRCC study permit application and pay the fees.',
                'Give biometrics at VFS Global, Dhaka.',
                'Complete an upfront medical examination with an IRCC panel physician.',
            ],
            financial: [
                `A Guaranteed Investment Certificate (GIC) of ${b('CAD 20,635')} for living expenses in the first year (outside Quebec).`,
                'Proof of payment of the first year’s tuition fees.',
                'Additional evidence of funds where the applicant has accompanying family members.',
                'Six months of the sponsor’s bank statements with a documented source of funds.',
            ],
            documents: [
                'Passport valid for the duration of the intended stay, plus all old passports.',
                'Letter of Acceptance from a Designated Learning Institution.',
                'Provincial / Territorial Attestation Letter (PAL / TAL), where applicable.',
                'GIC certificate and tuition fee payment receipt.',
                'All academic transcripts and certificates.',
                'IELTS / TOEFL / PTE score report.',
                'Statement of Purpose (study plan).',
                'Upfront Medical Examination (UMR) report from an IRCC panel physician.',
                'Sponsor’s bank statements, income documents, trade licence or salary certificate, and tax returns.',
                'Two recent photographs (35 mm × 45 mm, white background).',
            ],
            notes: [
                'The PAL / TAL requirement applies to most new study permit applicants and the application will be returned without it.',
                'IRCC applies a strict assessment of the source of funds — an unexplained large deposit is a common refusal ground.',
                'Biometrics remain valid for 10 years and need not be repeated within that period.',
                'A study permit is not a visa: an approved applicant is also issued a TRV or eTA to travel to Canada.',
            ],
            submission: 'The application is filed online through IRCC; biometrics must be given in person at VFS Global, Dhaka.',
        }),
    },
    {
        country: 'Australia', countryBn: 'অস্ট্রেলিয়া', flag: '🇦🇺', order: 4,
        visaType: 'Student Visa (Subclass 500)',
        processingTime: '04 to 12 weeks',
        processingFee: 'BDT 25,000 (Aerovista service charge)',
        embassyFee: 'AUD 2,000 approx.',
        validity: 'Course duration + 1 to 3 months', stayDuration: 'Full course duration', entryType: 'Multiple Entry',
        content: buildStudentContent({
            intro: 'The Australian Student visa (Subclass 500) requires a Confirmation of Enrolment (CoE) from a CRICOS-registered provider, Overseas Student Health Cover (OSHC), and a Genuine Student (GS) statement. The application is lodged online through an ImmiAccount.',
            keySteps: [
                'Secure an offer from a CRICOS-registered institution and pay the required tuition deposit.',
                'Receive your Confirmation of Enrolment (CoE).',
                'Purchase Overseas Student Health Cover (OSHC) for the full visa duration.',
                'Prepare your Genuine Student (GS) statement.',
                'Lodge the Subclass 500 application online through ImmiAccount and pay the visa application charge.',
                'Complete health examinations and biometrics as requested.',
            ],
            financial: [
                `Living costs of ${b('AUD 29,710')} for 12 months for the primary applicant.`,
                'First year’s tuition fees as stated on the CoE.',
                'Return airfare evidence.',
                'Additional funds where a spouse (AUD 10,394) or dependent child (AUD 4,449 each) accompanies you.',
            ],
            documents: [
                'Passport valid for the duration of the intended stay, plus all old passports.',
                'Confirmation of Enrolment (CoE) from the CRICOS-registered provider.',
                'Overseas Student Health Cover (OSHC) policy certificate.',
                'Genuine Student (GS) statement addressing all required criteria.',
                'All academic transcripts and certificates.',
                'IELTS / PTE / TOEFL score report meeting the provider’s requirement.',
                'Bank statements, solvency certificate and documented source of funds.',
                'Sponsor’s income documents, trade licence or salary certificate, and tax returns.',
                'Health examination (medical) report from a panel physician.',
                'Two recent photographs (35 mm × 45 mm, white background).',
            ],
            notes: [
                'The Genuine Student requirement replaced the former Genuine Temporary Entrant (GTE) criterion and is assessed strictly.',
                'OSHC must be maintained for the full duration of the visa, not just the course.',
                'The visa application charge is payable at lodgement and is not refunded if the application is refused.',
                'Financial capacity evidence must show a clear, legitimate and documented source of funds.',
            ],
            submission: 'The application is lodged online; biometrics and health examinations are completed at the designated centres in Dhaka.',
        }),
    },
    {
        country: 'Germany', countryBn: 'জার্মানি', flag: '🇩🇪', order: 5,
        visaType: 'National Visa (D) — Studies',
        processingTime: '08 to 12 weeks',
        processingFee: 'BDT 25,000 (Aerovista service charge)',
        embassyFee: 'EUR 75 approx.',
        validity: '90 days entry visa, converted to a residence permit', stayDuration: 'Full course duration', entryType: 'Single Entry (then residence permit)',
        content: buildStudentContent({
            intro: 'Studying in Germany requires a National Visa (category D). Bangladeshi applicants must first obtain an APS certificate, which is mandatory before a university application can be validated, and open a blocked account to evidence living costs.',
            keySteps: [
                'Obtain an APS certificate from the APS office — this is mandatory for Bangladeshi applicants.',
                'Secure an admission letter (Zulassungsbescheid) from a recognised German institution.',
                'Open a blocked account (Sperrkonto) and deposit the required amount.',
                'Purchase travel health insurance covering the period until enrolment.',
                'Book a visa appointment at the German Embassy, Dhaka.',
                'Attend the appointment and submit the complete file.',
            ],
            financial: [
                `A blocked account (Sperrkonto) holding ${b('EUR 11,904')} for one year — released at EUR 992 per month.`,
                'Alternatively, a formal declaration of commitment (Verpflichtungserklärung) from a sponsor resident in Germany.',
                'Scholarship award letter, where applicable.',
            ],
            documents: [
                'Passport valid for the duration of the intended stay, plus all old passports.',
                'APS certificate (mandatory for Bangladeshi applicants).',
                'University admission letter (Zulassungsbescheid).',
                'Blocked account confirmation from an approved provider.',
                'All academic transcripts and certificates, with certified translations.',
                'IELTS / TOEFL for English-taught programmes, or TestDaF / DSH for German-taught programmes.',
                'Motivation letter and curriculum vitae in tabular form.',
                'Travel health insurance certificate.',
                'Two completed and signed national visa application forms.',
                'Three recent biometric photographs (35 mm × 45 mm).',
            ],
            notes: [
                'The APS certificate is mandatory and the process itself takes several weeks — start it well before the university application deadline.',
                'The visa issued is a 90-day entry visa. You must apply for a residence permit at the local Ausländerbehörde after arriving in Germany.',
                'Appointment slots at the German Embassy in Dhaka are limited and are often booked months in advance.',
                'All documents not in German or English must be submitted with certified translations.',
            ],
            submission: 'All documents must be submitted in person at the German Embassy, Dhaka, on the booked appointment date.',
        }),
    },
    {
        country: 'Malaysia', countryBn: 'মালয়েশিয়া', flag: '🇲🇾', order: 6,
        visaType: 'Student Pass',
        processingTime: '04 to 08 weeks',
        processingFee: 'BDT 18,000 (Aerovista service charge)',
        embassyFee: 'MYR 1,500 – 2,500 approx. (EMGS + Student Pass)',
        validity: 'Course duration (renewed annually)', stayDuration: 'Full course duration', entryType: 'Multiple Entry',
        content: buildStudentContent({
            intro: 'Studying in Malaysia requires an offer from a registered institution and approval from Education Malaysia Global Services (EMGS). The institution applies for the Visa Approval Letter (VAL) on the student’s behalf, which is then used to obtain the single-entry visa.',
            keySteps: [
                'Secure an offer letter from an EMGS-registered Malaysian institution.',
                'The institution submits your EMGS application for the Visa Approval Letter (VAL).',
                'Complete the pre-arrival medical screening.',
                'Receive the VAL and apply for the single-entry visa at the Malaysian High Commission, Dhaka.',
                'Travel to Malaysia and complete the post-arrival medical check within 7 days.',
                'Collect the Student Pass sticker endorsed in your passport.',
            ],
            financial: [
                'Proof of funds covering the first year’s tuition and living expenses.',
                'Six months of bank statements with a solvency certificate.',
                'Sponsor’s income documents where the applicant is not self-funding.',
            ],
            documents: [
                'Passport valid for at least 18 months, plus all old passports.',
                'Offer letter from the Malaysian institution.',
                'EMGS Visa Approval Letter (VAL).',
                'All academic transcripts and certificates, attested where required.',
                'IELTS / TOEFL score report, where required by the institution.',
                'Pre-arrival medical screening report.',
                'Bank statements and solvency certificate.',
                'Six recent photographs (35 mm × 50 mm, white background).',
            ],
            notes: [
                'The EMGS application is submitted by the institution, not by the student directly.',
                'A post-arrival medical screening must be completed within 7 days of entering Malaysia, or the Student Pass will not be endorsed.',
                'The Student Pass must be renewed annually for the duration of the course.',
                'Academic certificates may require attestation by the Ministry of Foreign Affairs in Bangladesh.',
            ],
            submission: 'The VAL is issued online. The single-entry visa is obtained in person at the Malaysian High Commission, Dhaka.',
        }),
    },
];

// ── Runner ──────────────────────────────────────────────────────────
async function run() {
    console.log('🔌 Connecting to MongoDB…');
    await mongoose.connect(DB_URL);
    console.log('✅ Connected.\n');

    const rows = [
        ...TOURIST.map((r) => ({ ...r, category: 'tourist' })),
        ...STUDENT.map((r) => ({ ...r, category: 'student' })),
    ];

    let created = 0, updated = 0, skipped = 0;

    for (const row of rows) {
        const countrySlug = slugify(row.country);
        const doc = { ...row, countrySlug, isActive: true };

        const existing = await VisaGuide.findOne({ category: row.category, countrySlug });

        if (existing && !FORCE) {
            skipped++;
            console.log(`  ⏭️  skip    ${row.category.padEnd(8)} ${row.country} (already exists)`);
            continue;
        }
        if (existing) {
            await VisaGuide.updateOne({ _id: existing._id }, { $set: doc });
            updated++;
            console.log(`  ♻️  update  ${row.category.padEnd(8)} ${row.country}`);
        } else {
            await VisaGuide.create(doc);
            created++;
            console.log(`  ✅ create  ${row.category.padEnd(8)} ${row.country}`);
        }
    }

    console.log(`\n📊 Done — ${created} created, ${updated} updated, ${skipped} skipped.`);
    if (skipped && !FORCE) {
        console.log('   Re-run with --force to overwrite the existing rows.');
    }

    await mongoose.disconnect();
    process.exit(0);
}

run().catch(async (err) => {
    console.error('❌ Seed failed:', err.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
});
