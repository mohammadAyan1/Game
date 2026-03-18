import pool from "../config/db.js";

// ✅ POST /api/payment/verify
export const verifyPayment = async (req, res) => {
  try {
    const { txnId, utrNumber } = req.body;

    if (!txnId) {
      return res.status(400).json({ error: "txnId required" });
    }

    const [txns] = await pool.query(
      "SELECT * FROM transactions WHERE id=?",
      [txnId]
    );

    if (txns.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const txn = txns[0];

    // already processed
    if (txn.status !== "pending") {
      return res.json({ success: true, status: txn.status });
    }

    // ✅ update transaction
    await pool.query(
      `UPDATE transactions 
       SET status='success', utr_number=?, paid_at=NOW() 
       WHERE id=?`,
      [utrNumber || "MANUAL", txnId]
    );

    // ✅ update bank collection
    await pool.query(
      "UPDATE bank_accounts SET collected = collected + ? WHERE id=?",
      [txn.amount, txn.bank_id]
    );

    console.log(`✦ Payment verified: ${txnId} | UTR: ${utrNumber}`);

    res.json({
      success: true,
      status: "success",
      coins: txn.coins,
      returnUrl: txn.return_url
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


// ✅ POST /api/payment/simulate (DEMO ONLY)
export const simulatePayment = async (req, res) => {
  try {
    const { txnId } = req.body;

    if (!txnId) {
      return res.status(400).json({ error: "txnId required" });
    }

    const [txns] = await pool.query(
      "SELECT * FROM transactions WHERE id=?",
      [txnId]
    );

    if (txns.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const txn = txns[0];

    if (txn.status !== "pending") {
      return res.json({ success: true, status: txn.status });
    }

    await pool.query(
      `UPDATE transactions 
       SET status='success', utr_number=?, paid_at=NOW() 
       WHERE id=?`,
      ["SIM" + Date.now(), txnId]
    );

    await pool.query(
      "UPDATE bank_accounts SET collected = collected + ? WHERE id=?",
      [txn.amount, txn.bank_id]
    );

    console.log(`✦ [DEMO] Payment simulated: ${txnId}`);

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};