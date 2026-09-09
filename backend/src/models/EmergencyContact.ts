import mongoose, { Schema, Document } from 'mongoose';

export interface IEmergencyContact extends Document {
  name: string;
  phone: string;
  designation: string;
  email?: string;
  address?: string;
  isActive: boolean;
  society: mongoose.Types.ObjectId;
  priority: number;
}

const EmergencyContactSchema = new Schema<IEmergencyContact>(
  {
    name: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    address: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    society: {
      type: Schema.Types.ObjectId,
      ref: 'Society',
      required: true
    },
    priority: {
      type: Number,
      default: 1,
      min: 1,
      max: 5
    }
  },
  {
    timestamps: true
  }
);

EmergencyContactSchema.index({ society: 1, priority: -1 });
EmergencyContactSchema.index({ designation: 1 });

export const EmergencyContact = mongoose.model<IEmergencyContact>('EmergencyContact', EmergencyContactSchema);