// ===================================================================
// Visalink Air - User Model
// MongoDB User Schema with Mongoose
//
// Single-role system: every account is a super_admin. A super_admin creates
// other super_admins (name + email + password) and can delete them. There is
// no editing, no role picker, and no HR / seller / storefront data here.
// ===================================================================

import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import config from '../../config';
import { IUser, IUserMethods, UserModel } from './user.interface';

/**
 * User Schema Definition
 * User collection এর structure এখানে define করা হয়েছে
 */
const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    // ==================== Login credentials ====================
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Password default এ query result এ আসবে না
    },

    // ==================== Identity ====================
    // The create form asks for one "Full Name"; it is split into these two so
    // every `${firstName} ${lastName}` render across the app keeps working.
    // A single-word name simply leaves lastName empty.
    firstName: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
      default: '',
    },

    // Self-editable extras — set only from Dashboard → Profile, never at creation.
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },

    // ==================== Account state ====================
    role: {
      type: String,
      enum: {
        values: ['super_admin'],
        message: '{VALUE} is not a valid role',
      },
      default: 'super_admin',
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'blocked'],
        message: '{VALUE} is not a valid status',
      },
      default: 'active',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },

    // ==================== Password Reset ====================
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordChangedAt: Date,

    // ==================== Activity ====================
    lastLoginAt: Date,
  },
  {
    timestamps: true, // createdAt, updatedAt auto add হবে
    toJSON: {
      virtuals: true,
      transform: function (doc, ret: Record<string, unknown>) {
        delete ret.password; // JSON এ password থাকবে না
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ==================== Indexes ====================
// Search performance বাড়ানোর জন্য indexes
userSchema.index({ email: 1 });
userSchema.index({ status: 1 });
userSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

// ==================== Virtual Fields ====================
// fullName virtual field - firstName + lastName
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName || ''}`.trim();
});

// ==================== Pre-Save Middleware ====================
// Password hash করা save এর আগে
userSchema.pre('save', async function (next) {
  // Password modify হলেই hash করবো
  if (!this.isModified('password')) {
    return next();
  }

  // Password hash করা
  this.password = await bcrypt.hash(this.password, config.bcrypt_salt_rounds);

  // Password change time update
  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }

  next();
});

// Deleted users কে query থেকে বাদ দেওয়া
userSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

userSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

// ==================== Instance Methods ====================
// Password compare করার method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// JWT issue এর পর password change হয়েছে কিনা
userSchema.methods.isPasswordChangedAfterJwtIssued = function (
  jwtTimestamp: number
): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(
      this.passwordChangedAt.getTime() / 1000
    );
    return jwtTimestamp < changedTimestamp;
  }
  return false;
};

// ==================== Static Methods ====================
// Email দিয়ে user খুঁজে বের করা (password সহ)
userSchema.statics.findByEmail = async function (email: string) {
  return await this.findOne({ email }).select('+password');
};

// User exist করে কিনা
userSchema.statics.isUserExists = async function (email: string) {
  const user = await this.findOne({ email });
  return !!user;
};

// ==================== Export Model ====================
export const User = model<IUser, UserModel>('User', userSchema);
