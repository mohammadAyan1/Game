

import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export const transactionController = {

    // ── GET total coins (profit/topup ADD, loss/withdrawal MINUS) ──────────────
    getTransaction: async (req, res) => {
        try {
            const { id } = req.user;

            if (!id) {
                return res.status(401).json({
                    message: "User must be logged in",
                    success: false
                });
            }

            const [rows] = await pool.execute(
                `SELECT 
                    COALESCE(
                        SUM(
                            CASE 
                                WHEN type IN ('profit', 'topup') THEN coins
                                WHEN type IN ('loss', 'withdrawal') THEN -coins
                                ELSE 0
                            END
                        ), 0
                    ) AS totalCoins
                 FROM transactions
                 WHERE user_id = ? AND status = 'success'`,
                [id]
            );

            return res.status(200).json({
                success: true,
                totalCoins: rows[0].totalCoins
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Server error", success: false });
        }
    },

    // ── SAVE game result (profit or loss) ──────────────────────────────────────
    saveGameResult: async (req, res) => {
        try {
            const { id } = req.user;
            const { coins, type } = req.body;

            // Validation
            if (!id) {
                return res.status(401).json({ message: "User must be logged in", success: false });
            }

            if (!coins || coins <= 0) {
                return res.status(400).json({ message: "Invalid coin amount", success: false });
            }

            if (!["profit", "loss"].includes(type)) {
                return res.status(400).json({ message: "Invalid transaction type", success: false });
            }

            const txId = uuidv4();

            await pool.execute(
                `INSERT INTO transactions (id, user_id, coins, status, type, created_at)
                 VALUES (?, ?, ?, 'success', ?, NOW())`,
                [txId, id, Math.floor(coins), type]
            );

            return res.status(200).json({
                success: true,
                message: type === "profit" ? "Winnings saved!" : "Loss recorded",
                transactionId: txId
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Server error", success: false });
        }
    }
};