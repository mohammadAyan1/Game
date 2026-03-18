import express from "express";
import { userController } from "../controllers/user.controller.js";
const userRoutes = express.Router()


userRoutes.post("/", userController.login)
userRoutes.post("/register", userController.register)
userRoutes.post("/logout", userController.logout)

export default userRoutes