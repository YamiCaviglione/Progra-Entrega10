// pages/api/test-mongo.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = await connectToDatabase();
    res.status(200).json({ message: "✅ Conectado a MongoDB", db: db.connection.name });
  } catch (error) {
    res.status(500).json({ message: "❌ Error al conectar a MongoDB", error });
  }
}
