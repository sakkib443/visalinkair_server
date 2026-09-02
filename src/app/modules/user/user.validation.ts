// ===================================================================
// Visalink Air - User Validation
// Zod দিয়ে User data validation schemas
//
// Single-role system — creating an account only needs a name, an email and
// a password. There is no admin-side edit route, so no update schema for it.
// ===================================================================

import { z } from 'zod';
import { mediaUrl } from '../../utils/validators';

/**
 * Create User Validation Schema
 * নতুন super_admin তৈরি করার সময় এই validation চলবে
 */
export const createUserValidation = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Please provide a valid email'),

    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(6, 'Password must be at least 6 characters')
      .max(50, 'Password cannot exceed 50 characters'),

    // The form sends one "Full Name"; the client splits it before posting.
    firstName: z
      .string({
        required_error: 'Name is required',
      })
      .min(1, 'Name is required')
      .max(50, 'First name cannot exceed 50 characters'),

    lastName: z
      .string()
      .max(50, 'Last name cannot exceed 50 characters')
      .optional(),

    // Only one role exists — accepted for explicitness, defaulted anyway.
    role: z.literal('super_admin').optional().default('super_admin'),
  }),
});

/**
 * Update User Validation Schema
 * নিজের profile update করার সময় এই validation চলবে (Dashboard → Profile)
 */
export const updateUserValidation = z.object({
  body: z.object({
    email: z.string().email('Please provide a valid email').optional(),

    firstName: z
      .string()
      .min(1, 'Name is required')
      .max(50, 'First name cannot exceed 50 characters')
      .optional(),

    lastName: z
      .string()
      .max(50, 'Last name cannot exceed 50 characters')
      .optional()
      .or(z.literal('')),

    phone: z
      .string()
      .min(11, 'Phone number must be at least 11 digits')
      .max(14, 'Phone number cannot exceed 14 digits')
      .regex(/^(\+880|880|0)?1[3-9]\d{8}$/, 'Please provide a valid Bangladeshi phone number')
      .optional()
      .or(z.literal('')),

    avatar: mediaUrl('Avatar must be a valid URL').optional().or(z.literal('')),
    bio: z.string().max(500).optional().or(z.literal('')),
  }),
});

/**
 * Change Password Validation Schema
 * Password change করার সময় validation
 */
export const changePasswordValidation = z.object({
  body: z.object({
    currentPassword: z
      .string({
        required_error: 'Current password is required',
      })
      .min(1, 'Current password is required'),

    newPassword: z
      .string({
        required_error: 'New password is required',
      })
      .min(6, 'New password must be at least 6 characters')
      .max(50, 'New password cannot exceed 50 characters'),

    confirmPassword: z
      .string({
        required_error: 'Confirm password is required',
      }),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
});

/**
 * User Query Validation Schema
 * User list query parameters validation
 */
export const userQueryValidation = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    searchTerm: z.string().optional(),
    role: z.literal('super_admin').optional(),
    status: z.enum(['active', 'blocked']).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

// Export types for use in services
export type TCreateUserInput = z.infer<typeof createUserValidation>['body'];
export type TUpdateUserInput = z.infer<typeof updateUserValidation>['body'];
