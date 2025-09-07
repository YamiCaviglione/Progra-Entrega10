// pages/api/votes/index.ts
// -----------------------------------------------------------
// Endpoint para obtener votos
// - GET: todos los votos de una review (query ?reviewId=)
// -----------------------------------------------------------

import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import Vote from "../../../models/Vote";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();

    const { reviewId } = req.query;

    if (!reviewId || typeof reviewId !== "string") {
      return res.status(400).json({ error: "Se requiere reviewId en query" });
    }

    const votes = await Vote.find({ reviewId }).populate("userId", "email name");

    return res.status(200).json(votes);

  } catch (err) {
    console.error("Error al obtener votos:", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
}
