// pages/api/users/register.ts
// -----------------------------------------------------------
// Endpoint para registrar usuarios nuevos.
// - Valida email y password con Zod
// - Hashea la contraseña con bcrypt
// - Crea el usuario en MongoDB usando el modelo User
// - Devuelve el usuario creado (sin el passwordHash)
// -----------------------------------------------------------

import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import User from "../../../models/User";
import bcrypt from "bcrypt";
import { z } from "zod";

// Esquema de validación con Zod
const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  name: z.string().optional(), // opcional
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Solo permitimos POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    // Conexión a la base de datos
    await connectToDatabase();

    // Validación de body con Zod
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }

    const { email, password, name } = parsed.data;

    // Verificar si ya existe un usuario con ese email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "El email ya está registrado" });
    }

    // Hashear la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Crear nuevo usuario
    const newUser = await User.create({
      email,
      passwordHash,
      name,
    });

    // Devolver el usuario sin el hash
    return res.status(201).json({
      id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      createdAt: newUser.createdAt,
    });
  } catch (err) {
    console.error("Error en registro:", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
}
