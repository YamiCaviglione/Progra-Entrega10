// models/Review.ts
// Modelo Review: referencia a User, bookId (Google Books id), rating (1-5), comment.
// DÓNDE: /models/Review.ts

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId | string;
  bookId: string;
  rating: number;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  bookId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, required: true },
}, {
  timestamps: true,
});

// Índice único para que un mismo usuario no pueda crear muchas reseñas para el mismo libro
ReviewSchema.index({ userId: 1, bookId: 1 }, { unique: true });

const Review: Model<IReview> = (mongoose.models.Review as Model<IReview>) || mongoose.model<IReview>("Review", ReviewSchema);
export default Review;
