// pages/api/votes/index.ts
// -----------------------------------------------------------
// GET /api/votes?reviewId=...
// - Devuelve todos los votos de una reseña
// - Cuenta votos positivos y negativos
// - No requiere auth (pero podrías agregar requireAuth si querés)
// -----------------------------------------------------------

import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import Vote from "../../../models/Vote";
import { z } from "zod";

// Opcional: esquema de validación para query params
const querySchema = z.object({
  reviewId: z.string().min(1, "Se requiere reviewId en query"),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();

    // ⚡ Validar query params
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

    const { reviewId } = parsed.data;

    // Obtener votos y popular userId
    const votes = await Vote.find({ reviewId }).populate("userId", "email name");

    // Contar votos positivos y negativos
    const voteCount = votes.reduce(
      (acc, v) => {
        if (v.vote === 1) acc.positive += 1;
        if (v.vote === -1) acc.negative += 1;
        return acc;
      },
      { positive: 0, negative: 0 }
    );

    return res.status(200).json({ votes, voteCount });
  } catch (err) {
    console.error("Error al obtener votos:", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
}
