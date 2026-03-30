import express from "express";
import adminController from "../controllers/admin.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/package", authMiddleware, adminController.createPackage);
router.get("/package", adminController.getAllPackages);
router.get("/package/:id", adminController.getPackageById);
router.put("/package/:id", authMiddleware, adminController.updatePackage);
router.delete("/package/:id", authMiddleware, adminController.deletePackage);

export default router;