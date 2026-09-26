import cors from "cors";
import express from "express";
import { errorHandler } from "./lib/errorHandler";
import { authRouter } from "./routes/auth";
import { contactsRouter } from "./routes/contacts";
import { evaluationRouter } from "./routes/evaluation";
import { feedbackRouter } from "./routes/feedback";
import { followUpsRouter } from "./routes/followUps";
import { leadsRouter } from "./routes/leads";
import { meetingsRouter } from "./routes/meetings";
import { notificationsRouter } from "./routes/notifications";
import { publicRouter } from "./routes/public";
import { solutionsRouter } from "./routes/solutions";
import { stateRouter } from "./routes/state";
import { usersRouter } from "./routes/users";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

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
