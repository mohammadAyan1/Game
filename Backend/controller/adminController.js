import pool from "../config/db.js";

// ✅ GET /api/admin/banks
export const getAllBanks = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM bank_accounts");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ POST /api/admin/banks
export const addBank = async (req, res) => {
  const {
    account_name,
    upi_id,
    bank_name,
    account_no,
    ifsc_code,
    branch,
    daily_limit
  } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO bank_accounts 
      (account_name, upi_id, bank_name, account_no, ifsc_code, branch, daily_limit)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        account_name,
        upi_id,
        bank_name,
        account_no,
        ifsc_code,
        branch,
        daily_limit || 100000
      ]
    );

    res.json({ success: true, id: result.insertId });

  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "UPI ID already exists" });
    }

    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ PATCH /api/admin/banks/:id/toggle
export const toggleBank = async (req, res) => {
  try {
    await pool.query(
      "UPDATE bank_accounts SET is_active = NOT is_active WHERE id=?",
      [req.params.id]
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ DELETE /api/admin/banks/:id
export const deleteBank = async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM bank_accounts WHERE id=?",
      [req.params.id]
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ GET /api/admin/transactions
export const getRecentTransactions = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.*, b.account_name, b.upi_id
      FROM transactions t
      JOIN bank_accounts b ON t.bank_id = b.id
      ORDER BY t.created_at DESC
      LIMIT 100
    `);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ POST /api/admin/reset-daily
export const resetDailyCollected = async (req, res) => {
  try {
    await pool.query("UPDATE bank_accounts SET collected = 0");

    res.json({
      success: true,
      message: "Daily limits reset"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};