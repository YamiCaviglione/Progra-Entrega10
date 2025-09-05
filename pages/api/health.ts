import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();
    res.status(200).json({ message: "Conexión a MongoDB funcionando 🎉" });
  } catch (error) {
    res.status(500).json({ error: "Error conectando a MongoDB" });
  }
}
