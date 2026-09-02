// ===================================================================
// Visalink Air - Analytics Service
//
// The dashboard used to pull revenue, application counts, sparklines and
// recent-activity lists from the Bookings collection. Bookings has been
// removed, so those fields either come from other collections that still
// make sense (Users, Inquiries) or are returned as safe zero values —
// deliberately, so the admin home page keeps rendering unchanged and
// shows honest "no data yet" numbers rather than a broken layout.
// ===================================================================

import { User } from '../user/user.model';
import { Inquiry } from '../inquiry/inquiry.model';

const SPARK_DAYS = 12;

/** Bucket a date into 0..SPARK_DAYS-1; outside the window → -1. */
const bucketOf = (d: Date, start: Date): number => {
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const idx = Math.round((day.getTime() - start.getTime()) / 86400000);
    return idx >= 0 && idx < SPARK_DAYS ? idx : -1;
};

/** Signed % change vs previous period + arrow direction. */
const pctChange = (current: number, previous: number) => {
    const pct = previous === 0
        ? (current > 0 ? 100 : 0)
        : ((current - previous) / previous) * 100;
    const rounded = Math.round(pct * 10) / 10;
    return {
        change: `${rounded > 0 ? '+' : ''}${rounded}%`,
        trend: rounded >= 0 ? 'up' : 'down',
    };
};

const getDashboard = async () => {
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const sparkStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (SPARK_DAYS - 1));

    // Everything the dashboard now measures is either User data or
    // Inquiry data — the two collections that survived the Bookings
    // deletion.
    const [
        totalClients,
        clientsThisMonth,
        clientsLastMonth,
        recentClients,
        allInquiries,
    ] = await Promise.all([
        User.countDocuments({ role: 'super_admin' }),
        User.countDocuments({ role: 'super_admin', createdAt: { $gte: startMonth } }),
        User.countDocuments({ role: 'super_admin', createdAt: { $gte: startLastMonth, $lt: startMonth } }),
        User.find({ role: 'super_admin', createdAt: { $gte: sparkStart } })
            .select('createdAt').lean(),
        Inquiry.find()
            .select('name service status createdAt')
            .sort({ createdAt: -1 })
            .lean(),
    ]);

    // Sparklines: clients per day, inquiries per day, and (in the absence
    // of a payments collection) inquiries doubling as the "activity"
    // series for the pending-applications card.
    const clientsSpark = new Array(SPARK_DAYS).fill(0);
    const applicationsSpark = new Array(SPARK_DAYS).fill(0);
    const pendingSpark = new Array(SPARK_DAYS).fill(0);
    // Revenue was booking-derived, so it stays flat until a new
    // revenue source is wired up.
    const revenueSpark = new Array(SPARK_DAYS).fill(0);

    for (const u of recentClients as { createdAt: Date }[]) {
        const i = bucketOf(new Date(u.createdAt), sparkStart);
        if (i >= 0) clientsSpark[i] += 1;
    }

    let visaThisMonth = 0;
    let visaLastMonth = 0;
    let pendingThisMonth = 0;
    let pendingLastMonth = 0;
    let totalApplications = 0;   // count of visa-flavoured inquiries
    let pendingApplications = 0; // inquiries still in 'new' or 'contacted'

    // Anything that reads as a visa inquiry counts against
    // "applications" on the dashboard.
    const isVisaService = (s: string) => /visa|study/.test(s || '');
    const isPendingStatus = (s: string) => s === 'new' || s === 'contacted';

    for (const iq of allInquiries as { service: string; status: string; createdAt: Date }[]) {
        const created = new Date(iq.createdAt);
        const inThisMonth = created >= startMonth;
        const inLastMonth = created >= startLastMonth && created < startMonth;
        const b = bucketOf(created, sparkStart);

        if (isVisaService(iq.service)) {
            totalApplications += 1;
            if (inThisMonth) visaThisMonth += 1;
            else if (inLastMonth) visaLastMonth += 1;
            if (b >= 0) applicationsSpark[b] += 1;
        }
        if (isPendingStatus(iq.status)) {
            pendingApplications += 1;
            if (inThisMonth) pendingThisMonth += 1;
            else if (inLastMonth) pendingLastMonth += 1;
            if (b >= 0) pendingSpark[b] += 1;
        }
    }

    // Recent activity: the six newest inquiries, presented in the shape
    // the admin home page already expects. Status is left as the raw
    // inquiry status ('new' / 'contacted' / 'converted' / 'closed' / 'spam').
    const recentApplications = (allInquiries as {
        _id: unknown; name: string; service: string; status: string; createdAt: Date;
    }[]).slice(0, 6).map((iq) => ({
        id: String(iq._id).slice(-6).toUpperCase(),
        name: iq.name,
        date: new Date(iq.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        type: iq.service,
        country: '',
        status: iq.status,
    }));

    return {
        totalClients,
        totalApplications,
        totalRevenue: 0,
        totalDue: 0,
        monthlyRevenue: 0,
        todayRevenue: 0,
        pendingApplications,
        approvedVisas: 0,
        rejectedVisas: 0,
        tourBookings: 0,
        hajjBookings: 0,
        studyAbroadApps: 0,
        totalBookings: 0,
        changes: {
            totalClients: pctChange(clientsThisMonth, clientsLastMonth),
            totalApplications: pctChange(visaThisMonth, visaLastMonth),
            totalRevenue: pctChange(0, 0),
            pendingApplications: pctChange(pendingThisMonth, pendingLastMonth),
        },
        sparklines: {
            totalClients: clientsSpark,
            totalApplications: applicationsSpark,
            totalRevenue: revenueSpark,
            pendingApplications: pendingSpark,
        },
        recentApplications,
        upcomingTours: [] as unknown[],
        // Marker for the frontend if it wants to hide the revenue block.
        // Kept out of the top level so existing consumers keep working.
        _bookingsFeatureRemoved: true,
    };
};

// Only the dashboard endpoint remains — the previous team-performance
// and full-reports functions were both driven entirely by bookings.
export const AnalyticsService = {
    getDashboard,
};
