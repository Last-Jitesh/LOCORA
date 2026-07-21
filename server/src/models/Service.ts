import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
  serviceName: string;
  serviceType: 'electrician' | 'plumber' | 'carpenter' | 'laundry' | 'tutor' | 'mechanic' | 'other';
  phoneNumber: string;
  providerId: mongoose.Types.ObjectId;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    serviceName: { type: String, required: true, trim: true },
    serviceType: {
      type: String,
      enum: ['electrician', 'plumber', 'carpenter', 'laundry', 'tutor', 'mechanic', 'other'],
      required: true,
    },
    phoneNumber: { type: String, required: true, trim: true },
    providerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    address: { type: String, default: '' },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
  },
  { timestamps: true }
);

ServiceSchema.index({ location: '2dsphere' });
ServiceSchema.index({ serviceType: 1 });

export default mongoose.model<IService>('Service', ServiceSchema);
