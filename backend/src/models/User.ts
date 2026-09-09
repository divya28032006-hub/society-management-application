import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export enum UserRole {
  RESIDENT = 'resident',
  ADMIN = 'admin',
  SECURITY = 'security'
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  flatNumber?: string;
  wing?: string;
  isActive: boolean;
  profilePicture?: string;
  society: mongoose.Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.RESIDENT
    },
    flatNumber: {
      type: String,
      trim: true
    },
    wing: {
      type: String,
      trim: true,
      uppercase: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    profilePicture: {
      type: String
    },
    society: {
      type: Schema.Types.ObjectId,
      ref: 'Society',
      required: [true, 'Society is required']
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
UserSchema.methods.generateAuthToken = function (): string {
  const secret = process.env.JWT_SECRET || 'default-secret-key';
  const options: jwt.SignOptions = { expiresIn: '7d' };
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role, society: this.society },
    secret,
    options
  );
};

export const User = mongoose.model<IUser>('User', UserSchema);