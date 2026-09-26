import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { asyncHandler } from "../lib/http";

export const publicRouter = Router();

const schema = z.object({
  fullName: z.string().min(1).max(100),
  company: z.string().min(1).max(100),
  role: z.string().max(80).optional(),
  whatsapp: z.string().max(20).optional(),
  email: z.string().max(255).optional(),
  solution: z.string().min(1),
  solutions: z.array(z.string()).optional(),
  wantsDemo: z.boolean().optional(),
});

publicRouter.post(
  "/qr-contact",
  asyncHandler(async (req, res) => {
    const data = schema.parse(req.body);
    const sols = data.solutions?.length ? data.solutions : [data.solution];
    const demo = !!data.wantsDemo;
    const followUpDate = new Date(Date.now() + 86400000);
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
          createdBy: "public",
        },
      });
      const lead = await tx.lead.create({
        data: {
          contactId: contact.id,
          solutions: sols,
          mainSolution: sols[0],
          hasConcreteNeed: "Em avaliação",
          interest: demo ? "Alto" : "Médio",
          status: "Novo",
          ownerId: "USR-01",
          nextAction: demo ? "Fazer demonstração" : "Contactar via WhatsApp",
          followUpDate,
          notes: demo ? "Pediu apresentação/demonstração via QR Code." : undefined,
        },
      });
      await tx.interaction.create({
        data: {
          leadId: lead.id,
          type: "Nota",
          description: `Registo pelo QR Code${demo ? " · pediu apresentação ou demonstração" : ""}.`,
          userId: "USR-01",
        },
      });
      await tx.followUp.create({
        data: { leadId: lead.id, action: lead.nextAction, dueDate: followUpDate, ownerId: "USR-01", status: "Pendente" },
      });
      await tx.notification.create({
        data: {
          title: demo ? "Novo pedido de demonstração (QR)" : "Novo interesse pelo QR Code",
          detail: `${data.fullName} · ${data.company} · ${sols.join(", ")}`,
          date: "Agora",
          read: false,
          href: `/leads/${lead.id}`,
        },
      });
      return { contact, lead };
    });
    res.status(201).json(result);
  }),
);
