

import pool from '../config/db.js';

/**
 * Get admin dashboard statistics:
 * - totalUsers: number of registered users
 * - totalCoins: sum(profit+topup coins) - sum(loss+withdrawal coins) for all users
 * - totalPendingWithdrawalAmount: sum of amount from pending withdrawal requests
 * - totalRevenue: sum of amount from successful topup transactions
 */
const getAdminStats = async (req, res) => {
    try {

        const { role } = req?.user


        if (role !== "Admin") {
            res.status(402).json({
                message: "You are not Admin",
                success: false
            })
        }

        // 1. Total users
        const [userRows] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users');
        const totalUsers = userRows[0]?.totalUsers || 0;

        // 2. Total coins (all users) with status='success'
        const [coinRows] = await pool.query(`
            SELECT COALESCE(SUM(
                CASE 
                    WHEN type IN ('profit', 'topup') THEN coins
                    WHEN type IN ('loss', 'withdrawal') THEN -coins
                    ELSE 0
                END
            ), 0) AS totalCoins
            FROM transactions
            WHERE status = 'success'
        `);
        const totalCoins = coinRows[0]?.totalCoins || 0;

        // 3. Total pending withdrawal amount
        const [withdrawalRows] = await pool.query(`
            SELECT COALESCE(SUM(amount), 0) AS totalPendingWithdrawalAmount
            FROM withdrawal_requests
            WHERE status = 'pending'
        `);
        const totalPendingWithdrawalAmount = withdrawalRows[0]?.totalPendingWithdrawalAmount || 0;

        // 4. Total revenue (sum of amount from successful topups)
        const [revenueRows] = await pool.query(`
            SELECT COALESCE(SUM(amount), 0) AS totalRevenue
            FROM transactions
            WHERE type = 'topup' AND status = 'success'
        `);
        const totalRevenue = revenueRows[0]?.totalRevenue || 0;

        return res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalCoins,
                totalPendingWithdrawalAmount,
                totalRevenue
            }
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};



export default getAdminStats