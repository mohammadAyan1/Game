

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
            const { coins, type, game } = req.body;

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


            if (["profit", "loss"].includes(type) && !game?.length) {
                return res.status(401).json({
                    message: "Game Name is Required",
                    success: false
                })
            }

            await pool.execute(
                `INSERT INTO transactions (id, user_id, coins, status, type, created_at,game)
                 VALUES (?, ?, ?, 'success', ?, NOW(),?)`,
                [txId, id, Math.floor(coins), type, game]
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
    },

    withdraw: async (req, res) => {
        try {
            const { id } = req.user;
            const { coins, upiId } = req.body;

            // ── Validation ─────────────────────────────
            if (!id) {
                return res.status(401).json({
                    message: "User must be logged in",
                    success: false
                });
            }

            if (!coins || coins <= 0) {
                return res.status(400).json({
                    message: "Invalid withdrawal amount",
                    success: false
                });
            }

            if (!upiId || upiId.trim() === "") {
                return res.status(400).json({
                    message: "UPI ID is required",
                    success: false
                });
            }

            // ── Get current balance ────────────────────
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

            const totalCoins = rows[0].totalCoins;

            // ── Check balance ──────────────────────────
            if (coins > totalCoins) {
                return res.status(400).json({
                    message: "Insufficient balance",
                    success: false
                });
            }

            // ── Create transaction ─────────────────────
            const txId = uuidv4();

            await pool.execute(
                `INSERT INTO transactions 
                (id, user_id, coins, status, type, created_at) 
             VALUES (?, ?, ?, 'pending', 'withdrawal', NOW())`,
                [txId, id, Math.floor(coins)]
            );

            // ── Insert UPI request into new table ──────
            await pool.execute(
                `INSERT INTO withdrawal_requests
                (user_id, transaction_id, amount, upi_id)
             VALUES (?, ?, ?, ?)`,
                [id, txId, Math.floor(coins), upiId]
            );

            return res.status(200).json({
                success: true,
                message: "Withdrawal request submitted",
                transactionId: txId
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Server error",
                success: false
            });
        }
    },

    getAllTransactionsWithBalance: async (req, res) => {
        try {
            const { id } = req.user;

            if (!id) {
                return res.status(401).json({
                    message: "User must be logged in",
                    success: false
                });
            }

            // ── 1. Get all transactions + UPI ID ─────────────────────────────
            const [rows] = await pool.execute(
                `SELECT 
                t.id,
                t.type,
                t.status,
                t.amount,
                t.coins,
                t.game,
                t.created_at,
                t.paid_at,
                wr.upi_id
             FROM transactions t
             LEFT JOIN withdrawal_requests wr 
                ON wr.transaction_id = t.id
             WHERE t.user_id = ?
             ORDER BY t.created_at DESC`,
                [id]
            );

            // ── 2. Calculate total coins ─────────────────────────────
            const [balanceRow] = await pool.execute(
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

            const totalCoins = balanceRow[0].totalCoins;

            // ── 3. Format transactions ─────────────────────────────
            const formatted = rows.map(tx => {
                return {
                    id: tx.id,
                    type: tx.type,
                    status: tx.status,

                    amount: tx.amount || 0,
                    coins: tx.coins,
                    game: tx.game || null,

                    // ✅ NEW FIELD
                    upiId: tx.type === "withdrawal" ? tx.upi_id : null,

                    title:
                        tx.type === "topup" ? "Topup" :
                            tx.type === "withdrawal" ? "Withdrawal" :
                                tx.type === "profit" ? "Game Win" :
                                    tx.type === "loss" ? "Game Loss" :
                                        "Transaction",

                    description:
                        tx.type === "topup"
                            ? `Added ₹${tx.amount} → ${tx.coins} coins`
                            : tx.type === "withdrawal"
                                ? `Withdraw ${tx.coins} coins (UPI: ${tx.upi_id || "N/A"})`
                                : tx.type === "profit"
                                    ? `Won ${tx.coins} coins in ${tx.game}`
                                    : tx.type === "loss"
                                        ? `Lost ${tx.coins} coins in ${tx.game}`
                                        : "",

                    createdAt: tx.created_at,
                    paidAt: tx.paid_at
                };
            });

            // ── 4. Final response ─────────────────────────────
            return res.status(200).json({
                success: true,
                totalCoins,
                count: formatted.length,
                transactions: formatted
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Server error",
                success: false
            });
        }
    },

    deleteWithdrawal: async (req, res) => {
        try {
            const { id } = req.user;
            const { txId } = req.params;

            // check transaction
            const [rows] = await pool.execute(
                `SELECT * FROM transactions 
             WHERE id = ? AND user_id = ? AND type='withdrawal'`,
                [txId, id]
            );

            if (!rows.length) {
                return res.status(404).json({ success: false, message: "Transaction not found" });
            }

            const tx = rows[0];

            // ❌ Only pending allowed
            if (tx.status !== "pending") {
                return res.status(400).json({
                    success: false,
                    message: "Cannot delete after approval"
                });
            }

            // delete from both tables
            await pool.execute(`DELETE FROM withdrawal_requests WHERE transaction_id=?`, [txId]);
            await pool.execute(`DELETE FROM transactions WHERE id=?`, [txId]);

            return res.json({
                success: true,
                message: "Withdrawal deleted successfully"
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Server error" });
        }
    },

    updateWithdrawal: async (req, res) => {
        try {
            const { id } = req.user;
            const { txId } = req.params;
            const { coins, upiId } = req.body;

            const [rows] = await pool.execute(
                `SELECT * FROM transactions 
             WHERE id=? AND user_id=? AND type='withdrawal'`,
                [txId, id]
            );

            if (!rows.length) {
                return res.status(404).json({ success: false, message: "Not found" });
            }

            const tx = rows[0];

            // ❌ Only pending
            if (tx.status !== "pending") {
                return res.status(400).json({
                    success: false,
                    message: "Cannot edit after approval"
                });
            }

            // update transactions
            await pool.execute(
                `UPDATE transactions SET coins=? WHERE id=?`,
                [coins, txId]
            );

            // update withdrawal table
            await pool.execute(
                `UPDATE withdrawal_requests 
             SET amount=?, upi_id=? 
             WHERE transaction_id=?`,
                [coins, upiId, txId]
            );

            return res.json({
                success: true,
                message: "Withdrawal updated"
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false });
        }
    }

};

