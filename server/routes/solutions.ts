import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { asyncHandler } from "../lib/http.js";

export const solutionsRouter = Router();

const schema = z.object({ name: z.string().min(1), subtitle: z.string().default("") });

solutionsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = schema.parse(req.body);
    const solution = await prisma.solutionItem.create({ data });
    res.status(201).json(solution);
  }),
);

solutionsRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = schema.parse(req.body);
    const solution = await prisma.solutionItem.update({ where: { id: req.params.id }, data }).catch(() => null);
    if (!solution) {
      res.status(404).json({ error: "Solução não encontrada" });
      return;
    }
    res.json(solution);
  }),
);

solutionsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.solutionItem.delete({ where: { id: req.params.id } }).catch(() => null);
    res.status(204).end();
  }),
);
