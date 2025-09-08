// pages/api/users/login.ts
// -----------------------------------------------------------
// Endpoint login con JWT en cookie HTTP-only
// Refactorizado con middleware validateBody
// -----------------------------------------------------------

import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import User, { IUser } from "../../../models/User";
import { z } from "zod";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { validateBody } from "../../../lib/validate"; // ✅ middleware centralizado

// -----------------------------------------------------------
// 📌 1. Definir esquema de validación con Zod
// -----------------------------------------------------------
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

// -----------------------------------------------------------
// 📌 2. Handler del endpoint
// -----------------------------------------------------------
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    await connectToDatabase();

    // 👇 ya validado por middleware
    const { email, password } = req.body;

    // Buscar usuario
    const user: IUser | null = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Usuario o contraseña incorrecta" });
    }

    // Verificar contraseña
    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      return res.status(401).json({ error: "Usuario o contraseña incorrecta" });
    }

    // Crear JWT
    const secret: Secret = process.env.JWT_SECRET as string;
    const payload = { id: user._id.toString() };
    const options: SignOptions = {
      expiresIn: (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) || "1d",
    };
    const token = jwt.sign(payload, secret, options);

    // Enviar cookie HTTP-only
    res.setHeader(
      "Set-Cookie",
      `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24}; SameSite=Lax`
    );

    // Devolver info del usuario sin passwordHash
    return res.status(200).json({
      id: user._id.toString(),
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

// -----------------------------------------------------------
// 📌 3. Exportar con validateBody
// -----------------------------------------------------------
export default validateBody(loginSchema, handler);
