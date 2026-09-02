const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/visapro';

const schema = new mongoose.Schema({}, { strict: false });
const HajjUmrah = mongoose.model('HajjUmrah', schema);

async function cleanup() {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected');

    // Show all current packages
    const all = await HajjUmrah.find({ type: 'hajj' }, { name: 1, status: 1, price: 1, createdAt: 1, slug: 1 }).lean();
    console.log('\n📦 All Hajj packages currently in DB:');
    all.forEach(p => console.log(` - [${p._id}] ${p.name} | status: ${p.status} | price: ${p.price} | created: ${p.createdAt}`));

    // Keep only the 3 we seeded today (economy-hajj, standard-hajj, premium-hajj)
    const keepSlugs = ['economy-hajj', 'standard-hajj', 'premium-hajj'];
    const toDelete = all.filter(p => !keepSlugs.includes(p.slug));

    if (toDelete.length === 0) {
        console.log('\n✅ No old packages to delete. DB is clean.');
    } else {
        const ids = toDelete.map(p => p._id);
        const result = await HajjUmrah.deleteMany({ _id: { $in: ids } });
        console.log(`\n🗑️  Deleted ${result.deletedCount} old package(s):`);
        toDelete.forEach(p => console.log(` - ${p.name}`));
    }

    // Final state
    const remaining = await HajjUmrah.find({ type: 'hajj' }, { name: 1, status: 1, price: 1 }).lean();
    console.log('\n✅ Remaining Hajj packages:');
    remaining.forEach(p => console.log(` - ${p.name} | ৳${p.price} | ${p.status}`));

    await mongoose.disconnect();
    console.log('\nDone!');
}

cleanup().catch(console.error);
