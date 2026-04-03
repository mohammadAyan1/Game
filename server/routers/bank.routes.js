import express from "express";
import { bankController } from "../controllers/bank.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";
import { setUploadFolder } from "../middleware/folder.set.middleware.js";
const router = express.Router();

// All routes require authentication and admin role (add check in controller or middleware)
router.get("/", authMiddleware, bankController.getAll);
router.post("/", authMiddleware, setUploadFolder("qr"), upload.single('qr_image'), bankController.create);
router.put("/:id", authMiddleware, setUploadFolder("qr"), upload.single('qr_image'), bankController.update);
router.delete("/:id", authMiddleware, bankController.delete);

export default router;