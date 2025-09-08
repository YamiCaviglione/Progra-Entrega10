// pages/api/votes/create.ts
// -----------------------------------------------------------
// POST /api/votes/create
// - Crear voto (+1/-1) para una reseña
// - Valida body con Zod usando validateBody
// - Requiere autenticación con JWT
// -----------------------------------------------------------

import type { NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import Vote from "../../../models/Vote";
import { z } from "zod";
import { requireAuth, AuthenticatedNextApiRequest } from "../../../lib/auth";
import { validateBody } from "../../../lib/validate"; // ✅ middleware

// ✅ Esquema de validación de body
const voteSchema = z.object({
  reviewId: z.string().min(1, "Falta reviewId"),
  vote: z.number().refine((val) => [-1, 1].includes(val), {
    message: "El voto debe ser -1 o +1",
  }),
});

// 🔒 Handler protegido por JWT
async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  try {
    await connectToDatabase();

    // ⚡ req.body ya está validado por validateBody
    const { reviewId, vote } = req.body;

    const newVote = await Vote.create({
      userId: req.user!._id, // usuario autenticado
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
}

// 🔗 Export con requireAuth + validateBody
export default requireAuth(validateBody(voteSchema, handler));
