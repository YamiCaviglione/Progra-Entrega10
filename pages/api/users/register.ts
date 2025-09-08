// pages/api/users/register.ts
// -----------------------------------------------------------
// Endpoint para registro de usuarios
// Refactorizado con middleware validateBody
// -----------------------------------------------------------

import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import User, { IUser } from "../../../models/User";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { validateBody } from "../../../lib/validate"; // ✅ nuestro middleware

// -----------------------------------------------------------
// 📌 1. Definir esquema de validación con Zod
// -----------------------------------------------------------
const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  name: z.string().optional(),
});

// -----------------------------------------------------------
// 📌 2. Handler del endpoint (ya no valida inline)
// -----------------------------------------------------------
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    await connectToDatabase();

    const { email, password, name } = req.body; // ← ya validado por middleware ✅

    // Verificar si ya existe el usuario
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Crear nuevo usuario
    const user: IUser = await User.create({
      email,
      passwordHash,
      name,
    });

    // Crear JWT
    const secret: Secret = process.env.JWT_SECRET as string;
    const payload = { id: user._id.toString() };

    const expiresIn: SignOptions["expiresIn"] =
      (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) || "1d";

    const token = jwt.sign(payload, secret, { expiresIn });

    // Guardar cookie HTTP-only
    res.setHeader(
      "Set-Cookie",
      `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24}; SameSite=Lax`
    );

    // Responder usuario sin passwordHash
    return res.status(201).json({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      favorites: user.favorites,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    console.error("Error en registro:", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
}

// -----------------------------------------------------------
// 📌 3. Exportar con el middleware aplicado
// -----------------------------------------------------------
// - validateBody recibe el schema y el handler
// - Si el body no cumple, responde 400 automáticamente
// -----------------------------------------------------------
export default validateBody(registerSchema, handler);
