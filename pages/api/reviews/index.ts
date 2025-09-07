// pages/api/reviews/index.ts
// -----------------------------------------------------------
// Endpoint para obtener reseñas
// - GET: todas las reseñas de un libro (query ?bookId=)
// -----------------------------------------------------------

import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import Review from "../../../models/Review";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();

    const { bookId } = req.query;

    if (!bookId || typeof bookId !== "string") {
      return res.status(400).json({ error: "Se requiere bookId en query" });
    }

    const reviews = await Review.find({ bookId }).populate("userId", "email name");

    return res.status(200).json(reviews);

  } catch (err) {
    console.error("Error al obtener reseñas:", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
}
