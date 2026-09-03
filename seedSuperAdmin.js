// ===================================================================
// Super Admin Seeder
// Usage: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='...' node seedSuperAdmin.js
//   Upserts a super_admin user. Safe to run multiple times - the password is
//   RESET to ADMIN_PASSWORD every time.
// ===================================================================

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Credentials come from the environment so no weak default ever ships in the
// repo. Both are required - the script refuses to run without them.
const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;
const FIRST_NAME = process.env.ADMIN_FIRST_NAME || 'Super';
const LAST_NAME = process.env.ADMIN_LAST_NAME || 'Admin';
const ROLE = 'super_admin';

if (!EMAIL || !PASSWORD) {
    console.error('Missing ADMIN_EMAIL / ADMIN_PASSWORD.');
    console.error("  ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='your-password' node seedSuperAdmin.js");
    process.exit(1);
}
if (PASSWORD.length < 8) {
    console.error('X ADMIN_PASSWORD must be at least 8 characters.');
    process.exit(1);
}

const DB_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/aerovista';
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

(async () => {
    try {
        await mongoose.connect(DB_URL);
        console.log('✅ Connected to MongoDB');

        const User = mongoose.connection.collection('users');
        const hashed = await bcrypt.hash(PASSWORD, SALT_ROUNDS);
        const now = new Date();

        const result = await User.updateOne(
            { email: EMAIL.toLowerCase() },
            {
                $set: {
                    email: EMAIL.toLowerCase(),
                    password: hashed,
                    firstName: FIRST_NAME,
                    lastName: LAST_NAME,
                    role: ROLE,
                    status: 'active',
                    isDeleted: false,
                    updatedAt: now,
                    passwordChangedAt: new Date(now.getTime() - 1000),
                },
                $setOnInsert: {
                    createdAt: now,
                    phone: '',
                    avatar: '',
                    bio: '',
                },
            },
            { upsert: true }
        );

        console.log('');
        console.log('══════════════════════════════════════════════════════');
        console.log('  ✅ SUPER ADMIN READY');
        console.log('══════════════════════════════════════════════════════');
        console.log(`  Email    : ${EMAIL}`);
        console.log('  Password : (the ADMIN_PASSWORD you supplied)');
        console.log(`  Role     : ${ROLE}`);
        console.log(`  Action   : ${result.upsertedCount ? 'created new' : 'updated existing (password reset)'}`);
        console.log('══════════════════════════════════════════════════════');
        console.log('');
        console.log('  Login at: http://localhost:3000/login');
        console.log('');

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err);
        process.exit(1);
    }
})();
