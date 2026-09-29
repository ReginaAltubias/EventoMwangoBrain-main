import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { asyncHandler } from "../lib/http.js";

export const followUpsRouter = Router();

followUpsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const schema = z.object({ leadId: z.string().min(1), action: z.string().min(1), dueDate: z.string().min(1) });
    const data = schema.parse(req.body);
    const lead = await prisma.lead.findUnique({ where: { id: data.leadId } });
    if (!lead) {
      res.status(404).json({ error: "Lead não encontrado" });
      return;
    }
    const followUp = await prisma.followUp.create({
      data: { leadId: data.leadId, action: data.action, dueDate: new Date(data.dueDate), ownerId: "USR-01", status: "Pendente" },
    });
    res.status(201).json(followUp);
  }),
);

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
