import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
// ✅ Routes import (ESM)
import transactionRoutes from "./routes/transactionRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();

app.use(cookieParser())

console.log('====================================');
console.log(process.env.FRONTEND_URL_MAIN);
console.log('====================================');

app.set("trust proxy", 1);

// ✅ CORS setup
app.use(cors({
  origin: [
    process.env.FRONTEND_URL_PAYMENT,
    process.env.FRONTEND_URL_MAIN,
    process.env.BACKEND_URL_PAYMENT,
    "http://localhost:8081",

  ],
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE"],
}));

// ✅ Middleware
app.use(express.json());

// ✅ Routes
app.use("/api/txn", transactionRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);

// ✅ Export (ESM)
export default app;