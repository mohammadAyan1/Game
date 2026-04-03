import pool from "../config/db.js";

export const userController = {
    getAllUserCltr: async (req, res) => {
        try {
            const { role, id } = req.user;

            if (!id) {
                return res.status(401).json({
                    message: "Please Login First",
                    success: false
                });
            }

            if (role !== "Admin") {
                return res.status(403).json({
                    message: "User not Admin",
                    success: false
                });
            }

            // ✅ USERS + TOTALS
            const [users] = await pool.execute(`
            SELECT 
                u.id,
                u.Username,
                u.Phone,
                u.Role,

                COALESCE(SUM(CASE 
                    WHEN t.type IN ('profit','topup') AND t.status='success' THEN t.coins
                    WHEN t.type IN ('loss','withdrawal') AND t.status='success' THEN -t.coins
                    ELSE 0
                END),0) AS totalCoins,

                COALESCE(SUM(CASE 
                    WHEN t.type='profit' AND t.status='success' THEN t.coins
                    ELSE 0
                END),0) AS totalProfit,

                COALESCE(SUM(CASE 
                    WHEN t.type='loss' AND t.status='success' THEN t.coins
                    ELSE 0
                END),0) AS totalLoss,

                COALESCE(SUM(CASE 
                    WHEN t.type='withdrawal' AND t.status='success' THEN t.coins
                    ELSE 0
                END),0) AS totalWithdrawal

            FROM users u
            LEFT JOIN transactions t ON u.id = t.user_id
            GROUP BY u.id
        `);

            // ✅ ALL TRANSACTIONS
            const [transactions] = await pool.execute(`
            SELECT t.*, wr.upi_id 
            FROM transactions t
            LEFT JOIN withdrawal_requests wr 
                ON wr.transaction_id = t.id
            ORDER BY t.created_at DESC
        `);

            // ✅ MAP
            const data = users.map(user => {
                return {
                    ...user,
                    transactions: transactions.filter(tx => tx.user_id == user.id)
                };
            });

            return res.status(200).json({
                success: true,
                count: data.length,
                data
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Server Error",
                success: false
            });
        }
    },



    // In user.controller.js

    getReferralStats: async (req, res) => {
        try {
            const { id } = req.user;

            // Get referrer's playing_id
            const [userRows] = await pool.execute(
                `SELECT playing_id FROM users WHERE id = ?`,
                [id]
            );
            if (userRows.length === 0) {
                return res.status(404).json({ success: false, message: "User not found" });
            }
            const myPlayingId = userRows[0].playing_id;

            // Count referrals
            const [refRows] = await pool.execute(
                `SELECT id, Username, phone, created_at 
                 FROM users 
                 WHERE userReffer_id = ? 
                 ORDER BY created_at DESC`,
                [myPlayingId]
            );

            // Total bonus earned from referral milestones
            const [bonusRows] = await pool.execute(
                `SELECT SUM(coins) as totalBonus 
                 FROM transactions 
                 WHERE user_id = ? AND type = 'bonus' AND admin_remark = 'referral_milestone'`,
                [id]
            );

            return res.status(200).json({
                success: true,
                referralCount: refRows.length,
                totalBonusEarned: bonusRows[0].totalBonus || 0,
                referrals: refRows.map(r => ({
                    id: r.id,
                    username: r.Username,
                    phone: r.phone,
                    joinedAt: r.created_at
                }))
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: "Server error" });
        }

    },

}



