// ===================================================================
// Visalink Air — Remark Controller
// CRUD + list-by-service with date-range / single-date filters, plus a
// tiny stats endpoint the sidebar cards use ("today / upcoming / total").
// ===================================================================

import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Remark } from './remark.model';
import { Inquiry } from '../inquiry/inquiry.model';
import AppError from '../../utils/AppError';

const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const endOfDay   = (d: Date) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };

// POST /api/remarks  { inquiryId, nextRemarkDate, message }
// Creates the first-and-only remark record for that inquiry. If one
// already exists, 409 → the client should PATCH it (append a follow-up)
// instead of creating a second record.
export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { inquiryId, nextRemarkDate, message } = req.body || {};
        if (!inquiryId || !nextRemarkDate || !message) {
            throw new AppError(400, 'inquiryId, nextRemarkDate and message are required');
        }
        if (!Types.ObjectId.isValid(inquiryId)) {
            throw new AppError(400, 'Invalid inquiryId');
        }
        const inquiry = await Inquiry.findById(inquiryId);
        if (!inquiry) throw new AppError(404, 'Inquiry not found');

        const exists = await Remark.findOne({ inquiryId });
        if (exists) {
            throw new AppError(409, 'A remark already exists for this inquiry — update it instead.');
        }

        const doc = await Remark.create({
            inquiryId,
            service: inquiry.service,
            inquiryDate: inquiry.createdAt,
            inquirySnapshot: {
                name: inquiry.name,
                phone: inquiry.phone,
                email: inquiry.email,
                subject: inquiry.subject,
            },
            nextRemarkDate: new Date(nextRemarkDate),
            message: String(message).trim(),
        });

        res.status(201).json({ success: true, data: doc });
    } catch (err) { next(err); }
};

// GET /api/remarks?service=&from=&to=&date=&search=&page=&limit=
// Range and single-date filters both apply to `nextRemarkDate`.
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const q = req.query as Record<string, string>;
        const filter: Record<string, unknown> = {};

        if (q.service) filter.service = q.service;

        if (q.date) {
            // Single-day filter (from midnight to end-of-day).
            const d = new Date(q.date);
            if (!isNaN(d.getTime())) {
                filter.nextRemarkDate = { $gte: startOfDay(d), $lte: endOfDay(d) };
            }
        } else if (q.from || q.to) {
            const range: Record<string, Date> = {};
            if (q.from) {
                const f = new Date(q.from);
                if (!isNaN(f.getTime())) range.$gte = startOfDay(f);
            }
            if (q.to) {
                const t = new Date(q.to);
                if (!isNaN(t.getTime())) range.$lte = endOfDay(t);
            }
            if (Object.keys(range).length) filter.nextRemarkDate = range;
        }

        if (q.search) {
            const rx = new RegExp(q.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            filter.$or = [
                { message: rx },
                { 'inquirySnapshot.name': rx },
                { 'inquirySnapshot.phone': rx },
                { 'inquirySnapshot.email': rx },
            ];
        }

        const page = Math.max(1, Number(q.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(q.limit) || 20));
        const [items, total] = await Promise.all([
            Remark.find(filter).sort({ nextRemarkDate: 1 }).skip((page - 1) * limit).limit(limit),
            Remark.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: items,
            meta: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (err) { next(err); }
};

// GET /api/remarks/stats?service=  — counters for the list-page cards
export const getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const q = req.query as Record<string, string>;
        const base: Record<string, unknown> = {};
        if (q.service) base.service = q.service;

        const now = new Date();
        const todayStart = startOfDay(now);
        const todayEnd = endOfDay(now);
        const in7 = new Date(todayEnd); in7.setDate(in7.getDate() + 7);

        const [total, today, upcoming, overdue] = await Promise.all([
            Remark.countDocuments(base),
            Remark.countDocuments({ ...base, nextRemarkDate: { $gte: todayStart, $lte: todayEnd } }),
            Remark.countDocuments({ ...base, nextRemarkDate: { $gt: todayEnd, $lte: in7 } }),
            Remark.countDocuments({ ...base, nextRemarkDate: { $lt: todayStart } }),
        ]);

        res.json({ success: true, data: { total, today, upcoming, overdue } });
    } catch (err) { next(err); }
};

