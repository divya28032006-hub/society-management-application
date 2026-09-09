import mongoose, { Schema, Document } from 'mongoose';

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  UPI = 'upi',
  BANK_TRANSFER = 'bank_transfer',
  ONLINE = 'online'
}

export interface IPayment extends Document {
  user: mongoose.Types.ObjectId;
  amount: number;
  month: number; // 1-12
  year: number;
  status: PaymentStatus;
  paymentDate?: Date;
  receipt?: string;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  remarks?: string;
  society: mongoose.Types.ObjectId;
  lateFee?: number;
  discount?: number;
  paidBy?: mongoose.Types.ObjectId; // Admin who recorded the payment
  dueDate: Date;
  isRecurring: boolean;
  recurringMonths?: number[]; // Months if recurring
}

const PaymentSchema = new Schema<IPayment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    month: {
      type: Number,
      required: [true, 'Month is required'],
      min: [1, 'Month must be between 1 and 12'],
      max: [12, 'Month must be between 1 and 12']
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [2000, 'Year must be 2000 or later']
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING
    },
    paymentDate: {
      type: Date
    },
    receipt: {
      type: String
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod)
    },
    transactionId: {
      type: String,
      trim: true
    },
    remarks: {
      type: String,
      trim: true
    },
    society: {
      type: Schema.Types.ObjectId,
      ref: 'Society',
      required: [true, 'Society is required']
    },
    lateFee: {
      type: Number,
      default: 0,
      min: [0, 'Late fee cannot be negative']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative']
    },
    paidBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    isRecurring: {
      type: Boolean,
      default: false
    },
    recurringMonths: [{
      type: Number,
      min: 1,
      max: 12
    }]
  },
  {
    timestamps: true
  }
);

// Indexes for efficient queries
PaymentSchema.index({ user: 1, month: 1, year: 1 });
PaymentSchema.index({ status: 1, dueDate: 1 });
PaymentSchema.index({ society: 1, createdAt: -1 });
PaymentSchema.index({ transactionId: 1 });

// Compound unique index to prevent duplicate payments for same month/year
PaymentSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

// Virtual for total amount (amount + lateFee - discount)
PaymentSchema.virtual('totalAmount').get(function() {
  return this.amount + (this.lateFee || 0) - (this.discount || 0);
});

// Set due date to end of month if not provided
PaymentSchema.pre('save', function(next) {
  if (!this.dueDate) {
    const lastDay = new Date(this.year, this.month, 0);
    this.dueDate = lastDay;
  }
  next();
});

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);