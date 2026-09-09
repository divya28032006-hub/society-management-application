import { User, IUser, UserRole } from '../../models/User';
import { AppError } from '../../utils/AppError';
import logger, { logInfo, logError } from '../../utils/logger';
import { Types } from 'mongoose';

interface UpdateProfileInput {
  name?: string;
  phone?: string;
  flatNumber?: string;
  wing?: string;
  profilePicture?: string;
}

interface UpdateUserByAdminInput {
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  flatNumber?: string;
  wing?: string;
  isActive?: boolean;
}

export class UserService {
  /**
   * Get user profile by ID
   */
  static async getProfile(userId: string): Promise<IUser> {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        throw new AppError('User not found', 404);
      }
      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logError('UserService', error as Error, { userId });
      throw new AppError('Failed to get user profile', 500);
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    input: UpdateProfileInput
  ): Promise<IUser> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Check if phone is being updated and is unique
      if (input.phone && input.phone !== user.phone) {
        const existingUser = await User.findOne({ 
          phone: input.phone,
          _id: { $ne: userId }
        });
        if (existingUser) {
          throw new AppError('Phone number already in use', 400);
        }
      }

      Object.assign(user, input);
      await user.save();

      // Remove password from response
      const userResponse = user.toObject();
      delete (userResponse as any).password;

      logInfo('UserService', `Profile updated for user: ${user.email}`, { userId });
      return userResponse as IUser;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logError('UserService', error as Error, { userId, input });
      throw new AppError('Failed to update profile', 500);
    }
  }

  /**
   * Change user password
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        throw new AppError('Current password is incorrect', 401);
      }

      user.password = newPassword;
      await user.save();

      logInfo('UserService', `Password changed for user: ${user.email}`, { userId });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logError('UserService', error as Error, { userId });
      throw new AppError('Failed to change password', 500);
    }
  }

  /**
   * Get member directory with pagination and search
   */
  static async getMemberDirectory(
    page: number = 1,
    limit: number = 10,
    search?: string,
    role?: UserRole,
    isActive?: boolean
  ): Promise<{ users: IUser[]; total: number }> {
    try {
      const query: any = {};

      if (role) {
        query.role = role;
      }

      if (isActive !== undefined) {
        query.isActive = isActive;
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { flatNumber: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        User.find(query)
          .select('-password')
          .sort({ name: 1 })
          .skip(skip)
          .limit(limit),
        User.countDocuments(query)
      ]);

      return { users, total };
    } catch (error) {
      logError('UserService', error as Error, { page, limit, search, role });
      throw new AppError('Failed to get member directory', 500);
    }
  }

  /**
   * Get user by ID (admin only)
   */
  static async getUserById(userId: string): Promise<IUser> {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        throw new AppError('User not found', 404);
      }
      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logError('UserService', error as Error, { userId });
      throw new AppError('Failed to get user', 500);
    }
  }

  /**
   * Update user by admin
   */
  static async updateUserByAdmin(
    userId: string,
    input: UpdateUserByAdminInput
  ): Promise<IUser> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Check if email is being updated and is unique
      if (input.email && input.email !== user.email) {
        const existingUser = await User.findOne({
          email: input.email,
          _id: { $ne: userId }
        });
        if (existingUser) {
          throw new AppError('Email already in use', 400);
        }
      }

      // Check if phone is being updated and is unique
      if (input.phone && input.phone !== user.phone) {
        const existingUser = await User.findOne({
          phone: input.phone,
          _id: { $ne: userId }
        });
        if (existingUser) {
          throw new AppError('Phone number already in use', 400);
        }
      }

      Object.assign(user, input);
      await user.save();

      const userResponse = user.toObject();
      delete (userResponse as any).password;

      logInfo('UserService', `User updated by admin: ${user.email}`, { userId });
      return userResponse as IUser;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logError('UserService', error as Error, { userId, input });
      throw new AppError('Failed to update user', 500);
    }
  }

  /**
   * Delete user (soft delete) by admin
   */
  static async deleteUser(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Soft delete - set inactive
      user.isActive = false;
      await user.save();

      logInfo('UserService', `User deactivated: ${user.email}`, { userId });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logError('UserService', error as Error, { userId });
      throw new AppError('Failed to delete user', 500);
    }
  }

  /**
   * Hard delete user (permanent) by admin
   */
  static async hardDeleteUser(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      await user.deleteOne();
      logInfo('UserService', `User permanently deleted: ${user.email}`, { userId });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logError('UserService', error as Error, { userId });
      throw new AppError('Failed to permanently delete user', 500);
    }
  }

  /**
   * Get user statistics (admin only)
   */
  static async getUserStats(societyId: string): Promise<any> {
    try {
      const stats = await User.aggregate([
        { $match: { society: new Types.ObjectId(societyId) } },
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
            active: {
              $sum: {
                $cond: [{ $eq: ['$isActive', true] }, 1, 0]
              }
            },
            inactive: {
              $sum: {
                $cond: [{ $eq: ['$isActive', false] }, 1, 0]
              }
            }
          }
        }
      ]);

      const total = await User.countDocuments({ society: new Types.ObjectId(societyId) });
      const active = await User.countDocuments({ society: new Types.ObjectId(societyId), isActive: true });
      const inactive = await User.countDocuments({ society: new Types.ObjectId(societyId), isActive: false });

      return {
        total,
        active,
        inactive,
        byRole: stats
      };
    } catch (error) {
      logError('UserService', error as Error, { societyId });
      throw new AppError('Failed to get user statistics', 500);
    }
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<IUser | null> {
    try {
      const user = await User.findOne({ email }).select('-password');
      return user;
    } catch (error) {
      logError('UserService', error as Error, { email });
      throw new AppError('Failed to get user by email', 500);
    }
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(role: UserRole): Promise<IUser[]> {
    try {
      const users = await User.find({ role, isActive: true })
        .select('-password')
        .sort({ name: 1 });
      return users;
    } catch (error) {
      logError('UserService', error as Error, { role });
      throw new AppError('Failed to get users by role', 500);
    }
  }

  /**
   * Get society residents (members)
   */
  static async getSocietyMembers(
    societyId: string,
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{ users: IUser[]; total: number }> {
    try {
      const query: any = {
        society: new Types.ObjectId(societyId),
        isActive: true
      };

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { flatNumber: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        User.find(query)
          .select('-password')
          .sort({ flatNumber: 1 })
          .skip(skip)
          .limit(limit),
        User.countDocuments(query)
      ]);

      return { users, total };
    } catch (error) {
      logError('UserService', error as Error, { societyId });
      throw new AppError('Failed to get society members', 500);
    }
  }

  /**
   * Update user profile picture
   */
  static async updateProfilePicture(
    userId: string,
    profilePicture: string
  ): Promise<IUser> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      user.profilePicture = profilePicture;
      await user.save();

      const userResponse = user.toObject();
      delete (userResponse as any).password;

      logInfo('UserService', `Profile picture updated for user: ${user.email}`, { userId });
      return userResponse as IUser;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logError('UserService', error as Error, { userId });
      throw new AppError('Failed to update profile picture', 500);
    }
  }
}