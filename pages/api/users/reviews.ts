//endpoint para resenas de usuario - para lo de /profile
//pages/api/users/reviews.ts

import type { NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import { requireAuth, AuthenticatedNextApiRequest } from "../../../lib/auth";
import Review from "../../../models/Review";

export default requireAuth(async function handler(
  req: AuthenticatedNextApiRequest,
  res: NextApiResponse
) {
  await connectToDatabase();

  if (!req.user) return res.status(401).json({ error: "No autorizado" });

  const reviews = await Review.find({ userId: req.user._id }).sort({
    createdAt: -1,
  });

  return res.status(200).json(reviews);
});
