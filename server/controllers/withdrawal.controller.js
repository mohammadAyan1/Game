import pool from "../config/db.js";
export const withdrawalController = {
    getAllPendingWithdrawal: async (req, res) => {
        try {
            const { role, id } = req.user;

            // ✅ AUTH CHECK
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

            // ✅ MAIN QUERY (JOIN)
            const [rows] = await pool.execute(`
    SELECT 
        t.id,
        t.coins,
        t.amount,
        t.status,
        t.created_at,

        u.Username,
        wr.upi_id

    FROM transactions t

    LEFT JOIN users u 
        ON u.id = t.user_id

    LEFT JOIN withdrawal_requests wr 
        ON wr.transaction_id = t.id

    WHERE t.type = 'withdrawal' 
    AND t.status = 'pending'
    AND t.user_id IS NOT NULL   -- ✅ IMPORTANT

    ORDER BY t.created_at DESC
`);
            // ✅ FORMAT RESPONSE
            const formatted = rows.map(tx => ({
                id: tx.id,
                user: tx.Username,
                coins: tx.coins,
                amount: tx.amount,
                status: tx.status,
                upiId: tx.upi_id || "N/A",
                createdAt: tx.created_at
            }));

            // ✅ FINAL RESPONSE
            return res.status(200).json({
                success: true,
                count: formatted.length,
                data: formatted
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Server Error",
                success: false
            });
        }
    },


    approveRejectPendingWithdrawal: async (req, res) => {
        try {
            const { role, id } = req.user;
            const transactionId = req.params.id;
            const { status, remark } = req.body;

            // ✅ AUTH CHECK
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

            if (!transactionId || !status) {
                return res.status(400).json({
                    message: "Missing transactionId or status",
                    success: false
                });
            }

            // ✅ ONLY allow valid status
            if (!["success", "failed"].includes(status)) {
                return res.status(400).json({
                    message: "Invalid status",
                    success: false
                });
            }

            // ✅ START TRANSACTION (important)
            const conn = await pool.getConnection();
            await conn.beginTransaction();

            try {
                // ✅ UPDATE transactions table
                if (status === "success") {
                    await conn.execute(`
                    UPDATE transactions 
                    SET status = 'success',
                        paid_at = NOW()
                    WHERE id = ? 
                    AND type = 'withdrawal'
                    AND status = 'pending'
                `, [transactionId]);

                    // ✅ UPDATE withdrawal_requests
                    await conn.execute(`
                    UPDATE withdrawal_requests
                    SET status = 'approved'
                    WHERE transaction_id = ?
                `, [transactionId]);

                } else {
                    await conn.execute(`
                    UPDATE transactions 
                    SET status = 'failed',
                        admin_remark = ?
                    WHERE id = ? 
                    AND type = 'withdrawal'
                    AND status = 'pending'
                `, [remark || "Rejected by admin", transactionId]);

                    await conn.execute(`
                    UPDATE withdrawal_requests
                    SET status = 'rejected'
                    WHERE transaction_id = ?
                `, [transactionId]);
                }

                // ✅ COMMIT
                await conn.commit();
                conn.release();

                return res.status(200).json({
                    success: true,
                    message: "Withdrawal updated successfully"
                });

            } catch (err) {
                await conn.rollback();
                conn.release();
                throw err;
            }

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Server Error",
                success: false
            });
        }
    },

    // NEW: Fetch withdrawals with optional status filter
    getAllWithdrawals: async (req, res) => {
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

            const { status } = req.query; // 'pending', 'success', 'failed', or undefined for all

            let query = `
        SELECT 
          t.id,
          t.coins,
          t.amount,
          t.status,
          t.created_at,
          u.Username,
          wr.upi_id
        FROM transactions t
        LEFT JOIN users u ON u.id = t.user_id
        LEFT JOIN withdrawal_requests wr ON wr.transaction_id = t.id
        WHERE t.type = 'withdrawal'
        AND t.user_id IS NOT NULL
      `;

            const params = [];

            if (status && status !== 'all') {
                query += ` AND t.status = ?`;
                params.push(status);
            }

            query += ` ORDER BY t.created_at DESC`;

            const [rows] = await pool.execute(query, params);

            const formatted = rows.map(tx => ({
                id: tx.id,
                user: tx.Username,
                coins: tx.coins,
                amount: tx.amount,
                status: tx.status,
                upiId: tx.upi_id || "N/A",
                createdAt: tx.created_at
            }));

            return res.status(200).json({
                success: true,
                count: formatted.length,
                data: formatted
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Server Error",
                success: false
            });
        }
    },

}