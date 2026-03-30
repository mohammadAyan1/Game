import express from "express";
import { bankController } from "../controllers/bank.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// All routes require authentication and admin role (add check in controller or middleware)
router.get("/", authMiddleware, bankController.getAll);
router.post("/", authMiddleware, upload.single('qr_image'), bankController.create);
router.put("/:id", authMiddleware, upload.single('qr_image'), bankController.update);
router.delete("/:id", authMiddleware, bankController.delete);

export default router;