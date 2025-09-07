// pages/api/users/logout.ts
// -----------------------------------------------------------
// Logout: borra cookie JWT
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  // Borrar cookie
  res.setHeader("Set-Cookie", `token=; HttpOnly; Path=/; Max-Age=0`);

  return res.status(200).json({ message: "Deslogueado correctamente" });
}
