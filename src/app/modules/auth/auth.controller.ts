// ===================================================================
// Visalink Air Backend - Auth Controller
// HTTP Request handling for Authentication
// ===================================================================

import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import AuthService from './auth.service';
import config from '../../config';

// ===================================================================
// AUTH CONTROLLER
// ===================================================================

const AuthController = {
  // ==================== LOGIN ====================
  /**
   * POST /api/auth/login
   * Login with email and password
   * Email password দিয়ে login
   */
  login: catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);

    // Optionally set refresh token in HTTP-only cookie
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Login successful',
      data: result,
    });
  }),

  // ==================== REFRESH TOKEN ====================
  /**
   * POST /api/auth/refresh-token
   * Get new access token using refresh token
   * Refresh token দিয়ে নতুন tokens নেওয়া
   */
  refreshToken: catchAsync(async (req: Request, res: Response) => {
    // Get refresh token from body or cookie
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

    if (!refreshToken) {
      sendResponse(res, {
        statusCode: 401,
        success: false,
        message: 'Refresh token is required',
      });
      return;
    }

    const tokens = await AuthService.refreshToken(refreshToken);

    // Update refresh token cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Token refreshed successfully',
      data: tokens,
    });
  }),

  // ==================== FORGOT PASSWORD ====================
  /**
   * POST /api/auth/forgot-password
   * Request password reset email
   * Password reset email পাঠানো
   */
  forgotPassword: catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;

    // The reset token must be delivered to the user via email only.
    // It is NEVER returned in the HTTP response, otherwise any unauthenticated
    // caller who knows a victim's email could obtain the token and take over
    // the account.
    await AuthService.forgotPassword(email);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Password reset link sent to your email',
    });
  }),

  // ==================== RESET PASSWORD ====================
  /**
   * POST /api/auth/reset-password
   * Reset password using token
   * Token দিয়ে password reset
   */
  resetPassword: catchAsync(async (req: Request, res: Response) => {
    const { token, password } = req.body;
    await AuthService.resetPassword(token, password);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Password reset successful. Please login with your new password.',
    });
  }),

  // ==================== UPDATE PASSWORD ====================
  /**
   * POST /api/auth/update-password
   * Update password for logged-in user
   * Password update করা (logged-in user)
   */
  updatePassword: catchAsync(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      sendResponse(res, {
        statusCode: 401,
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    await AuthService.updatePassword(userId, currentPassword, newPassword);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Password updated successfully',
    });
  }),

  // ==================== LOGOUT ====================
  /**
   * POST /api/auth/logout
   * Clear refresh token cookie
   * Logout - cookie clear করা
   */
  logout: catchAsync(async (req: Request, res: Response) => {
    // Clear refresh token cookie
    res.cookie('refreshToken', '', {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'strict',
      expires: new Date(0),
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Logged out successfully',
    });
  }),
};

export default AuthController;
