// // models/Review.ts
// import mongoose, { Schema, Document, Model } from 'mongoose';

// export interface IReview extends Document {
//   userId: string;
//   bookId: string;
//   rating: number;
//   comment: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const ReviewSchema = new Schema<IReview>({
//   userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//   bookId: { type: String, required: true }, // google book id
//   rating: { type: Number, required: true, min: 1, max: 5 },
//   comment: { type: String, required: true },
// }, { timestamps: true });

// const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
// export default Review;
