// pages/api/reviews/[id].ts
import type { NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import Review from "../../../models/Review";
import { requireAuth, AuthenticatedNextApiRequest } from "../../../lib/auth";
import { z } from "zod";
import { validateBody } from "../../../lib/validate"; // ✅ Middleware de validación

// ✅ Esquema para actualizar reseña
const updateReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  text: z.string().optional(),
});

// 🔒 Endpoint protegido con requireAuth
async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Se requiere ID de la reseña" });
  }

  try {
    await connectToDatabase();

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ error: "Reseña no encontrada" });

    // ⚡ Verificar que el usuario logueado sea el dueño
    if (review.userId.toString() !== req.user!._id.toString()) {
      return res.status(403).json({ error: "No autorizado" });
    }

    if (req.method === "PATCH") {
      // ✅ Gracias al middleware, req.body ya está validado
      const { rating, text } = req.body;

      if (rating !== undefined) review.rating = rating;
      if (text !== undefined) review.text = text;

      await review.save();

      return res.status(200).json({ message: "Reseña actualizada", review });
    }

    if (req.method === "DELETE") {
      await review.deleteOne();
      return res.status(200).json({ message: "Reseña eliminada" });
    }

    return res.status(405).json({ error: "Método no permitido" });
  } catch (err) {
    console.error("Error en reseña:", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
}

// 🔗 Exportamos con requireAuth + validateBody SOLO para PATCH
export default requireAuth((req, res) => {
  if (req.method === "PATCH") {
    // Si es PATCH → aplicar validación
    return validateBody(updateReviewSchema, handler)(req, res);
  }
  // Para DELETE u otros métodos, pasamos directo al handler
  return handler(req, res);
});
