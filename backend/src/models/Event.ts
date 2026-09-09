import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  organizer: mongoose.Types.ObjectId;
  maxAttendees?: number;
  attendees: {
    user: mongoose.Types.ObjectId;
    status: 'going' | 'maybe' | 'not_going';
    registeredAt: Date;
  }[];
  isVirtual: boolean;
  meetingLink?: string;
  image?: string;
}

const EventSchema = new Schema<IEvent>(
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
    location: {
      type: String,
      required: [true, 'Location is required']
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    maxAttendees: {
      type: Number
    },
    attendees: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['going', 'maybe', 'not_going'],
        default: 'going'
      },
      registeredAt: {
        type: Date,
        default: Date.now
      }
    }],
    isVirtual: {
      type: Boolean,
      default: false
    },
    meetingLink: {
      type: String
    },
    image: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

EventSchema.index({ startDate: 1, endDate: 1 });
EventSchema.index({ organizer: 1 });

export const Event = mongoose.model<IEvent>('Event', EventSchema);