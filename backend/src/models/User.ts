import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  slackUserId: string;
  slackTeamId: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  slackUserId: { type: String, required: true, unique: true },
  slackTeamId: { type: String, required: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: false },
  tokenExpiresAt: { type: Date, required: true },
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema); 