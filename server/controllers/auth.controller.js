import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import fs from "fs";
import imagekit from "../config/imagekit.js";


// Add this function inside authController (or as a helper)
async function awardReferralBonus(referrerId, connection) {
    // Count distinct referred users (by userReffer_id)
    const [countRows] = await connection.execute(
        `SELECT COUNT(*) AS referralCount FROM users WHERE userReffer_id = 
         (SELECT playing_id FROM users WHERE id = ?)`,
        [referrerId]
    );
    const referralCount = countRows[0].referralCount;

    // Total bonus milestones (500 per 3 referrals)
    const milestones = Math.floor(referralCount / 3);
    const expectedTotalBonus = milestones * 500;

    // Get already awarded bonus for referrals (type='bonus' with remark 'referral_milestone')
    const [awardedRows] = await connection.execute(
        `SELECT COALESCE(SUM(coins),0) AS awarded FROM transactions 
         WHERE user_id = ? AND type = 'bonus' AND admin_remark = 'referral_milestone'`,
        [referrerId]
    );
    const alreadyAwarded = awardedRows[0].awarded;

    const toAward = expectedTotalBonus - alreadyAwarded;
    if (toAward > 0) {
        const txId = uuidv4();
        await connection.execute(
            `INSERT INTO transactions (id, user_id, coins, status, type, is_bonus, admin_remark, created_at)
             VALUES (?, ?, ?, 'success', 'bonus', 1, 'referral_milestone', NOW())`,
            [txId, referrerId, toAward]
        );
        // Update user bonus_balance
        await connection.execute(
            `UPDATE users SET bonus_balance = bonus_balance + ? WHERE id = ?`,
            [toAward, referrerId]
        );
    }
}



