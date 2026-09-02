const { MongoClient } = require("mongodb");
const uri = "mongodb+srv://visaprobd:visaprobd@cluster0.b5kfivm.mongodb.net/visaprobd?appName=Cluster0";

const packages = [
    // ===== Hajj Packages =====
    {
        name: "Economy Hajj 2025", nameBn: "ইকোনমি হজ্জ ২০২৫", slug: "economy-hajj-2025", type: "hajj",
        subtitle: "Essential Spiritual Journey", subtitleBn: "অপরিহার্য আধ্যাত্মিক যাত্রা",
        image: "https://images.pexels.com/photos/2818108/pexels-photo-2818108.jpeg?auto=compress&cs=tinysrgb&w=1200",
        duration: "21 Days", durationBn: "২১ দিন", price: 650000, oldPrice: 720000, currency: "BDT",
        groupSize: 50, bookings: 28, departureDate: "2025-06-01",
        hotel: "3-Star Makkah + 3-Star Madinah + Mina Tent", hotelBn: "৩-স্টার মক্কা + ৩-স্টার মদিনা + মিনা তাঁবু",
        distance: "800m from Haram", distanceBn: "হারাম থেকে ৮০০ মিটার",
        meals: "Breakfast & Dinner", mealsBn: "সকাল ও রাতের খাবার",
        description: "Affordable Hajj package with all essential services for a fulfilling pilgrimage.",
        descriptionBn: "পরিপূর্ণ তীর্থযাত্রার জন্য সকল অপরিহার্য সেবা সহ সাশ্রয়ী হজ্জ প্যাকেজ।",
        features: ["Shared Room (4 persons)", "Air-conditioned Bus", "Visa Processing", "Guided Rituals", "Makkah & Madinah Stay", "Basic Meals", "Sacrifice Included"],
        featuresBn: ["শেয়ার রুম (৪ জন)", "শীতাতপ নিয়ন্ত্রিত বাস", "ভিসা প্রসেসিং", "গাইডেড রিচুয়াল", "মক্কা ও মদিনা থাকা", "বেসিক খাবার", "কুরবানি অন্তর্ভুক্ত"],
        excludes: ["Personal expenses", "Extra luggage", "Laundry"],
        excludesBn: ["ব্যক্তিগত খরচ", "অতিরিক্ত লাগেজ", "লন্ড্রি"],
        isPopular: false, status: "upcoming", isActive: true, isFeatured: true, order: 1,
        tags: ["Hajj", "Economy", "Budget"],
    },
    {
        name: "Standard Hajj 2025", nameBn: "স্ট্যান্ডার্ড হজ্জ ২০২৫", slug: "standard-hajj-2025", type: "hajj",
        subtitle: "Comfortable Pilgrimage Experience", subtitleBn: "আরামদায়ক তীর্থযাত্রা অভিজ্ঞতা",
        image: "https://images.pexels.com/photos/2818108/pexels-photo-2818108.jpeg?auto=compress&cs=tinysrgb&w=1200",
        duration: "25 Days", durationBn: "২৫ দিন", price: 850000, oldPrice: 950000, currency: "BDT",
        groupSize: 30, bookings: 18, departureDate: "2025-05-28",
        hotel: "4-Star Makkah + 4-Star Madinah + AC Mina Tent", hotelBn: "৪-স্টার মক্কা + ৪-স্টার মদিনা + এসি মিনা তাঁবু",
        distance: "400m from Haram", distanceBn: "হারাম থেকে ৪০০ মিটার",
        meals: "Full Board", mealsBn: "ফুল বোর্ড",
        description: "Comfortable Hajj experience with premium accommodation and full meal service.",
        descriptionBn: "প্রিমিয়াম আবাসন ও পূর্ণ খাবার সেবা সহ আরামদায়ক হজ্জ অভিজ্ঞতা।",
        features: ["Shared Room (2 persons)", "Private AC Transport", "Visa + Insurance", "Scholar Guidance", "Full Board Meals", "Ziyarah Tours", "Emergency Support", "Sacrifice Included"],
        featuresBn: ["শেয়ার রুম (২ জন)", "প্রাইভেট এসি ট্রান্সপোর্ট", "ভিসা + ইনসুরেন্স", "আলেমদের গাইডেন্স", "ফুল বোর্ড খাবার", "জিয়ারাহ ট্যুর", "জরুরি সাপোর্ট", "কুরবানি অন্তর্ভুক্ত"],
        isPopular: true, status: "upcoming", isActive: true, isFeatured: true, order: 2,
        tags: ["Hajj", "Standard", "Comfortable"],
    },
    {
        name: "Premium Hajj 2025", nameBn: "প্রিমিয়াম হজ্জ ২০২৫", slug: "premium-hajj-2025", type: "hajj",
        subtitle: "Luxury VIP Experience", subtitleBn: "বিলাসবহুল ভিআইপি অভিজ্ঞতা",
        image: "https://images.pexels.com/photos/2818108/pexels-photo-2818108.jpeg?auto=compress&cs=tinysrgb&w=1200",
        duration: "30 Days", durationBn: "৩০ দিন", price: 1450000, oldPrice: 1600000, currency: "BDT",
        groupSize: 15, bookings: 8, departureDate: "2025-05-25",
        hotel: "5-Star Makkah + 5-Star Madinah + VIP Mina", hotelBn: "৫-স্টার মক্কা + ৫-স্টার মদিনা + ভিআইপি মিনা",
        distance: "50m from Haram", distanceBn: "হারাম থেকে ৫০ মিটার",
        meals: "Full Board + Snacks", mealsBn: "ফুল বোর্ড + স্ন্যাকস",
        description: "Ultimate VIP Hajj experience with 5-star accommodation steps from Haram.",
        descriptionBn: "হারামের পাশে ৫-তারা আবাসন সহ চূড়ান্ত ভিআইপি হজ্জ অভিজ্ঞতা।",
        features: ["Private Room", "Luxury Transport", "VIP Visa Service", "Personal Scholar", "Haram View Room", "Gourmet Meals", "All Ziyarah Tours", "24/7 Concierge", "Laundry Service", "Medical Support"],
        featuresBn: ["প্রাইভেট রুম", "বিলাসবহুল ট্রান্সপোর্ট", "ভিআইপি ভিসা সার্ভিস", "ব্যক্তিগত আলেম", "হারাম ভিউ রুম", "গুর্মে খাবার", "সব জিয়ারাহ ট্যুর", "২৪/৭ কনসিয়ার্জ", "লন্ড্রি সার্ভিস", "মেডিকেল সাপোর্ট"],
        isPopular: false, status: "upcoming", isActive: true, isFeatured: true, order: 3,
        tags: ["Hajj", "Premium", "VIP", "Luxury"],
    },
    // ===== Umrah Packages =====
    {
        name: "7-Day Umrah Economy", nameBn: "৭-দিনের ওমরাহ ইকোনমি", slug: "7-day-umrah-economy", type: "umrah",
        subtitle: "Short & Sweet Spiritual Trip", subtitleBn: "সংক্ষিপ্ত ও মধুর আধ্যাত্মিক ভ্রমণ",
        image: "https://images.pexels.com/photos/2818108/pexels-photo-2818108.jpeg?auto=compress&cs=tinysrgb&w=1200",
        duration: "7 Days", durationBn: "৭ দিন", price: 95000, oldPrice: 110000, currency: "BDT",
        groupSize: 40, bookings: 35, departureDate: "2025-03-15",
        hotel: "3-Star Hotel", hotelBn: "৩-স্টার হোটেল",
        distance: "700m from Haram", distanceBn: "হারাম থেকে ৭০০ মিটার",
        meals: "Breakfast", mealsBn: "সকালের খাবার",
        description: "A short but spiritually fulfilling Umrah experience with all essentials covered.",
        descriptionBn: "সকল প্রয়োজনীয়তা সহ একটি সংক্ষিপ্ত কিন্তু আধ্যাত্মিকভাবে পরিপূর্ণ ওমরাহ অভিজ্ঞতা।",
        features: ["Visa Processing", "Return Flights", "Hotel Accommodation", "Airport Transfers", "Guided Umrah"],
        featuresBn: ["ভিসা প্রসেসিং", "রিটার্ন ফ্লাইট", "হোটেল আবাসন", "এয়ারপোর্ট ট্রান্সফার", "গাইডেড ওমরাহ"],
        isPopular: false, status: "active", isActive: true, isFeatured: false, order: 4,
        tags: ["Umrah", "Economy", "Short"],
    },
    {
        name: "10-Day Umrah Standard", nameBn: "১০-দিনের ওমরাহ স্ট্যান্ডার্ড", slug: "10-day-umrah-standard", type: "umrah",
        subtitle: "Extended Spiritual Stay", subtitleBn: "দীর্ঘ আধ্যাত্মিক থাকা",
        image: "https://images.pexels.com/photos/2818108/pexels-photo-2818108.jpeg?auto=compress&cs=tinysrgb&w=1200",
        duration: "10 Days", durationBn: "১০ দিন", price: 145000, oldPrice: 165000, currency: "BDT",
        groupSize: 30, bookings: 22, departureDate: "2025-04-10",
        hotel: "4-Star Hotel", hotelBn: "৪-স্টার হোটেল",
        distance: "400m from Haram", distanceBn: "হারাম থেকে ৪০০ মিটার",
        meals: "Full Board", mealsBn: "ফুল বোর্ড",
        description: "Extended stay with comfortable accommodation near Haram for a peaceful journey.",
        descriptionBn: "শান্তিপূর্ণ যাত্রার জন্য হারামের কাছে আরামদায়ক আবাসন সহ দীর্ঘ থাকা।",
        features: ["Visa Processing", "Return Flights", "4-Star Hotel", "Full Board Meals", "Guided Umrah", "Ziyarah Tours"],
        featuresBn: ["ভিসা প্রসেসিং", "রিটার্ন ফ্লাইট", "৪-স্টার হোটেল", "ফুল বোর্ড খাবার", "গাইডেড ওমরাহ", "জিয়ারাহ ট্যুর"],
        isPopular: true, status: "active", isActive: true, isFeatured: true, order: 5,
        tags: ["Umrah", "Standard", "Popular"],
    },
    {
        name: "14-Day Umrah Premium", nameBn: "১৪-দিনের ওমরাহ প্রিমিয়াম", slug: "14-day-umrah-premium", type: "umrah",
        subtitle: "Comprehensive Holy Journey", subtitleBn: "ব্যাপক পবিত্র যাত্রা",
        image: "https://images.pexels.com/photos/2818108/pexels-photo-2818108.jpeg?auto=compress&cs=tinysrgb&w=1200",
        duration: "14 Days", durationBn: "১৪ দিন", price: 195000, oldPrice: 225000, currency: "BDT",
        groupSize: 25, bookings: 15, departureDate: "2025-04-20",
        hotel: "4-Star Hotel", hotelBn: "৪-স্টার হোটেল",
        distance: "300m from Haram", distanceBn: "হারাম থেকে ৩০০ মিটার",
        meals: "Full Board", mealsBn: "ফুল বোর্ড",
        description: "Comprehensive Umrah package with extended stays in both Makkah and Madinah.",
        descriptionBn: "মক্কা ও মদিনা উভয় স্থানে দীর্ঘ থাকা সহ ব্যাপক ওমরাহ প্যাকেজ।",
        features: ["Visa Processing", "Return Flights", "4-Star Hotel", "Full Board Meals", "Guided Umrah", "All Ziyarah", "Private Transport"],
        featuresBn: ["ভিসা প্রসেসিং", "রিটার্ন ফ্লাইট", "৪-স্টার হোটেল", "ফুল বোর্ড খাবার", "গাইডেড ওমরাহ", "সব জিয়ারাহ", "প্রাইভেট ট্রান্সপোর্ট"],
        isPopular: false, status: "active", isActive: true, isFeatured: true, order: 6,
        tags: ["Umrah", "Premium", "Extended"],
    },
    {
        name: "Ramadan Special Umrah", nameBn: "রমজান স্পেশাল ওমরাহ", slug: "ramadan-special-umrah", type: "umrah",
        subtitle: "Blessed Month Special", subtitleBn: "বরকতময় মাসের বিশেষ",
        image: "https://images.pexels.com/photos/2818108/pexels-photo-2818108.jpeg?auto=compress&cs=tinysrgb&w=1200",
        duration: "15 Days", durationBn: "১৫ দিন", price: 245000, oldPrice: 285000, currency: "BDT",
        groupSize: 35, bookings: 30, departureDate: "2025-03-01",
        hotel: "5-Star Hotel", hotelBn: "৫-স্টার হোটেল",
        distance: "100m from Haram", distanceBn: "হারাম থেকে ১০০ মিটার",
        meals: "Full Board + Iftar & Suhoor", mealsBn: "ফুল বোর্ড + ইফতার ও সেহরি",
        description: "Experience the blessed month of Ramadan in the holy cities with premium services.",
        descriptionBn: "প্রিমিয়াম সেবা সহ পবিত্র শহরগুলোতে রমজানের বরকতময় মাস উপভোগ করুন।",
        features: ["Visa Processing", "Return Flights", "5-Star Hotel", "Iftar & Suhoor", "Premium Guided Umrah", "All Ziyarah", "Private Transport", "Laundry"],
        featuresBn: ["ভিসা প্রসেসিং", "রিটার্ন ফ্লাইট", "৫-স্টার হোটেল", "ইফতার ও সেহরি", "প্রিমিয়াম গাইডেড ওমরাহ", "সব জিয়ারাহ", "প্রাইভেট ট্রান্সপোর্ট", "লন্ড্রি"],
        isPopular: false, status: "active", isActive: true, isFeatured: true, order: 7,
        tags: ["Umrah", "Ramadan", "Special", "Premium"],
    },
];

async function seed() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("visaprobd");
        const col = db.collection("hajjumrahs");
        const existing = await col.countDocuments();
        if (existing > 0) {
            console.log(`⚠️  Already ${existing} packages exist. Dropping and re-seeding...`);
            await col.deleteMany({});
        }
        const now = new Date();
        const docs = packages.map(p => ({ ...p, createdAt: now, updatedAt: now }));
        const result = await col.insertMany(docs);
        console.log(`✅ Successfully inserted ${result.insertedCount} Hajj/Umrah packages!`);
        const all = await col.find({}, { projection: { name: 1, type: 1, price: 1 } }).toArray();
        all.forEach((p, i) => console.log(`  ${i + 1}. [${p.type.toUpperCase()}] ${p.name} — ৳${p.price.toLocaleString()}`));
    } catch (err) { console.error("❌ Error:", err.message); }
    finally { await client.close(); }
}

seed();
