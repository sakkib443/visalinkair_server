/**
 * Seed script: two sample courses in two categories —
 *   • Flight Ticketing  → offline classroom course (demonstrates the location field)
 *   • Visa Processing   → online course (no location)
 *
 * Run: npx ts-node src/scripts/seedCourses.ts   (or: npm run seed:courses)
 *
 * Safe to re-run — upserts by slug, so running it twice will not create
 * duplicates. It goes through CourseService, so the exact same slug logic,
 * category checks and Mongoose validation run as when an admin uses the form.
 */

import mongoose from 'mongoose';
import config from '../app/config';
import { Course, CourseCategory } from '../app/modules/course/course.model';
import { CourseService } from '../app/modules/course/course.service';
import { ICourse } from '../app/modules/course/course.interface';

// ===================================================================
//  Rich-text bodies
//
//  এই HTML গুলোই Quill এডিটরে লোড হয় — তাই এখানে ঠিক সেই ট্যাগগুলোই
//  ব্যবহার করা হয়েছে যেগুলো Quill নিজে তৈরি করে (h2/h3, ul/ol, strong,
//  em, u, আর কালারের জন্য inline `style="color: rgb(...)"`)। ফলে সেভ করা
//  কনটেন্ট এডিটরে খুলে আবার সেভ করলেও ফরম্যাটিং একই থাকে।
// ===================================================================

const FLIGHT_TICKETING_BODY = `
<h2><span style="color: rgb(2, 30, 20);">Course Overview</span></h2>
<p>This is a complete, hands-on <strong>flight ticketing and reservation</strong> program built for people who want to start working at a travel agency, an airline sales counter, or open their own ticketing business. You will work on <strong>live GDS terminals</strong> (Amadeus and Galileo) from the very first week — not on slides.</p>
<p>By the end of the course you will be able to search fares, build an itinerary, issue a ticket, reissue it, and process a refund on your own.</p>

<h2><span style="color: rgb(2, 30, 20);">What You Will Learn</span></h2>
<ul>
  <li>Reading and building <strong>PNR</strong> (Passenger Name Record) from scratch</li>
  <li>Fare construction, fare rules and <strong>IATA</strong> pricing logic</li>
  <li>Ticket issue, void, reissue, refund and <strong>EMD</strong> handling</li>
  <li>Handling infants, unaccompanied minors, group bookings and special meals</li>
  <li>Airline commission, service charge and profit calculation for an agency</li>
</ul>

<h2><span style="color: rgb(239, 140, 44);">Course Modules</span></h2>

<h3>Module 1 — Aviation &amp; Travel Industry Basics <em>(3 classes)</em></h3>
<ul>
  <li>Structure of the airline industry, IATA and its role</li>
  <li>Three-letter <strong>airport codes</strong> and two-letter airline codes</li>
  <li>Time zones, GMT/UTC offset and elapsed flying time</li>
  <li>Reading a 24-hour timetable correctly</li>
</ul>

<h3>Module 2 — Amadeus GDS Fundamentals <em>(6 classes)</em></h3>
<ul>
  <li>Sign-in, sign-out, work areas and cryptic command structure</li>
  <li>Availability display: <strong>AN</strong>, <strong>SN</strong>, <strong>TN</strong> entries</li>
  <li>Selling a segment, seat map display and seat assignment</li>
  <li>Encode / decode for city, airport, airline and aircraft</li>
</ul>

<h3>Module 3 — Building a PNR <em>(5 classes)</em></h3>
<ul>
  <li>The five mandatory elements: <strong>Name, Itinerary, Contact, Ticketing, Received-from</strong></li>
  <li>Adding SSR, OSI and remarks</li>
  <li>Splitting a PNR, adding and removing passengers</li>
  <li>Queue handling and PNR retrieval</li>
</ul>

<h3>Module 4 — Fare Quote &amp; Pricing <em>(6 classes)</em></h3>
<ul>
  <li>FQD, FQN and FXP entries explained step by step</li>
  <li>Fare basis code, booking class and fare rules</li>
  <li>Taxes, surcharges and the total fare breakdown</li>
  <li>One-way, round-trip and multi-city pricing practice</li>
</ul>

<h3>Module 5 — Ticket Issue, Void &amp; Reissue <em>(6 classes)</em></h3>
<ul>
  <li>E-ticket issue and the <strong>TST</strong> record</li>
  <li>Same-day void versus refund — when to use which</li>
  <li>Reissue with fare difference and change penalty</li>
  <li>Involuntary reissue for schedule change and cancellation</li>
</ul>

<h3>Module 6 — Galileo GDS <em>(5 classes)</em></h3>
<ul>
  <li>Galileo command set and how it differs from Amadeus</li>
  <li>Availability, sell, fare quote and ticketing in Galileo</li>
  <li>Working comfortably across both systems</li>
</ul>

<h3>Module 7 — Refund, Reporting &amp; Agency Operations <em>(3 classes)</em></h3>
<ul>
  <li>Full refund, partial refund and no-show handling</li>
  <li><strong>BSP</strong> reporting and sales report reconciliation</li>
  <li>Daily agency workflow and common costly mistakes</li>
</ul>

<h3>Module 8 — Live Project &amp; Job Preparation <em>(2 classes)</em></h3>
<ul>
  <li>End-to-end live booking project, graded</li>
  <li>CV writing for the travel industry and interview practice</li>
</ul>

<h2><span style="color: rgb(2, 30, 20);">Requirements</span></h2>
<ol>
  <li>Minimum HSC / equivalent — no prior aviation background needed</li>
  <li>Basic computer and English typing ability</li>
  <li>Own laptop preferred for practice at home</li>
</ol>

<h2><span style="color: rgb(2, 30, 20);">After Completing This Course</span></h2>
<p>You can apply as a <strong>Ticketing Executive</strong>, <strong>Reservation Officer</strong> or <strong>GDS Operator</strong> at travel agencies, airline GSAs and tour operators — or run ticketing for your own agency.</p>
<blockquote>Every student who finishes all 36 classes and the live project receives a certificate and free job-placement assistance for 6 months.</blockquote>
`.trim();

