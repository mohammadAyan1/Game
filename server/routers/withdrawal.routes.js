
import express from "express";
import { withdrawalController } from "../controllers/withdrawal.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const withdrawalRoutes = express.Router();

// Optional: keep old endpoint for backward compatibility
withdrawalRoutes.get("/pending", authMiddleware, withdrawalController.getAllPendingWithdrawal);

// New endpoint: /withdrawal?status=pending|success|failed|all
withdrawalRoutes.get("/", authMiddleware, withdrawalController.getAllWithdrawals);

withdrawalRoutes.put("/:id/approvereject", authMiddleware, withdrawalController.approveRejectPendingWithdrawal);

export default withdrawalRoutes;