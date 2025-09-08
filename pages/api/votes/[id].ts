// pages/api/votes/[id].ts
// -----------------------------------------------------------
// DELETE /api/votes/:id
// - Solo el dueño del voto puede borrarlo
// - Requiere autenticación con JWT
// -----------------------------------------------------------

import type { NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import Vote from "../../../models/Vote";
import { requireAuth, AuthenticatedNextApiRequest } from "../../../lib/auth";
import { z } from "zod";

// 📌 Validación de query params
const voteIdSchema = z.object({
  id: z.string().min(1, "Se requiere ID del voto"),
});

export default requireAuth(async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();

    if (req.method === "DELETE") {
      // ✅ Validar ID de la query
      const parsed = voteIdSchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.format() });
      }

      const { id } = parsed.data;

      const vote = await Vote.findById(id);
      if (!vote) return res.status(404).json({ error: "Voto no encontrado" });

      // ⚡ Solo el dueño puede borrar
      if (vote.userId.toString() !== req.user!._id.toString()) {
        return res.status(403).json({ error: "No autorizado" });
      }

      await vote.deleteOne();
      return res.status(200).json({ message: "Voto eliminado" });
    }

    return res.status(405).json({ error: "Método no permitido" });
  } catch (err) {
    console.error("Error al borrar voto:", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});
