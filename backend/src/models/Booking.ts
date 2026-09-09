import mongoose, { Schema, Document } from 'mongoose';

export enum BookingStatus {
  PENDING = 'pending',
  BOOKED = 'booked',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export interface IBooking extends Document {
  facility: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  notes?: string;
  society: mongoose.Types.ObjectId;
  bookingReference: string;
  cancelledAt?: Date;
  completedAt?: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    facility: {
      type: Schema.Types.ObjectId,
      ref: 'Facility',
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      required: [true, 'Booking date is required']
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
    },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.BOOKED
    },
    notes: {
      type: String
    },
    society: {
      type: Schema.Types.ObjectId,
      ref: 'Society',
      required: true
    },
    bookingReference: {
      type: String,
      unique: true,
      required: true
    },
    cancelledAt: {
      type: Date
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

BookingSchema.index({ facility: 1, date: 1, startTime: 1 });
BookingSchema.index({ user: 1, date: -1 });
BookingSchema.index({ bookingReference: 1 });

// Generate booking reference before saving
BookingSchema.pre('save', function(next) {
  if (!this.bookingReference) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.bookingReference = `BK-${timestamp}-${random}`;
  }
  next();
});

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);