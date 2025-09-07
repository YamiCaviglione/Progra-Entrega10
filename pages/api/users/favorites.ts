// pages/api/users/favorites.ts
// -------------------------------------------------------------------
// Endpoint para manejar favoritos de un usuario.
// - POST: agregar un libro a favoritos
// - DELETE: quitar un libro de favoritos
// Nota: en un proyecto real deberías usar auth middleware (JWT/cookie)
// Aquí lo simplificamos pidiendo userId directamente.
// -------------------------------------------------------------------

import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import User from "../../../models/User";
import { z } from "zod";

// Validación con Zod
const favoriteSchema = z.object({
  userId: z.string().min(1, "userId requerido"),
  bookId: z.string().min(1, "bookId requerido"),
  title: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method === "POST") {
    // ➝ Agregar favorito
    try {
      const parsed = favoriteSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues });
      }

      const { userId, bookId, title } = parsed.data;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

      await user.addFavorite(bookId, title);

      return res.status(200).json({ message: "Favorito agregado", favorites: user.favorites });
    } catch (err) {
      console.error("Error al agregar favorito:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }
  }

  if (req.method === "DELETE") {
    // ➝ Quitar favorito
    try {
      const parsed = favoriteSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues });
      }

      const { userId, bookId } = parsed.data;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

      await user.removeFavorite(bookId);

      return res.status(200).json({ message: "Favorito eliminado", favorites: user.favorites });
    } catch (err) {
      console.error("Error al eliminar favorito:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}
