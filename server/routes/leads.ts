import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { asyncHandler } from "../lib/http";

export const leadsRouter = Router();

leadsRouter.post(
  "/:id/interactions",
  asyncHandler(async (req, res) => {
    const schema = z.object({ description: z.string().min(1), type: z.string().optional() });
    const data = schema.parse(req.body);
    const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });
    if (!lead) {
      res.status(404).json({ error: "Lead não encontrado" });
      return;
    }
    const interaction = await prisma.interaction.create({
      data: { leadId: lead.id, type: data.type ?? "Nota", description: data.description, userId: "USR-01" },
    });
    res.status(201).json(interaction);
  }),
);

leadsRouter.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const schema = z.object({ status: z.string().min(1) });
    const { status } = schema.parse(req.body);
    const lead = await prisma.lead.update({ where: { id: req.params.id }, data: { status } }).catch(() => null);
    if (!lead) {
      res.status(404).json({ error: "Lead não encontrado" });
      return;
    }
    await prisma.interaction.create({
      data: { leadId: lead.id, type: "Estado alterado", description: `Estado alterado para ${status}.`, userId: "USR-01" },
    });
    res.json(lead);
  }),
);
