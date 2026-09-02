/**
 * Blog Seed Script — Aerovista
 * Run: node seedBlogs.js
 * Seeds the database with initial blog posts
 */

require('dotenv').config();
const mongoose = require('mongoose');

const DB_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/visapro';

const blogs = [
    {
        title: "Complete Guide to UK Tourist Visa Application 2026",
        titleBn: "যুক্তরাজ্যের ট্যুরিস্ট ভিসা আবেদনের সম্পূর্ণ গাইড ২০২৬",
        slug: "uk-tourist-visa-guide-2026",
        excerpt: "Step-by-step guide to applying for a UK tourist visa from Bangladesh. Requirements, documents, fees, and tips to increase your approval chances.",
        excerptBn: "বাংলাদেশ থেকে যুক্তরাজ্যের ট্যুরিস্ট ভিসা আবেদনের ধাপে ধাপে গাইড।",
        content: `<h2>Introduction</h2><p>Applying for a UK tourist visa from Bangladesh can seem daunting, but with proper preparation and the right documentation, the process becomes straightforward. This comprehensive guide walks you through every step of the application process.</p><h2>Basic Requirements</h2><p>Before you start your application, make sure you have the following documents ready:</p><ul><li>Valid passport with at least 6 months validity</li><li>Recent passport-sized photographs</li><li>Bank statements for the last 6 months</li><li>Employment letter or business documents</li><li>Travel itinerary and hotel reservations</li><li>Travel insurance coverage</li></ul><h2>Step 1: Online Application</h2><p>Visit the official UK government visa application website and fill out the Standard Visitor Visa form. Be honest and thorough in your responses.</p><h2>Step 2: Document Preparation</h2><p>Organize your documents in a neat folder. All documents should be in English or have certified translations.</p><h2>Step 3: Biometrics Appointment</h2><p>After submitting your online application, book a biometrics appointment at the nearest Visa Application Centre (VAC). In Dhaka, the VAC is located at Gulshan.</p><h2>Visa Fees</h2><p>The current fee for a Standard Visitor Visa (6 months) is £100. Longer-term visas are available for frequent travelers.</p><h2>How Aerovista Can Help</h2><p>At Aerovista, we've helped thousands of applicants successfully obtain their UK visas. Contact us for a free consultation.</p>`,
        thumbnail: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800",
        tags: ["uk visa", "tourist visa", "travel", "immigration"],
        status: "published",
        isFeatured: true,
        totalViews: 4520,
        readingTime: 8,
        publishedAt: new Date("2026-02-20"),
    },
    {
        title: "Top 10 Scholarships for Bangladeshi Students in Canada",
        titleBn: "কানাডায় বাংলাদেশি শিক্ষার্থীদের জন্য সেরা ১০টি বৃত্তি",
        slug: "scholarships-bangladeshi-students-canada",
        excerpt: "Explore the best scholarship opportunities for Bangladeshi students looking to study in Canada. Full funding, partial scholarships, and more.",
        excerptBn: "কানাডায় পড়তে আগ্রহী বাংলাদেশি শিক্ষার্থীদের জন্য সেরা বৃত্তির সুযোগ।",
        content: `<h2>Why Study in Canada?</h2><p>Canada is one of the top destinations for international students, offering world-class education, multicultural environment, and excellent post-graduation work opportunities.</p><h2>1. Vanier Canada Graduate Scholarships</h2><p>Worth $50,000 per year for three years, this is one of Canada's most prestigious scholarships for doctoral students.</p><h2>2. Lester B. Pearson International Scholarship</h2><p>Offered by the University of Toronto, covering tuition, books, incidental fees, and full residence support for four years.</p><h2>3. Schulich Leader Scholarships</h2><p>For students pursuing STEM programs, worth up to $100,000 for a four-year program.</p><h2>Application Tips</h2><p>Start early, maintain a strong academic record, and prepare compelling personal statements. Aerovista can help you with the entire application process.</p>`,
        thumbnail: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800",
        tags: ["study abroad", "canada", "scholarships", "education"],
        status: "published",
        isFeatured: false,
        totalViews: 3890,
        readingTime: 10,
        publishedAt: new Date("2026-02-18"),
    },
    {
        title: "How We Helped 500+ Families Get Their Schengen Visa",
        titleBn: "কীভাবে আমরা ৫০০+ পরিবারকে শেনজেন ভিসা পেতে সাহায্য করেছি",
        slug: "500-families-schengen-visa-success",
        excerpt: "Real success stories of families who trusted Aerovista for their European travel dreams. Read about their journeys and our approach.",
        excerptBn: "ভিসাপ্রো-এর উপর আস্থা রেখে ইউরোপ ভ্রমণের স্বপ্ন পূরণ করা পরিবারগুলোর সত্যিকারের সাফল্যের গল্প।",
        content: `<h2>Our Journey</h2><p>Over the past 5 years, Aerovista has helped over 500 families successfully obtain their Schengen visas. Here are some of their stories.</p><h2>The Rahman Family</h2><p>Mr. Rahman wanted to take his family of four to visit relatives in Germany. After two previous rejections, he came to Aerovista. We restructured his application, prepared proper documentation, and guided him through the interview process. The result? Approved visas for the entire family.</p><h2>Our Approach</h2><p>We focus on three key areas: proper document preparation, clear travel purpose, and strong financial evidence. Our team reviews every application multiple times before submission.</p><h2>Your Turn</h2><p>If you're planning a trip to Europe, don't leave your visa application to chance. Contact Aerovista for expert guidance.</p>`,
        thumbnail: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800",
        tags: ["schengen visa", "europe", "success stories"],
        status: "published",
        isFeatured: false,
        totalViews: 2760,
        readingTime: 6,
        publishedAt: new Date("2026-02-15"),
    },
    {
        title: "Australia PR Visa: Points Calculator & Eligibility Guide",
        titleBn: "অস্ট্রেলিয়া পিআর ভিসা: পয়েন্ট ক্যালকুলেটর ও যোগ্যতা গাইড",
        slug: "australia-pr-visa-points-guide",
        excerpt: "Everything you need to know about the Australian Permanent Residency visa, including the points system, eligibility, and processing times.",
        excerptBn: "অস্ট্রেলিয়ার পিআর ভিসা সম্পর্কে সম্পূর্ণ তথ্য — পয়েন্ট সিস্টেম, যোগ্যতা এবং প্রসেসিং সময়।",
        content: `<h2>Understanding Australia's Points-Based System</h2><p>Australia uses a points-based system for skilled migration. You need a minimum of 65 points to be eligible, but competitive scores are usually 80+.</p><h2>Points Breakdown</h2><ul><li>Age: Up to 30 points (25-32 years gets maximum)</li><li>English Language: Up to 20 points (Superior English)</li><li>Work Experience: Up to 20 points</li><li>Education: Up to 20 points</li><li>State Nomination: 5-15 points</li></ul><h2>Processing Timeline</h2><p>The average processing time is 6-12 months, depending on your visa subclass and occupation.</p><h2>How Aerovista Can Help</h2><p>Our immigration experts can assess your eligibility, help you maximize your points score, and guide you through the entire PR application process.</p>`,
        thumbnail: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800",
        tags: ["australia", "permanent residency", "immigration", "pr visa"],
        status: "published",
        isFeatured: false,
        totalViews: 5120,
        readingTime: 12,
        publishedAt: new Date("2026-02-12"),
    },
    {
        title: "Essential Packing Tips for Hajj & Umrah Pilgrims",
        titleBn: "হজ্জ ও উমরাহ যাত্রীদের জন্য প্রয়োজনীয় প্যাকিং টিপস",
        slug: "packing-tips-hajj-umrah",
        excerpt: "A comprehensive packing checklist and travel tips for first-time Hajj and Umrah pilgrims from Bangladesh.",
        excerptBn: "বাংলাদেশ থেকে প্রথমবার হজ্জ ও উমরাহ যাত্রীদের জন্য বিস্তৃত প্যাকিং চেকলিস্ট এবং ভ্রমণ টিপস।",
        content: `<h2>Before You Pack</h2><p>Preparing for Hajj or Umrah is a spiritual journey that begins long before you board the plane. Proper packing ensures you can focus on your ibadah without worrying about essentials.</p><h2>Essential Items</h2><ul><li>Ihram (2 sets recommended)</li><li>Comfortable walking shoes/sandals</li><li>Unscented soap and toiletries</li><li>Prescription medications</li><li>Money belt for security</li><li>Small prayer mat</li></ul><h2>Health Tips</h2><p>Stay hydrated, wear sunscreen, and carry basic first-aid supplies. The climate in Saudi Arabia can be harsh, especially during summer months.</p><h2>Aerovista Hajj Packages</h2><p>We offer comprehensive Hajj and Umrah packages that include visa processing, flights, accommodation, and guided services.</p>`,
        thumbnail: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800",
        tags: ["hajj", "umrah", "travel tips", "packing"],
        status: "published",
        isFeatured: false,
        totalViews: 3340,
        readingTime: 7,
        publishedAt: new Date("2026-02-10"),
    },
    {
        title: "Malaysia Work Visa: Requirements & Application Process",
        titleBn: "মালয়েশিয়া ওয়ার্ক ভিসা: প্রয়োজনীয়তা ও আবেদন প্রক্রিয়া",
        slug: "malaysia-work-visa-requirements",
        excerpt: "Complete guide to getting a work visa for Malaysia. Learn about different work permit categories, required documents, and processing timeline.",
        excerptBn: "মালয়েশিয়ার ওয়ার্ক ভিসা পাওয়ার সম্পূর্ণ গাইড — ওয়ার্ক পারমিটের ক্যাটেগরি, প্রয়োজনীয় কাগজপত্র।",
        content: `<h2>Types of Work Permits in Malaysia</h2><p>Malaysia offers several types of work permits depending on your profession and qualifications.</p><h2>Employment Pass (EP)</h2><p>For foreign professionals with a contract of at least 2 years and a minimum salary of RM5,000. Categories include EP I, EP II, and EP III based on salary levels.</p><h2>Required Documents</h2><ul><li>Valid passport (minimum 18 months validity)</li><li>Employment contract</li><li>Educational certificates (attested)</li><li>Medical fitness certificate</li><li>Company registration documents</li></ul><h2>Processing Timeline</h2><p>Standard processing takes 4-8 weeks. Aerovista can expedite the process with our established connections and expertise.</p>`,
        thumbnail: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800",
        tags: ["malaysia", "work visa", "work permit", "employment"],
        status: "published",
        isFeatured: false,
        totalViews: 2180,
        readingTime: 9,
        publishedAt: new Date("2026-02-08"),
    },
];

