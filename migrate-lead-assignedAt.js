// ===================================================================
// Backfill Lead.assignedAt
// -------------------------------------------------------------------
// `assignedAt` field টা team-performance-এর "Assigned" হিসাবের জন্য পরে
// যোগ করা হয়েছে। আগে assign করা লিডগুলোতে এটা নেই, ফলে ওরা কোনো
// তারিখেই "assigned" হিসেবে গোনা হয় না। এই script সেগুলো ভরে দেয়:
//
//   1. assignment-এর callLog থাকলে তার `at` (সবচেয়ে সঠিক)
//   2. না থাকলে lead.createdAt (approximation)
//
// চালাতে:  node migrate-lead-assignedAt.js [--dry-run]
// DATABASE_URL .env থেকে নেয়; না পেলে MIGRATE_DB_URL env var দিন।
// ===================================================================

require('dotenv').config();
const mongoose = require('mongoose');

const DRY = process.argv.includes('--dry-run');
const URI = process.env.DATABASE_URL || process.env.MIGRATE_DB_URL;

// assignment বোঝানো callLog: status 'assigned', বা comment-এ assign-জাতীয় শব্দ
const ASSIGN_COMMENT = /^(assigned to|distributed to|auto-assigned to)/i;
const isAssignLog = (c) =>
    c && (c.status === 'assigned' || ASSIGN_COMMENT.test(String(c.comment || '')));

(async () => {
    if (!URI) {
        console.error('✖ DATABASE_URL not set (check .env or pass MIGRATE_DB_URL).');
        process.exit(1);
    }

    await mongoose.connect(URI);
    const leads = mongoose.connection.db.collection('leads');

    // assign করা আছে কিন্তু assignedAt নেই
    const targets = await leads
        .find({
            assignedTo: { $ne: null },
            $or: [{ assignedAt: null }, { assignedAt: { $exists: false } }],
        })
        .project({ _id: 1, createdAt: 1, callLogs: 1 })
        .toArray();

    console.log(`${DRY ? '[dry-run] ' : ''}leads needing assignedAt: ${targets.length}`);
    if (!targets.length) {
        console.log('nothing to do.');
        await mongoose.disconnect();
        return;
    }

    let fromLog = 0;
    let fromCreated = 0;
    const ops = [];

    for (const l of targets) {
        // শেষ assignment log-টা ধরি — মালিক বদল হলে সেটাই সাম্প্রতিক
        const logs = Array.isArray(l.callLogs) ? l.callLogs.filter(isAssignLog) : [];
        const last = logs.length ? logs[logs.length - 1] : null;
        const when = last && last.at ? new Date(last.at) : l.createdAt ? new Date(l.createdAt) : null;
        if (!when || Number.isNaN(when.getTime())) continue;

        if (last && last.at) fromLog++;
        else fromCreated++;

        ops.push({ updateOne: { filter: { _id: l._id }, update: { $set: { assignedAt: when } } } });
    }

    if (DRY) {
        console.log(`[dry-run] would update ${ops.length} (${fromLog} from call log, ${fromCreated} from createdAt)`);
        console.log('[dry-run] sample:', ops.slice(0, 3).map((o) => ({
            _id: String(o.updateOne.filter._id),
            assignedAt: o.updateOne.update.$set.assignedAt.toISOString(),
        })));
    } else {
        const r = await leads.bulkWrite(ops);
        console.log(`✔ updated ${r.modifiedCount} lead(s) — ${fromLog} from call log, ${fromCreated} from createdAt`);
    }

    await mongoose.disconnect();
})().catch((err) => {
    console.error('migration failed:', err);
    process.exit(1);
});
