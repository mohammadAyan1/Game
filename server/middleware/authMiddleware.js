
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export const authMiddleware = async (req, res, next) => {
    try {
        let token;

        // 🔥 1. Check Authorization Header (Mobile App)
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }

        // 🔥 2. Agar header me nahi mila to cookie se lo (Web)
        if (!token) {
            token = req.cookies?.token;
        }

        // ❌ Agar dono me nahi mila
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized. Token not found.",
                success: false
            });
        }

        // 🔐 Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 🔍 User fetch
        const [users] = await pool.query(
            "SELECT id, Username, Phone, Role FROM users WHERE id = ?",
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "User not found",
                success: false
            });
        }

        // ✅ Attach user to request
        req.user = {
            id: users[0].id,
            username: users[0].Username,
            phone: users[0].Phone,
            role: users[0].Role
        };

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token",
            success: false
        });
    }
};