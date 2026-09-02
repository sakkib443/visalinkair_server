// ===================================================================
// Visalink Air - User Interface
// User মডেলের TypeScript interface definitions
//
// The whole platform has exactly ONE role: super_admin. A super_admin can
// create more super_admins and delete them — nothing else. So a user record
// is only: name + login credentials + account state.
// ===================================================================

import { Model, Types } from 'mongoose';

/**
 * User Role Types — the system has a single role: super_admin.
 */
export type TUserRole = 'super_admin';

/**
 * User Status Types
 * active  - Normal active account
 * blocked - Blocked (cannot log in)
 */
export type TUserStatus = 'active' | 'blocked';

/**
 * IUser - Main User Interface
 * Database এ যে format এ user data save হবে
 */
export interface IUser {
  _id?: Types.ObjectId;

  // ==================== Login credentials ====================
  email: string;
  password: string;

  // ==================== Identity ====================
  // The Add Super Admin form collects one "Full Name" field; it is stored
  // split so every existing `${firstName} ${lastName}` render keeps working.
  firstName: string;
  lastName?: string;

  // Self-editable profile extras (Dashboard → Profile only — never asked for
  // when creating an account).
  phone?: string;
  avatar?: string;
  bio?: string;

  // ==================== Account state ====================
  role: TUserRole;
  status: TUserStatus;
  isDeleted: boolean;

  // ==================== Password reset ====================
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  passwordChangedAt?: Date;

  // ==================== Timestamps ====================
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * IUserMethods - Instance Methods
 * User document এর উপর যে methods call করা যাবে
 */
export interface IUserMethods {
  // Password compare করার জন্য method
  comparePassword(candidatePassword: string): Promise<boolean>;

  // JWT token তৈরি করার পর password change হয়েছে কিনা check
  isPasswordChangedAfterJwtIssued(jwtTimestamp: number): boolean;
}

/**
 * UserModel - Static Methods
 * User.method() এভাবে call করা যাবে এমন methods
 */
export interface UserModel extends Model<IUser, object, IUserMethods> {
  // Email দিয়ে user খুঁজে বের করা (password সহ)
  findByEmail(email: string): Promise<IUser & IUserMethods>;

  // User exist করে কিনা check
  isUserExists(email: string): Promise<boolean>;
}

/**
 * IUserFilters - Query Filters
 * User list filter করার জন্য
 */
export interface IUserFilters {
  searchTerm?: string;
  email?: string;
  role?: TUserRole;
  status?: TUserStatus;
}
