import express from "express";
import {
    verifyPayment,
    simulatePayment
} from "../controller/paymentController.js";

const router = express.Router();

router.post("/verify", verifyPayment);
router.post("/simulate", simulatePayment); // DEMO

export default router;