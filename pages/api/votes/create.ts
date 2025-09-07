// pages/api/votes/create.ts
// -----------------------------------------------------------
// Endpoint para crear votos en reseñas
// - Valida datos con Zod
// - Un usuario solo puede votar una vez por reseña (unique index en el modelo)
// - Maneja error 11000 si intenta votar de nuevo
// -----------------------------------------------------------

import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import Vote from "../../../models/Vote";
import { z } from "zod";

// Esquema de validación
const voteSchema = z.object({
  userId: z.string().min(1, "Falta userId"),
  reviewId: z.string().min(1, "Falta reviewId"),
  vote: z.number().refine((val) => [-1, 1].includes(val), {
    message: "El voto debe ser -1 o +1",
  }),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    await connectToDatabase();

    const parsed = voteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }

    const { userId, reviewId, vote } = parsed.data;

    const newVote = await Vote.create({
      userId,
      reviewId,
      vote,
    });

    return res.status(201).json(newVote);
  } catch (err: any) {
    console.error("Error al crear voto:", err);

    // Capturar error de índice único (ya votó)
    if (err.code === 11000) {
      return res.status(409).json({
        error: "El usuario ya votó esta reseña",
      });
    }

    return res.status(500).json({ error: "Error en el servidor" });
  }
}
