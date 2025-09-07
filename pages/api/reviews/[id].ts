// pages/api/reviews/[id].ts
// -----------------------------------------------------------
// Endpoint para borrar una reseña
// - DELETE: elimina review por ID
// - Requiere autenticación y verifica que el usuario sea el dueño
// -----------------------------------------------------------

import type { NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import Review from "../../../models/Review";
import { requireAuth, AuthenticatedNextApiRequest } from "../../../lib/auth";

export default requireAuth(async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Se requiere ID de la reseña" });
  }

  try {
    await connectToDatabase();

    if (req.method === "DELETE") {
      const review = await Review.findById(id);
      if (!review) return res.status(404).json({ error: "Reseña no encontrada" });

      // ⚡ Verificar que el usuario logueado sea el dueño
      if (review.userId.toString() !== req.user!._id.toString()) {
        return res.status(403).json({ error: "No autorizado" });
      }

      await review.deleteOne();

      return res.status(200).json({ message: "Reseña eliminada" });
    } else {
      return res.status(405).json({ error: "Método no permitido" });
    }
  } catch (err) {
    console.error("Error al borrar reseña:", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});
