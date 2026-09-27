// server/app.ts
import cors from "cors";
import express from "express";

// server/lib/errorHandler.ts
import { ZodError } from "zod";
var errorHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({ error: "Dados inv\xE1lidos", issues: err.issues });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Erro interno do servidor" });
};

// server/routes/auth.ts
import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";

// server/prisma.ts
import { PrismaClient } from "@prisma/client";
var globalForPrisma = globalThis;
var prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// server/lib/http.ts
function asyncHandler(fn) {
  return (req, res, next) => {
    fn(req, res).catch(next);
  };
}

// server/lib/user.ts
var userSelect = { id: true, name: true, email: true, role: true, initials: true, status: true };
function publicUser(user) {
  const { passwordHash: _passwordHash, createdAt: _createdAt, ...rest } = user;
  return rest;
}

// server/routes/auth.ts
var authRouter = Router();
var registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.string().min(1),
  password: z.string().min(6)
});
authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);
    const email = data.email.trim().toLowerCase();
    const existing = await prisma.brainUser.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "J\xE1 existe uma conta com este e-mail." });
      return;
    }
    const passwordHash = await bcrypt.hash(data.password, 10);
    const initials = data.name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
    const user = await prisma.brainUser.create({
      data: { name: data.name.trim(), email, role: data.role.trim(), passwordHash, initials, status: "Pendente" },
      select: userSelect
    });
    res.status(201).json(publicUser(user));
  })
);
var loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body);
    const email = data.email.trim().toLowerCase();
    const user = await prisma.brainUser.findUnique({ where: { email } });
    if (!user || !await bcrypt.compare(data.password, user.passwordHash)) {
      res.status(401).json({ error: "Credenciais inv\xE1lidas." });
      return;
    }
    if (user.status !== "Aprovado") {
      res.status(403).json({ error: "A sua conta ainda aguarda aprova\xE7\xE3o de um administrador." });
      return;
    }
    res.json(publicUser(user));
  })
);

// server/routes/contacts.ts
import { Router as Router2 } from "express";
import { z as z2 } from "zod";
var contactsRouter = Router2();
var interestSchema = z2.enum(["Alto", "M\xE9dio", "Baixo"]);
var quickSchema = z2.object({
  fullName: z2.string().min(1),
  company: z2.string().min(1),
  phone: z2.string().min(1),
  mainSolution: z2.string().min(1),
  interest: interestSchema
});
contactsRouter.post(
  "/quick",
  asyncHandler(async (req, res) => {
    const data = quickSchema.parse(req.body);
    const result = await prisma.$transaction(async (tx) => {
      const contact = await tx.contact.create({
        data: {
          fullName: data.fullName,
          company: data.company,
          phone: data.phone,
          source: "Captura r\xE1pida",
          isComplete: false,
          createdBy: "USR-01"
        }
      });
      const lead = await tx.lead.create({
        data: {
          contactId: contact.id,
          solutions: [data.mainSolution],
          mainSolution: data.mainSolution,
          hasConcreteNeed: "Em avalia\xE7\xE3o",
          interest: data.interest,
          status: "Novo",
          ownerId: "USR-01",
          nextAction: data.interest === "Alto" ? "Agendar reuni\xE3o" : "Enviar apresenta\xE7\xE3o",
          followUpDate: new Date(Date.now() + 864e5)
        }
      });
      await tx.interaction.create({
        data: { leadId: lead.id, type: "Nota", description: "Contacto registado por captura r\xE1pida.", userId: "USR-01" }
      });
      return { contact, lead };
    });
    res.status(201).json(result);
  })
);
var fullSchema = z2.object({
  contact: z2.object({
    fullName: z2.string().min(1),
    company: z2.string().min(1),
    phone: z2.string().min(1),
    role: z2.string().optional(),
    email: z2.string().optional(),
    sector: z2.string().optional(),
    whatsapp: z2.string().optional()
  }),
  lead: z2.object({
    solutions: z2.array(z2.string()).min(1),
    mainSolution: z2.string().min(1),
    interest: interestSchema,
    need: z2.string().optional(),
    nextAction: z2.string().min(1),
    followUpDate: z2.string().optional()
  })
});
contactsRouter.post(
  "/full",
  asyncHandler(async (req, res) => {
    const data = fullSchema.parse(req.body);
    const followUpDate = data.lead.followUpDate ? new Date(data.lead.followUpDate) : new Date(Date.now() + 864e5);
    const result = await prisma.$transaction(async (tx) => {
      const contact = await tx.contact.create({
        data: { ...data.contact, source: "Stand", isComplete: true, createdBy: "USR-01" }
      });
      const lead = await tx.lead.create({
        data: {
          contactId: contact.id,
          solutions: data.lead.solutions,
          mainSolution: data.lead.mainSolution,
          need: data.lead.need,
          hasConcreteNeed: "Em avalia\xE7\xE3o",
          interest: data.lead.interest,
          status: "Novo",
          ownerId: "USR-01",
          nextAction: data.lead.nextAction,
          followUpDate
        }
      });
      await tx.interaction.create({
        data: { leadId: lead.id, type: "Nota", description: "Contacto completo registado no stand.", userId: "USR-01" }
      });
      await tx.followUp.create({
        data: { leadId: lead.id, action: lead.nextAction, dueDate: followUpDate, ownerId: "USR-01", status: "Pendente" }
      });
      return { contact, lead };
    });
    res.status(201).json(result);
  })
);

