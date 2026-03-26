// // services/telegramBotHandler.js
// // ─────────────────────────────────────────────────────────────────────────────
// // Ye service Telegram webhook ke "message" events handle karta hai.
// // Flow:
// //   1. Admin "REJECT" button dabata hai → bot admin se remark maangta hai
// //   2. Admin remark text bhejta hai → bot transaction reject karta hai
// // ─────────────────────────────────────────────────────────────────────────────

// import pool from "../config/db.js";
// import { editAdminMessage } from "./telegramService.js";

// const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
// const BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

// // In-memory store: { chatId: { awaitingRemark: true, txnId, msgId } }
// // (works fine for single-instance server; use Redis for multi-instance)
// const pendingRemarks = new Map();

// export async function handleTelegramUpdate(body) {
//   // ── Callback query (inline button press) ─────────────────────────────────
//   if (body.callback_query) {
//     const cbq = body.callback_query;
//     const [action, txnId] = (cbq.data || "").split(":");

//     if (action === "reject" && txnId) {
//       // Ask admin for a remark
//       pendingRemarks.set(String(cbq.from.id), { txnId, msgId: cbq.message?.message_id });

//       await sendMsg(
//         cbq.message.chat.id,
//         `❌ <b>Reject karne ke liye remark likhein:</b>\n\n<code>TxnID: ${txnId}</code>\n\nRemark bhejein (ya "skip" likhein bina remark ke reject karne ke liye):`,
//       );

//       await answerCallback(cbq.id, "Remark bhejein...");
//       return;
//     }

//     if (action === "accept" && txnId) {
//       await acceptTxn(txnId, cbq.message?.message_id);
//       await answerCallback(cbq.id, "✅ Payment ACCEPTED!");
//       return;
//     }

//     await answerCallback(cbq.id, "Unknown action");
//     return;
//   }

//   // ── Regular message (admin remark text) ──────────────────────────────────
//   if (body.message) {
//     const msg = body.message;
//     const fromId = String(msg.from?.id);
//     const chatId = msg.chat?.id;
//     const text = msg.text?.trim() || "";

//     // Only handle if we're waiting for a remark from this admin
//     if (!pendingRemarks.has(fromId)) return;

//     const { txnId, msgId } = pendingRemarks.get(fromId);
//     pendingRemarks.delete(fromId);

//     const remark = text.toLowerCase() === "skip" ? "Rejected by admin" : text;

//     await rejectTxn(txnId, msgId, remark, chatId);
//     return;
//   }
// }

// // ─────────────────────────────────────────────────────────────────────────────

// async function acceptTxn(txnId, originalMsgId) {
//   const [rows] = await pool.query(
//     "SELECT * FROM transactions WHERE id=?",
//     [txnId]
//   );
//   if (!rows.length) return;
//   const txn = rows[0];

//   await pool.query("UPDATE transactions SET status='success' WHERE id=?", [txnId]);

//   await editAdminMessage({
//     msgId: originalMsgId || txn.telegram_msg_id,
//     txnId,
//     amount: txn.amount,
//     coins: txn.coins,
//     utrNumber: txn.utr_number,
//     userName: txn.user_id,
//     action: "accept",
//   });
// }

// async function rejectTxn(txnId, originalMsgId, remark, chatId) {
//   const [rows] = await pool.query(
//     "SELECT * FROM transactions WHERE id=?",
//     [txnId]
//   );
//   if (!rows.length) return;
//   const txn = rows[0];

//   await pool.query(
//     "UPDATE transactions SET status='failed', admin_remark=? WHERE id=?",
//     [remark, txnId]
//   );

//   await editAdminMessage({
//     msgId: originalMsgId || txn.telegram_msg_id,
//     txnId,
//     amount: txn.amount,
//     coins: txn.coins,
//     utrNumber: txn.utr_number,
//     userName: txn.user_id,
//     action: "reject",
//     remark,
//   });

//   await sendMsg(chatId, `✅ Transaction <code>${txnId}</code> reject kar diya.\nRemark: <i>${remark}</i>`);
// }

// async function sendMsg(chatId, text) {
//   await fetch(`${BASE}/sendMessage`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
//   });
// }

// async function answerCallback(id, text) {
//   await fetch(`${BASE}/answerCallbackQuery`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ callback_query_id: id, text, show_alert: true }),
//   });
// }


/////////////////////////////////////////////////////!SECTION

// ╔══════════════════════════════════════════════════════╗
// ║  FILE: backend/src/services/telegramBotHandler.js   ║
// ║  Admin ke Telegram button press handle karna        ║
// ║  Flow:                                              ║
// ║   1. Admin ACCEPT dabata hai → DB success           ║
// ║   2. Admin REJECT dabata hai → bot remark maangta   ║
// ║   3. Admin remark likhta hai → DB failed + remark   ║
// ╚══════════════════════════════════════════════════════╝

import pool from "../config/db.js";
import { editAdminMessage } from "./telegramService.js";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

// ── In-memory store: admin ke pending remark ka wait ─────────────────────────
// key   = admin ka Telegram user_id (String)
// value = { txnId, msgId, chatId }
const pendingRemarks = new Map();

// ────────────────────────────────────────────────────────────────────────────
//  MAIN EXPORT: paymentController se call hota hai
// ────────────────────────────────────────────────────────────────────────────
export async function handleTelegramUpdate(body) {
  console.log("📨 Telegram update:", JSON.stringify(body).slice(0, 200));

  try {
    if (body.callback_query) {
      await handleCallbackQuery(body.callback_query);
      return;
    }
    if (body.message) {
      await handleMessage(body.message);
      return;
    }
    console.log("ℹ️ Unknown update type, ignoring");
  } catch (err) {
    console.error("❌ handleTelegramUpdate error:", err.message);
  }
}

