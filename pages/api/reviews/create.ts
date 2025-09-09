// pages/api/reviews/create.ts
// -----------------------------------------------------------
// Endpoint para crear reseñas de libros
// - Valida datos con Zod usando validateBody
// - Requiere userId (de auth con requireAuth)
// - Maneja error 11000 si el usuario ya reseñó ese libro
// -----------------------------------------------------------

import type { NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import Review from "../../../models/Review";
import { z } from "zod";
import { requireAuth, AuthenticatedNextApiRequest } from "../../../lib/auth";
import { validateBody } from "../../../lib/validate"; // ✅ nuevo import

// ✅ Esquema de validación con Zod
const reviewSchema = z.object({
  bookId: z.string().min(1, "Falta el bookId"),
  rating: z.number().min(1).max(5),
  text: z.string().optional(),
});

// 🔒 Handler protegido con requireAuth
async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    await connectToDatabase();

    // ✅ Ya no usamos safeParse, el body ya está validado por validateBody
    const { bookId, rating, text } = req.body;

    const newReview = await Review.create({
      userId: req.user!._id,
      bookId,
      rating,
      text,
      upvotes:0,
      downvotes:0
    });

    return res.status(201).json(newReview);
  } catch (err: any) {
    console.error("Error al crear reseña:", err);

    if (err.code === 11000) {
      return res.status(409).json({
        error: "El usuario ya tiene una reseña para este libro",
      });
    }

    return res.status(500).json({ error: "Error en el servidor" });
  }
}

// ✅ Export con requireAuth + validateBody
export default requireAuth(validateBody(reviewSchema, handler));