// server/routes/evaluation.ts
import { Router as Router3 } from "express";
import { z as z3 } from "zod";
var evaluationRouter = Router3();
var schema = z3.object({
  scores: z3.record(z3.number()),
  wentWell: z3.string().optional(),
  difficulties: z3.string().optional(),
  topSolutions: z3.array(z3.string()),
  mainNeeds: z3.string().optional(),
  improvements: z3.string().optional()
});
evaluationRouter.put(
  "/",
  asyncHandler(async (req, res) => {
    const data = schema.parse(req.body);
    const existing = await prisma.internalEvaluation.findFirst();
    const evaluation = existing ? await prisma.internalEvaluation.update({ where: { id: existing.id }, data }) : await prisma.internalEvaluation.create({ data });
    res.json(evaluation);
  })
);

// server/routes/feedback.ts
import { Router as Router4 } from "express";
import { z as z4 } from "zod";
var feedbackRouter = Router4();
var schema2 = z4.object({
  contactId: z4.string().optional(),
  overall: z4.number().int().min(1).max(5),
  team: z4.number().int(),
  presentation: z4.number().int(),
  relevance: z4.number().int(),
  highlights: z4.array(z4.string()),
  wantsSolution: z4.string().optional(),
  wantsContact: z4.boolean(),
  comment: z4.string().optional()
});
feedbackRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = schema2.parse(req.body);
    const feedback = await prisma.visitorFeedback.create({ data });
    res.status(201).json(feedback);
  })
);

// server/routes/followUps.ts
import { Router as Router5 } from "express";
import { z as z5 } from "zod";
var followUpsRouter = Router5();
followUpsRouter.patch(
  "/:id/complete",
  asyncHandler(async (req, res) => {
    const schema6 = z5.object({ result: z5.string().min(1) });
    const { result } = schema6.parse(req.body);
    const followUp = await prisma.followUp.update({ where: { id: req.params.id }, data: { status: "Conclu\xEDdo" } }).catch(() => null);
    if (!followUp) {
      res.status(404).json({ error: "Follow-up n\xE3o encontrado" });
      return;
    }
    await prisma.interaction.create({
      data: { leadId: followUp.leadId, type: "Nota", description: `Follow-up conclu\xEDdo: ${result}`, userId: "USR-01" }
    });
    res.json(followUp);
  })
);

