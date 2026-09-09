import { User, IUser, UserRole } from '../../models/User';
import { Society } from '../../models/Society';
import { AppError } from '../../utils/AppError';
import logger from '../../utils/logger';

interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  flatNumber?: string;
  wing?: string;
  role?: UserRole;
  societyId: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  static async register(input: RegisterInput): Promise<{ user: IUser; token: string }> {
    try {
      // Check if society exists
      const society = await Society.findById(input.societyId);
      if (!society) {
        throw new AppError('Society not found', 404);
      }

      // Check if user exists
      const existingUser = await User.findOne({ 
        $or: [{ email: input.email }, { phone: input.phone }] 
      });
      
      if (existingUser) {
        throw new AppError('User with this email or phone number already exists', 400);
      }

      // Create user
      const user = await User.create({
        name: input.name,
        email: input.email,
        phone: input.phone,
        password: input.password,
        role: input.role || UserRole.RESIDENT,
        flatNumber: input.flatNumber,
        wing: input.wing,
        society: input.societyId,
        isActive: true
      });

      // Generate token
      const token = user.generateAuthToken();

      // Remove password from response
      const userResponse = user.toObject();
      delete (userResponse as any).password;

      logger.info(`User registered successfully: ${user.email} (${user.role}) in society: ${society.name}`);
      return { user: userResponse as IUser, token };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Registration error:', error);
      throw new AppError('Failed to register user', 500);
    }
  }

  static async login(input: LoginInput): Promise<{ user: IUser; token: string }> {
    try {
      // Find user by email
      const user = await User.findOne({ email: input.email }).select('+password');
      
      if (!user) {
        throw new AppError('Invalid email or password', 401);
      }

      // Check if user is active
      if (!user.isActive) {
        throw new AppError('Your account has been deactivated. Please contact administration.', 401);
      }

      // Compare password
      const isPasswordValid = await user.comparePassword(input.password);
      
      if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401);
      }

      // Generate token
      const token = user.generateAuthToken();

      // Remove password from response
      const userResponse = user.toObject();
      delete (userResponse as any).password;

      logger.info(`User logged in successfully: ${user.email}`);
      return { user: userResponse as IUser, token };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Login error:', error);
      throw new AppError('Failed to login', 500);
    }
  }

  static async getCurrentUser(userId: string): Promise<IUser> {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        throw new AppError('User not found', 404);
      }
      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get current user error:', error);
      throw new AppError('Failed to get user', 500);
    }
  }

  static async logout(): Promise<void> {
    // JWT is stateless, logout is handled client-side
    // This is just a placeholder for any server-side logout logic
    logger.info('User logged out');
  }
}