async function seed() {
    try {
        await mongoose.connect(DB_URL);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;

        // Find an admin user to set as author
        const usersCol = db.collection('users');
        let admin = await usersCol.findOne({ role: 'admin' });
        if (!admin) {
            console.log('⚠️ No admin user found. Creating a placeholder admin reference...');
            admin = { _id: new mongoose.Types.ObjectId() };
        }
        console.log(`👤 Using author: ${admin.email || admin._id}`);

        const blogsCol = db.collection('blogs');

        // Check existing
        const existing = await blogsCol.countDocuments();
        if (existing > 0) {
            console.log(`⚠️ ${existing} blogs already exist. Skipping seed.`);
            await mongoose.disconnect();
            return;
        }

        // Prepare blog docs
        const docs = blogs.map(b => ({
            ...b,
            author: admin._id,
            authorRole: 'admin',
            likeCount: 0,
            likedBy: [],
            commentCount: 0,
            shareCount: 0,
            wordCount: b.content.split(/\s+/).length,
            allowComments: true,
            isPopular: b.totalViews > 3000,
            createdAt: b.publishedAt,
            updatedAt: b.publishedAt,
        }));

        const result = await blogsCol.insertMany(docs);
        console.log(`✅ Seeded ${result.insertedCount} blog posts successfully!`);

        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    }
}

seed();
