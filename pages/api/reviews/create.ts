// pages/api/reviews/create.ts
// -----------------------------------------------------------
// Endpoint para crear reseñas de libros
// - Valida datos con Zod
// - Requiere userId (auth vendrá en Fase 2, por ahora lo pasamos)
// - Maneja error 11000 si el usuario ya reseñó ese libro
// -----------------------------------------------------------

import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import Review from "../../../models/Review";
import { z } from "zod";

// Esquema de validación con Zod
const reviewSchema = z.object({
  userId: z.string().min(1, "Falta el userId"),
  bookId: z.string().min(1, "Falta el bookId"),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    await connectToDatabase();

    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }

    const { userId, bookId, rating, comment } = parsed.data;

    const newReview = await Review.create({
      userId,
      bookId,
      rating,
      comment,
    });

    return res.status(201).json(newReview);
  } catch (err: any) {
    console.error("Error al crear reseña:", err);

    // Error de índice único → usuario ya reseñó ese libro
    if (err.code === 11000) {
      return res.status(409).json({
        error: "El usuario ya tiene una reseña para este libro",
      });
    }

    return res.status(500).json({ error: "Error en el servidor" });
  }
}
