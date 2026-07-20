import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tokenHash: { type: String, required: true, unique: true },
    userAgent: { type: String },
    ipAddress: { type: String },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// TTL index — auto-delete expired sessions
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
SessionSchema.index({ userId: 1 });

export default mongoose.model<ISession>('Session', SessionSchema);
