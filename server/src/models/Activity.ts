import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  title: string;
  description: string;
  category: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  startTime: Date;
  endTime?: Date;
  createdBy: mongoose.Types.ObjectId;
  interestedCount: number;
  maxParticipants: number;
  currentParticipants: number;
  participants: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['sport', 'wellness', 'social', 'education', 'garage-sale', 'volunteering', 'other'],
      default: 'other',
    },
    address: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    interestedCount: { type: Number, default: 0 },
    maxParticipants: { type: Number, required: true, min: 2 },
    currentParticipants: { type: Number, default: 0 },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

ActivitySchema.index({ location: '2dsphere' });
ActivitySchema.index({ startTime: 1 });

export default mongoose.model<IActivity>('Activity', ActivitySchema);
