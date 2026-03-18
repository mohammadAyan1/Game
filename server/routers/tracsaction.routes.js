// import express from "express"
// import { authMiddleware } from "../middleware/authMiddleware.js"
// import { transactionController } from "../controllers/transaction.controller.js"
// const transactionRouter = express.Router()

// transactionRouter.get("/get-total-coin", authMiddleware, transactionController.getTransaction)

// export default transactionRouter


import express from "express"
import { authMiddleware } from "../middleware/authMiddleware.js"
import { transactionController } from "../controllers/transaction.controller.js"

const transactionRouter = express.Router()

// GET  /api/wallet/get-total-coin  → net coins (profit+topup MINUS loss+withdrawal)
transactionRouter.get("/get-total-coin", authMiddleware, transactionController.getTransaction)

// POST /api/wallet/save-game-result → save profit or loss after each round
transactionRouter.post("/save-game-result", authMiddleware, transactionController.saveGameResult)

export default transactionRouter