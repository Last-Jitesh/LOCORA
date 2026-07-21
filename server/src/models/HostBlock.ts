import mongoose, { Document, Schema } from 'mongoose';

export interface IHostBlock extends Document {
  hostId: mongoose.Types.ObjectId;
  blockedUserId: mongoose.Types.ObjectId;
  reason?: string;
  blockedAt: Date;
}

const HostBlockSchema = new Schema<IHostBlock>(
  {
    hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    blockedUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String },
    blockedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One block record per host-user pair
HostBlockSchema.index({ hostId: 1, blockedUserId: 1 }, { unique: true });

export default mongoose.model<IHostBlock>('HostBlock', HostBlockSchema);
