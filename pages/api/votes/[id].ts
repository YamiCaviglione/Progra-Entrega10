// pages/api/votes/[id].ts
// -----------------------------------------------------------
// Endpoint para borrar un voto
// - DELETE: elimina voto por ID
// -----------------------------------------------------------

import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import Vote from "../../../models/Vote";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Se requiere ID del voto" });
  }

  try {
    await connectToDatabase();

    if (req.method === "DELETE") {
      const deleted = await Vote.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: "Voto no encontrado" });

      return res.status(200).json({ message: "Voto eliminado" });
    } else {
      return res.status(405).json({ error: "Método no permitido" });
    }

  } catch (err) {
    console.error("Error al borrar voto:", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
}


