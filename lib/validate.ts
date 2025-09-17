// lib/validate.ts
import type { NextApiResponse } from "next";
import { ZodSchema } from "zod";
import { AuthenticatedNextApiRequest } from "./auth";

// ✅ Versión simple: recibe schema y handler juntos
export function validateBody<T>(
  schema: ZodSchema<T>,
  handler: (req: AuthenticatedNextApiRequest, res: NextApiResponse) => void | Promise<void>
) {
  return async (req: AuthenticatedNextApiRequest, res: NextApiResponse) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }
    req.body = parsed.data; // body ya validado
    return handler(req, res);
  };
}
