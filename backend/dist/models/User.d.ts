import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    slackUserId: string;
    slackTeamId: string;
    accessToken: string;
    refreshToken?: string;
    tokenExpiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser> & IUser & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map