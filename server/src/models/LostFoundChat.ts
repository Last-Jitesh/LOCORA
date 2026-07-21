import mongoose, { Document, Schema } from 'mongoose';

export interface ILostFoundMessage {
  senderId: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface ILostFoundChat extends Document {
  itemId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  claimantId: mongoose.Types.ObjectId;
  messages: ILostFoundMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const LostFoundMessageSchema = new Schema<ILostFoundMessage>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const LostFoundChatSchema = new Schema<ILostFoundChat>(
  {
    itemId: { type: Schema.Types.ObjectId, ref: 'LostFound', required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    claimantId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    messages: [LostFoundMessageSchema],
  },
  { timestamps: true }
);

// One chat conversation per claimant per item
LostFoundChatSchema.index({ itemId: 1, claimantId: 1 }, { unique: true });

export default mongoose.model<ILostFoundChat>('LostFoundChat', LostFoundChatSchema);
