import mongoose, { Schema, Document } from 'mongoose';

export interface ISociety extends Document {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  totalFlats: number;
  totalWings: number;
  registrationNumber?: string;
  establishedYear?: number;
  amenities: string[];
  contactEmail: string;
  contactPhone: string;
  logo?: string;
  isActive: boolean;
}

const SocietySchema = new Schema<ISociety>(
  {
    name: {
      type: String,
      required: [true, 'Society name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Society name must be at least 2 characters']
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
      match: [/^[0-9]{6}$/, 'Please provide a valid 6-digit pincode']
    },
    totalFlats: {
      type: Number,
      required: [true, 'Total flats is required'],
      min: [1, 'Total flats must be at least 1']
    },
    totalWings: {
      type: Number,
      required: [true, 'Total wings is required'],
      min: [1, 'Total wings must be at least 1']
    },
    registrationNumber: {
      type: String,
      trim: true
    },
    establishedYear: {
      type: Number,
      min: [1900, 'Year must be 1900 or later'],
      max: [new Date().getFullYear(), 'Year cannot be in the future']
    },
    amenities: [{
      type: String,
      trim: true
    }],
    contactEmail: {
      type: String,
      required: [true, 'Contact email is required'],
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    contactPhone: {
      type: String,
      required: [true, 'Contact phone is required'],
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    },
    logo: {
      type: String
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Add indexes
SocietySchema.index({ name: 1 });
SocietySchema.index({ city: 1, state: 1 });

export const Society = mongoose.model<ISociety>('Society', SocietySchema);