const VISA_PROCESSING_BODY = `
<h2><span style="color: rgb(2, 30, 20);">Course Overview</span></h2>
<p>A complete <strong>visa processing and documentation</strong> course covering tourist, student, work and business visa files. You will learn how an embassy actually reads a file, why applications get refused, and how to build a file that stands up to scrutiny.</p>
<p>Classes are <strong>live online</strong>, and every session is recorded so you can rewatch anytime.</p>

<h2><span style="color: rgb(2, 30, 20);">What You Will Learn</span></h2>
<ul>
  <li>Preparing a complete visa file for any major destination</li>
  <li>Filling embassy application forms without costly mistakes</li>
  <li>Building a defensible <strong>financial profile</strong> for the applicant</li>
  <li>Writing cover letters, invitation letters and sponsorship letters</li>
  <li>Reading a refusal letter and preparing a strong reapplication</li>
</ul>

<h2><span style="color: rgb(239, 140, 44);">Course Modules</span></h2>

<h3>Module 1 — Visa Fundamentals <em>(3 classes)</em></h3>
<ul>
  <li>Visa categories: tourist, student, work, business, transit, medical</li>
  <li>Single entry, multiple entry, validity and duration of stay</li>
  <li>Visa on arrival, e-visa and sticker visa — the real differences</li>
  <li>Role of the embassy, consulate and <strong>VFS / BLS</strong> centres</li>
</ul>

<h3>Module 2 — Documentation Mastery <em>(5 classes)</em></h3>
<ul>
  <li>Passport checks: validity, blank pages, previous travel history</li>
  <li>Photo specification per country — the most common rejection cause</li>
  <li>Bank statement, solvency certificate and tax return (TIN) preparation</li>
  <li>NOC, trade licence, salary certificate and student ID papers</li>
  <li><strong>Notarisation, attestation and apostille</strong> — what goes where</li>
</ul>

<h3>Module 3 — Application Forms &amp; Portals <em>(4 classes)</em></h3>
<ul>
  <li>Schengen application form, filled field by field</li>
  <li>UK, USA (<strong>DS-160</strong>), Canada (IMM forms) and Australia (ImmiAccount)</li>
  <li>Appointment booking, biometrics and fee payment</li>
  <li>Handling errors after submission</li>
</ul>

<h3>Module 4 — Financial Profile Building <em>(4 classes)</em></h3>
<ul>
  <li>How much balance is actually needed, and for how long</li>
  <li>Transaction history that looks genuine versus one that raises flags</li>
  <li>Sponsorship: who can sponsor, and the papers that prove the relationship</li>
  <li>Business owner, salaried and student profiles handled separately</li>
</ul>

<h3>Module 5 — Country-Specific Filing <em>(6 classes)</em></h3>
<ul>
  <li><strong>Schengen</strong> — Italy, France, Germany, Greece</li>
  <li><strong>Asia</strong> — Thailand, Malaysia, Singapore, Vietnam, Japan, South Korea</li>
  <li><strong>Middle East</strong> — UAE, Saudi Arabia, Qatar, Oman</li>
  <li><strong>Others</strong> — UK, USA, Canada, Australia</li>
</ul>

<h3>Module 6 — Interview Preparation <em>(3 classes)</em></h3>
<ul>
  <li>Questions embassies actually ask, and how to answer them</li>
  <li>Proving strong home-country ties</li>
  <li>Mock interview practice with feedback</li>
</ul>

<h3>Module 7 — Refusal Handling &amp; Reapplication <em>(3 classes)</em></h3>
<ul>
  <li>Decoding standard refusal codes and letters</li>
  <li>Fixing the actual weakness before reapplying</li>
  <li>Appeal letters and when an appeal is worth filing</li>
</ul>

<h3>Module 8 — Running a Visa Consultancy <em>(2 classes)</em></h3>
<ul>
  <li>Client intake, file tracking and follow-up systems</li>
  <li>Service pricing and professional ethics</li>
  <li>Legal boundaries — what a consultant must never promise</li>
</ul>

<h2><span style="color: rgb(2, 30, 20);">Requirements</span></h2>
<ol>
  <li>Minimum HSC / equivalent</li>
  <li>A stable internet connection and a laptop or smartphone</li>
  <li>Basic English reading ability — embassy documents are in English</li>
</ol>

<h2><span style="color: rgb(2, 30, 20);">After Completing This Course</span></h2>
<p>You can work as a <strong>Visa Consultant</strong>, <strong>Documentation Officer</strong> or <strong>Counsellor</strong> at a travel or student-consultancy firm — or start your own visa processing service.</p>
<blockquote>All classes are recorded. You keep lifetime access to the recordings and to the document checklist library.</blockquote>
`.trim();

