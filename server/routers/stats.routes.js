import express from "express";
import getAdminStats from "../controllers/stats.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const statsRoutes = express.Router()

statsRoutes.get("/", authMiddleware, getAdminStats)

export default statsRoutes