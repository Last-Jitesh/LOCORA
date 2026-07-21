import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  avatarUrl?: string;
  address?: string;
  bio?: string;
  department?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  latitude?: number;
  longitude?: number;
  lastLocationUpdatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    avatarUrl: { type: String },
    address: { type: String },
    bio: { type: String },
    department: { type: String },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    latitude: { type: Number },
    longitude: { type: Number },
    lastLocationUpdatedAt: { type: Date },
  },
  { timestamps: true }
);

UserSchema.index({ location: '2dsphere' });

export default mongoose.model<IUser>('User', UserSchema);

