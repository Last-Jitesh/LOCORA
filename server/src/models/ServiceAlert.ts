import mongoose, { Document, Schema } from 'mongoose';

export interface IServiceAlert extends Document {
  serviceType: 'plumber' | 'electrician' | 'carpenter' | 'ac-repair' | 'other';
  customServiceType?: string;
  providerName?: string;
  description: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  scheduledTime: Date;
  status: 'open' | 'closed' | 'expired';
  createdBy: mongoose.Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceAlertSchema = new Schema<IServiceAlert>(
  {
    serviceType: {
      type: String,
      enum: ['plumber', 'electrician', 'carpenter', 'ac-repair', 'other'],
      required: true,
    },
    customServiceType: { type: String },
    providerName: { type: String },
    description: { type: String, required: true },
    address: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    scheduledTime: { type: Date, required: true },
    status: { type: String, enum: ['open', 'closed', 'expired'], default: 'open' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

ServiceAlertSchema.index({ location: '2dsphere' });
ServiceAlertSchema.index({ status: 1, scheduledTime: 1 });

export default mongoose.model<IServiceAlert>('ServiceAlert', ServiceAlertSchema);
