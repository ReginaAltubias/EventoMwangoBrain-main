import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { asyncHandler } from "../lib/http";

export const followUpsRouter = Router();

followUpsRouter.patch(
  "/:id/complete",
  asyncHandler(async (req, res) => {
    const schema = z.object({ result: z.string().min(1) });
    const { result } = schema.parse(req.body);
    const followUp = await prisma.followUp.update({ where: { id: req.params.id }, data: { status: "Concluído" } }).catch(() => null);
    if (!followUp) {
      res.status(404).json({ error: "Follow-up não encontrado" });
      return;
    }
    await prisma.interaction.create({
      data: { leadId: followUp.leadId, type: "Nota", description: `Follow-up concluído: ${result}`, userId: "USR-01" },
    });
    res.json(followUp);
  }),
);
