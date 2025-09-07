// pages/api/users/login.ts
// -----------------------------------------------------------
// Endpoint para login de usuarios.
// - Valida email y password con Zod
// - Verifica existencia del usuario
// - Compara contraseña usando user.comparePassword()
// - Devuelve usuario (sin passwordHash)
// -----------------------------------------------------------

import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import User from "../../../models/User";
import { z } from "zod";

// Esquema de validación mínimo
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Solo permitimos POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    await connectToDatabase();

    // Validar body con Zod
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.format() }); // ⚡ usar .format() en TS
    }

    const { email, password } = parsed.data;

    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Usuario o contraseña incorrecta" });
    }

    // Comparar contraseña
    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      return res.status(401).json({ error: "Usuario o contraseña incorrecta" });
    }

    // Responder usuario (sin passwordHash)
    return res.status(200).json({
      id: user._id,
      email: user.email,
      name: user.name,
      favorites: user.favorites,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });

  } catch (err) {
    console.error("Error en login:", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
}
