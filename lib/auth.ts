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
export function requireAuth(handler: (req: AuthenticatedNextApiRequest, res: NextApiResponse) => void | Promise<void>) {
  return async (req: AuthenticatedNextApiRequest, res: NextApiResponse) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ error: "No autorizado" });
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error("JWT_SECRET no definido");

      const decoded = jwt.verify(token, secret) as { id: string }; // id del user
      const user = await User.findById(decoded.id).select("-passwordHash");
      if (!user) return res.status(401).json({ error: "Usuario no encontrado" });

      req.user = user;

      return handler(req, res); // ejecutar endpoint
    } catch (err) {
      console.error("requireAuth error:", err);
      return res.status(401).json({ error: "Token inválido" });
    }
  };
}
