// pages/api/votes/[id].ts
// -----------------------------------------------------------
// Endpoint para borrar un voto
// - Requiere autenticación
// - Solo el dueño puede borrar su voto
// -----------------------------------------------------------

import type { NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import Vote from "../../../models/Vote";
import { requireAuth, AuthenticatedNextApiRequest } from "../../../lib/auth";

export default requireAuth(async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Se requiere ID del voto" });
  }

  try {
    await connectToDatabase();

    if (req.method === "DELETE") {
      const vote = await Vote.findById(id);
      if (!vote) return res.status(404).json({ error: "Voto no encontrado" });

      // ⚡ Verificar que el usuario logueado sea el dueño
      if (vote.userId.toString() !== req.user!._id.toString()) {
        return res.status(403).json({ error: "No autorizado" });
      }

      await vote.deleteOne();

      return res.status(200).json({ message: "Voto eliminado" });
    } else {
      return res.status(405).json({ error: "Método no permitido" });
    }
  } catch (err) {
    console.error("Error al borrar voto:", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});
