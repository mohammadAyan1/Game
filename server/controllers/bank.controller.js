

import pool from "../config/db.js";
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(__filename);
console.log(__dirname);



export const bankController = {
    getAll: async (req, res) => {
        try {

            const { id, role } = req.user;

            if (!id) {
                return res.status(401).json({
                    success: false,
                    message: "User ID required"
                });
            }

            if (role !== "Admin") {
                return res.status(403).json({
                    success: false,
                    message: "Only admin can create package"
                });
            }

            const [rows] = await pool.execute(
                "SELECT id, upi_id, qr_image, created_at, updated_at FROM bank_accounts WHERE status='active' ORDER BY id DESC"
            );
            const formatted = rows.map(row => ({
                ...row,
                qr_url: row.qr_image ? `${req.protocol}://${req.get('host')}/${row.qr_image}` : null
            }));
            return res.status(200).json({ success: true, data: formatted });
        } catch (error) {
            console.error('GET bank error:', error);
            return res.status(500).json({ success: false, message: "Server error" });
        }
    },

    create: async (req, res) => {
        try {

            const { id, role } = req.user;

            if (!id) {
                return res.status(401).json({
                    success: false,
                    message: "User ID required"
                });
            }

            if (role !== "Admin") {
                return res.status(403).json({
                    success: false,
                    message: "Only admin can create package"
                });
            }

            const { upi_id } = req.body;
            if (!upi_id) {
                return res.status(400).json({ success: false, message: "UPI ID is required" });
            }

            let qr_image = null;
            if (req.file) {
                qr_image = `uploads/qr/${req.file.filename}`;
            }

            const [result] = await pool.execute(
                "INSERT INTO bank_accounts (upi_id, qr_image) VALUES (?, ?)",
                [upi_id, qr_image]
            );

            return res.status(201).json({
                success: true,
                message: "Bank detail added",
                data: { id: result.insertId, upi_id, qr_image }
            });
        } catch (error) {
            console.error('CREATE bank error:', error);
            return res.status(500).json({ success: false, message: "Server error" });
        }
    },

    update: async (req, res) => {
        try {

            const { role } = req.user;

            // if (!id) {
            //     return res.status(401).json({
            //         success: false,
            //         message: "User ID required"
            //     });
            // }

            if (role !== "Admin") {
                return res.status(403).json({
                    success: false,
                    message: "Only admin can create package"
                });
            }

            const { id } = req.params;
            const { upi_id } = req.body;

            if (!upi_id) {
                return res.status(400).json({ success: false, message: "UPI ID is required" });
            }

            const [current] = await pool.execute(
                "SELECT qr_image FROM bank_accounts WHERE id = ?",
                [id]
            );
            if (current.length === 0) {
                return res.status(404).json({ success: false, message: "Record not found" });
            }

            let qr_image = current[0].qr_image;
            if (req.file) {
                // Delete old file if exists (ignore ENOENT)
                if (qr_image) {
                    // const oldPath = path.join(__dirname, '../../', qr_image);

                    const oldPath = path.join(process.cwd(), 'uploads', 'qr', qr_image);
                    try {
                        await fs.unlink(oldPath);
                        console.log(`Deleted old file: ${oldPath}`);
                    } catch (err) {
                        if (err.code !== 'ENOENT') {
                            console.error(`Error deleting old file ${oldPath}:`, err);
                        } else {
                            console.log(`Old file not found (already deleted): ${oldPath}`);
                        }
                    }
                }
                qr_image = `uploads/qr/${req.file.filename}`;
            }

            await pool.execute(
                "UPDATE bank_accounts SET upi_id = ?, qr_image = ? WHERE id = ?",
                [upi_id, qr_image, id]
            );

            return res.status(200).json({
                success: true,
                message: "Bank detail updated",
                data: { id, upi_id, qr_image }
            });
        } catch (error) {
            console.error('UPDATE error:', error);
            return res.status(500).json({ success: false, message: "Server error" });
        }
    },

    delete: async (req, res) => {
        try {

            const { role } = req.user;


            if (role !== "Admin") {
                return res.status(403).json({
                    success: false,
                    message: "Only admin can create package"
                });
            }

            const { id } = req.params;

            const [rows] = await pool.execute(
                "SELECT qr_image FROM bank_accounts WHERE id = ?",
                [id]
            );
            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: "Record not found" });
            }

            // const qr_image = rows[0].qr_image;
            // if (qr_image) {
            //     const filePath = path.join(__dirname, '../../', qr_image);
            //     try {
            //         await fs.unlink(filePath);
            //         console.log(`Deleted file: ${filePath}`);
            //     } catch (err) {
            //         if (err.code !== 'ENOENT') {
            //             console.error(`Error deleting file ${filePath}:`, err);
            //         } else {
            //             console.log(`File not found (already deleted): ${filePath}`);
            //         }
            //     }
            // }

            // await pool.execute("DELETE FROM bank_accounts WHERE id = ?", [id]);

            await pool.execute("UPDATE bank_accounts SET status='inactive' WHERE id=?", [id])

            return res.status(200).json({ success: true, message: "Bank detail Inactive" });
        } catch (error) {
            console.error('DELETE error:', error);
            return res.status(500).json({ success: false, message: "Server error" });
        }
    }
};