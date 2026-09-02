/**
 * Seed script: push the testimonials that used to be hard-coded on the home
 * page into the database, so they can be edited/deleted from the dashboard
 * like any other testimonial.
 *
 * These three came from the client's LanguageContext fallback strings — the
 * home page slider no longer has any built-in content of its own.
 *
 * Run: npm run seed:testimonials
 *
 * Safe to run repeatedly — a testimonial with the same name is skipped, not
 * duplicated. Pass --force to overwrite the matching rows instead.
 */

import mongoose from 'mongoose';
import config from '../app/config';
import { Testimonial } from '../app/modules/testimonial/testimonial.model';

const FORCE = process.argv.includes('--force');

const samples = [
    {
        name: 'Tanzina Rupa',
        role: 'Verified Client',
        rating: 5,
        message:
            'Visalink Air helped me get my Singapore tourist visa within a week. Their expert guidance made the entire process smooth and hassle-free!',
    },
    {
        name: 'Mabia Rahman',
        role: 'Verified Client',
        rating: 5,
        message:
            'Amazing service! They handled my USA tourist visa application professionally. The team is very knowledgeable and responsive.',
    },
    {
        name: 'Forkan Uddin',
        role: 'Verified Client',
        rating: 5,
        message:
            'I got my student visa for Canada through Visalink Air. They guided me through every step from university selection to visa approval.',
    },
];

(async () => {
    try {
        await mongoose.connect(config.database_url);
        console.log('✅ Connected to MongoDB');

        let created = 0;
        let updated = 0;
        let skipped = 0;

        for (const sample of samples) {
            const existing = await Testimonial.findOne({ name: sample.name });

            if (!existing) {
                await Testimonial.create(sample);
                created++;
                console.log(`  + ${sample.name}`);
            } else if (FORCE) {
                await Testimonial.findByIdAndUpdate(existing._id, sample, { runValidators: true });
                updated++;
                console.log(`  ~ ${sample.name} (overwritten)`);
            } else {
                skipped++;
                console.log(`  = ${sample.name} (already exists, skipped)`);
            }
        }

        const total = await Testimonial.countDocuments();
        console.log('');
        console.log(`created: ${created}, updated: ${updated}, skipped: ${skipped}`);
        console.log(`testimonials now in DB: ${total}`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err);
        process.exit(1);
    }
})();
