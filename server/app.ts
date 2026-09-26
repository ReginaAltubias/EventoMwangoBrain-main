import cors from "cors";
import express from "express";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    message: "API funcionando na Vercel",
  });
});
