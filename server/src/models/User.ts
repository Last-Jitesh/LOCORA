import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
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
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
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

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
