import mongoose, { Document, Schema } from 'mongoose';

export interface ILostFound extends Document {
  reportedBy: mongoose.Types.ObjectId;
  type: 'lost' | 'found';
  title: string;
  description: string;
  category: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  date: Date;
  status: 'open' | 'resolved';
  contactPreference: string;
  createdAt: Date;
  updatedAt: Date;
}

const LostFoundSchema = new Schema<ILostFound>(
  {
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['lost', 'found'], required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['pet', 'keys', 'wallet', 'phone', 'bag', 'documents', 'jewellery', 'other'],
      default: 'other',
    },
    address: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    date: { type: Date, required: true },
    status: { type: String, enum: ['open', 'resolved'], default: 'open' },
    contactPreference: { type: String, default: '' },
  },
  { timestamps: true }
);

LostFoundSchema.index({ location: '2dsphere' });
LostFoundSchema.index({ status: 1, type: 1 });

export default mongoose.model<ILostFound>('LostFound', LostFoundSchema);
