// Vercel Serverless Function entry point. The `[...path]` catch-all filename
// routes every request under /api/* here; the shared Express app (server/app.ts)
// does its own internal routing from there, unchanged from local dev.
// Imports the pre-bundled output (built by `npm run build:server`), not the
// raw TypeScript source, so there is no cross-directory module for the
// deployed function to resolve at runtime.
import { app } from "../server/app.js";

export default app;