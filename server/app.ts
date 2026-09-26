import cors from "cors";
import express from "express";

import { errorHandler } from "./lib/errorHandler.js";
import { authRouter } from "./routes/auth.js";
import { contactsRouter } from "./routes/contacts.js";
import { evaluationRouter } from "./routes/evaluation.js";
import { feedbackRouter } from "./routes/feedback.js";
import { followUpsRouter } from "./routes/followUps.js";
import { leadsRouter } from "./routes/leads.js";
import { meetingsRouter } from "./routes/meetings.js";
import { notificationsRouter } from "./routes/notifications.js";
import { publicRouter } from "./routes/public.js";
import { solutionsRouter } from "./routes/solutions.js";
import { stateRouter } from "./routes/state.js";
import { usersRouter } from "./routes/users.js";

export const app = express();

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