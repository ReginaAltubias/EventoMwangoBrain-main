import { Router } from "express";
import { prisma } from "../prisma";
import { asyncHandler } from "../lib/http";
import { userSelect } from "../lib/user";

export const usersRouter = Router();

usersRouter.patch(
  "/:id/approve",
  asyncHandler(async (req, res) => {
    const user = await prisma.brainUser
      .update({ where: { id: req.params.id }, data: { status: "Aprovado" }, select: userSelect })
      .catch(() => null);
    if (!user) {
      res.status(404).json({ error: "Pedido não encontrado" });
      return;
    }
    res.json(user);
  }),
);

usersRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.brainUser.delete({ where: { id: req.params.id } }).catch(() => null);
    res.status(204).end();
  }),
);
