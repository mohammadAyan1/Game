import express from "express";
import {
    createTransaction,
    getTransaction,
    getTransactionStatus
} from "../controller/transactionController.js";

const router = express.Router();

router.post("/create", createTransaction);
router.get("/:id", getTransaction);
router.get("/status/:id", getTransactionStatus);


export default router;