// ===================================================================
//  Seed data
// ===================================================================

type SeedCourse = Omit<Partial<ICourse>, 'category'> & { categoryName: string };

const CATEGORIES = [
    {
        name: 'Flight Ticketing',
        description:
            'GDS, reservation and air ticketing courses for people entering the travel trade.',
        icon: '🎫',
        order: 1,
    },
    {
        name: 'Visa Processing',
        description:
            'Visa documentation, filing and consultancy courses for all major destinations.',
        icon: '🛂',
        order: 2,
    },
];

const COURSES: SeedCourse[] = [
    {
        categoryName: 'Flight Ticketing',
        title: 'Professional Flight Ticketing & GDS Mastery (Amadeus + Galileo)',
        // ছবিগুলো ব্রাউজারে দেখে বাছা হয়েছে — এয়ারপোর্ট টার্মিনাল (কভার),
        // ট্রলি হাতে যাত্রী, আর সূর্যাস্তে উড়োজাহাজের ডানা।
        image:
            'https://images.pexels.com/photos/2026324/pexels-photo-2026324.jpeg?auto=compress&cs=tinysrgb&w=1200',
        gallery: [
            'https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=1200',
            'https://images.pexels.com/photos/723240/pexels-photo-723240.jpeg?auto=compress&cs=tinysrgb&w=1200',
        ],
        shortDescription:
            'Learn air ticketing on live Amadeus and Galileo terminals — PNR building, fare quoting, ticket issue, reissue and refund. 36 hands-on classes with job placement support.',
        longDescription: FLIGHT_TICKETING_BODY,

        courseType: 'offline',
        location: 'Visalink Air Training Centre, House 12 (4th Floor), Road 5, Dhanmondi, Dhaka 1205',

        totalSeats: 25,
        enrolledCount: 11,

        duration: '3 Months (36 Classes)',
        startDate: '2026-10-05',
        classSchedule: 'Sat, Mon, Wed — 7:00 PM to 9:00 PM',

        instructor: 'Md. Rafiqul Islam',
        instructorTitle: 'IATA Certified GDS Trainer — 12 years in airline reservations',

        price: 18000,
        oldPrice: 25000,
        currency: 'BDT',

        level: 'Beginner to Advanced',
        language: 'Bangla',
        tags: ['Air Ticketing', 'Amadeus', 'Galileo', 'GDS', 'IATA', 'PNR', 'Travel Agency'],

        metaTitle: 'Flight Ticketing & GDS Course in Dhaka | Amadeus + Galileo | Visalink Air',
        metaDescription:
            'Hands-on air ticketing course in Dhaka. Learn Amadeus and Galileo GDS, PNR building, fare quoting, ticket issue and refund in 36 classes. Certificate and job placement support.',

        status: 'upcoming',
        isActive: true,
        isFeatured: true,
        order: 1,
    },
    {
        categoryName: 'Visa Processing',
        title: 'Complete Visa Processing & Documentation Course',
        // পাসপোর্ট + ম্যাপ ফ্ল্যাট-লে (কভার) আর কনসাল্টেশন ডেস্ক।
        image:
            'https://images.pexels.com/photos/1051075/pexels-photo-1051075.jpeg?auto=compress&cs=tinysrgb&w=1200',
        gallery: [
            'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1200',
        ],
        shortDescription:
            'Master visa documentation and filing for Schengen, UK, USA, Canada, Australia and Asia. Live online classes covering forms, financial profiles, interviews and refusal handling.',
        longDescription: VISA_PROCESSING_BODY,

        courseType: 'online',
        // অনলাইন কোর্স, তাই location ইচ্ছে করেই ফাঁকা — সার্ভারও এটাই এনফোর্স করে

        totalSeats: 40,
        enrolledCount: 27,

        duration: '2 Months (30 Classes)',
        startDate: '2026-09-20',
        classSchedule: 'Sun, Tue, Thu — 8:30 PM to 10:00 PM (Live on Zoom)',

        instructor: 'Farhana Akter',
        instructorTitle: 'Senior Visa Consultant — 9 years, 4000+ files processed',

        price: 9500,
        oldPrice: 14000,
        currency: 'BDT',

        level: 'Beginner Friendly',
        language: 'Bangla',
        tags: ['Visa', 'Documentation', 'Schengen', 'Student Visa', 'Embassy', 'Consultancy'],

        metaTitle: 'Visa Processing & Documentation Course Online | Visalink Air',
        metaDescription:
            'Live online visa processing course. Learn documentation, embassy forms, financial profile building, interview preparation and refusal handling for Schengen, UK, USA, Canada and Asia.',

        status: 'ongoing',
        isActive: true,
        isFeatured: true,
        order: 2,
    },
];

