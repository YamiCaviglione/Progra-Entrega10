// models/User.ts
// ---------------------------------------------------------------
// Modelo User: email, passwordHash, name, favorites (subdocumentos).
// Métodos de instancia: comparePassword, addFavorite, removeFavorite.
// ---------------------------------------------------------------

import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcrypt";

export interface IFavorite {
  bookId: string;       // ID de Google Books
  title?: string;       // opcional, por conveniencia
  addedAt?: Date;       // cuándo se agregó a favoritos
}

// Definimos la interfaz IUser con los campos y métodos de User
export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name?: string;
  favorites: IFavorite[];
  comparePassword(candidate: string): Promise<boolean>;
  addFavorite(bookId: string, title?: string): Promise<void>;
  removeFavorite(bookId: string): Promise<void>;
  createdAt: Date;    
  updatedAt: Date;     
}

const FavoriteSchema = new Schema<IFavorite>({
  bookId: { type: String, required: true },
  title: { type: String },
  addedAt: { type: Date, default: Date.now },
}, { _id: false }); // no queremos un _id extra en cada favorito

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  name: { type: String },
  favorites: { type: [FavoriteSchema], default: [] },
}, {
  timestamps: true, // agrega createdAt y updatedAt
});

// Método de instancia: comparar contraseña
UserSchema.methods.comparePassword = async function(this: IUser, candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Métodos auxiliares para favoritos
UserSchema.methods.addFavorite = async function(this: IUser, bookId: string, title?: string) {
  // Evitar duplicados
  if (this.favorites.some(f => f.bookId === bookId)) return;
  this.favorites.push({ bookId, title, addedAt: new Date() });
  await this.save();
};

UserSchema.methods.removeFavorite = async function(this: IUser, bookId: string) {
  this.favorites = this.favorites.filter(f => f.bookId !== bookId);
  await this.save();
};

// Evitar recrear el modelo en hot-reload (Next.js)
const User: Model<IUser> = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>("User", UserSchema);
export default User;
