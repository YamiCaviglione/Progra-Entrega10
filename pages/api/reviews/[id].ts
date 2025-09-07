// pages/api/reviews/[id].ts
// -----------------------------------------------------------
// Endpoint para borrar una reseña
// - DELETE: elimina review por ID
// - Chequea que el usuario sea el dueño (opcional si agregamos auth)
// -----------------------------------------------------------

import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import Review from "../../../models/Review";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Se requiere ID de la reseña" });
  }

  try {
    await connectToDatabase();

    if (req.method === "DELETE") {
      const deleted = await Review.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: "Reseña no encontrada" });

      return res.status(200).json({ message: "Reseña eliminada" });
    } else {
      return res.status(405).json({ error: "Método no permitido" });
    }

  } catch (err) {
    console.error("Error al borrar reseña:", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
}
