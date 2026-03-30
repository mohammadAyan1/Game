import pool from "../config/db.js";

const adminController = {

    // ✅ CREATE PACKAGE
    createPackage: async (req, res) => {
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

            const { rupees, coins, bonus, pct, label, tag, popular } = req.body?.form;

            console.log(rupees);
            console.log(req?.body);



            const [result] = await pool.query(
                `INSERT INTO coin_packages 
                (rupees, coins, bonus, pct, label, tag, popular) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [rupees, coins, bonus, pct, label, tag || null, popular || false]
            );

            return res.status(201).json({
                success: true,
                message: "Package created successfully",
                data: { id: result.insertId }
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    },

    // ✅ GET ALL PACKAGES
    getAllPackages: async (req, res) => {
        try {
            const [rows] = await pool.query("SELECT * FROM coin_packages ORDER BY id DESC");

            return res.status(200).json({
                success: true,
                data: rows
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    },

    // ✅ GET SINGLE PACKAGE
    getPackageById: async (req, res) => {
        try {
            const { id } = req.params;

            const [rows] = await pool.query(
                "SELECT * FROM coin_packages WHERE id = ?",
                [id]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Package not found"
                });
            }

            return res.status(200).json({
                success: true,
                data: rows[0]
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    },

    // ✅ UPDATE PACKAGE
    updatePackage: async (req, res) => {
        try {
            const { id: userId, role } = req.user;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User ID required"
                });
            }

            if (role !== "Admin") {
                return res.status(403).json({
                    success: false,
                    message: "Only admin can update package"
                });
            }

            const { id } = req.params;
            const { rupees, coins, bonus, pct, label, tag, popular } = req.body;

            const [result] = await pool.query(
                `UPDATE coin_packages 
                SET rupees=?, coins=?, bonus=?, pct=?, label=?, tag=?, popular=? 
                WHERE id=?`,
                [rupees, coins, bonus, pct, label, tag || null, popular, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Package not found"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Package updated successfully"
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    },

    // ✅ DELETE PACKAGE
    deletePackage: async (req, res) => {
        try {
            const { id: userId, role } = req.user;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User ID required"
                });
            }

            if (role !== "Admin") {
                return res.status(403).json({
                    success: false,
                    message: "Only admin can delete package"
                });
            }

            const { id } = req.params;

            const [result] = await pool.query(
                "DELETE FROM coin_packages WHERE id = ?",
                [id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Package not found"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Package deleted successfully"
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

export default adminController;