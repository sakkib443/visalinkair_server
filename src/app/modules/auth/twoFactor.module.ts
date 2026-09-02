// ===================================================================
// 2FA (Two-Factor Authentication) - OTP based
// ===================================================================

import { User } from '../user/user.model';
import AppError from '../../utils/AppError';
import EmailService from '../email/email.service';
import express from 'express';
import { z } from 'zod';
import { authMiddleware } from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';

/**
 * Verify 2FA Validation Schema
 * Ensures a 6-digit numeric OTP is provided before verification
 */
export const verifyTwoFactorValidation = z.object({
    body: z.object({
        otp: z
            .string({
                required_error: 'OTP is required',
            })
            .regex(/^\d{6}$/, 'OTP must be a 6-digit code'),
    }),
});

// Generate 6-digit OTP
const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const TwoFactorService = {
    async enableTwoFactor(userId: string) {
        const user = await User.findById(userId);
        if (!user) throw new AppError(404, 'User not found');

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.twoFactorSecret = otp;
        user.twoFactorExpiry = otpExpiry;
        await user.save();

        // Send OTP via email
        await EmailService.sendPasswordResetEmail(
            user.email,
            user.firstName,
            `Your 2FA OTP is: ${otp}. Valid for 10 minutes.`
        );

        return { message: 'OTP sent to your email' };
    },

    async verifyTwoFactor(userId: string, otp: string) {
        const user = await User.findById(userId);
        if (!user) throw new AppError(404, 'User not found');

        if (!user.twoFactorSecret || !user.twoFactorExpiry) {
            throw new AppError(400, '2FA not initiated');
        }

        if (new Date() > user.twoFactorExpiry) {
            throw new AppError(400, 'OTP expired');
        }

        if (user.twoFactorSecret !== otp) {
            throw new AppError(400, 'Invalid OTP');
        }

        user.twoFactorEnabled = true;
        user.twoFactorSecret = undefined;
        user.twoFactorExpiry = undefined;
        await user.save();

        return { message: '2FA enabled successfully' };
    },

    async disableTwoFactor(userId: string) {
        await User.findByIdAndUpdate(userId, {
            twoFactorEnabled: false,
            twoFactorSecret: undefined,
            twoFactorExpiry: undefined
        });
        return { message: '2FA disabled' };
    }
};

// Routes
const router = express.Router();

router.post('/enable', authMiddleware, catchAsync(async (req, res) => {
    const result = await TwoFactorService.enableTwoFactor(req.user!.userId);
    sendResponse(res, { statusCode: 200, success: true, message: result.message, data: null });
}));

router.post('/verify', authMiddleware, validateRequest(verifyTwoFactorValidation), catchAsync(async (req, res) => {
    const { otp } = req.body;
    const result = await TwoFactorService.verifyTwoFactor(req.user!.userId, otp);
    sendResponse(res, { statusCode: 200, success: true, message: result.message, data: null });
}));

router.post('/disable', authMiddleware, catchAsync(async (req, res) => {
    const result = await TwoFactorService.disableTwoFactor(req.user!.userId);
    sendResponse(res, { statusCode: 200, success: true, message: result.message, data: null });
}));

export const TwoFactorRoutes = router;