// ===================================================================
//  Runner
// ===================================================================

const run = async (): Promise<void> => {
    await mongoose.connect(config.database_url);
    console.log(`Connected to ${config.database_url}\n`);

    // ---------- Categories ----------
    const categoryIds = new Map<string, string>();

    for (const cat of CATEGORIES) {
        const existing = await CourseCategory.findOne({ name: cat.name }).lean();

        if (existing) {
            categoryIds.set(cat.name, String(existing._id));
            console.log(`  = category kept   : ${cat.name}`);
        } else {
            // CourseService দিয়ে বানানো হচ্ছে যাতে slug/ডুপ্লিকেট চেক
            // অ্যাডমিন ফর্মের মতোই চলে
            const created = await CourseService.createCategory(cat);
            categoryIds.set(cat.name, String(created._id));
            console.log(`  + category created: ${cat.name}  (slug: ${created.slug})`);
        }
    }

    // ---------- Courses ----------
    for (const { categoryName, ...course } of COURSES) {
        const category = categoryIds.get(categoryName);
        if (!category) throw new Error(`Category not resolved: ${categoryName}`);

        const existing = await Course.findOne({ title: course.title }).lean();
        const payload = { ...course, category } as Partial<ICourse>;

        if (existing) {
            await CourseService.updateCourse(String(existing._id), payload);
            console.log(`  ~ course updated  : ${course.title}`);
        } else {
            const created = await CourseService.createCourse(payload);
            console.log(`  + course created  : ${course.title}  (slug: ${created.slug})`);
        }
    }

    // ---------- Summary ----------
    const totalCategories = await CourseCategory.countDocuments();
    const totalCourses = await Course.countDocuments();
    console.log(`\nDone. ${totalCategories} categories, ${totalCourses} courses in the database.`);

    await mongoose.disconnect();
};

run().catch(async (err) => {
    console.error('Seed failed:', err instanceof Error ? err.message : err);
    await mongoose.disconnect().catch(() => undefined);
    process.exit(1);
});
