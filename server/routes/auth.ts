import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { asyncHandler } from "../lib/http.js";
import { publicUser, userSelect } from "../lib/user.js";

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.string().min(1),
  password: z.string().min(6),
});

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);
    const email = data.email.trim().toLowerCase();
    const existing = await prisma.brainUser.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "Já existe uma conta com este e-mail." });
      return;
    }
    const passwordHash = await bcrypt.hash(data.password, 10);
    const initials = data.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();
    const user = await prisma.brainUser.create({
      data: { name: data.name.trim(), email, role: data.role.trim(), passwordHash, initials, status: "Pendente" },
      select: userSelect,
    });
    res.status(201).json(publicUser(user));
  }),
);

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body);
    const email = data.email.trim().toLowerCase();
    const user = await prisma.brainUser.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      res.status(401).json({ error: "Credenciais inválidas." });
      return;
    }
    if (user.status !== "Aprovado") {
      res.status(403).json({ error: "A sua conta ainda aguarda aprovação de um administrador." });
      return;
    }
    res.json(publicUser(user));
  }),
);
