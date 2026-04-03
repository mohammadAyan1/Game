import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { userController } from "../controllers/user.controller.js";
const routes = express.Router()


routes.get("/getAllUser", authMiddleware, userController.getAllUserCltr)
// In user.routes.js
routes.get("/referral-stats", authMiddleware, userController.getReferralStats);

export default routes