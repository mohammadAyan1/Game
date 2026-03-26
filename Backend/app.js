// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import cookieParser from "cookie-parser";
// // ✅ Routes import (ESM)
// import transactionRoutes from "./routes/transactionRoutes.js";
// import paymentRoutes from "./routes/paymentRoutes.js";
// import adminRoutes from "./routes/adminRoutes.js";

// dotenv.config();

// const app = express();

// app.use(cookieParser())

// console.log('====================================');
// console.log(process.env.FRONTEND_URL_MAIN);
// console.log('====================================');

// app.set("trust proxy", 1);

// // ✅ CORS setup
// app.use(cors({
//   origin: [
//     process.env.FRONTEND_URL_PAYMENT,
//     process.env.FRONTEND_URL_MAIN,
//     process.env.BACKEND_URL_PAYMENT,
//     "http://localhost:8081",

//   ],
//   credentials: true,
//   methods: ["GET", "POST", "PATCH", "DELETE"],
// }));

// // ✅ Middleware
// app.use(express.json());

// // ✅ Routes
// app.use("/api/txn", transactionRoutes);
// app.use("/api/payment", paymentRoutes);
// app.use("/api/admin", adminRoutes);

// // ✅ Export (ESM)
// export default app;


//////////////////////////////////////////!SECTION


// ╔══════════════════════════════════════════════════════╗
// ║  FILE: backend/src/app.js                           ║
// ║  Express app setup — routes, cors, middleware       ║
// ╚══════════════════════════════════════════════════════╝

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




// //////////////////////////////!SECTION

// // app.js
// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import cookieParser from "cookie-parser";

// import transactionRoutes from "./routes/transactionRoutes.js";
// import paymentRoutes from "./routes/paymentRoutes.js";
// import adminRoutes from "./routes/adminRoutes.js";
// import { handleTelegramUpdate } from "./services/telegramBotHandler.js";

// dotenv.config();

// const app = express();
// app.use(cookieParser());
// app.set("trust proxy", 1);

// app.use(
//   cors({
//     origin: [
//       process.env.FRONTEND_URL_PAYMENT,
//       process.env.FRONTEND_URL_MAIN,
//       process.env.BACKEND_URL_PAYMENT,
//       "http://localhost:8081",
//     ],
//     credentials: true,
//     methods: ["GET", "POST", "PATCH", "DELETE"],
//   })
// );

// app.use(express.json());

// // ── Routes ──────────────────────────────────────────────────────────────────
// app.use("/api/txn", transactionRoutes);
// app.use("/api/payment", paymentRoutes);
// app.use("/api/admin", adminRoutes);

// // ── Telegram Webhook (all updates go through paymentRoutes /telegram-webhook)
// // But we also need to handle the bot handler from there:
// // paymentController ke adminCallback se handleTelegramUpdate call hoga.
// // Isliye paymentController mein import karenge.

// // handleTelegramUpdate()

// export default app;