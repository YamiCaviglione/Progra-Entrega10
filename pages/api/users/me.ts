// pages/api/users/me.ts
import type { NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import { requireAuth, AuthenticatedNextApiRequest } from "../../../lib/auth";
import User from "../../../models/User";

export default requireAuth(async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (!req.user) return res.status(401).json({ error: "No autorizado" });

  // devolver usuario logueado
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

  return res.status(200).json({
    id: user._id,
    email: user.email,
    name: user.name,
    favorites: user.favorites,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
});
