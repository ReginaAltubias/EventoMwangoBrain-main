import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { asyncHandler } from "../lib/http";

export const feedbackRouter = Router();

const schema = z.object({
  contactId: z.string().optional(),
  overall: z.number().int().min(1).max(5),
  team: z.number().int(),
  presentation: z.number().int(),
  relevance: z.number().int(),
  highlights: z.array(z.string()),
  wantsSolution: z.string().optional(),
  wantsContact: z.boolean(),
  comment: z.string().optional(),
});

feedbackRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = schema.parse(req.body);
    const feedback = await prisma.visitorFeedback.create({ data });
    res.status(201).json(feedback);
  }),
);
