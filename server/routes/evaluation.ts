import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { asyncHandler } from "../lib/http.js";

export const evaluationRouter = Router();

const schema = z.object({
  scores: z.record(z.number()),
  wentWell: z.string().optional(),
  difficulties: z.string().optional(),
  topSolutions: z.array(z.string()),
  mainNeeds: z.string().optional(),
  improvements: z.string().optional(),
});

evaluationRouter.put(
  "/",
  asyncHandler(async (req, res) => {
    const data = schema.parse(req.body);
    const existing = await prisma.internalEvaluation.findFirst();
    const evaluation = existing
      ? await prisma.internalEvaluation.update({ where: { id: existing.id }, data })
      : await prisma.internalEvaluation.create({ data });
    res.json(evaluation);
  }),
);
