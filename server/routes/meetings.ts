import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { asyncHandler } from "../lib/http";

export const meetingsRouter = Router();

const schema = z.object({
  leadId: z.string().min(1),
  type: z.string().min(1),
  start: z.string().min(1),
  end: z.string().min(1),
  location: z.string().optional(),
});

meetingsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = schema.parse(req.body);
    const meeting = await prisma.meeting.create({
      data: { leadId: data.leadId, type: data.type, start: new Date(data.start), end: new Date(data.end), ownerId: "USR-01", location: data.location },
    });
    await prisma.interaction.create({
      data: { leadId: data.leadId, type: "Reunião", description: `${data.type} agendada.`, userId: "USR-01" },
    });
    res.status(201).json(meeting);
  }),
);
