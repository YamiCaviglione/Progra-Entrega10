// // models/User.ts
// import mongoose, { Schema, Document, Model } from 'mongoose';
// import bcrypt from 'bcryptjs';

// export interface IUser extends Document {
//   email: string;
//   passwordHash: string;
//   name?: string;
//   favorites: string[]; // array de bookId (Google Books ids)
//   comparePassword(candidate: string): Promise<boolean>;
// }

// const UserSchema = new Schema<IUser>({
//   email: { type: String, required: true, unique: true, lowercase: true, trim: true },
//   passwordHash: { type: String, required: true },
//   name: { type: String },
//   favorites: [{ type: String }],
// }, { timestamps: true });

// UserSchema.methods.comparePassword = function(candidatePassword: string) {
//   return bcrypt.compare(candidatePassword, this.passwordHash);
// };

// const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
// export default User;
