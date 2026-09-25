import { Router } from "express";
import { prisma } from "../prisma";
import { asyncHandler } from "../lib/http";
import { userSelect } from "../lib/user";

export const stateRouter = Router();

stateRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const [contacts, leads, interactions, followUps, meetings, feedback, notifications, users, solutions, evaluation] =
      await Promise.all([
        prisma.contact.findMany({ orderBy: { createdAt: "desc" } }),
        prisma.lead.findMany({ orderBy: { createdAt: "desc" } }),
        prisma.interaction.findMany({ orderBy: { date: "desc" } }),
        prisma.followUp.findMany({ orderBy: { dueDate: "asc" } }),
        prisma.meeting.findMany({ orderBy: { start: "asc" } }),
        prisma.visitorFeedback.findMany({ orderBy: { createdAt: "desc" } }),
        prisma.notification.findMany(),
        prisma.brainUser.findMany({ select: userSelect, orderBy: { createdAt: "asc" } }),
        prisma.solutionItem.findMany(),
        prisma.internalEvaluation.findFirst(),
      ]);
    res.json({ contacts, leads, interactions, followUps, meetings, feedback, notifications, users, solutions, evaluation });
  }),
);
