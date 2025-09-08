// lib/schemas.ts
import { z } from "zod";

// Registro de usuario
export const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  name: z.string().optional(),
});

// Login
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

// Crear reseña
export const reviewSchema = z.object({
  bookId: z.string().min(1, "Falta el bookId"),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1, "El comentario no puede estar vacío"),
});

// Votar reseña
export const voteSchema = z.object({
  reviewId: z.string().min(1, "Falta reviewId"),
  vote: z.number().refine((val) => [-1, 1].includes(val), {
    message: "El voto debe ser -1 o +1",
  }),
});

// Favoritos
export const favoriteSchema = z.object({
  bookId: z.string().min(1, "bookId requerido"),
  title: z.string().optional(),
});
