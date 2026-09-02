// ===================================================================
// Visalink Air — Inquiry Controller
// Public: submit + get own by tracking id. Admin: list / update / delete.
// ===================================================================

import { Request, Response, NextFunction } from 'express';
import { Inquiry } from './inquiry.model';
import AppError from '../../utils/AppError';

// POST /api/inquiries  (public)
export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { service, name, phone } = req.body || {};
        if (!service || !name || !phone) {
            throw new AppError(400, 'service, name and phone are required');
        }
        const doc = await Inquiry.create({
            ...req.body,
            userAgent: req.headers['user-agent'] || '',
        });
        res.status(201).json({
            success: true,
            message: 'We received your message — our team will reach out shortly.',
            data: { _id: doc._id, createdAt: doc.createdAt },
        });
    } catch (err) {
        next(err);
    }
};

// GET /api/inquiries  (admin)
// filters: ?service=&status=&assignedTo=&dateFrom=&dateTo=&search=
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const q = req.query as Record<string, string>;
        const filter: Record<string, unknown> = {};
        if (q.service) filter.service = q.service;
        if (q.status) filter.status = q.status;
        if (q.assignedTo) filter.assignedTo = q.assignedTo === 'unassigned' ? null : q.assignedTo;
        if (q.dateFrom || q.dateTo) {
            const range: Record<string, Date> = {};
            if (q.dateFrom) range.$gte = new Date(q.dateFrom);
            if (q.dateTo) {
                const to = new Date(q.dateTo);
                to.setHours(23, 59, 59, 999);
                range.$lte = to;
            }
            filter.createdAt = range;
        }
        if (q.search) {
            const rx = new RegExp(q.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            filter.$or = [{ name: rx }, { phone: rx }, { email: rx }, { message: rx }];
        }

        const page = Math.max(1, Number(q.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(q.limit) || 20));
        const [items, total] = await Promise.all([
            Inquiry.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
            Inquiry.countDocuments(filter),
        ]);
        res.json({
            success: true,
            data: items,
            meta: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (err) {
        next(err);
    }
};

// GET /api/inquiries/stats  (admin) — counters for dashboard cards
export const getStats = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const startToday = new Date();
        startToday.setHours(0, 0, 0, 0);

        const [total, newCount, todayCount, converted, byService] = await Promise.all([
            Inquiry.countDocuments({}),
            Inquiry.countDocuments({ status: 'new' }),
            Inquiry.countDocuments({ createdAt: { $gte: startToday } }),
            Inquiry.countDocuments({ status: 'converted' }),
            Inquiry.aggregate([
                { $group: { _id: '$service', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
        ]);
        res.json({
            success: true,
            data: { total, newCount, todayCount, converted, byService },
        });
    } catch (err) {
        next(err);
    }
};

// GET /api/inquiries/:id  (admin)
export const getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const doc = await Inquiry.findById(req.params.id).populate('assignedTo', 'firstName lastName email');
        if (!doc) throw new AppError(404, 'Inquiry not found');
        res.json({ success: true, data: doc });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/inquiries/:id  (admin) — update status, note, assignment
export const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const allowed: Record<string, unknown> = {};
        const { status, adminNote, assignedTo, assignedToName } = req.body || {};
        if (status !== undefined) allowed.status = status;
        if (adminNote !== undefined) allowed.adminNote = adminNote;
        if (assignedTo !== undefined) allowed.assignedTo = assignedTo || null;
        if (assignedToName !== undefined) allowed.assignedToName = assignedToName;

        const doc = await Inquiry.findByIdAndUpdate(req.params.id, allowed, { new: true, runValidators: true });
        if (!doc) throw new AppError(404, 'Inquiry not found');
        res.json({ success: true, data: doc });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/inquiries/:id  (admin)
export const remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const doc = await Inquiry.findByIdAndDelete(req.params.id);
        if (!doc) throw new AppError(404, 'Inquiry not found');
        res.json({ success: true, message: 'Inquiry deleted' });
    } catch (err) {
        next(err);
    }
};