// ────────────────────────────────────────────────────────────────────────────
//  Admin ne ACCEPT ya REJECT button dabaya
// ────────────────────────────────────────────────────────────────────────────
async function handleCallbackQuery(cbq) {
  const data = cbq.data || "";
  const adminUserId = String(cbq.from.id);  // string ke roop mein store karo
  const chatId = cbq.message?.chat?.id;

  console.log(`🔘 Callback: "${data}" from admin ${adminUserId}`);

  // ── Parse callback data: "accept:txnId" ya "reject:txnId" ────────────────
  const firstColon = data.indexOf(":");
  if (firstColon === -1) {
    await answerCallback(cbq.id, "⚠️ Invalid data");
    return;
  }

  const action = data.slice(0, firstColon);
  const txnId = data.slice(firstColon + 1);

  if (!txnId) {
    await answerCallback(cbq.id, "⚠️ TxnId missing");
    return;
  }

  // ── DB se transaction fetch karo ─────────────────────────────────────────
  const [rows] = await pool.query(
    "SELECT * FROM transactions WHERE id=?",
    [txnId]
  );

  if (!rows.length) {
    await answerCallback(cbq.id, "❌ Transaction not found in DB!");
    return;
  }

  const txn = rows[0];

  // DB ka telegram_msg_id use karo (reliable)
  const msgId = txn.telegram_msg_id || cbq.message?.message_id;

  // ── ACCEPT ────────────────────────────────────────────────────────────────
  if (action === "accept") {
    await pool.query(
      "UPDATE transactions SET status='success' WHERE id=?",
      [txnId]
    );

    await editAdminMessage({
      msgId,
      txnId,
      amount: txn.amount,
      coins: txn.coins,
      utrNumber: txn.utr_number,
      userName: txn.user_id,
      action: "accept",
    });

    await answerCallback(cbq.id, "✅ Payment ACCEPTED! User ko coins mil jayenge.");
    console.log(`✅ TxnId=${txnId} ACCEPTED`);
    return;
  }

  // ── REJECT: Admin se remark maango ────────────────────────────────────────
  if (action === "reject") {
    // Pending state save karo
    pendingRemarks.set(adminUserId, { txnId, msgId, chatId });

    await sendMsg(
      chatId,
      `❌ <b>Reject kar rahe ho?</b>\n\n` +
      `TxnID: <code>${txnId}</code>\n` +
      `Amount: ₹${Number(txn.amount).toLocaleString("en-IN")}\n\n` +
      `Ab <b>reject ka reason</b> type karo aur bhejo.\n` +
      `(Ya sirf <code>skip</code> likho bina reason ke.)`
    );

    await answerCallback(cbq.id, "✏️ Reason type karo chat mein...");
    console.log(`⏳ TxnId=${txnId} — waiting for reject remark from admin ${adminUserId}`);
    return;
  }

  await answerCallback(cbq.id, "⚠️ Unknown action: " + action);
}

// ────────────────────────────────────────────────────────────────────────────
//  Admin ne remark text bheja (reject ke baad)
// ────────────────────────────────────────────────────────────────────────────
async function handleMessage(msg) {
  const adminUserId = String(msg.from?.id);
  const chatId = msg.chat?.id;
  const text = (msg.text || "").trim();

  console.log(`💬 Message from admin ${adminUserId}: "${text}"`);

  // Sirf tab process karo jab remark ka wait ho
  if (!pendingRemarks.has(adminUserId)) {
    console.log(`ℹ️ No pending remark for admin ${adminUserId}, ignoring`);
    return;
  }

  const { txnId, msgId } = pendingRemarks.get(adminUserId);
  pendingRemarks.delete(adminUserId); // turant clear karo

  const remark =
    text.toLowerCase() === "skip" ? "Rejected by admin" : text;

  // DB se fresh data lo
  const [rows] = await pool.query(
    "SELECT * FROM transactions WHERE id=?",
    [txnId]
  );

  if (!rows.length) {
    await sendMsg(chatId, `⚠️ Transaction <code>${txnId}</code> DB mein nahi mila.`);
    return;
  }

  const txn = rows[0];

  // DB update
  await pool.query(
    "UPDATE transactions SET status='failed', admin_remark=? WHERE id=?",
    [remark, txnId]
  );

  // Telegram message update
  await editAdminMessage({
    msgId: msgId || txn.telegram_msg_id,
    txnId,
    amount: txn.amount,
    coins: txn.coins,
    utrNumber: txn.utr_number,
    userName: txn.user_id,
    action: "reject",
    remark,
  });

  // Admin ko confirm message
  await sendMsg(
    chatId,
    `✅ Transaction <code>${txnId}</code> REJECT kar diya.\n` +
    `📝 Reason: <i>${remark}</i>`
  );

  console.log(`❌ TxnId=${txnId} REJECTED — remark: "${remark}"`);
}

// ────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ────────────────────────────────────────────────────────────────────────────

// Telegram button ka loading spinner band karo
async function answerCallback(callbackQueryId, text) {
  try {
    const res = await fetch(`${BASE}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
        show_alert: true,
      }),
    });
    const data = await res.json();
    if (!data.ok) console.error("⚠️ answerCallback error:", JSON.stringify(data));
  } catch (err) {
    console.error("❌ answerCallback error:", err.message);
  }
}

// Simple text message bhejna
async function sendMsg(chatId, text) {
  try {
    const res = await fetch(`${BASE}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });
    const data = await res.json();
    if (!data.ok) console.error("⚠️ sendMsg error:", JSON.stringify(data));
  } catch (err) {
    console.error("❌ sendMsg error:", err.message);
  }
}