import mongoose, { Schema, Document } from 'mongoose';

export enum VisitorStatus {
  PENDING = 'pending',
  PRE_APPROVED = 'pre_approved',
  APPROVED = 'approved',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  REJECTED = 'rejected'
}

export interface IVisitor extends Document {
  name: string;
  phone: string;
  purpose: string;
  vehicleNumber?: string;
  hostFlat: string;
  hostName?: string;
  entryTime?: Date;
  exitTime?: Date;
  status: VisitorStatus;
  preApprovedBy?: mongoose.Types.ObjectId;
  society: mongoose.Types.ObjectId;
  photo?: string;
  idProof?: string;
  notes?: string;
}

const VisitorSchema = new Schema<IVisitor>(
  {
    name: {
      type: String,
      required: [true, 'Visitor name is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    purpose: {
      type: String,
      required: [true, 'Purpose is required'],
      trim: true
    },
    vehicleNumber: {
      type: String,
      trim: true
    },
    hostFlat: {
      type: String,
      required: [true, 'Host flat number is required']
    },
    hostName: {
      type: String,
      trim: true
    },
    entryTime: {
      type: Date
    },
    exitTime: {
      type: Date
    },
    status: {
      type: String,
      enum: Object.values(VisitorStatus),
      default: VisitorStatus.PENDING
    },
    preApprovedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    society: {
      type: Schema.Types.ObjectId,
      ref: 'Society',
      required: true
    },
    photo: {
      type: String
    },
    idProof: {
      type: String
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for efficient queries
VisitorSchema.index({ status: 1, entryTime: -1 });
VisitorSchema.index({ hostFlat: 1, createdAt: -1 });
VisitorSchema.index({ phone: 1 });
VisitorSchema.index({ entryTime: 1, exitTime: 1 });

export const Visitor = mongoose.model<IVisitor>('Visitor', VisitorSchema);
