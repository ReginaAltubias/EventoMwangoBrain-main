import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { asyncHandler } from "../lib/http.js";
import { notifyNewContact, notifyClient } from "../lib/notify.js";
import { sendSms } from "../lib/sms.js";

export const contactsRouter = Router();

const interestSchema = z.enum(["Alto", "Médio", "Baixo"]);

const quickSchema = z.object({
  fullName: z.string().min(1),
  company: z.string().min(1),
  phone: z.string().min(1),
  mainSolution: z.string().min(1),
  interest: interestSchema,
  notes: z.string().max(500).optional(),
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
          notes: data.notes,
          source: "Captura rápida",
          isComplete: false,
          createdBy: "USR-01",
        },
      });
      const lead = await tx.lead.create({
        data: {
          contactId: contact.id,
          solutions: [data.mainSolution],
          mainSolution: data.mainSolution,
          hasConcreteNeed: "Em avaliação",
          interest: data.interest,
          status: "Novo",
          ownerId: "USR-01",
          nextAction: data.interest === "Alto" ? "Agendar reunião" : "Enviar apresentação",
          followUpDate: new Date(Date.now() + 86400000),
        },
      });
      await tx.interaction.create({
        data: {
          leadId: lead.id,
          type: "Nota",
          description: `Contacto registado por captura rápida.${data.notes ? ` Obs: ${data.notes}` : ""}`,
          userId: "USR-01",
        },
      });
      return { contact, lead };
    });

    void notifyNewContact({
      fullName: data.fullName,
      company: data.company,
      source: "Captura rápida",
      solutions: [data.mainSolution],
      notes: data.notes,
    });

    // SMS de confirmação se tiver número (telefone usado como WhatsApp)
    void sendSms({
      to: data.phone,
      body: `Olá ${data.fullName}! Obrigado pelo interesse na Mwango Brain. A nossa equipa vai contactá-lo(a) em breve. — mwangobrain.com`,
    });

    res.status(201).json(result);
  }),
);

const fullSchema = z.object({
  contact: z.object({
    fullName: z.string().min(1),
    company: z.string().min(1),
    phone: z.string().min(1),
    role: z.string().optional(),
    email: z.string().optional(),
    sector: z.string().optional(),
    whatsapp: z.string().optional(),
    notes: z.string().max(500).optional(),
  }),
  lead: z.object({
    solutions: z.array(z.string()).min(1),
    mainSolution: z.string().min(1),
    interest: interestSchema,
    need: z.string().optional(),
    nextAction: z.string().min(1),
    followUpDate: z.string().optional(),
  }),
});

contactsRouter.post(
  "/full",
  asyncHandler(async (req, res) => {
    const data = fullSchema.parse(req.body);
    const followUpDate = data.lead.followUpDate ? new Date(data.lead.followUpDate) : new Date(Date.now() + 86400000);
    const result = await prisma.$transaction(async (tx) => {
      const contact = await tx.contact.create({
        data: { ...data.contact, source: "Stand", isComplete: true, createdBy: "USR-01" },
      });
      const lead = await tx.lead.create({
        data: {
          contactId: contact.id,
          solutions: data.lead.solutions,
          mainSolution: data.lead.mainSolution,
          need: data.lead.need,
          hasConcreteNeed: "Em avaliação",
          interest: data.lead.interest,
          status: "Novo",
          ownerId: "USR-01",
          nextAction: data.lead.nextAction,
          followUpDate,
        },
      });
      await tx.interaction.create({
        data: {
          leadId: lead.id,
          type: "Nota",
          description: `Contacto completo registado no stand.${data.contact.notes ? ` Obs: ${data.contact.notes}` : ""}`,
          userId: "USR-01",
        },
      });
      await tx.followUp.create({
        data: { leadId: lead.id, action: lead.nextAction, dueDate: followUpDate, ownerId: "USR-01", status: "Pendente" },
      });
      return { contact, lead };
    });

    void notifyNewContact({
      fullName: data.contact.fullName,
      company: data.contact.company,
      source: "Stand",
      solutions: data.lead.solutions,
      whatsapp: data.contact.whatsapp,
      email: data.contact.email,
      notes: data.contact.notes,
    });

    // E-mail de confirmação ao cliente
    if (data.contact.email) {
      void notifyClient({
        fullName: data.contact.fullName,
        email: data.contact.email,
        solutions: data.lead.solutions,
        wantsDemo: false,
      });
    }

    // SMS de confirmação ao cliente
    const phone = data.contact.whatsapp || data.contact.phone;
    void sendSms({
      to: phone,
      body: `Olá ${data.contact.fullName}! Obrigado pelo interesse na Mwango Brain. A nossa equipa vai contactá-lo(a) em breve. — mwangobrain.com`,
    });

    res.status(201).json(result);
  }),
);
