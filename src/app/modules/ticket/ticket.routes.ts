import express, { Request, Response, NextFunction } from 'express';
import { Ticket } from './ticket.model';
import { TicketValidation } from './ticket.validation';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

// টিকিটে যাত্রীর নাম, পাসপোর্ট নম্বর, PNR আর e-ticket নম্বর থাকে — তাই
// পড়ার রুট দুটোও অ্যাডমিন-only। আগে এগুলোতে auth ছিল না, ফলে যে কেউ
// /api/tickets খুলেই সবার পাসপোর্ট নম্বর দেখতে পেত। লেখার রুটগুলো (POST/
// PUT/DELETE) আগে থেকেই সুরক্ষিত ছিল; শুধু GET দুটো বাদ পড়ে গিয়েছিল।
// ফ্রন্ট-এন্ডের দুটো ব্যবহারই (all-tickets, ticket-generator) অ্যাডমিন
// ড্যাশবোর্ড থেকে টোকেনসহ আসে, তাই এতে কিছু ভাঙে না।

// GET all tickets (sorted by latest)
router.get('/', authMiddleware, authorizeRoles('super_admin'), async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const tickets = await Ticket.find().sort({ createdAt: -1 }).lean();
        res.json({ success: true, data: tickets });
    } catch (err) {
        next(err);
    }
});

// GET single ticket by ID
router.get('/:id', authMiddleware, authorizeRoles('super_admin'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ticket = await Ticket.findById(req.params.id).lean();
        if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
        res.json({ success: true, data: ticket });
    } catch (err) {
        next(err);
    }
});

// POST create new ticket
router.post(
    '/',
    authMiddleware,
    authorizeRoles('super_admin'),
    validateRequest(TicketValidation.createTicketSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const ticket = await Ticket.create(req.body);
            res.status(201).json({ success: true, data: ticket });
        } catch (err) {
            next(err);
        }
    }
);

// PUT update ticket
router.put(
    '/:id',
    authMiddleware,
    authorizeRoles('super_admin'),
    validateRequest(TicketValidation.updateTicketSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
            if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
            res.json({ success: true, data: ticket });
        } catch (err) {
            next(err);
        }
    }
);

// DELETE ticket
router.delete(
    '/:id',
    authMiddleware,
    authorizeRoles('super_admin'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const ticket = await Ticket.findByIdAndDelete(req.params.id);
            if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
            res.json({ success: true, message: 'Ticket deleted' });
        } catch (err) {
            next(err);
        }
    }
);

export const TicketRoutes = router;
