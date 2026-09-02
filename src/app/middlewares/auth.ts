// ===================================================================
// Visalink Air - Authentication Middleware
// JWT Token verify করে user authenticate করার জন্য middleware
// ===================================================================

import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import AppError from '../utils/AppError';
import { User } from '../modules/user/user.model';

// Single role — super_admin only.
type TRole = 'super_admin';

/**
 * Extended Request interface with user data
 * Request এ user data attach করার জন্য type extend করা হচ্ছে
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        _id: string;
        userId: string;
        email: string;
        role: TRole;
      };
    }
  }
}

/**
 * authMiddleware - Verify JWT token and attach user to request
 * Protected routes এ এই middleware use করা হবে
 * 
 * @example
 * router.get('/profile', authMiddleware, UserController.getProfile);
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // ==================== 1. Get Token from Header ====================
    // Header থেকে Authorization token বের করা
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'You are not logged in. Please login to continue.');
    }

    // "Bearer <token>" থেকে শুধু token part নেওয়া
    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AppError(401, 'Invalid authentication token.');
    }

    // ==================== 2. Verify Token ====================
    // Token verify করা - valid না হলে error throw হবে
    const decoded = jwt.verify(token, config.jwt.access_secret) as JwtPayload & {
      userId: string;
      email: string;
      role: TRole;
    };

    // ==================== 3. Handle Superadmin from .env ====================
    // Special handling for superadmin login from environment variables
    const SUPER_ADMIN_ID = '000000000000000000000001';

    if (decoded.userId === SUPER_ADMIN_ID && decoded.role === 'super_admin') {
      // Admin from .env - skip database check
      req.user = {
        ...decoded,
        _id: decoded.userId,
      };
      return next();
    }

    // ==================== 4. Check if User Exists ====================
    // User database এ আছে কিনা এবং active কিনা check করা
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new AppError(401, 'User belonging to this token no longer exists.');
    }

    if (user.isDeleted) {
      throw new AppError(401, 'This user account has been deleted.');
    }

    if (user.status === 'blocked') {
      throw new AppError(403, 'Your account has been blocked. Contact support.');
    }

    // ==================== 5. Attach User to Request ====================
    // Request object এ user data attach করা যাতে controller থেকে access করা যায়
    req.user = {
      ...decoded,
      _id: decoded.userId, // Add _id for convenience
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * authorizeRoles - Role-based access control middleware
 * নির্দিষ্ট role এর users কে access দেওয়ার জন্য
 *
 * @example
 * router.delete('/user/:id', authMiddleware, authorizeRoles('super_admin'), UserController.delete);
 */
export const authorizeRoles = (...allowedRoles: TRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // User এর role allowed list এ আছে কিনা check করা
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw new AppError(403, 'You do not have permission to perform this action.');
    }
    next();
  };
};

/**
 * auth - Combined authentication and authorization middleware
 * একসাথে authenticate এবং role check করে
 * 
 * @example
 * router.post('/products', auth('super_admin'), ProductController.create);
 */
const auth = (...allowedRoles: TRole[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // First authenticate
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError(401, 'You are not logged in. Please login to continue.');
      }

      const token = authHeader.split(' ')[1];

      if (!token) {
        throw new AppError(401, 'Invalid authentication token.');
      }

      const decoded = jwt.verify(token, config.jwt.access_secret) as JwtPayload & {
        userId: string;
        email: string;
        role: TRole;
      };

      const user = await User.findById(decoded.userId);

      if (!user) {
        throw new AppError(401, 'User belonging to this token no longer exists.');
      }

      if (user.isDeleted) {
        throw new AppError(401, 'This user account has been deleted.');
      }

      if (user.status === 'blocked') {
        throw new AppError(403, 'Your account has been blocked. Contact support.');
      }

      // Attach user to request
      req.user = {
        ...decoded,
        _id: decoded.userId,
      };

      // Then authorize if roles specified
      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        throw new AppError(403, 'You do not have permission to perform this action.');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * optionalAuth - Optional authentication middleware
 * User logged in থাকলে data পাবে, না থাকলেও route access করতে পারবে
 * 
 * @example
 * router.get('/products', optionalAuth, ProductController.getAll);
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      if (token) {
        try {
          const decoded = jwt.verify(token, config.jwt.access_secret) as JwtPayload & {
            userId: string;
            email: string;
            role: TRole;
          };
          req.user = {
            ...decoded,
            _id: decoded.userId,
          };
        } catch {
          // Token invalid হলে ignore করবো, guest হিসেবে continue করবে
        }
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Default export for new modules
export default auth;
