import mongoose, { Document, Schema } from 'mongoose';

export interface IActivityInterest extends Document {
  activityId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ActivityInterestSchema = new Schema<IActivityInterest>(
  {
    activityId: { type: Schema.Types.ObjectId, ref: 'Activity', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

ActivityInterestSchema.index({ activityId: 1, userId: 1 }, { unique: true });

export default mongoose.model<IActivityInterest>('ActivityInterest', ActivityInterestSchema);
