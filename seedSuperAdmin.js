// ===================================================================
// Super Admin Seeder
// Usage: node seedSuperAdmin.js
//   Upserts a super_admin user. Safe to run multiple times — password is
//   RESET to the value below every time (change email/password up top).
// ===================================================================

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const EMAIL = 'admin@visalinkair.com';
const PASSWORD = 'Admin@12345';
const FIRST_NAME = 'Super';
const LAST_NAME = 'Admin';
const ROLE = 'super_admin';

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
        console.log(`  Password : ${PASSWORD}`);
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
