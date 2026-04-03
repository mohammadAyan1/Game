
// import pool from "../config/db.js";
// import { v4 as uuidv4 } from "uuid";

// const expiresIn15 = () => {
//   const d = new Date();
//   const istOffset = 5.5 * 60 * 60 * 1000;
//   const istTime = new Date(d.getTime() + istOffset);
//   istTime.setMinutes(istTime.getMinutes() + 15);
//   return istTime.toISOString().slice(0, 19).replace("T", " ");
// };



// const pickBank = async () => {
//   // Randomly select one bank account
//   const [banks] = await pool.query("SELECT * FROM bank_accounts WHERE status='active' ORDER BY RAND() LIMIT 1");
//   return banks[0] || null;
// };

// export const createTransaction = async (req, res) => {
//   try {
//     const { amount, coins, returnUrl, userId } = req.body;

//     if (!amount || amount < 300)
//       return res.status(400).json({ error: "Minimum ₹300" });

//     const bank = await pickBank();
//     if (!bank)
//       return res.status(503).json({ error: "No bank available" });

//     const txnId = uuidv4();
//     const expiresAt = expiresIn15();

//     await pool.query(
//       `INSERT INTO transactions 
//        (id, user_id, amount, coins, bank_id, return_url, expires_at, type)
//        VALUES (?, ?, ?, ?, ?, ?, ?, 'topup')`,
//       [txnId, userId, amount, coins, bank.id, returnUrl, expiresAt]
//     );

//     res.json({ success: true, txnId, expiresAt });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// export const getTransaction = async (req, res) => {
//   const [rows] = await pool.query(
//     `SELECT t.*, b.* 
//      FROM transactions t
//      JOIN bank_accounts b ON t.bank_id = b.id
//      WHERE t.id = ?`,
//     [req.params.id]
//   );

//   if (!rows.length)
//     return res.status(404).json({ error: "Not found" });

//   res.json(rows[0]);
// };

// export const getTransactionStatus = async (req, res) => {
//   const userId = req.query.userId;

//   if (!userId) {
//     return res.status(403).json({ message: "User is required", success: false });
//   }

//   const [rows] = await pool.query(
//     "SELECT status FROM transactions WHERE id=?",
//     [req.params.id]
//   );

//   await pool.query(
//     "UPDATE transactions SET user_id=? WHERE id=?",
//     [userId, req.params.id]
//   );

//   res.json(rows[0]);
// };





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
  const [banks] = await pool.query("SELECT * FROM bank_accounts WHERE status='active' ORDER BY RAND() LIMIT 1");
  return banks[0] || null;
};

// ──────────────────────────────────────────────────────────
// 1. Create Topup Transaction
// ──────────────────────────────────────────────────────────
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

    // 🔥 Important: is_bonus = 0, status = 'pending'
    await pool.query(
      `INSERT INTO transactions 
       (id, user_id, amount, coins, bank_id, return_url, expires_at, type, is_bonus, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'topup', 0, 'pending')`,
      [txnId, userId, amount, coins, bank.id, returnUrl, expiresAt]
    );

    res.json({ success: true, txnId, expiresAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ──────────────────────────────────────────────────────────
// 2. Get Transaction Details
// ──────────────────────────────────────────────────────────
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

// ──────────────────────────────────────────────────────────
// 3. Get Transaction Status (optional user_id update)
// ──────────────────────────────────────────────────────────
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


// ──────────────────────────────────────────────────────────
// 4. Confirm Topup (Called by Telegram bot on ACCEPT)
//    Adds coins to user's real_balance and marks success
// ──────────────────────────────────────────────────────────
export const confirmTopup = async (txnId) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // ✅ Allow both 'pending' and 'submitted' status
    const [txnRows] = await connection.execute(
      `SELECT * FROM transactions 
       WHERE id = ? 
       AND type = 'topup' 
       AND status IN ('pending', 'submitted') 
       FOR UPDATE`,
      [txnId]
    );

    if (txnRows.length === 0) {
      await connection.rollback();
      connection.release();
      console.error(`❌ Topup ${txnId} not found or already processed`);
      return { success: false, message: "Transaction not found or already processed" };
    }

    const txn = txnRows[0];
    const userId = txn.user_id;
    const coinsToAdd = txn.coins;

    // Update user's real_balance
    await connection.execute(
      `UPDATE users SET real_balance = real_balance + ? WHERE id = ?`,
      [coinsToAdd, userId]
    );

    // Mark transaction as success
    await connection.execute(
      `UPDATE transactions SET status = 'success', paid_at = NOW() WHERE id = ?`,
      [txnId]
    );

    await connection.commit();
    connection.release();

    console.log(`✅ Topup ${txnId} confirmed: ${coinsToAdd} coins added to user ${userId} real_balance`);
    return { success: true, coinsAdded: coinsToAdd };
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error(`❌ confirmTopup error for ${txnId}:`, error);
    return { success: false, message: error.message };
  }
};

// ──────────────────────────────────────────────────────────
// 5. Reject Topup (Called by Telegram bot on REJECT)
//    Marks transaction as failed with optional remark
// ──────────────────────────────────────────────────────────
export const rejectTopup = async (txnId, remark = null) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // ✅ Allow both 'pending' and 'submitted' status
    const [txnRows] = await connection.execute(
      `SELECT * FROM transactions 
       WHERE id = ? 
       AND type = 'topup' 
       AND status IN ('pending', 'submitted') 
       FOR UPDATE`,
      [txnId]
    );

    if (txnRows.length === 0) {
      await connection.rollback();
      connection.release();
      console.error(`❌ Topup ${txnId} not found for rejection`);
      return { success: false, message: "Transaction not found" };
    }

    await connection.execute(
      `UPDATE transactions SET status = 'failed', admin_remark = ? WHERE id = ?`,
      [remark || "Rejected by admin", txnId]
    );

    await connection.commit();
    connection.release();

    console.log(`❌ Topup ${txnId} rejected${remark ? ` with remark: ${remark}` : ""}`);
    return { success: true };
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error(`❌ rejectTopup error for ${txnId}:`, error);
    return { success: false, message: error.message };
  }
};