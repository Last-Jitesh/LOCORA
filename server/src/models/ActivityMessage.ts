import mongoose, { Document, Schema } from 'mongoose';

export interface IActivityMessage extends Document {
  activityId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  message: string;
  createdAt: Date;
}

const ActivityMessageSchema = new Schema<IActivityMessage>(
  {
    activityId: { type: Schema.Types.ObjectId, ref: 'Activity', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

ActivityMessageSchema.index({ activityId: 1, createdAt: 1 });

export default mongoose.model<IActivityMessage>('ActivityMessage', ActivityMessageSchema);
