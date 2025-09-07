// models/Vote.ts
// Modelo Vote: usuario vota una reseña (vote puede ser +1 / -1 o 1..5 según diseño).
// DÓNDE: /models/Vote.ts

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVote extends Document {
  userId: mongoose.Types.ObjectId | string;
  reviewId: mongoose.Types.ObjectId | string;
  vote: number; // por ejemplo +1 (me gusta) o -1 (no)
  createdAt: Date;
  updatedAt: Date;
}

const VoteSchema = new Schema<IVote>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  reviewId: { type: Schema.Types.ObjectId, ref: "Review", required: true },
  vote: { type: Number, required: true },
}, {
  timestamps: true,
});

// Un usuario solo puede votar una vez por reseña
VoteSchema.index({ userId: 1, reviewId: 1 }, { unique: true });

const Vote: Model<IVote> = (mongoose.models.Vote as Model<IVote>) || mongoose.model<IVote>("Vote", VoteSchema);
export default Vote;
