
import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

const expiresIn15 = () => {
  const d = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(d.getTime() + istOffset);
  istTime.setMinutes(istTime.getMinutes() + 15);
  return istTime.toISOString().slice(0, 19).replace("T", " ");
};



const pickBank = async () => {
  // Randomly select one bank account
  const [banks] = await pool.query("SELECT * FROM bank_accounts WHERE status='active' ORDER BY RAND() LIMIT 1");
  return banks[0] || null;
};

export const createTransaction = async (req, res) => {
  try {
    const { amount, coins, returnUrl, userId } = req.body;

    if (!amount || amount < 300)
      return res.status(400).json({ error: "Minimum ₹300" });

    const bank = await pickBank();
    if (!bank)
      return res.status(503).json({ error: "No bank available" });

    const txnId = uuidv4();
    const expiresAt = expiresIn15();

    await pool.query(
      `INSERT INTO transactions 
       (id, user_id, amount, coins, bank_id, return_url, expires_at, type)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'topup')`,
      [txnId, userId, amount, coins, bank.id, returnUrl, expiresAt]
    );

    res.json({ success: true, txnId, expiresAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTransaction = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT t.*, b.* 
     FROM transactions t
     JOIN bank_accounts b ON t.bank_id = b.id
     WHERE t.id = ?`,
    [req.params.id]
  );

  if (!rows.length)
    return res.status(404).json({ error: "Not found" });

  res.json(rows[0]);
};

export const getTransactionStatus = async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(403).json({ message: "User is required", success: false });
  }

  const [rows] = await pool.query(
    "SELECT status FROM transactions WHERE id=?",
    [req.params.id]
  );

  await pool.query(
    "UPDATE transactions SET user_id=? WHERE id=?",
    [userId, req.params.id]
  );

  res.json(rows[0]);
};