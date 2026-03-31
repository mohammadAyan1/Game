import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const authController = {

    // ✅ REGISTER
    register: async (req, res) => {
        try {
            const { username, phone, password } = req.body;

            // ✅ validation
            if (!username || !phone || !password) {
                return res.status(400).json({
                    message: "All fields are required",
                    success: false
                });
            }

            if (password.length < 8) {
                return res.status(400).json({
                    message: "Password must be at least 8 characters",
                    success: false
                });
            }

            // ✅ check existing user (username OR email)
            const [existingUser] = await pool.query(
                "SELECT * FROM users WHERE Username = ?",
                [username]
            );

            if (existingUser.length > 0) {
                return res.status(400).json({
                    message: "Username  already exists",
                    success: false
                });
            }

            // ✅ hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // ✅ insert user
            await pool.query(
                `INSERT INTO users (Username, Phone, Password) 
         VALUES (?, ?, ?)`,
                [username, phone, hashedPassword]
            );

            return res.status(201).json({
                message: "User registered successfully",
                success: true
            });

        } catch (error) {
            return res.status(500).json({
                message: error.message,
                success: false
            });
        }
    },

    // ✅ LOGIN (Username OR Email)
    login: async (req, res) => {
        try {
            const { phone, password } = req.body;

            if (!phone || !password) {
                return res.status(400).json({
                    message: "phone and password required",
                    success: false
                });
            }

            // ✅ find user
            const [users] = await pool.query(
                "SELECT * FROM users WHERE Phone = ?",
                [phone]
            );

            if (users.length === 0) {
                return res.status(401).json({
                    message: "Invalid credentials",
                    success: false
                });
            }

            const user = users[0];

            // ✅ password match
            const isMatch = await bcrypt.compare(password, user.Password);

            if (!isMatch) {
                return res.status(401).json({
                    message: "Invalid credentials",
                    success: false
                });
            }

            // ✅ JWT token
            const token = jwt.sign(
                { id: user.id, role: user.Role },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            // console.log(token, "FGHJK");




            // ✅ COOKIE SET Live
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE == "Production" ? true : false,       // 🔥 required
                sameSite: process.env.NODE == "Production" ? "none" : "lax",
                maxAge: 24 * 60 * 60 * 1000
            });


            return res.status(200).json({
                message: "Login successful",
                success: true,
                user: {
                    id: user.id,
                    username: user.Username,
                    phone: user.Phone,
                    role: user.Role,
                    token
                }
            });

        } catch (error) {
            return res.status(500).json({
                message: error.message,
                success: false
            });
        }
    },

    // ✅ LOGOUT
    logout: (req, res) => {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE == "Production" ? true : false,
            sameSite: process.env.NODE == "Production" ? "none" : "lax",
        });

        return res.json({
            message: "Logged out successfully",
            success: true
        });
    }

};