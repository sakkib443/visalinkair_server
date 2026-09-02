// ===================================================================
// Users collection cleanup — single-role (super_admin) redesign
// -------------------------------------------------------------------
// User schema এখন শুধু এইটুকু রাখে:
//   email, password, firstName, lastName, phone, avatar, bio,
//   role ('super_admin'), status ('active' | 'blocked'), isDeleted,
//   password-reset fields, lastLoginAt, timestamps
//
// পুরনো ডকুমেন্টগুলোতে HR / seller / storefront-এর অনেক ফিল্ড পড়ে আছে।
// Mongoose সেগুলো আর পড়ে না, কিন্তু DB-তে থেকে যায়। এই script সেগুলো
// $unset করে দেয় এবং বাকি ডেটা নতুন schema-র সাথে মিলিয়ে নেয়:
//
//   1. প্রতিটি user-এর role = 'super_admin'
//   2. status 'pending' (বা অজানা কিছু) → 'active'
//   3. উপরে না-থাকা সব ফিল্ড unset
//
// চালাতে:  node migrate-users-single-role.js [--dry-run]
// DATABASE_URL .env থেকে নেয়; না পেলে MIGRATE_DB_URL env var দিন।
// ===================================================================

require('dotenv').config();
const mongoose = require('mongoose');

const DRY = process.argv.includes('--dry-run');
const URI = process.env.DATABASE_URL || process.env.MIGRATE_DB_URL;

// নতুন schema-তে যেসব key টিকে থাকে — এর বাইরের সবকিছু বাদ।
const KEEP = new Set([
    '_id',
    '__v',
    'email',
    'password',
    'firstName',
    'lastName',
    'phone',
    'avatar',
    'bio',
    'role',
    'status',
    'isDeleted',
    'passwordResetToken',
    'passwordResetExpires',
    'passwordChangedAt',
    'lastLoginAt',
    'createdAt',
    'updatedAt',
]);

(async () => {
    if (!URI) {
        console.error('✖ DATABASE_URL not set (check .env or pass MIGRATE_DB_URL).');
        process.exit(1);
    }

    await mongoose.connect(URI);
    const users = mongoose.connection.db.collection('users');

    const docs = await users.find({}).toArray();
    console.log(`${DRY ? '[dry-run] ' : ''}users in collection: ${docs.length}`);

    let touched = 0;
    const droppedKeys = new Set();

    for (const doc of docs) {
        const unset = {};
        for (const key of Object.keys(doc)) {
            if (!KEEP.has(key)) {
                unset[key] = '';
                droppedKeys.add(key);
            }
        }

        const set = {};
        if (doc.role !== 'super_admin') set.role = 'super_admin';
        if (doc.status !== 'active' && doc.status !== 'blocked') set.status = 'active';
        if (typeof doc.lastName !== 'string') set.lastName = '';

        if (!Object.keys(unset).length && !Object.keys(set).length) continue;
        touched++;

        if (DRY) {
            console.log(
                `  ${doc.email}: unset ${Object.keys(unset).length} field(s)` +
                (Object.keys(set).length ? `, set ${JSON.stringify(set)}` : '')
            );
            continue;
        }

        const update = {};
        if (Object.keys(unset).length) update.$unset = unset;
        if (Object.keys(set).length) update.$set = set;
        await users.updateOne({ _id: doc._id }, update);
    }

    console.log('');
    console.log(`${DRY ? '[dry-run] ' : ''}documents needing changes: ${touched}`);
    if (droppedKeys.size) {
        console.log(`fields removed: ${[...droppedKeys].sort().join(', ')}`);
    }
    console.log(DRY ? 'Nothing written (--dry-run).' : '✅ Cleanup done.');

    await mongoose.disconnect();
    process.exit(0);
})().catch((err) => {
    console.error('✖ Migration failed:', err);
    process.exit(1);
});