export const authController = {





    // ✅ REGISTER
    // register: async (req, res) => {
    //     try {
    //         const { username, phone, password } = req.body;

    //         // ✅ validation
    //         if (!username || !phone || !password) {
    //             return res.status(400).json({
    //                 message: "All fields are required",
    //                 success: false
    //             });
    //         }

    //         if (password.length < 8) {
    //             return res.status(400).json({
    //                 message: "Password must be at least 8 characters",
    //                 success: false
    //             });
    //         }

    //         // 🔥 Check existing user
    //         const [existingUser] = await pool.query(
    //             "SELECT * FROM users WHERE Username = ? OR Phone = ?",
    //             [username, phone]
    //         );

    //         if (existingUser.length > 0) {
    //             const user = existingUser[0];

    //             if (user.Username === username) {
    //                 return res.status(400).json({
    //                     message: "Username already exists",
    //                     success: false
    //                 });
    //             }

    //             if (user.Phone === phone) {
    //                 return res.status(400).json({
    //                     message: "Phone number already registered",
    //                     success: false
    //                 });
    //             }
    //         }

    //         // ✅ hash password
    //         const hashedPassword = await bcrypt.hash(password, 10);

    //         // ─────────────────────────────────────────────
    //         // 🔥 Generate Playing ID
    //         // ─────────────────────────────────────────────

    //         const [lastUser] = await pool.query(
    //             "SELECT id, playing_id FROM users ORDER BY id DESC LIMIT 1"
    //         );

    //         let newPlayingId;

    //         if (lastUser.length === 0) {
    //             // First user
    //             newPlayingId = "abc1000001";
    //         } else {
    //             const lastPlayingId = lastUser[0].playing_id;

    //             if (!lastPlayingId) {
    //                 newPlayingId = "abc1000001";
    //             } else {
    //                 // Extract number part
    //                 const numberPart = parseInt(lastPlayingId.replace("abc", ""));
    //                 const nextNumber = numberPart + 1;

    //                 newPlayingId = "abc" + nextNumber;
    //             }
    //         }

    //         // ✅ insert user
    //         await pool.query(
    //             `INSERT INTO users (Username, Phone, Password, playing_id) 
    //          VALUES (?, ?, ?, ?)`,
    //             [username, phone, hashedPassword, newPlayingId]
    //         );

    //         return res.status(201).json({
    //             message: "User registered successfully",
    //             playing_id: newPlayingId,
    //             success: true
    //         });

    //     } catch (error) {
    //         return res.status(500).json({
    //             message: error.message,
    //             success: false
    //         });
    //     }
    // },


    // Updated register method
    register: async (req, res) => {
        const connection = await pool.getConnection();
        try {
            const { username, phone, password, reffer_id } = req.body; // reffer_id = referrer's playing_id

            // validation
            if (!username || !phone || !password) {
                return res.status(400).json({ message: "All fields required", success: false });
            }
            if (password.length < 8) {
                return res.status(400).json({ message: "Password must be at least 8 characters", success: false });
            }

            // Check existing user
            const [existing] = await connection.execute(
                `SELECT * FROM users WHERE Username = ? OR Phone = ?`,
                [username, phone]
            );
            if (existing.length > 0) {
                const user = existing[0];
                if (user.Username === username) return res.status(400).json({ message: "Username already exists", success: false });
                if (user.Phone === phone) return res.status(400).json({ message: "Phone number already registered", success: false });
            }

            // Validate referrer if provided
            let referrerId = null;
            if (reffer_id) {
                const [refRows] = await connection.execute(
                    `SELECT id FROM users WHERE playing_id = ?`,
                    [reffer_id]
                );
                if (refRows.length === 0) {
                    return res.status(400).json({ message: "Invalid referrer ID", success: false });
                }
                referrerId = refRows[0].id;
                // Prevent self referral
                // (we don't know new user id yet, but we can check later; we'll add a check after insert)
            }

            // Generate new playing_id
            const [lastUser] = await connection.execute(`SELECT playing_id FROM users ORDER BY id DESC LIMIT 1`);
            let newPlayingId;
            if (lastUser.length === 0 || !lastUser[0].playing_id) {
                newPlayingId = "abc1000001";
            } else {
                const num = parseInt(lastUser[0].playing_id.replace("abc", ""));
                newPlayingId = "abc" + (num + 1);
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            await connection.beginTransaction();

            // Insert new user
            const [result] = await connection.execute(
                `INSERT INTO users (Username, Phone, Password, playing_id, userReffer_id, bonus_balance, real_balance)
             VALUES (?, ?, ?, ?, ?, 0, 0)`,
                [username, phone, hashedPassword, newPlayingId, reffer_id || null]
            );
            const newUserId = result.insertId;

            // Prevent self referral (if referrer_id equals new user id)
            if (referrerId === newUserId) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({ message: "Cannot refer yourself", success: false });
            }

            // Award 100 bonus to new user
            const bonusTxId = uuidv4();
            await connection.execute(
                `INSERT INTO transactions (id, user_id, coins, status, type, is_bonus, admin_remark, created_at)
             VALUES (?, ?, 100, 'success', 'bonus', 1, 'signup_bonus', NOW())`,
                [bonusTxId, newUserId]
            );
            await connection.execute(
                `UPDATE users SET bonus_balance = bonus_balance + 100 WHERE id = ?`,
                [newUserId]
            );

            // Award milestone bonus to referrer (if any)
            if (referrerId) {
                await awardReferralBonus(referrerId, connection);
            }

            await connection.commit();
            connection.release();

            return res.status(201).json({
                message: "User registered successfully",
                playing_id: newPlayingId,
                bonusAwarded: 100,
                success: true
            });

        } catch (error) {
            await connection.rollback();
            connection.release();
            console.error(error);
            return res.status(500).json({ message: error.message, success: false });
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
    },



    resetPassword: async (req, res) => {
        try {
            const { phone, newPassword } = req.body;

            // ── Validation ─────────────────────────────
            if (!phone || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Phone and new password required"
                });
            }

            if (newPassword.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: "Password must be at least 8 characters"
                });
            }

            // ── Check user ─────────────────────────────
            const [users] = await pool.query(
                "SELECT * FROM users WHERE Phone = ?",
                [phone]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            // ── Hash new password ──────────────────────
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // ── Update password ────────────────────────
            await pool.query(
                "UPDATE users SET Password = ? WHERE Phone = ?",
                [hashedPassword, phone]
            );

            return res.json({
                success: true,
                message: "Password reset successful"
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    },


    uploadProfileImage: async (req, res) => {
        try {
            const { id } = req.user;

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "No file uploaded"
                });
            }

            // 📁 Local file path
            const filePath = req.file.path;

            // 🔥 Upload to ImageKit
            const uploaded = await imagekit.upload({
                file: fs.readFileSync(filePath),
                fileName: req.file.filename,
                folder: "/profile"
            });

            // ✅ Save URL in DB
            await pool.query(
                "UPDATE users SET user_image = ? WHERE id = ?",
                [uploaded.url, id]
            );

            return res.json({
                success: true,
                message: "Image uploaded successfully",
                image: uploaded.url
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    }
};