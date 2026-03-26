
import pool from "../config/db.js";
import { sendPaymentProof } from "../services/telegramService.js";
import { handleTelegramUpdate } from "../services/telegramBotHandler.js";

// ── 1. UTR se manual verify (purana system - rakh sakte ho) ──────────────────
export const verifyPayment = async (req, res) => {
  try {
    const { txnId, utrNumber } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM transactions WHERE id=? AND utr_number=? AND status='pending'",
      [txnId, utrNumber]
    );

    if (!rows.length) {
      return res.json({ success: false, status: "not_matched" });
    }

    await pool.query(
      "UPDATE transactions SET status='success' WHERE id=?",
      [txnId]
    );

    return res.json({ success: true, status: "success", coins: rows[0].coins });
  } catch (err) {
    console.error("verifyPayment error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ── 2. Simulate payment (DEMO — production mein hata do) ─────────────────────
export const simulatePayment = async (req, res) => {
  try {
    const { txnId } = req.body;

    await pool.query(
      "UPDATE transactions SET status='success' WHERE id=?",
      [txnId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("simulatePayment error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ── 3. User proof submit karta hai ────────────────────────────────────────────
// POST /api/payment/submit-proof
// Body (multipart/form-data):
//   txnId       — required
//   utrNumber   — optional (UTR/reference number)
//   userName    — optional (user ka naam ya ID)
//   screenshot  — optional (image file)
export const submitProof = async (req, res) => {
  try {
    const { txnId, utrNumber, userName } = req.body;
    const screenshotFile = req.file; // multer ne parse kiya

    // Validation
    if (!txnId) {
      return res.status(400).json({ error: "txnId is required" });
    }

    if (!screenshotFile && !utrNumber?.trim()) {
      return res.status(400).json({
        error: "Screenshot ya UTR number mein se ek dena zaroori hai",
      });
    }

    // DB se transaction + bank details fetch karo
    const [rows] = await pool.query(
      `SELECT t.*, 
              b.upi_id, 
              b.account_name, 
              b.account_no, 
              b.ifsc_code, 
              b.bank_name
       FROM transactions t
       JOIN bank_accounts b ON t.bank_id = b.id
       WHERE t.id = ?`,
      [txnId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const txn = rows[0];

    // Sirf pending ya submitted transactions allow karo (re-submission)
    if (!["pending", "submitted"].includes(txn.status)) {
      return res.status(400).json({
        error: `Transaction already ${txn.status}`,
        status: txn.status,
      });
    }

    // DB mein status update karo
    await pool.query(
      `UPDATE transactions 
       SET status = 'submitted', 
           utr_number = ?, 
           submitted_at = NOW()
       WHERE id = ?`,
      [utrNumber?.trim() || null, txnId]
    );

    // Telegram pe proof bhejna
    const msgId = await sendPaymentProof({
      txnId,
      amount: txn.amount,
      coins: txn.coins,
      utrNumber: utrNumber?.trim(),
      screenshotBuffer: screenshotFile?.buffer || null,
      screenshotMimeType: screenshotFile?.mimetype || null,
      userName: userName || String(txn.user_id),
    });

    // Telegram message ID save karo (edit ke liye baad mein chahiye)
    if (msgId) {
      await pool.query(
        "UPDATE transactions SET telegram_msg_id = ? WHERE id = ?",
        [msgId, txnId]
      );
    }

    return res.json({
      success: true,
      message: "Proof submit ho gaya. Admin verify karega.",
    });
  } catch (err) {
    console.error("submitProof error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ── 4. Telegram Webhook — Admin Accept/Reject ──────────────────────────────
// POST /api/payment/telegram-webhook
// Ye endpoint Telegram ka webhook hai
// Jab admin koi button dabata hai ya message bhejta hai,
// Telegram is URL pe POST request bhejta hai
export const adminCallback = async (req, res) => {
  try {
    await handleTelegramUpdate(req.body);
    return res.sendStatus(200); // Telegram ko 200 chahiye, warna retry karta hai
  } catch (err) {
    console.error("adminCallback error:", err);
    res.sendStatus(500);
  }
};

// ── 5. Frontend polling — status check ────────────────────────────────────────
// GET /api/payment/result/:txnId
// Frontend submitted screen pe har 4 second mein ye call karta hai
// Jab admin accept/reject kare, ye status return karta hai
export const getPaymentResult = async (req, res) => {
  try {
    const { txnId } = req.params;

    const [rows] = await pool.query(
      "SELECT status, admin_remark, coins FROM transactions WHERE id = ?",
      [txnId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const { status, admin_remark, coins } = rows[0];

    return res.json({
      status,
      remark: admin_remark || null,
      coins,
    });
  } catch (err) {
    console.error("getPaymentResult error:", err);
    res.status(500).json({ error: err.message });
  }
};


