import mongoose, { Schema, Document } from 'mongoose';

export interface IFacility extends Document {
  name: string;
  description: string;
  capacity: number;
  availableSlots: number;
  rules: string[];
  images: string[];
  isActive: boolean;
  society: mongoose.Types.ObjectId;
  bookingFee?: number;
  operatingHours?: {
    start: string;
    end: string;
  };
  amenities?: string[];
}

const FacilitySchema = new Schema<IFacility>(
  {
    name: {
      type: String,
      required: [true, 'Facility name is required'],
      trim: true,
      minlength: [3, 'Facility name must be at least 3 characters'],
      maxlength: [100, 'Facility name cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters']
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1']
    },
    availableSlots: {
      type: Number,
      required: true,
      min: [0, 'Available slots cannot be negative'],
      default: function(this: any) {
        // Mongoose evaluates defaults without a document context for upserts.
        // Preserve the normal capacity-based default while keeping seeded upserts safe.
        return this?.capacity ?? 0;
      }
    },
    rules: [{
      type: String,
      trim: true
    }],
    images: [{
      type: String
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    society: {
      type: Schema.Types.ObjectId,
      ref: 'Society',
      required: [true, 'Society is required']
    },
    bookingFee: {
      type: Number,
      min: [0, 'Booking fee cannot be negative'],
      default: 0
    },
    operatingHours: {
      start: {
        type: String,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
      },
      end: {
        type: String,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
      }
    },
    amenities: [{
      type: String,
      trim: true
    }]
  },
  {
    timestamps: true
  }
);

// Indexes
FacilitySchema.index({ society: 1, isActive: 1 });
FacilitySchema.index({ society: 1, name: 1 }, { unique: true }); // compound unique: name must be unique within a society
FacilitySchema.index({ capacity: 1, availableSlots: 1 });

// Virtual for availability
FacilitySchema.virtual('isAvailable').get(function() {
  return this.isActive && this.availableSlots > 0;
});

export const Facility = mongoose.model<IFacility>('Facility', FacilitySchema);
