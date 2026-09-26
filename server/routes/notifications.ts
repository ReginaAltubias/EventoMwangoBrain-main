import { Router } from "express";
import { prisma } from "../prisma.js";
import { asyncHandler } from "../lib/http.js";

export const notificationsRouter = Router();

notificationsRouter.patch(
  "/:id/read",
  asyncHandler(async (req, res) => {
    const notification = await prisma.notification.update({ where: { id: req.params.id }, data: { read: true } }).catch(() => null);
    if (!notification) {
      res.status(404).json({ error: "Notificação não encontrada" });
      return;
    }
    res.json(notification);
  }),
);
