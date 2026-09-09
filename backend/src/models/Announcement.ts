import mongoose, { Schema, Document } from 'mongoose';

export enum AnnouncementCategory {
  GENERAL = 'general',
  MAINTENANCE = 'maintenance',
  EMERGENCY = 'emergency',
  EVENT = 'event',
  ADMIN = 'admin'
}

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  category: AnnouncementCategory;
  author: mongoose.Types.ObjectId;
  pinned: boolean;
  expiresAt?: Date;
  readBy: mongoose.Types.ObjectId[];
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    content: {
      type: String,
      required: [true, 'Content is required']
    },
    category: {
      type: String,
      enum: Object.values(AnnouncementCategory),
      default: AnnouncementCategory.GENERAL
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    pinned: {
      type: Boolean,
      default: false
    },
    expiresAt: {
      type: Date
    },
    readBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
AnnouncementSchema.index({ category: 1, createdAt: -1 });
AnnouncementSchema.index({ pinned: -1, createdAt: -1 });

export const Announcement = mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);