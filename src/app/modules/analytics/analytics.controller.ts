// ===================================================================
// Visalink Air - Analytics Controller
// ===================================================================

import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AnalyticsService } from './analytics.service';

// GET /api/analytics/dashboard  → admin dashboard stats
const getDashboard = catchAsync(async (_req: Request, res: Response) => {
    const data = await AnalyticsService.getDashboard();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Dashboard analytics retrieved',
        data,
    });
});

export const AnalyticsController = {
    getDashboard,
};
