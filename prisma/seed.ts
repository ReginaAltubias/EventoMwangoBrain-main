import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { initialState } from "../src/brain/data/mock";

const prisma = new PrismaClient();
const DEMO_PASSWORD = "summit2026";

async function main() {
  await prisma.interaction.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.visitorFeedback.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.brainUser.deleteMany();
  await prisma.solutionItem.deleteMany();
  await prisma.internalEvaluation.deleteMany();

  await prisma.solutionItem.createMany({
    data: initialState.solutions.map((s) => ({ id: s.id, name: s.name, subtitle: s.subtitle })),
  });
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  await prisma.brainUser.createMany({ data: initialState.users.map((u) => ({ ...u, passwordHash })) });
  await prisma.contact.createMany({
    data: initialState.contacts.map((c) => ({ ...c, createdAt: new Date(c.createdAt) })),
  });
  await prisma.lead.createMany({
    data: initialState.leads.map((l) => ({ ...l, followUpDate: l.followUpDate ? new Date(l.followUpDate) : null })),
  });
  await prisma.interaction.createMany({
    data: initialState.interactions.map((i) => ({ ...i, date: new Date(i.date) })),
  });
  await prisma.followUp.createMany({
    data: initialState.followUps.map((f) => ({ ...f, dueDate: new Date(f.dueDate) })),
  });
  await prisma.meeting.createMany({
    data: initialState.meetings.map((m) => ({ ...m, start: new Date(m.start), end: new Date(m.end) })),
  });
  await prisma.visitorFeedback.createMany({ data: initialState.feedback });
  await prisma.notification.createMany({ data: initialState.notifications });
  await prisma.internalEvaluation.create({ data: initialState.evaluation });

  console.log(`Seed concluído. Contas de demonstração aprovadas, palavra-passe: "${DEMO_PASSWORD}" (ex.: regina@mwangobrain.com).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
