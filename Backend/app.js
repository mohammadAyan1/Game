
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import transactionRoutes from "./routes/transactionRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();

app.use(cookieParser());
app.set("trust proxy", 1);

// ── CORS setup ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL_PAYMENT,  // payment frontend URL
      process.env.FRONTEND_URL_MAIN,     // main game frontend URL
      process.env.BACKEND_URL_PAYMENT,   // backend URL itself
      "http://localhost:8081",
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/txn", transactionRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => res.json({ status: "ok" }));

export default app;


