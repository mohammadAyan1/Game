import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { userController } from "../controllers/user.controller.js";
const routes = express.Router()


routes.get("/getAllUser", authMiddleware, userController.getAllUserCltr)

export default routes