// GET /api/remarks/by-inquiry/:inquiryId  — used by the modal to
// decide "create new" vs "edit existing" before it opens.
export const getByInquiry = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { inquiryId } = req.params;
        if (!Types.ObjectId.isValid(inquiryId)) throw new AppError(400, 'Invalid inquiryId');
        const doc = await Remark.findOne({ inquiryId });
        // 200 with data:null — this is a "does it exist?" probe, not an error.
        res.json({ success: true, data: doc });
    } catch (err) { next(err); }
};

// GET /api/remarks/:id
export const getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const doc = await Remark.findById(req.params.id);
        if (!doc) throw new AppError(404, 'Remark not found');
        res.json({ success: true, data: doc });
    } catch (err) { next(err); }
};

// PATCH /api/remarks/:id
//   Body fields — every one optional:
//     { nextRemarkDate, message }              — edit the first remark
//     { addFollowUp: { date, message } }       — append a follow-up
//     { updateFollowUp: { id, date, message }} — edit an existing follow-up
//     { removeFollowUp: <followUpId> }         — delete a single follow-up
export const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const doc = await Remark.findById(req.params.id);
        if (!doc) throw new AppError(404, 'Remark not found');

        const { nextRemarkDate, message, addFollowUp, updateFollowUp, removeFollowUp } = req.body || {};

        if (nextRemarkDate !== undefined) {
            const d = new Date(nextRemarkDate);
            if (isNaN(d.getTime())) throw new AppError(400, 'Invalid nextRemarkDate');
            doc.nextRemarkDate = d;
        }
        if (message !== undefined) {
            const t = String(message).trim();
            if (!t) throw new AppError(400, 'Message cannot be empty');
            doc.message = t;
        }

        if (addFollowUp && typeof addFollowUp === 'object') {
            if (!addFollowUp.date || !addFollowUp.message) {
                throw new AppError(400, 'Follow-up needs both date and message');
            }
            const d = new Date(addFollowUp.date);
            if (isNaN(d.getTime())) throw new AppError(400, 'Invalid follow-up date');
            doc.followUps.push({
                date: d,
                message: String(addFollowUp.message).trim(),
                createdAt: new Date(),
            } as any);
        }

        if (updateFollowUp && typeof updateFollowUp === 'object') {
            const { id, date, message: fMsg } = updateFollowUp;
            if (!id) throw new AppError(400, 'updateFollowUp needs an id');
            const fu = doc.followUps.find((f) => String((f as any)._id) === String(id));
            if (!fu) throw new AppError(404, 'Follow-up not found');
            if (date !== undefined) {
                const d = new Date(date);
                if (isNaN(d.getTime())) throw new AppError(400, 'Invalid follow-up date');
                fu.date = d;
            }
            if (fMsg !== undefined) {
                const t = String(fMsg).trim();
                if (!t) throw new AppError(400, 'Follow-up message cannot be empty');
                fu.message = t;
            }
        }

        if (removeFollowUp) {
            const before = doc.followUps.length;
            doc.followUps = doc.followUps.filter(
                (f) => String((f as any)._id) !== String(removeFollowUp),
            ) as any;
            if (doc.followUps.length === before) throw new AppError(404, 'Follow-up not found');
        }

        await doc.save();
        res.json({ success: true, data: doc });
    } catch (err) { next(err); }
};

// DELETE /api/remarks/:id — removes the whole record (all follow-ups).
export const remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const doc = await Remark.findByIdAndDelete(req.params.id);
        if (!doc) throw new AppError(404, 'Remark not found');
        res.json({ success: true, message: 'Remark deleted' });
    } catch (err) { next(err); }
};
