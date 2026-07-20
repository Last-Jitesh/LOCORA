import mongoose, { Document, Schema } from 'mongoose';

export interface IServiceAlertInterest extends Document {
  serviceAlertId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
}

const ServiceAlertInterestSchema = new Schema<IServiceAlertInterest>(
  {
    serviceAlertId: { type: Schema.Types.ObjectId, ref: 'ServiceAlert', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  },
  { timestamps: true }
);

ServiceAlertInterestSchema.index({ serviceAlertId: 1, userId: 1 }, { unique: true });

export default mongoose.model<IServiceAlertInterest>('ServiceAlertInterest', ServiceAlertInterestSchema);
