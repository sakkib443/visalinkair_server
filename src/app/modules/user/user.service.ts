// ===================================================================
// Visalink Air Backend - User Service
// User related business logic
//
// Single-role system: a super_admin can list, view, create and delete other
// super_admins. There is deliberately NO admin-side edit — the only update
// path is a user editing their own profile / password.
// ===================================================================

import { FilterQuery, SortOrder } from 'mongoose';
import config from '../../config';
import AppError from '../../utils/AppError';
import { IUser, IUserFilters } from './user.interface';
import { User } from './user.model';
import { TCreateUserInput, TUpdateUserInput } from './user.validation';

/**
 * Pagination Options Interface
 */
interface IPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Pagination Result Interface
 */
interface IPaginationResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===================================================================
// USER SERVICE
// ===================================================================

const UserService = {
  // ==================== CREATE USER ====================
  /**
   * Create a new super_admin
   * নতুন super_admin তৈরি করা (name + email + password)
   */
  async createUser(payload: TCreateUserInput): Promise<IUser> {
    // Check if email already exists
    const isExists = await User.isUserExists(payload.email);
    if (isExists) {
      throw new AppError(400, 'Email already registered. Please login.');
    }

    // Whitelist — a create request may only set these fields.
    const user = await User.create({
      email: payload.email,
      password: payload.password,
      firstName: payload.firstName,
      lastName: payload.lastName || '',
      role: 'super_admin',
      status: 'active',
    });

    // Password remove করে return
    const userObject = user.toObject();
    delete (userObject as unknown as Record<string, unknown>).password;

    return userObject;
  },

  // ==================== GET ALL USERS (ADMIN) ====================
  /**
   * Get all users with pagination and filters
   * Admin panel এর জন্য সব super_admin fetch করা
   */
  async getAllUsers(
    filters: IUserFilters,
    paginationOptions: IPaginationOptions
  ): Promise<IPaginationResult<IUser>> {
    const { searchTerm, ...filterData } = filters;
    const {
      page = config.pagination.default_page,
      limit = config.pagination.default_limit,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = paginationOptions;

    // Build search conditions
    const andConditions: FilterQuery<IUser>[] = [];

    // Search in multiple fields
    if (searchTerm) {
      andConditions.push({
        $or: [
          { firstName: { $regex: searchTerm, $options: 'i' } },
          { lastName: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } },
        ],
      });
    }

    // Exact match filters
    if (Object.keys(filterData).length) {
      andConditions.push({
        $and: Object.entries(filterData).map(([field, value]) => ({
          [field]: value,
        })),
      });
    }

    const whereConditions = andConditions.length > 0 ? { $and: andConditions } : {};

    // Sort order
    const sortConditions: { [key: string]: SortOrder } = {};
    sortConditions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate skip
    const skip = (page - 1) * limit;

    // Execute query
    const users = await User.find(whereConditions)
      .sort(sortConditions)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(whereConditions);

    return {
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // ==================== GET SINGLE USER ====================
  /**
   * Get user by ID
   * Single user details fetch করা
   */
  async getUserById(userId: string): Promise<IUser> {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return user;
  },

  // ==================== GET USER BY EMAIL ====================
  /**
   * Get user by email (with password for login)
   * Login এ use হবে
   */
  async getUserByEmail(email: string): Promise<IUser | null> {
    return await User.findByEmail(email);
  },

  // ==================== UPDATE OWN PROFILE ====================
  /**
   * Update user profile (self update)
   * User নিজে নিজের profile update করবে
   */
  async updateProfile(userId: string, payload: TUpdateUserInput): Promise<IUser> {
    // Whitelist: only self-editable profile fields can be updated here.
    // Privileged fields (role, status, isDeleted) must NEVER be set here.
    const allowedFields: (keyof TUpdateUserInput)[] = [
      'email',
      'firstName',
      'lastName',
      'phone',
      'avatar',
      'bio',
    ];

    const updateData: Partial<TUpdateUserInput> = {};
    for (const field of allowedFields) {
      if (payload[field] !== undefined) {
        (updateData as Record<string, unknown>)[field] = payload[field];
      }
    }

    // Changing email: normalise it and make sure no other account already uses it.
    if (updateData.email) {
      const email = String(updateData.email).toLowerCase().trim();
      const taken = await User.findOne({ email, _id: { $ne: userId }, isDeleted: false });
      if (taken) {
        throw new AppError(400, 'This email is already in use by another account.');
      }
      (updateData as Record<string, unknown>).email = email;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return user;
  },

  // ==================== DELETE USER (SOFT DELETE) ====================
  /**
   * Soft delete user
   * User কে permanently delete না করে isDeleted = true করা
   *
   * The last remaining super_admin can never be removed — otherwise nobody
   * could log in to the dashboard again.
   */
  async deleteUser(userId: string, requesterId?: string): Promise<IUser> {
    if (requesterId && String(requesterId) === String(userId)) {
      throw new AppError(400, 'You cannot delete your own account.');
    }

    const remaining = await User.countDocuments({ isDeleted: false });
    if (remaining <= 1) {
      throw new AppError(400, 'The last super admin cannot be deleted.');
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isDeleted: true, status: 'blocked' },
      { new: true }
    );

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return user;
  },

  // ==================== CHANGE PASSWORD ====================
  /**
   * Change user password
   * Password change করা (old password verify করে)
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Verify current password
    const isPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
      throw new AppError(401, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();
  },

  // ==================== GET USER STATS (ADMIN) ====================
  /**
   * Get user statistics for the admin dashboard
   * One role — so the only meaningful number is how many accounts exist.
   */
  async getUserStats(): Promise<{ total: number }> {
    const total = await User.countDocuments({ isDeleted: false });
    return { total };
  },
};

export default UserService;
