// pages/api/users/favorites.ts
import type { NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import User from "../../../models/User";
import { z } from "zod";
import { requireAuth, AuthenticatedNextApiRequest } from "../../../lib/auth";

const favoriteSchema = z.object({
  bookId: z.string().min(1, "bookId requerido"),
  title: z.string().optional(),
});

export default requireAuth(async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  const user = req.user!;
  
  if (req.method === "POST") {
    const parsed = favoriteSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

    const { bookId, title } = parsed.data;
    await user.addFavorite(bookId, title);

    return res.status(200).json({ message: "Favorito agregado", favorites: user.favorites });
  }

  if (req.method === "DELETE") {
    const parsed = favoriteSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

    const { bookId } = parsed.data;
    await user.removeFavorite(bookId);

    return res.status(200).json({ message: "Favorito eliminado", favorites: user.favorites });
  }

  return res.status(405).json({ error: "Método no permitido" });
});
