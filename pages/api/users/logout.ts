// pages/api/users/logout.ts
// -----------------------------------------------------------
// Endpoint para logout
// - Borra la cookie "token" con Max-Age=0
// - Usa HttpOnly y SameSite=Lax por seguridad
// -----------------------------------------------------------

import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  // Borrar cookie JWT
  res.setHeader(
    "Set-Cookie",
    `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`
    // ⚠ En producción conviene agregar: ; Secure
  );

  return res.status(200).json({ message: "Logout exitoso" });
}
