// // models/Vote.ts
// import mongoose, { Schema, Document, Model } from 'mongoose';

// export interface IVote extends Document {
//   userId: string;
//   reviewId: string;
//   vote: number; // +1 or -1 (o 1..5 si querés)
// }

// const VoteSchema = new Schema<IVote>({
//   userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//   reviewId: { type: Schema.Types.ObjectId, ref: 'Review', required: true },
//   vote: { type: Number, required: true },
// }, { timestamps: true });

// VoteSchema.index({ userId: 1, reviewId: 1 }, { unique: true }); // un usuario una votación por reseña

// const Vote: Model<IVote> = mongoose.models.Vote || mongoose.model<IVote>('Vote', VoteSchema);
// export default Vote;
