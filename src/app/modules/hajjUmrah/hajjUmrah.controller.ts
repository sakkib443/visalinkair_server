import { Request, Response, NextFunction } from 'express';
import { HajjUmrahService } from './hajjUmrah.service';

const createPackage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await HajjUmrahService.createPackage(req.body);
        res.status(201).json({ success: true, message: 'Package created successfully', data: result });
    } catch (error) { next(error); }
};

const getAllPackages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { searchTerm, type, status, isActive, isFeatured } = req.query;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 200;
        const filters: any = {};
        if (searchTerm) filters.searchTerm = searchTerm;
        if (type) filters.type = type;
        if (status) filters.status = status;
        if (isActive !== undefined) filters.isActive = isActive === 'true';
        if (isFeatured !== undefined) filters.isFeatured = isFeatured === 'true';
        const result = await HajjUmrahService.getAllPackages(filters, page, limit);
        res.status(200).json({ success: true, message: 'Packages retrieved successfully', data: result.data, meta: result.meta });
    } catch (error) { next(error); }
};

const getPackageById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await HajjUmrahService.getPackageById(req.params.id);
        res.status(200).json({ success: true, message: 'Package retrieved successfully', data: result });
    } catch (error) { next(error); }
};

const getPackageBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await HajjUmrahService.getPackageBySlug(req.params.slug);
        res.status(200).json({ success: true, message: 'Package retrieved successfully', data: result });
    } catch (error) { next(error); }
};

const updatePackage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await HajjUmrahService.updatePackage(req.params.id, req.body);
        res.status(200).json({ success: true, message: 'Package updated successfully', data: result });
    } catch (error) { next(error); }
};

const deletePackage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await HajjUmrahService.deletePackage(req.params.id);
        res.status(200).json({ success: true, message: 'Package deleted successfully' });
    } catch (error) { next(error); }
};

const getActivePackages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await HajjUmrahService.getActivePackages();
        res.status(200).json({ success: true, message: 'Active packages retrieved successfully', data: result });
    } catch (error) { next(error); }
};

const getFeaturedPackages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await HajjUmrahService.getFeaturedPackages();
        res.status(200).json({ success: true, message: 'Featured packages retrieved successfully', data: result });
    } catch (error) { next(error); }
};

const getByType = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await HajjUmrahService.getByType(req.params.type);
        res.status(200).json({ success: true, message: `${req.params.type} packages retrieved successfully`, data: result });
    } catch (error) { next(error); }
};

export const HajjUmrahController = {
    createPackage, getAllPackages, getPackageById, getPackageBySlug,
    updatePackage, deletePackage, getActivePackages, getFeaturedPackages, getByType,
};
