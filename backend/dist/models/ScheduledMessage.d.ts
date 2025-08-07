import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IScheduledMessage, {}, {}, {}, mongoose.Document<unknown, {}, IScheduledMessage> & IScheduledMessage & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=ScheduledMessage.d.ts.map