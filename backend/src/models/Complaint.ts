import mongoose, { Schema, Document } from 'mongoose';

export enum ComplaintStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  REJECTED = 'rejected'
}

export enum ComplaintPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface IComplaint extends Document {
  title: string;
  description: string;
  category: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  raisedBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  comments: {
    text: string;
    user: mongoose.Types.ObjectId;
    createdAt: Date;
  }[];
  attachments?: string[];
  resolvedAt?: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    category: {
      type: String,
      required: [true, 'Category is required']
    },
    priority: {
      type: String,
      enum: Object.values(ComplaintPriority),
      default: ComplaintPriority.MEDIUM
    },
    status: {
      type: String,
      enum: Object.values(ComplaintStatus),
      default: ComplaintStatus.PENDING
    },
    raisedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    comments: [{
      text: {
        type: String,
        required: true
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    attachments: [String],
    resolvedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

ComplaintSchema.index({ status: 1, createdAt: -1 });
ComplaintSchema.index({ raisedBy: 1, createdAt: -1 });

export const Complaint = mongoose.model<IComplaint>('Complaint', ComplaintSchema);