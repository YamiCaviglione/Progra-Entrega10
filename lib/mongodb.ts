import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("⚠️ Definí MONGODB_URI en tu archivo .env.local");
}

// Interfaz para el cache global
interface GlobalCache {
  mongoose?: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

// Para evitar múltiples conexiones en dev (Next.js recarga mucho)
const globalForMongoose = globalThis as unknown as GlobalCache;

let cached = globalForMongoose.mongoose;

if (!cached) {
  cached = globalForMongoose.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  // 🔹 Si ya hay una conexión activa, usarla
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    cached!.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      console.log("✅ Conectado a MongoDB");
      return mongoose;
    });
  }
  cached!.conn = await cached!.promise;
  return cached!.conn;
}