// server/routes/leads.ts
import { Router as Router6 } from "express";
import { z as z6 } from "zod";
var leadsRouter = Router6();
leadsRouter.post(
  "/:id/interactions",
  asyncHandler(async (req, res) => {
    const schema6 = z6.object({ description: z6.string().min(1), type: z6.string().optional() });
    const data = schema6.parse(req.body);
    const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });
    if (!lead) {
      res.status(404).json({ error: "Lead n\xE3o encontrado" });
      return;
    }
    const interaction = await prisma.interaction.create({
      data: { leadId: lead.id, type: data.type ?? "Nota", description: data.description, userId: "USR-01" }
    });
    res.status(201).json(interaction);
  })
);
leadsRouter.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const schema6 = z6.object({ status: z6.string().min(1) });
    const { status } = schema6.parse(req.body);
    const lead = await prisma.lead.update({ where: { id: req.params.id }, data: { status } }).catch(() => null);
    if (!lead) {
      res.status(404).json({ error: "Lead n\xE3o encontrado" });
      return;
    }
    await prisma.interaction.create({
      data: { leadId: lead.id, type: "Estado alterado", description: `Estado alterado para ${status}.`, userId: "USR-01" }
    });
    res.json(lead);
  })
);

// server/routes/meetings.ts
import { Router as Router7 } from "express";
import { z as z7 } from "zod";
var meetingsRouter = Router7();
var schema3 = z7.object({
  leadId: z7.string().min(1),
  type: z7.string().min(1),
  start: z7.string().min(1),
  end: z7.string().min(1),
  location: z7.string().optional()
});
meetingsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = schema3.parse(req.body);
    const meeting = await prisma.meeting.create({
      data: { leadId: data.leadId, type: data.type, start: new Date(data.start), end: new Date(data.end), ownerId: "USR-01", location: data.location }
    });
    await prisma.interaction.create({
      data: { leadId: data.leadId, type: "Reuni\xE3o", description: `${data.type} agendada.`, userId: "USR-01" }
    });
    res.status(201).json(meeting);
  })
);

// server/routes/notifications.ts
import { Router as Router8 } from "express";
var notificationsRouter = Router8();
notificationsRouter.patch(
  "/:id/read",
  asyncHandler(async (req, res) => {
    const notification = await prisma.notification.update({ where: { id: req.params.id }, data: { read: true } }).catch(() => null);
    if (!notification) {
      res.status(404).json({ error: "Notifica\xE7\xE3o n\xE3o encontrada" });
      return;
    }
    res.json(notification);
  })
);

// server/routes/public.ts
import { Router as Router9 } from "express";
import { z as z8 } from "zod";
var publicRouter = Router9();
var schema4 = z8.object({
  fullName: z8.string().min(1).max(100),
  company: z8.string().min(1).max(100),
  role: z8.string().max(80).optional(),
  whatsapp: z8.string().max(20).optional(),
  email: z8.string().max(255).optional(),
  solution: z8.string().min(1),
  solutions: z8.array(z8.string()).optional(),
  wantsDemo: z8.boolean().optional()
});
publicRouter.post(
  "/qr-contact",
  asyncHandler(async (req, res) => {
    const data = schema4.parse(req.body);
    const sols = data.solutions?.length ? data.solutions : [data.solution];
    const demo = !!data.wantsDemo;
    const followUpDate = new Date(Date.now() + 864e5);
    const result = await prisma.$transaction(async (tx) => {
      const contact = await tx.contact.create({
        data: {
          fullName: data.fullName,
          company: data.company,
          role: data.role,
          phone: data.whatsapp ?? "",
          whatsapp: data.whatsapp,
          email: data.email,
          source: "QR Code",
          isComplete: true,
          createdBy: "public"
        }
      });
      const lead = await tx.lead.create({
        data: {
          contactId: contact.id,
          solutions: sols,
          mainSolution: sols[0],
          hasConcreteNeed: "Em avalia\xE7\xE3o",
          interest: demo ? "Alto" : "M\xE9dio",
          status: "Novo",
          ownerId: "USR-01",
          nextAction: demo ? "Fazer demonstra\xE7\xE3o" : "Contactar via WhatsApp",
          followUpDate,
          notes: demo ? "Pediu apresenta\xE7\xE3o/demonstra\xE7\xE3o via QR Code." : void 0
        }
      });
      await tx.interaction.create({
        data: {
          leadId: lead.id,
          type: "Nota",
          description: `Registo pelo QR Code${demo ? " \xB7 pediu apresenta\xE7\xE3o ou demonstra\xE7\xE3o" : ""}.`,
          userId: "USR-01"
        }
      });
      await tx.followUp.create({
        data: { leadId: lead.id, action: lead.nextAction, dueDate: followUpDate, ownerId: "USR-01", status: "Pendente" }
      });
      await tx.notification.create({
        data: {
          title: demo ? "Novo pedido de demonstra\xE7\xE3o (QR)" : "Novo interesse pelo QR Code",
          detail: `${data.fullName} \xB7 ${data.company} \xB7 ${sols.join(", ")}`,
          date: "Agora",
          read: false,
          href: `/leads/${lead.id}`
        }
      });
      return { contact, lead };
    });
    res.status(201).json(result);
  })
);

