import mongoose, { Document, Schema } from 'mongoose';

export interface IOtpRequest extends Document {
  email: string;
  otpHash: string;
  attempts: number;
  expiresAt: Date;
  createdAt: Date;
}

const OtpRequestSchema = new Schema<IOtpRequest>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    otpHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// TTL index — auto-delete expired OTPs from DB
OtpRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpRequestSchema.index({ email: 1 });

export default mongoose.model<IOtpRequest>('OtpRequest', OtpRequestSchema);
