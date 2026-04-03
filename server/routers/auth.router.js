import express from "express";
import { authController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { setUploadFolder } from "../middleware/folder.set.middleware.js";
import { upload } from "../middleware/upload.js";
const authRoutes = express.Router()


authRoutes.post("/", authController.login)
authRoutes.post("/register", authController.register)
authRoutes.get("/logout", authController.logout)
authRoutes.post("/forget", authController.resetPassword)
authRoutes.post("/upload-image", authMiddleware, setUploadFolder("profile"), upload.single("image"), authController.uploadProfileImage)

export default authRoutes