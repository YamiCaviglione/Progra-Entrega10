// pages/api/votes/create.ts
// -----------------------------------------------------------
// Endpoint para crear votos en reseñas
// - Requiere autenticación (JWT)
// - Un usuario solo puede votar una vez por reseña (unique index)
// -----------------------------------------------------------

import type { NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import Vote from "../../../models/Vote";
import { z } from "zod";
import { requireAuth, AuthenticatedNextApiRequest } from "../../../lib/auth";

// Esquema de validación
const voteSchema = z.object({
  reviewId: z.string().min(1, "Falta reviewId"),
  vote: z.number().refine((val) => [-1, 1].includes(val), {
    message: "El voto debe ser -1 o +1",
  }),
});

export default requireAuth(async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    await connectToDatabase();

    const parsed = voteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }

    const { reviewId, vote } = parsed.data;

    const newVote = await Vote.create({
      userId: req.user!._id,
      reviewId,
      vote,
    });

    return res.status(201).json(newVote);
  } catch (err: any) {
    console.error("Error al crear voto:", err);

    if (err.code === 11000) {
      return res.status(409).json({ error: "El usuario ya votó esta reseña" });
    }

    return res.status(500).json({ error: "Error en el servidor" });
  }
});
