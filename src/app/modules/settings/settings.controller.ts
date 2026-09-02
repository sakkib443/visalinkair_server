// ===================================================================
// Visalink Air - Settings Controller
// ===================================================================

import { Request, Response, NextFunction } from 'express';
import { SettingsService } from './settings.service';

const getSettings = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await SettingsService.getSettings();
        res.status(200).json({
            success: true,
            message: 'Settings retrieved successfully',
            data,
        });
    } catch (err) {
        next(err);
    }
};

const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await SettingsService.updateSettings(req.body);
        res.status(200).json({
            success: true,
            message: 'Settings updated successfully',
            data,
        });
    } catch (err) {
        next(err);
    }
};

export const SettingsController = { getSettings, updateSettings };
