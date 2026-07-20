import mongoose, { Document, Schema } from 'mongoose';

export interface IActivityParticipant extends Document {
  activity: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  status: 'interested' | 'joined' | 'left';
  joinedAt: Date;
}

const ActivityParticipantSchema = new Schema<IActivityParticipant>(
  {
    activity: { type: Schema.Types.ObjectId, ref: 'Activity', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['interested', 'joined', 'left'],
      default: 'joined',
    },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ActivityParticipantSchema.index({ activity: 1, user: 1 }, { unique: true });

export default mongoose.model<IActivityParticipant>('ActivityParticipant', ActivityParticipantSchema);
