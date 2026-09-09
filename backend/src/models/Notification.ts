import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  title: string;
  message: string;
  user: mongoose.Types.ObjectId;
  isRead: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
  link?: string;
  metadata?: Record<string, any>;
  society: mongoose.Types.ObjectId;
}

const NotificationSchema = new Schema<INotification>(
  {
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      minlength: [5, 'Message must be at least 5 characters'],
      maxlength: [500, 'Message cannot exceed 500 characters']
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    },
    isRead: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['info', 'warning', 'success', 'error'],
      default: 'info'
    },
    link: {
      type: String,
      trim: true
    },
    metadata: {
      type: Schema.Types.Mixed
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

// Indexes for efficient queries
NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ society: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });

// Compound index for user notifications
NotificationSchema.index({ user: 1, isRead: 1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);