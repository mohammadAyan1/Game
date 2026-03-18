import express from "express";
import {
    getAllBanks,
    addBank,
    toggleBank,
    deleteBank,
    getRecentTransactions,
    resetDailyCollected
} from "../controller/adminController.js";

const router = express.Router();

router.get("/banks", getAllBanks);
router.post("/banks", addBank);
router.patch("/banks/:id/toggle", toggleBank);
router.delete("/banks/:id", deleteBank);
router.get("/transactions", getRecentTransactions);
router.post("/reset-daily", resetDailyCollected);

export default router;