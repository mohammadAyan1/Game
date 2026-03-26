import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const userController = {

    // ✅ REGISTER
    register: async (req, res) => {
        try {
            const { username, email, phone, password } = req.body;

            // ✅ validation
            if (!username || !email || !phone || !password) {
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
                "SELECT * FROM users WHERE Username = ? OR Email = ?",
                [username, email]
            );

            if (existingUser.length > 0) {
                return res.status(400).json({
                    message: "Username or Email already exists",
                    success: false
                });
            }

            // ✅ hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // ✅ insert user
            await pool.query(
                `INSERT INTO users (Username, Email, Phone, Password) 
         VALUES (?, ?, ?, ?)`,
                [username, email, phone, hashedPassword]
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
            const { username, email, password } = req.body;

            if ((!username && !email) || !password) {
                return res.status(400).json({
                    message: "Username/Email and password required",
                    success: false
                });
            }

            // ✅ find user
            const [users] = await pool.query(
                "SELECT * FROM users WHERE Username = ? OR Email = ?",
                [username || null, email || null]
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

            console.log(token, "FGHJK");


            // ✅ COOKIE SET Localhost
            res.cookie("token", token, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",   // 🔥 change here
                maxAge: 24 * 60 * 60 * 1000
            });

            // ✅ COOKIE SET Live
            // res.cookie("token", token, {
            //     httpOnly: true,
            //     secure: true,       // 🔥 required
            //     sameSite: "none",
            //     maxAge: 24 * 60 * 60 * 1000
            // });


            return res.status(200).json({
                message: "Login successful",
                success: true,
                user: {
                    id: user.id,
                    username: user.Username,
                    email: user.Email,
                    phone: user.Phone,
                    role: user.Role
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
        res.clearCookie("token");

        return res.json({
            message: "Logged out successfully",
            success: true
        });
    }

};