// ===================================================================
// Visalink Air - Legal Policy Service
// CRUD for Privacy & Refund policies — type-based singleton documents
// ===================================================================

import { LegalPolicy } from './legalPolicy.model';
import { ILegalPolicy, PolicyType } from './legalPolicy.interface';

// ─── Default Content (professional starter text, admin-editable) ──────

const DEFAULTS: Record<PolicyType, { title: { en: string; bn: string }; content: { en: string; bn: string } }> = {
    privacy: {
        title: { en: 'Privacy Policy', bn: 'প্রাইভেসি পলিসি' },
        content: {
            en: `
<h2>1. Introduction</h2>
<p>At Visalink Air Consultancy &amp; Migration ("Visalink Air", "we", "us", "our"), your privacy is important to us. This Privacy Policy explains how we collect, use, store and protect your personal information when you use our website and services, including visa processing, air ticketing, hotel reservation, tour packages, Hajj &amp; Umrah and study-abroad services.</p>

<h2>2. Information We Collect</h2>
<ul>
<li><strong>Personal details</strong> — name, email address, phone number, date of birth and passport information provided during booking or application.</li>
<li><strong>Travel &amp; visa data</strong> — destination, travel dates, visa type and supporting documents you upload.</li>
<li><strong>Payment information</strong> — transaction details processed through our payment partners (we do not store full card numbers).</li>
<li><strong>Usage data</strong> — pages visited, device and browser information collected automatically to improve our services.</li>
</ul>

<h2>3. How We Use Your Information</h2>
<p>We use your information to process visa applications and bookings, communicate updates about your application or trip, issue invoices and travel documents, provide customer support, and comply with legal and embassy requirements.</p>

<h2>4. Sharing of Information</h2>
<p>We only share your data with relevant embassies, airlines, hotels and government authorities as required to deliver the service you requested, and with trusted payment providers. We never sell your personal data to third parties.</p>

<h2>5. Data Security</h2>
<p>We apply reasonable technical and organisational measures to protect your information against unauthorised access, loss or misuse. However, no method of transmission over the internet is completely secure.</p>

<h2>6. Your Rights</h2>
<p>You may request access to, correction of, or deletion of your personal data by contacting us. You may also opt out of promotional communications at any time.</p>

<h2>7. Contact Us</h2>
<p>For any questions about this Privacy Policy or your data, please contact us through the details provided on our <a href="/contact">Contact</a> page.</p>
`.trim(),
            bn: `
<h2>১. ভূমিকা</h2>
<p>Visalink Air Consultancy &amp; Migration ("Visalink Air", "আমরা")-এর কাছে আপনার গোপনীয়তা গুরুত্বপূর্ণ। এই প্রাইভেসি পলিসিতে ব্যাখ্যা করা হয়েছে আপনি যখন আমাদের ওয়েবসাইট ও সেবা—ভিসা প্রসেসিং, এয়ার টিকিট, হোটেল রিজার্ভেশন, ট্যুর প্যাকেজ, হজ্জ ও উমরাহ এবং বিদেশে পড়াশোনা—ব্যবহার করেন তখন আমরা কীভাবে আপনার ব্যক্তিগত তথ্য সংগ্রহ, ব্যবহার, সংরক্ষণ ও সুরক্ষা করি।</p>

<h2>২. আমরা যেসব তথ্য সংগ্রহ করি</h2>
<ul>
<li><strong>ব্যক্তিগত তথ্য</strong> — নাম, ইমেইল, ফোন নম্বর, জন্ম তারিখ এবং পাসপোর্ট তথ্য যা বুকিং বা আবেদনের সময় দেওয়া হয়।</li>
<li><strong>ভ্রমণ ও ভিসা তথ্য</strong> — গন্তব্য, ভ্রমণের তারিখ, ভিসার ধরন এবং আপনার আপলোড করা ডকুমেন্ট।</li>
<li><strong>পেমেন্ট তথ্য</strong> — আমাদের পেমেন্ট পার্টনারের মাধ্যমে প্রসেস হওয়া লেনদেনের তথ্য (আমরা সম্পূর্ণ কার্ড নম্বর সংরক্ষণ করি না)।</li>
<li><strong>ব্যবহার সংক্রান্ত তথ্য</strong> — সেবা উন্নত করতে স্বয়ংক্রিয়ভাবে সংগৃহীত ডিভাইস ও ব্রাউজার তথ্য।</li>
</ul>

<h2>৩. তথ্য যেভাবে ব্যবহার করি</h2>
<p>ভিসা আবেদন ও বুকিং প্রসেস করা, আপনার আবেদন বা ভ্রমণের আপডেট জানানো, ইনভয়েস ও ট্রাভেল ডকুমেন্ট প্রদান, কাস্টমার সাপোর্ট এবং আইনি ও দূতাবাসের প্রয়োজন মেটাতে আমরা আপনার তথ্য ব্যবহার করি।</p>

<h2>৪. তথ্য শেয়ারিং</h2>
<p>আপনার অনুরোধকৃত সেবা প্রদানের জন্য প্রয়োজন অনুযায়ী শুধুমাত্র সংশ্লিষ্ট দূতাবাস, এয়ারলাইন, হোটেল ও সরকারি কর্তৃপক্ষ এবং বিশ্বস্ত পেমেন্ট প্রোভাইডারের সাথে তথ্য শেয়ার করি। আমরা কখনো আপনার তথ্য তৃতীয় পক্ষের কাছে বিক্রি করি না।</p>

<h2>৫. ডেটা সুরক্ষা</h2>
<p>অননুমোদিত প্রবেশ, ক্ষতি বা অপব্যবহার থেকে আপনার তথ্য রক্ষা করতে আমরা যুক্তিসঙ্গত কারিগরি ব্যবস্থা গ্রহণ করি। তবে ইন্টারনেটে কোনো ট্রান্সমিশনই সম্পূর্ণ নিরাপদ নয়।</p>

<h2>৬. আপনার অধিকার</h2>
<p>আমাদের সাথে যোগাযোগ করে আপনি আপনার ব্যক্তিগত তথ্য দেখা, সংশোধন বা মুছে ফেলার অনুরোধ করতে পারেন। যেকোনো সময় প্রচারমূলক বার্তা থেকে অপ্ট-আউট করতে পারেন।</p>

<h2>৭. যোগাযোগ</h2>
<p>এই প্রাইভেসি পলিসি বা আপনার তথ্য সম্পর্কে যেকোনো প্রশ্নের জন্য আমাদের <a href="/contact">যোগাযোগ</a> পেজের তথ্য অনুযায়ী যোগাযোগ করুন।</p>
`.trim(),
        },
    },
    refund: {
        title: { en: 'Refund & Cancellation Policy', bn: 'রিফান্ড ও ক্যান্সেলেশন পলিসি' },
        content: {
            en: `
<h2>1. Overview</h2>
<p>This Refund &amp; Cancellation Policy applies to all services booked through Visalink Air Consultancy &amp; Migration, including visa processing, air tickets, hotel reservation, tour packages and Hajj &amp; Umrah packages.</p>

<h2>2. Service Fees vs. Third-Party Fees</h2>
<p>Our <strong>service/processing fee</strong> covers the professional work we perform on your behalf. Government fees, embassy fees, airline fares and hotel charges are paid to third parties and are governed by their own refund rules.</p>

<h2>3. Visa Applications</h2>
<ul>
<li>Once an application has been submitted to an embassy, government and embassy fees are <strong>non-refundable</strong>.</li>
<li>A <strong>visa rejection does not guarantee a refund</strong>, as the decision rests solely with the embassy. Our service fee for work already completed is non-refundable.</li>
<li>If you cancel before submission, eligible amounts (minus work already done) may be refunded at our discretion.</li>
</ul>

<h2>4. Air Tickets, Hotels &amp; Tours</h2>
<p>Refunds and cancellation charges for air tickets, hotels and tour packages follow the terms of the respective airline, hotel or operator. Cancellation closer to the travel date usually attracts higher charges.</p>

<h2>5. How to Request a Refund</h2>
<p>To request a refund or cancellation, contact us with your booking reference. Approved refunds are processed to the original payment method, typically within <strong>7–14 business days</strong>, depending on the payment provider and third parties involved.</p>

<h2>6. Contact Us</h2>
<p>For any refund or cancellation request, please reach us through our <a href="/contact">Contact</a> page.</p>
`.trim(),
            bn: `
<h2>১. সংক্ষিপ্ত বিবরণ</h2>
<p>এই রিফান্ড ও ক্যান্সেলেশন পলিসি Visalink Air Consultancy &amp; Migration-এর মাধ্যমে বুক করা সকল সেবার—ভিসা প্রসেসিং, এয়ার টিকিট, হোটেল রিজার্ভেশন, ট্যুর প্যাকেজ এবং হজ্জ ও উমরাহ প্যাকেজ—ক্ষেত্রে প্রযোজ্য।</p>

<h2>২. সার্ভিস ফি বনাম থার্ড-পার্টি ফি</h2>
<p>আমাদের <strong>সার্ভিস/প্রসেসিং ফি</strong> আপনার পক্ষে সম্পাদিত পেশাদার কাজের জন্য। সরকারি ফি, দূতাবাস ফি, এয়ারলাইন ভাড়া ও হোটেল চার্জ তৃতীয় পক্ষকে পরিশোধ করা হয় এবং তাদের নিজস্ব রিফান্ড নিয়ম অনুযায়ী পরিচালিত হয়।</p>

<h2>৩. ভিসা আবেদন</h2>
<ul>
<li>দূতাবাসে আবেদন জমা দেওয়ার পর সরকারি ও দূতাবাস ফি <strong>ফেরতযোগ্য নয়</strong>।</li>
<li><strong>ভিসা প্রত্যাখ্যান হলেই রিফান্ড নিশ্চিত নয়</strong>, কারণ সিদ্ধান্ত সম্পূর্ণভাবে দূতাবাসের। ইতিমধ্যে সম্পন্ন কাজের সার্ভিস ফি ফেরতযোগ্য নয়।</li>
<li>জমা দেওয়ার আগে বাতিল করলে প্রযোজ্য পরিমাণ (সম্পন্ন কাজ বাদে) আমাদের বিবেচনায় ফেরত দেওয়া হতে পারে।</li>
</ul>

<h2>৪. এয়ার টিকিট, হোটেল ও ট্যুর</h2>
<p>এয়ার টিকিট, হোটেল ও ট্যুর প্যাকেজের রিফান্ড ও বাতিল চার্জ সংশ্লিষ্ট এয়ারলাইন, হোটেল বা অপারেটরের শর্ত অনুযায়ী নির্ধারিত হয়। ভ্রমণের তারিখের কাছাকাছি বাতিল করলে সাধারণত বেশি চার্জ প্রযোজ্য হয়।</p>

<h2>৫. রিফান্ডের জন্য অনুরোধ</h2>
<p>রিফান্ড বা বাতিলের জন্য আপনার বুকিং রেফারেন্সসহ আমাদের সাথে যোগাযোগ করুন। অনুমোদিত রিফান্ড মূল পেমেন্ট মাধ্যমে সাধারণত <strong>৭–১৪ কার্যদিবসের</strong> মধ্যে প্রসেস করা হয়, যা পেমেন্ট প্রোভাইডার ও তৃতীয় পক্ষের উপর নির্ভর করে।</p>

<h2>৬. যোগাযোগ</h2>
<p>যেকোনো রিফান্ড বা বাতিলের অনুরোধের জন্য আমাদের <a href="/contact">যোগাযোগ</a> পেজের মাধ্যমে যোগাযোগ করুন।</p>
`.trim(),
        },
    },
};

