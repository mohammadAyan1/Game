

import express from "express"
import { authMiddleware } from "../middleware/authMiddleware.js"
import { transactionController } from "../controllers/transaction.controller.js"

const transactionRouter = express.Router()

// GET  /api/wallet/get-total-coin  → net coins (profit+topup MINUS loss+withdrawal)
transactionRouter.get("/get-total-coin", authMiddleware, transactionController.getTransaction)

// POST /api/wallet/save-game-result → save profit or loss after each round
transactionRouter.post("/save-game-result", authMiddleware, transactionController.saveGameResult)
transactionRouter.post("/withdrawal", authMiddleware, transactionController.withdraw)
transactionRouter.get("/history", authMiddleware, transactionController.getAllTransactionsWithBalance)

transactionRouter.delete("/withdrawal/:txId", authMiddleware, transactionController.deleteWithdrawal);
transactionRouter.put("/withdrawal/:txId", authMiddleware, transactionController.updateWithdrawal);

export default transactionRouter