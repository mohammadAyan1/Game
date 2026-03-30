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
}



