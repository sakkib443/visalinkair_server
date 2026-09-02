// ===================================================================
// Visalink Air — Service Controller
// Full CRUD. Public: list active + get by slug. Admin: full management.
// ===================================================================

import { Request, Response, NextFunction } from 'express';
import { Service } from './service.model';
import AppError from '../../utils/AppError';

// GET /api/services  (public — active only, ordered)
// GET /api/services?type=study_abroad  → filtered by type
// GET /api/services?all=1  (admin) → include inactive
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filter: Record<string, unknown> = {};
        if (!req.query.all) filter.isActive = true;
        if (req.query.type) filter.type = req.query.type;

        const services = await Service.find(filter).sort({ order: 1, createdAt: -1 });
        res.json({ success: true, data: services });
    } catch (err) {
        next(err);
    }
};

// GET /api/services/:slug  (public)
export const getBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const doc = await Service.findOne({ slug: req.params.slug, isActive: true });
        if (!doc) throw new AppError(404, 'Service not found');
        res.json({ success: true, data: doc });
    } catch (err) {
        next(err);
    }
};

// GET /api/services/id/:id  (admin)
export const getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const doc = await Service.findById(req.params.id);
        if (!doc) throw new AppError(404, 'Service not found');
        res.json({ success: true, data: doc });
    } catch (err) {
        next(err);
    }
};

// POST /api/services  (admin)
export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const doc = await Service.create(req.body);
        res.status(201).json({ success: true, data: doc });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/services/:id  (admin)
export const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const doc = await Service.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!doc) throw new AppError(404, 'Service not found');
        res.json({ success: true, data: doc });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/services/:id  (admin)
export const remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const doc = await Service.findByIdAndDelete(req.params.id);
        if (!doc) throw new AppError(404, 'Service not found');
        res.json({ success: true, message: 'Service deleted' });
    } catch (err) {
        next(err);
    }
};
