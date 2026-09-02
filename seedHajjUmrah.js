const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/visapro';

const hajjUmrahSchema = new mongoose.Schema({
    name: String, nameBn: String,
    slug: { type: String, unique: true, lowercase: true },
    type: { type: String, enum: ['hajj', 'umrah'], default: 'umrah' },
    subtitle: String, subtitleBn: String,
    image: String,
    duration: String, durationBn: String,
    price: Number, oldPrice: Number,
    currency: { type: String, default: 'BDT' },
    groupSize: { type: Number, default: 30 },
    bookings: { type: Number, default: 0 },
    departureDate: String,
    departureDates: [String],
    hotel: String, hotelBn: String,
    distance: String, distanceBn: String,
    meals: String, mealsBn: String,
    description: String, descriptionBn: String,
    longDescription: String, longDescriptionBn: String,
    features: [String], featuresBn: [String],
    excludes: [String], excludesBn: [String],
    tags: [String],
    isPopular: { type: Boolean, default: false },
    status: { type: String, default: 'active' },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    metaTitle: String, metaDescription: String,
}, { timestamps: true });

const HajjUmrah = mongoose.model('HajjUmrah', hajjUmrahSchema);

const packages = [
    {
        name: 'Economy Hajj',
        nameBn: 'ইকোনমি হজ্জ',
        slug: 'economy-hajj',
        type: 'hajj',
        subtitle: 'Essential Spiritual Journey',
        subtitleBn: 'অপরিহার্য আধ্যাত্মিক যাত্রা',
        duration: '21 Days',
        durationBn: '২১ দিন',
        price: 4500,
        oldPrice: 5200,
        currency: 'BDT',
        groupSize: 40,
        bookings: 0,
        departureDate: '2026-05-15',
        hotel: '3-Star Hotel',
        hotelBn: '৩-স্টার হোটেল',
        distance: '800m from Haram',
        distanceBn: 'হারাম থেকে ৮০০ মিটার',
        meals: 'Basic Meals Included',
        mealsBn: 'বেসিক খাবার অন্তর্ভুক্ত',
        description: 'An affordable and spiritually fulfilling Hajj package for all.',
        descriptionBn: 'সকলের জন্য সাশ্রয়ী মূল্যে একটি আধ্যাত্মিক হজ্জ প্যাকেজ।',
        features: [
            'Shared Room (4 persons)',
            'Air-conditioned Bus',
            'Visa Processing',
            'Guided Rituals',
            'Makkah & Madinah Stay',
            'Basic Meals Included',
        ],
        featuresBn: [
            'শেয়ার রুম (৪ জন)',
            'শীতাতপ নিয়ন্ত্রিত বাস',
            'ভিসা প্রসেসিং',
            'গাইডেড রিচুয়াল',
            'মক্কা ও মদিনা থাকা',
            'বেসিক খাবার অন্তর্ভুক্ত',
        ],
        excludes: [
            'Personal expenses',
            'Optional Ziyarah tours',
            'Travel insurance',
        ],
        excludesBn: [
            'ব্যক্তিগত খরচ',
            'ঐচ্ছিক জিয়ারাহ ট্যুর',
            'ট্রাভেল ইনসুরেন্স',
        ],
        tags: ['hajj', 'economy', 'affordable'],
        isPopular: false,
        status: 'active',
        isActive: true,
        isFeatured: false,
        order: 1,
        metaTitle: 'Economy Hajj Package - Aerovista',
        metaDescription: 'Affordable Economy Hajj Package with essential services.',
    },
    {
        name: 'Standard Hajj',
        nameBn: 'স্ট্যান্ডার্ড হজ্জ',
        slug: 'standard-hajj',
        type: 'hajj',
        subtitle: 'Comfortable Pilgrimage Experience',
        subtitleBn: 'আরামদায়ক তীর্থযাত্রা অভিজ্ঞতা',
        duration: '25 Days',
        durationBn: '২৫ দিন',
        price: 6500,
        oldPrice: 7500,
        currency: 'BDT',
        groupSize: 30,
        bookings: 0,
        departureDate: '2026-05-10',
        hotel: '4-Star Hotel',
        hotelBn: '৪-স্টার হোটেল',
        distance: '400m from Haram',
        distanceBn: 'হারাম থেকে ৪০০ মিটার',
        meals: 'Full Board Meals',
        mealsBn: 'ফুল বোর্ড খাবার',
        description: 'A comfortable and well-organized Hajj experience for families.',
        descriptionBn: 'পরিবারের জন্য একটি আরামদায়ক এবং সুশৃঙ্খল হজ্জ অভিজ্ঞতা।',
        features: [
            'Shared Room (2 persons)',
            'Private AC Transport',
            'Visa + Insurance',
            'Scholar Guidance',
            'Makkah & Madinah Stay',
            'Full Board Meals',
            'Ziyarah Tours',
            'Emergency Support',
        ],
        featuresBn: [
            'শেয়ার রুম (২ জন)',
            'প্রাইভেট এসি ট্রান্সপোর্ট',
            'ভিসা + ইনসুরেন্স',
            'আলেমদের গাইডেন্স',
            'মক্কা ও মদিনা থাকা',
            'ফুল বোর্ড খাবার',
            'জিয়ারাহ ট্যুর',
            'জরুরি সাপোর্ট',
        ],
        excludes: [
            'Personal expenses',
            'Laundry service',
            'Extra Ziyarah tours',
        ],
        excludesBn: [
            'ব্যক্তিগত খরচ',
            'লন্ড্রি সার্ভিস',
            'অতিরিক্ত জিয়ারাহ ট্যুর',
        ],
        tags: ['hajj', 'standard', 'family'],
        isPopular: true,
        status: 'active',
        isActive: true,
        isFeatured: true,
        order: 2,
        metaTitle: 'Standard Hajj Package - Aerovista',
        metaDescription: 'Comfortable Standard Hajj Package for families with full board meals.',
    },
    {
        name: 'Premium Hajj',
        nameBn: 'প্রিমিয়াম হজ্জ',
        slug: 'premium-hajj',
        type: 'hajj',
        subtitle: 'Luxury VIP Experience',
        subtitleBn: 'বিলাসবহুল ভিআইপি অভিজ্ঞতা',
        duration: '30 Days',
        durationBn: '৩০ দিন',
        price: 12000,
        oldPrice: 14000,
        currency: 'BDT',
        groupSize: 15,
        bookings: 0,
        departureDate: '2026-05-05',
        hotel: '5-Star Hotel',
        hotelBn: '৫-স্টার হোটেল',
        distance: '50m from Haram',
        distanceBn: 'হারাম থেকে ৫০ মিটার',
        meals: 'Gourmet Meals',
        mealsBn: 'গুর্মে খাবার',
        description: 'A luxurious VIP Hajj experience with premium services and personal scholar.',
        descriptionBn: 'ব্যক্তিগত আলেম ও প্রিমিয়াম সেবা সহ একটি বিলাসবহুল ভিআইপি হজ্জ অভিজ্ঞতা।',
        features: [
            'Private Room',
            'Luxury Transport',
            'VIP Visa Service',
            'Personal Scholar',
            'Haram View Room',
            'Gourmet Meals',
            'All Ziyarah Tours',
            '24/7 Concierge',
            'Laundry Service',
            'Medical Support',
        ],
        featuresBn: [
            'প্রাইভেট রুম',
            'বিলাসবহুল ট্রান্সপোর্ট',
            'ভিআইপি ভিসা সার্ভিস',
            'ব্যক্তিগত আলেম',
            'হারাম ভিউ রুম',
            'গুর্মে খাবার',
            'সব জিয়ারাহ ট্যুর',
            '২৪/৭ কনসিয়ার্জ',
            'লন্ড্রি সার্ভিস',
            'মেডিকেল সাপোর্ট',
        ],
        excludes: [
            'Personal shopping expenses',
            'International flight tickets',
        ],
        excludesBn: [
            'ব্যক্তিগত শপিং খরচ',
            'আন্তর্জাতিক ফ্লাইট টিকিট',
        ],
        tags: ['hajj', 'premium', 'vip', 'luxury'],
        isPopular: false,
        status: 'active',
        isActive: true,
        isFeatured: true,
        order: 3,
        metaTitle: 'Premium VIP Hajj Package - Aerovista',
        metaDescription: 'Luxury VIP Hajj Package with 5-star hotel and personal scholar.',
    },
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB connected');

        for (const pkg of packages) {
            const existing = await HajjUmrah.findOne({ slug: pkg.slug });
            if (existing) {
                console.log(`⚠️  Already exists: ${pkg.name} — skipping`);
            } else {
                await HajjUmrah.create(pkg);
                console.log(`✅ Created: ${pkg.name}`);
            }
        }

        console.log('\n🎉 Seed complete!');
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seed();
