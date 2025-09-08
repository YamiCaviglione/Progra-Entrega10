// pages/api/users/favorites.ts
// -----------------------------------------------------------
// Endpoint para manejar favoritos de libros
// - POST   /api/users/favorites   → agregar libro a favoritos
// - DELETE /api/users/favorites   → eliminar libro de favoritos
// - GET    /api/users/favorites   → listar favoritos del usuario
// - Requiere autenticación (JWT)
// -----------------------------------------------------------

import type { NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import { requireAuth, AuthenticatedNextApiRequest } from "../../../lib/auth";
import { validateBody } from "../../../lib/validate";
import { z } from "zod";

// -----------------------------------------------------------
// 📌 1. Schemas de validación
// -----------------------------------------------------------
// Para agregar favorito
const addFavoriteSchema = z.object({
  bookId: z.string().min(1, "bookId requerido"),
  title: z.string().optional(),
});

// Para eliminar favorito (solo necesita bookId)
const removeFavoriteSchema = z.object({
  bookId: z.string().min(1, "bookId requerido"),
});

// -----------------------------------------------------------
// 📌 2. Handlers
// -----------------------------------------------------------

// ➕ POST → agregar favorito
async function addFavoriteHandler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  const user = req.user!;

  const { bookId, title } = req.body; // ← ya validado
  await user.addFavorite(bookId, title);

  return res.status(200).json({
    message: "Favorito agregado",
    favorites: user.favorites,
  });
}

// ➖ DELETE → eliminar favorito
async function removeFavoriteHandler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  const user = req.user!;

  const { bookId } = req.body; // ← ya validado
  await user.removeFavorite(bookId);

  return res.status(200).json({
    message: "Favorito eliminado",
    favorites: user.favorites,
  });
}

// 👀 GET → listar favoritos
async function listFavoritesHandler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  const user = req.user!;
  return res.status(200).json({ favorites: user.favorites });
}

// -----------------------------------------------------------
// 📌 3. Export principal
// -----------------------------------------------------------
// Como es un solo archivo con 3 métodos, hacemos un router manual
export default requireAuth(async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    return validateBody(addFavoriteSchema, addFavoriteHandler)(req, res);
  }

  if (req.method === "DELETE") {
    return validateBody(removeFavoriteSchema, removeFavoriteHandler)(req, res);
  }

  if (req.method === "GET") {
    return listFavoritesHandler(req, res);
  }

  return res.status(405).json({ error: "Método no permitido" });
});
