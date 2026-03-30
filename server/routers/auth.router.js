import express from "express";
import { authController } from "../controllers/auth.controller.js";
const authRoutes = express.Router()


authRoutes.post("/", authController.login)
authRoutes.post("/register", authController.register)
authRoutes.get("/logout", authController.logout)

export default authRoutes