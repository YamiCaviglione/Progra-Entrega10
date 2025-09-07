// lib/auth.ts
// -----------------------------------------------------------
// Middleware para proteger endpoints Next.js API routes
// - Verifica JWT en cookie "token"
// - Adjunta req.user con información del usuario
// -----------------------------------------------------------

import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

export interface AuthenticatedNextApiRequest extends NextApiRequest {
  user?: IUser;
}

/**
 * requireAuth: Wrapper para proteger endpoints
 * Uso:
 * export default requireAuth(async (req, res) => { ... });
 */
export function requireAuth(
  handler: (req: AuthenticatedNextApiRequest, res: NextApiResponse) => void | Promise<void>
) {
  return async (req: AuthenticatedNextApiRequest, res: NextApiResponse) => {
    try {
      const token = req.cookies?.token; // ⚡ aseguro que sea opcional
      if (!token) {
        return res.status(401).json({ error: "No autorizado" });
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error("JWT_SECRET no definido");

      // Verifico token y obtengo el id
      const decoded = jwt.verify(token, secret) as { id: string };

      // Busco usuario en DB sin passwordHash
      const user = await User.findById(decoded.id).select("-passwordHash");
      if (!user) {
        return res.status(401).json({ error: "Usuario no encontrado" });
      }

      req.user = user;

      // Paso control al handler original
      return handler(req, res);
    } catch (err) {
      console.error("requireAuth error:", err);
      return res.status(401).json({ error: "Token inválido" });
    }
  };
}
