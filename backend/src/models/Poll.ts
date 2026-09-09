import mongoose, { Schema, Document } from 'mongoose';

export interface IPollOption {
  text: string;
  votes: mongoose.Types.ObjectId[];
}

export interface IPoll extends Document {
  question: string;
  options: IPollOption[];
  createdBy: mongoose.Types.ObjectId;
  expiryDate: Date;
  isActive: boolean;
  society: mongoose.Types.ObjectId;
  isMultipleChoice: boolean;
  totalVotes: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const PollSchema = new Schema<IPoll>(
  {
    question: {
      type: String,
      required: [true, 'Poll question is required'],
      trim: true
    },
    options: [{
      text: {
        type: String,
        required: true
      },
      votes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
      }]
    }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required']
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
    isMultipleChoice: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

PollSchema.virtual('totalVotes').get(function() {
  return this.options.reduce((total, option) => total + option.votes.length, 0);
});

PollSchema.index({ isActive: 1, expiryDate: 1 });
PollSchema.index({ society: 1, createdAt: -1 });

export const Poll = mongoose.model<IPoll>('Poll', PollSchema);