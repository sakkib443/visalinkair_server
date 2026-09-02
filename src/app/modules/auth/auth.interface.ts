// ===================================================================
// Visalink Air LMS - Auth Interface
// Authentication related TypeScript types
// ===================================================================

/**
 * ILoginPayload - Login request body
 * Login করার সময় যে data আসবে
 */
export interface ILoginPayload {
    email: string;
    password: string;
}

/**
 * ITokens - JWT token pair
 * Access এবং Refresh token
 */
export interface ITokens {
    accessToken: string;
    refreshToken: string;
}

/**
 * IAuthResponse - Login response
 * Authentication success হলে এই response যাবে
 */
export interface IAuthResponse {
    user: {
        _id: string;
        email: string;
        firstName: string;
        lastName?: string;
        phone?: string;
        role: 'super_admin';
            avatar?: string;
    };
    tokens: ITokens;
}

/**
 * IRefreshTokenPayload - Refresh token request
 */
export interface IRefreshTokenPayload {
    refreshToken: string;
}

/**
 * IForgotPasswordPayload - Forgot password request
 */
export interface IForgotPasswordPayload {
    email: string;
}

/**
 * IResetPasswordPayload - Reset password request
 */
export interface IResetPasswordPayload {
    token: string;
    password: string;
}

/**
 * IJwtPayload - JWT token payload structure
 * Token এর ভিতরে যে data থাকবে
 */
export interface IJwtPayload {
    userId: string;
    email: string;
    role: 'super_admin';
    iat?: number;
    exp?: number;
}
