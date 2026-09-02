// ===================================================================
// Seed 5 CMS-driven service landing pages:
//   Study Abroad, Passport Service, Banking Support, Career Opportunity,
//   Air Ticketing & Visa Processing Course.
//
// Run: node seedServices.js
// Safe to re-run — upserts by slug.
// ===================================================================

require('dotenv').config();
const mongoose = require('mongoose');

const DB_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/aerovista';

const bi = (en, bn = '') => ({ en, bn });

const services = [
    {
        slug: 'study-abroad',
        type: 'study_abroad',
        title: bi('Study Abroad', 'বিদেশে পড়াশোনা'),
        subtitle: bi(
            'Top universities in UK, USA, Canada, Australia & Europe',
            'যুক্তরাজ্য, যুক্তরাষ্ট্র, কানাডা, অস্ট্রেলিয়া ও ইউরোপের সেরা বিশ্ববিদ্যালয়'
        ),
        description: bi(
            'End-to-end study abroad consulting — university shortlisting, application, SOP editing, visa filing, and pre-departure briefing.',
            'বিদেশে পড়াশোনার সম্পূর্ণ সহায়তা — বিশ্ববিদ্যালয় নির্বাচন, আবেদন, SOP এডিটিং, ভিসা ফাইলিং এবং প্রি-ডিপার্চার ব্রিফিং।'
        ),
        heroImage: '/images/hotel-hero-bg.png',
        icon: '🎓',
        sections: [
            {
                type: 'features',
                title: bi('Why choose us', 'কেন আমাদের বেছে নেবেন'),
                items: [
                    { title: bi('Free counseling', 'ফ্রি কাউন্সেলিং'), description: bi('One-on-one with our certified consultants', 'অভিজ্ঞ কনসাল্ট্যান্টের সাথে ওয়ান-অন-ওয়ান'), icon: '🧭' },
                    { title: bi('University shortlisting', 'বিশ্ববিদ্যালয় শর্টলিস্টিং'), description: bi('Match programs to your profile & budget', 'আপনার প্রোফাইল ও বাজেট অনুযায়ী প্রোগ্রাম'), icon: '🏛️' },
                    { title: bi('Application & visa filing', 'অ্যাপ্লিকেশন ও ভিসা ফাইলিং'), description: bi('We handle paperwork end-to-end', 'পুরো কাগজপত্রের কাজ আমরা করি'), icon: '📄' },
                    { title: bi('Scholarship guidance', 'স্কলারশিপ গাইডেন্স'), description: bi('Merit + need-based scholarship search', 'মেরিট ও নিড-বেইজড স্কলারশিপ'), icon: '💰' },
                ],
                order: 1,
            },
            {
                type: 'list',
                title: bi('Popular destinations', 'জনপ্রিয় গন্তব্য'),
                items: [
                    { title: bi('United Kingdom', 'যুক্তরাজ্য'), icon: '🇬🇧' },
                    { title: bi('United States', 'যুক্তরাষ্ট্র'), icon: '🇺🇸' },
                    { title: bi('Canada', 'কানাডা'), icon: '🇨🇦' },
                    { title: bi('Australia', 'অস্ট্রেলিয়া'), icon: '🇦🇺' },
                    { title: bi('Germany', 'জার্মানি'), icon: '🇩🇪' },
                    { title: bi('Malaysia', 'মালয়েশিয়া'), icon: '🇲🇾' },
                ],
                order: 2,
            },
        ],
        ctaText: bi('Book free counseling', 'ফ্রি কাউন্সেলিং বুক করুন'),
        seoTitle: bi('Study Abroad Consultancy | Aerovista', 'বিদেশে পড়াশোনা কনসালটেন্সি | Aerovista'),
        seoDescription: bi('End-to-end study abroad consultancy — UK, USA, Canada, Australia, Europe. Free counseling.', 'বিদেশে পড়াশোনার পূর্ণ সহায়তা।'),
        seoKeywords: 'study abroad, bangladesh, uk, usa, canada, visa, scholarship',
        order: 1,
    },
    {
        slug: 'passport-service',
        type: 'passport',
        title: bi('Passport Service', 'পাসপোর্ট সার্ভিস'),
        subtitle: bi(
            'New passport, renewal & correction — hassle-free',
            'নতুন পাসপোর্ট, রিনিউয়াল ও সংশোধন — ঝামেলামুক্ত'
        ),
        description: bi(
            'We handle the whole passport process for you: form filling, appointment, biometric booking, delivery tracking.',
            'পুরো পাসপোর্ট প্রসেস আমরা করি: ফর্ম পূরণ, অ্যাপয়েন্টমেন্ট, বায়োমেট্রিক বুকিং, ডেলিভারি ট্র্যাকিং।'
        ),
        heroImage: '/images/img01.png',
        icon: '🛂',
        sections: [
            {
                type: 'features',
                title: bi('Services we cover', 'আমরা যেই সেবাগুলো দিই'),
                items: [
                    { title: bi('New E-Passport', 'নতুন ই-পাসপোর্ট'), description: bi('MRP or 10-year E-Passport application', 'MRP অথবা ১০ বছরের ই-পাসপোর্ট আবেদন'), icon: '📘' },
                    { title: bi('Passport Renewal', 'পাসপোর্ট রিনিউয়াল'), description: bi('Expired passport renewal', 'মেয়াদোত্তীর্ণ পাসপোর্ট রিনিউয়াল'), icon: '🔄' },
                    { title: bi('Data correction', 'তথ্য সংশোধন'), description: bi('Name, DOB, or address correction', 'নাম, জন্মতারিখ বা ঠিকানা সংশোধন'), icon: '✏️' },
                    { title: bi('Lost passport re-issue', 'হারানো পাসপোর্ট রি-ইস্যু'), description: bi('GD copy + re-application handled by us', 'GD কপি + রি-অ্যাপ্লিকেশন আমাদের দায়িত্বে'), icon: '🔍' },
                ],
                order: 1,
            },
        ],
        ctaText: bi('Get help now', 'এখনই সাহায্য নিন'),
        seoTitle: bi('Passport Service in Bangladesh | Aerovista', 'পাসপোর্ট সার্ভিস | Aerovista'),
        seoDescription: bi('E-Passport application, renewal and correction service in Bangladesh.', 'ই-পাসপোর্ট আবেদন, রিনিউয়াল ও সংশোধন সার্ভিস।'),
        seoKeywords: 'passport, e-passport, mrp, bangladesh, renewal, correction',
        order: 2,
    },
    {
        slug: 'banking-support',
        type: 'banking',
        title: bi('Banking Support', 'ব্যাংকিং সাপোর্ট'),
        subtitle: bi(
            'Bank statements, solvency, endorsement — for visa & travel',
            'ব্যাংক স্টেটমেন্ট, সলভেন্সি, এনডোর্সমেন্ট — ভিসা ও ভ্রমণের জন্য'
        ),
        description: bi(
            'One-stop banking documentation help: statements, solvency certificates, dollar endorsement, forex card — all coordinated with partner banks.',
            'ব্যাংকিং ডকুমেন্টেশনের সব সাহায্য: স্টেটমেন্ট, সলভেন্সি সার্টিফিকেট, ডলার এনডোর্সমেন্ট, ফরেক্স কার্ড।'
        ),
        heroImage: '/images/img02.png',
        icon: '🏦',
        sections: [
            {
                type: 'features',
                title: bi('What we help with', 'আমরা যেই বিষয়ে সাহায্য করি'),
                items: [
                    { title: bi('Bank Statement', 'ব্যাংক স্টেটমেন্ট'), description: bi('Recent 6-month statement, English format', 'সাম্প্রতিক ৬ মাসের ইংরেজি স্টেটমেন্ট'), icon: '📊' },
                    { title: bi('Solvency Certificate', 'সলভেন্সি সার্টিফিকেট'), description: bi('For visa & study abroad requirement', 'ভিসা ও বিদেশে পড়ার জন্য'), icon: '✅' },
                    { title: bi('USD Endorsement', 'ডলার এনডোর্সমেন্ট'), description: bi('Travel & study endorsement on passport', 'পাসপোর্টে ট্রাভেল ও স্টাডি এনডোর্সমেন্ট'), icon: '💵' },
                    { title: bi('Prepaid Forex Card', 'প্রিপেইড ফরেক্স কার্ড'), description: bi('Multi-currency travel card', 'মাল্টি-কারেন্সি ট্রাভেল কার্ড'), icon: '💳' },
                ],
                order: 1,
            },
        ],
        ctaText: bi('Request support', 'সাহায্যের জন্য অনুরোধ'),
        seoTitle: bi('Banking Support for Visa & Travel | Aerovista', 'ভিসা ও ভ্রমণের ব্যাংকিং সাপোর্ট | Aerovista'),
        seoDescription: bi('Bank statement, solvency certificate, dollar endorsement for visa and study.', 'ব্যাংক স্টেটমেন্ট, সলভেন্সি সার্টিফিকেট ইত্যাদি।'),
        seoKeywords: 'bank statement, solvency, dollar endorsement, forex, visa',
        order: 3,
    },
    {
        slug: 'career-opportunity',
        type: 'career',
        title: bi('Career Opportunity', 'ক্যারিয়ার অপরচুনিটি'),
        subtitle: bi(
            'Join our team — travel, visa & study abroad specialists',
            'আমাদের টিমে যোগ দিন — ট্রাভেল, ভিসা ও স্টাডি অ্যাব্রড স্পেশালিস্ট'
        ),
        description: bi(
            'We are a growing consultancy. Explore open roles or send us your CV — we hire counselors, visa officers, digital marketers, and interns year-round.',
            'আমরা একটি ক্রমবর্ধমান কনসালটেন্সি। খোলা পদগুলো দেখুন অথবা আপনার CV পাঠান।'
        ),
        heroImage: '/images/hotel-hero-bg.png',
        icon: '💼',
        sections: [
            {
                type: 'list',
                title: bi('Current openings', 'বর্তমান খোলা পদ'),
                items: [
                    { title: bi('Visa Counselor', 'ভিসা কাউন্সেলর'), description: bi('2+ years experience', '২+ বছরের অভিজ্ঞতা'), icon: '📋' },
                    { title: bi('Study Abroad Consultant', 'স্টাডি অ্যাব্রড কনসালট্যান্ট'), description: bi('IELTS 7+ preferred', 'IELTS ৭+ পছন্দনীয়'), icon: '🎓' },
                    { title: bi('Digital Marketing Executive', 'ডিজিটাল মার্কেটিং এক্সিকিউটিভ'), description: bi('Meta Ads + SEO experience', 'Meta Ads + SEO অভিজ্ঞতা'), icon: '📈' },
                    { title: bi('Front-Desk Officer', 'ফ্রন্ট-ডেস্ক অফিসার'), description: bi('Client-facing, fluent English & Bangla', 'ক্লায়েন্ট ফেসিং, ইংরেজি ও বাংলায় দক্ষ'), icon: '🎧' },
                ],
                order: 1,
            },
        ],
        ctaText: bi('Apply now', 'এখনই আবেদন করুন'),
        seoTitle: bi('Careers at Aerovista | Job Openings', 'Aerovista-এ ক্যারিয়ার | চাকরির সুযোগ'),
        seoDescription: bi('Open positions at Aerovista — visa counselor, study abroad consultant, digital marketer, more.', 'Aerovista-এ খোলা পদ।'),
        seoKeywords: 'career, jobs, visa counselor, hiring, bangladesh',
        order: 4,
    },
    {
        slug: 'course',
        type: 'course',
        title: bi('Air Ticketing & Visa Processing Course', 'এয়ার টিকেটিং ও ভিসা প্রসেসিং কোর্স'),
        subtitle: bi(
            'Hands-on professional training with certification',
            'হাতে-কলমে পেশাদার প্রশিক্ষণ ও সার্টিফিকেশন'
        ),
        description: bi(
            'A 3-month industry-driven course covering GDS (Amadeus/Sabre), airline reservation, IATA basics, and visa filing across major destinations.',
            '৩ মাসের ইন্ডাস্ট্রি-চালিত কোর্স — GDS (Amadeus/Sabre), এয়ারলাইন রিজার্ভেশন, IATA বেসিকস এবং প্রধান গন্তব্যের ভিসা ফাইলিং।'
        ),
        heroImage: '/images/img01.png',
        icon: '🎫',
        sections: [
            {
                type: 'features',
                title: bi('What you will learn', 'আপনি যা শিখবেন'),
                items: [
                    { title: bi('GDS Systems', 'GDS সিস্টেম'), description: bi('Amadeus + Sabre hands-on', 'Amadeus + Sabre হাতে-কলমে'), icon: '💻' },
                    { title: bi('Airline Reservation', 'এয়ারলাইন রিজার্ভেশন'), description: bi('Booking, cancellation, refund', 'বুকিং, ক্যানসেলেশন, রিফান্ড'), icon: '✈️' },
                    { title: bi('Fare Construction', 'ফেয়ার কনস্ট্রাকশন'), description: bi('Pricing, taxes, add-ons', 'প্রাইসিং, ট্যাক্স, অ্যাড-অন'), icon: '💰' },
                    { title: bi('Visa Processing', 'ভিসা প্রসেসিং'), description: bi('Application, documentation, embassy filing', 'অ্যাপ্লিকেশন, ডকুমেন্টেশন, এমব্যাসি ফাইলিং'), icon: '📄' },
                ],
                order: 1,
            },
            {
                type: 'stats',
                title: bi('Course details', 'কোর্স ডিটেইলস'),
                items: [
                    { title: bi('Duration', 'মেয়াদ'), description: bi('3 months', '৩ মাস') },
                    { title: bi('Classes', 'ক্লাস'), description: bi('Sat–Tue, 3 days/week', 'শনি–মঙ্গল, সপ্তাহে ৩ দিন') },
                    { title: bi('Certification', 'সার্টিফিকেশন'), description: bi('IATA-aligned course certificate', 'IATA-অ্যালাইন্ড কোর্স সার্টিফিকেট') },
                    { title: bi('Fee', 'ফি'), description: bi('৳ 25,000 (installments available)', '৳ ২৫,০০০ (কিস্তিতে সুবিধা)') },
                ],
                order: 2,
            },
        ],
        ctaText: bi('Enroll now', 'এখনই এনরোল করুন'),
        seoTitle: bi('Air Ticketing & Visa Processing Course | Aerovista', 'এয়ার টিকেটিং ও ভিসা প্রসেসিং কোর্স | Aerovista'),
        seoDescription: bi('Industry-driven 3-month course on GDS, airline reservation and visa filing.', 'GDS ও ভিসা প্রসেসিং কোর্স।'),
        seoKeywords: 'air ticketing course, visa processing, gds, amadeus, sabre, iata, bangladesh',
        order: 5,
    },
];

(async () => {
    try {
        await mongoose.connect(DB_URL);
        console.log('✅ Connected to MongoDB');

        const col = mongoose.connection.collection('services');
        let created = 0, updated = 0;
        for (const svc of services) {
            const now = new Date();
            const doc = { ...svc, isActive: true, formEnabled: true, updatedAt: now };
            const res = await col.updateOne(
                { slug: svc.slug },
                { $set: doc, $setOnInsert: { createdAt: now } },
                { upsert: true }
            );
            if (res.upsertedCount) created++; else updated++;
        }

        console.log('');
        console.log('══════════════════════════════════════════════════════');
        console.log('  ✅ SERVICES SEEDED');
        console.log('══════════════════════════════════════════════════════');
        console.log(`  Created : ${created}`);
        console.log(`  Updated : ${updated}`);
        console.log('  Slugs   : study-abroad, passport-service, banking-support,');
        console.log('            career-opportunity, course');
        console.log('  API     : GET  http://localhost:5000/api/services');
        console.log('            GET  http://localhost:5000/api/services/study-abroad');
        console.log('══════════════════════════════════════════════════════');

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err);
        process.exit(1);
    }
})();