const VALID_TYPES: PolicyType[] = ['privacy', 'refund'];

// ─── Get all policies ─────────────────────────────────────────────────
const getAllPolicies = async (): Promise<ILegalPolicy[]> => {
    let docs = await LegalPolicy.find().lean();

    // Auto-seed missing policies
    const existing = new Set(docs.map((d: any) => d.type));
    const missing = VALID_TYPES.filter((t) => !existing.has(t));

    if (missing.length > 0) {
        const toInsert = missing.map((t) => ({
            type: t,
            title: DEFAULTS[t].title,
            content: DEFAULTS[t].content,
        }));
        await LegalPolicy.insertMany(toInsert);
        docs = await LegalPolicy.find().lean();
    }

    return docs as unknown as ILegalPolicy[];
};

// ─── Get single policy ────────────────────────────────────────────────
const getPolicy = async (type: PolicyType): Promise<ILegalPolicy> => {
    let doc = await LegalPolicy.findOne({ type });
    if (!doc) {
        doc = await LegalPolicy.create({
            type,
            title: DEFAULTS[type].title,
            content: DEFAULTS[type].content,
        });
    }
    return doc;
};

// ─── Update policy ────────────────────────────────────────────────────
const updatePolicy = async (
    type: PolicyType,
    input: { title?: { en?: string; bn?: string }; content?: { en?: string; bn?: string } }
): Promise<ILegalPolicy> => {
    let doc = await LegalPolicy.findOne({ type });
    if (!doc) {
        doc = await LegalPolicy.create({
            type,
            title: input.title ?? DEFAULTS[type].title,
            content: input.content ?? DEFAULTS[type].content,
        });
        return doc;
    }
    if (input.title !== undefined) {
        doc.title = { en: input.title.en ?? '', bn: input.title.bn ?? '' };
    }
    if (input.content !== undefined) {
        doc.content = { en: input.content.en ?? '', bn: input.content.bn ?? '' };
    }
    await doc.save();
    return doc;
};

// ─── Seed all defaults ────────────────────────────────────────────────
const seedDefaults = async (): Promise<ILegalPolicy[]> => {
    for (const type of VALID_TYPES) {
        const exists = await LegalPolicy.findOne({ type });
        if (!exists) {
            await LegalPolicy.create({
                type,
                title: DEFAULTS[type].title,
                content: DEFAULTS[type].content,
            });
        }
    }
    return LegalPolicy.find().lean() as unknown as ILegalPolicy[];
};

export const LegalPolicyService = {
    getAllPolicies,
    getPolicy,
    updatePolicy,
    seedDefaults,
    VALID_TYPES,
};
