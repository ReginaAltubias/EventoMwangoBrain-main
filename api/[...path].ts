// Vercel Serverless Function entry point. The `[...path]` catch-all filename
// routes every request under /api/* here; the shared Express app (server/app.ts)
// does its own internal routing from there, unchanged from local dev.
import { app } from "../server/app.ts";

export default app;
