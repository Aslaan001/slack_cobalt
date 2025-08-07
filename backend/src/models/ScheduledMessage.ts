import mongoose, { Document, Schema } from 'mongoose';

export interface IScheduledMessage extends Document {
  userId: mongoose.Types.ObjectId;
  channelId: string;
  channelName: string;
  message: string;
  scheduledFor: Date;
  sent: boolean;
  sentAt?: Date;
  failed?: boolean;
  failedAt?: Date;
  failureReason?: string;
  status: 'pending' | 'sent' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const ScheduledMessageSchema = new Schema<IScheduledMessage>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  channelId: { type: String, required: true },
  channelName: { type: String, required: true },
  message: { type: String, required: true },
  scheduledFor: { type: Date, required: true },
  sent: { type: Boolean, default: false },
  sentAt: { type: Date },
  failed: { type: Boolean, default: false },
  failedAt: { type: Date },
  failureReason: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'sent', 'failed'], 
    default: 'pending' 
  }
}, {
  timestamps: true
});

// Create compound index for scheduler queries (most important for performance)
ScheduledMessageSchema.index({ 
  scheduledFor: 1, 
  sent: 1, 
  status: 1 
});

// Index for user-specific queries
ScheduledMessageSchema.index({ userId: 1, sent: 1 });

// Index for status-based queries
ScheduledMessageSchema.index({ status: 1, scheduledFor: 1 });

// Index for failed messages
ScheduledMessageSchema.index({ failed: 1, failedAt: 1 });

// Text index for message search (if needed)
ScheduledMessageSchema.index({ message: 'text' });

export default mongoose.model<IScheduledMessage>('ScheduledMessage', ScheduledMessageSchema); 