// server/routes/solutions.ts
import { Router as Router10 } from "express";
import { z as z9 } from "zod";
var solutionsRouter = Router10();
var schema5 = z9.object({ name: z9.string().min(1), subtitle: z9.string().default("") });
solutionsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = schema5.parse(req.body);
    const solution = await prisma.solutionItem.create({ data });
    res.status(201).json(solution);
  })
);
solutionsRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = schema5.parse(req.body);
    const solution = await prisma.solutionItem.update({ where: { id: req.params.id }, data }).catch(() => null);
    if (!solution) {
      res.status(404).json({ error: "Solu\xE7\xE3o n\xE3o encontrada" });
      return;
    }
    res.json(solution);
  })
);
solutionsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.solutionItem.delete({ where: { id: req.params.id } }).catch(() => null);
    res.status(204).end();
  })
);

// server/routes/state.ts
import { Router as Router11 } from "express";
var stateRouter = Router11();
stateRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const [contacts, leads, interactions, followUps, meetings, feedback, notifications, users, solutions, evaluation] = await Promise.all([
      prisma.contact.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.lead.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.interaction.findMany({ orderBy: { date: "desc" } }),
      prisma.followUp.findMany({ orderBy: { dueDate: "asc" } }),
      prisma.meeting.findMany({ orderBy: { start: "asc" } }),
      prisma.visitorFeedback.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.notification.findMany(),
      prisma.brainUser.findMany({ select: userSelect, orderBy: { createdAt: "asc" } }),
      prisma.solutionItem.findMany(),
      prisma.internalEvaluation.findFirst()
    ]);
    res.json({ contacts, leads, interactions, followUps, meetings, feedback, notifications, users, solutions, evaluation });
  })
);

// server/routes/users.ts
import { Router as Router12 } from "express";
var usersRouter = Router12();
usersRouter.patch(
  "/:id/approve",
  asyncHandler(async (req, res) => {
    const user = await prisma.brainUser.update({ where: { id: req.params.id }, data: { status: "Aprovado" }, select: userSelect }).catch(() => null);
    if (!user) {
      res.status(404).json({ error: "Pedido n\xE3o encontrado" });
      return;
    }
    res.json(user);
  })
);
usersRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.brainUser.delete({ where: { id: req.params.id } }).catch(() => null);
    res.status(204).end();
  })
);

// server/app.ts
var app = express();
app.use(cors());
app.use(express.json());
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});
app.use("/api/auth", authRouter);
app.use("/api/state", stateRouter);
app.use("/api/contacts", contactsRouter);
app.use("/api/leads", leadsRouter);
app.use("/api/meetings", meetingsRouter);
app.use("/api/follow-ups", followUpsRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/public", publicRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/evaluation", evaluationRouter);
app.use("/api/solutions", solutionsRouter);
app.use("/api/users", usersRouter);
app.use(errorHandler);
export {
  app
};
