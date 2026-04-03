

// /////////////////////////////////////////////////////!SECTION

// // ╔══════════════════════════════════════════════════════╗
// // ║  FILE: backend/src/services/telegramBotHandler.js   ║
// // ║  Admin ke Telegram button press handle karna        ║
// // ║  Flow:                                              ║
// // ║   1. Admin ACCEPT dabata hai → DB success           ║
// // ║   2. Admin REJECT dabata hai → bot remark maangta   ║
// // ║   3. Admin remark likhta hai → DB failed + remark   ║
// // ╚══════════════════════════════════════════════════════╝

// import pool from "../config/db.js";
// import { editAdminMessage } from "./telegramService.js";

// const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// const BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

// // ── In-memory store: admin ke pending remark ka wait ─────────────────────────
// // key   = admin ka Telegram user_id (String)
// // value = { txnId, msgId, chatId }
// const pendingRemarks = new Map();

// // ────────────────────────────────────────────────────────────────────────────
// //  MAIN EXPORT: paymentController se call hota hai
// // ────────────────────────────────────────────────────────────────────────────
// export async function handleTelegramUpdate(body) {
//   console.log("📨 Telegram update:", JSON.stringify(body).slice(0, 200));

//   try {
//     if (body.callback_query) {
//       await handleCallbackQuery(body.callback_query);
//       return;
//     }
//     if (body.message) {
//       await handleMessage(body.message);
//       return;
//     }
//     console.log("ℹ️ Unknown update type, ignoring");
//   } catch (err) {
//     console.error("❌ handleTelegramUpdate error:", err.message);
//   }
// }

// // ────────────────────────────────────────────────────────────────────────────
// //  Admin ne ACCEPT ya REJECT button dabaya
// // ────────────────────────────────────────────────────────────────────────────
// async function handleCallbackQuery(cbq) {
//   const data = cbq.data || "";
//   const adminUserId = String(cbq.from.id);  // string ke roop mein store karo
//   const chatId = cbq.message?.chat?.id;

//   console.log(`🔘 Callback: "${data}" from admin ${adminUserId}`);

//   // ── Parse callback data: "accept:txnId" ya "reject:txnId" ────────────────
//   const firstColon = data.indexOf(":");
//   if (firstColon === -1) {
//     await answerCallback(cbq.id, "⚠️ Invalid data");
//     return;
//   }

//   const action = data.slice(0, firstColon);
//   const txnId = data.slice(firstColon + 1);

//   if (!txnId) {
//     await answerCallback(cbq.id, "⚠️ TxnId missing");
//     return;
//   }

//   // ── DB se transaction fetch karo ─────────────────────────────────────────
//   const [rows] = await pool.query(
//     "SELECT * FROM transactions WHERE id=?",
//     [txnId]
//   );

//   if (!rows.length) {
//     await answerCallback(cbq.id, "❌ Transaction not found in DB!");
//     return;
//   }

//   const txn = rows[0];

//   // DB ka telegram_msg_id use karo (reliable)
//   const msgId = txn.telegram_msg_id || cbq.message?.message_id;

//   // ── ACCEPT ────────────────────────────────────────────────────────────────
//   if (action === "accept") {
//     await pool.query(
//       "UPDATE transactions SET status='success' WHERE id=?",
//       [txnId]
//     );

//     await editAdminMessage({
//       msgId,
//       txnId,
//       amount: txn.amount,
//       coins: txn.coins,
//       utrNumber: txn.utr_number,
//       userName: txn.user_id,
//       action: "accept",
//     });

//     await answerCallback(cbq.id, "✅ Payment ACCEPTED! User ko coins mil jayenge.");
//     console.log(`✅ TxnId=${txnId} ACCEPTED`);
//     return;
//   }

//   // ── REJECT: Admin se remark maango ────────────────────────────────────────
//   if (action === "reject") {
//     // Pending state save karo
//     pendingRemarks.set(adminUserId, { txnId, msgId, chatId });

//     await sendMsg(
//       chatId,
//       `❌ <b>Reject kar rahe ho?</b>\n\n` +
//       `TxnID: <code>${txnId}</code>\n` +
//       `Amount: ₹${Number(txn.amount).toLocaleString("en-IN")}\n\n` +
//       `Ab <b>reject ka reason</b> type karo aur bhejo.\n` +
//       `(Ya sirf <code>skip</code> likho bina reason ke.)`
//     );

//     await answerCallback(cbq.id, "✏️ Reason type karo chat mein...");
//     console.log(`⏳ TxnId=${txnId} — waiting for reject remark from admin ${adminUserId}`);
//     return;
//   }

//   await answerCallback(cbq.id, "⚠️ Unknown action: " + action);
// }

// // ────────────────────────────────────────────────────────────────────────────
// //  Admin ne remark text bheja (reject ke baad)
// // ────────────────────────────────────────────────────────────────────────────
// async function handleMessage(msg) {
//   const adminUserId = String(msg.from?.id);
//   const chatId = msg.chat?.id;
//   const text = (msg.text || "").trim();

//   console.log(`💬 Message from admin ${adminUserId}: "${text}"`);

//   // Sirf tab process karo jab remark ka wait ho
//   if (!pendingRemarks.has(adminUserId)) {
//     console.log(`ℹ️ No pending remark for admin ${adminUserId}, ignoring`);
//     return;
//   }

//   const { txnId, msgId } = pendingRemarks.get(adminUserId);
//   pendingRemarks.delete(adminUserId); // turant clear karo

//   const remark =
//     text.toLowerCase() === "skip" ? "Rejected by admin" : text;

//   // DB se fresh data lo
//   const [rows] = await pool.query(
//     "SELECT * FROM transactions WHERE id=?",
//     [txnId]
//   );

//   if (!rows.length) {
//     await sendMsg(chatId, `⚠️ Transaction <code>${txnId}</code> DB mein nahi mila.`);
//     return;
//   }

//   const txn = rows[0];

//   // DB update
//   await pool.query(
//     "UPDATE transactions SET status='failed', admin_remark=? WHERE id=?",
//     [remark, txnId]
//   );

//   // Telegram message update
//   await editAdminMessage({
//     msgId: msgId || txn.telegram_msg_id,
//     txnId,
//     amount: txn.amount,
//     coins: txn.coins,
//     utrNumber: txn.utr_number,
//     userName: txn.user_id,
//     action: "reject",
//     remark,
//   });

//   // Admin ko confirm message
//   await sendMsg(
//     chatId,
//     `✅ Transaction <code>${txnId}</code> REJECT kar diya.\n` +
//     `📝 Reason: <i>${remark}</i>`
//   );

//   console.log(`❌ TxnId=${txnId} REJECTED — remark: "${remark}"`);
// }

// // ────────────────────────────────────────────────────────────────────────────
// //  HELPERS
// // ────────────────────────────────────────────────────────────────────────────

// // Telegram button ka loading spinner band karo
// async function answerCallback(callbackQueryId, text) {
//   try {
//     const res = await fetch(`${BASE}/answerCallbackQuery`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         callback_query_id: callbackQueryId,
//         text,
//         show_alert: true,
//       }),
//     });
//     const data = await res.json();
//     if (!data.ok) console.error("⚠️ answerCallback error:", JSON.stringify(data));
//   } catch (err) {
//     console.error("❌ answerCallback error:", err.message);
//   }
// }

// // Simple text message bhejna
// async function sendMsg(chatId, text) {
//   try {
//     const res = await fetch(`${BASE}/sendMessage`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         chat_id: chatId,
//         text,
//         parse_mode: "HTML",
//       }),
//     });
//     const data = await res.json();
//     if (!data.ok) console.error("⚠️ sendMsg error:", JSON.stringify(data));
//   } catch (err) {
//     console.error("❌ sendMsg error:", err.message);
//   }
// }





// ╔══════════════════════════════════════════════════════╗
// ║  FILE: backend/src/services/telegramBotHandler.js   ║
// ║  Admin ke Telegram button press handle karna        ║
// ║  Flow:                                              ║
// ║   1. Admin ACCEPT dabata hai → confirmTopup()       ║
// ║      → DB success + real_balance update             ║
// ║   2. Admin REJECT dabata hai → bot remark maangta   ║
// ║   3. Admin remark likhta hai → rejectTopup()        ║
// ║      → DB failed + remark                           ║
// ╚══════════════════════════════════════════════════════╝

import pool from "../config/db.js";
import { editAdminMessage } from "./telegramService.js";
import { confirmTopup, rejectTopup } from "../controller/transactionController.js";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

// In-memory store for pending reject remarks
const pendingRemarks = new Map();

// ──────────────────────────────────────────────────────────────
//  MAIN EXPORT
// ──────────────────────────────────────────────────────────────
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

// ──────────────────────────────────────────────────────────────
//  Admin ne ACCEPT ya REJECT button dabaya
// ──────────────────────────────────────────────────────────────
async function handleCallbackQuery(cbq) {
  const data = cbq.data || "";
  const adminUserId = String(cbq.from.id);
  const chatId = cbq.message?.chat?.id;
  const callbackId = cbq.id;

  console.log(`🔘 Callback: "${data}" from admin ${adminUserId}`);

  // ✅ CRITICAL FIX: Answer callback IMMEDIATELY to avoid timeout
  await answerCallback(callbackId, "⏳ Processing...", false);

  const firstColon = data.indexOf(":");
  if (firstColon === -1) {
    await sendMsg(chatId, "⚠️ Invalid callback data");
    return;
  }

  const action = data.slice(0, firstColon);
  const txnId = data.slice(firstColon + 1);

  if (!txnId) {
    await sendMsg(chatId, "⚠️ TxnId missing");
    return;
  }

  // Fetch transaction from DB
  const [rows] = await pool.query("SELECT * FROM transactions WHERE id=?", [txnId]);
  if (!rows.length) {
    await sendMsg(chatId, "❌ Transaction not found in DB!");
    return;
  }

  const txn = rows[0];
  const msgId = txn.telegram_msg_id || cbq.message?.message_id;

  // ───────────── ACCEPT ─────────────
  if (action === "accept") {
    const result = await confirmTopup(txnId);

    if (!result.success) {
      await sendMsg(chatId, "❌ Failed to accept: " + result.message);
      return;
    }

    // Update Telegram message
    await editAdminMessage({
      msgId,
      txnId,
      amount: txn.amount,
      coins: txn.coins,
      utrNumber: txn.utr_number,
      userName: txn.user_id,
      action: "accept",
    });

    console.log(`✅ TxnId=${txnId} ACCEPTED — ${result.coinsAdded} coins added to real_balance`);
    return;
  }

  // ───────────── REJECT ─────────────
  if (action === "reject") {
    pendingRemarks.set(adminUserId, { txnId, msgId, chatId });

    await sendMsg(
      chatId,
      `❌ <b>Reject kar rahe ho?</b>\n\n` +
      `TxnID: <code>${txnId}</code>\n` +
      `Amount: ₹${Number(txn.amount).toLocaleString("en-IN")}\n\n` +
      `Ab <b>reject ka reason</b> type karo aur bhejo.\n` +
      `(Ya sirf <code>skip</code> likho bina reason ke.)`
    );

    console.log(`⏳ TxnId=${txnId} — waiting for reject remark`);
    return;
  }

  await sendMsg(chatId, "⚠️ Unknown action: " + action);
}

// ──────────────────────────────────────────────────────────────
//  Admin ne remark bheja (reject ke baad)
// ──────────────────────────────────────────────────────────────
async function handleMessage(msg) {
  const adminUserId = String(msg.from?.id);
  const chatId = msg.chat?.id;
  const text = (msg.text || "").trim();

  if (!pendingRemarks.has(adminUserId)) {
    console.log(`ℹ️ No pending remark for admin ${adminUserId}, ignoring`);
    return;
  }

  const { txnId, msgId } = pendingRemarks.get(adminUserId);
  pendingRemarks.delete(adminUserId);

  const remark = text.toLowerCase() === "skip" ? "Rejected by admin" : text;

  // Call rejectTopup to update status and remark
  const result = await rejectTopup(txnId, remark);
  if (!result.success) {
    await sendMsg(chatId, `⚠️ Failed to reject transaction: ${result.message}`);
    return;
  }

  // Fetch updated transaction for message edit
  const [rows] = await pool.query("SELECT * FROM transactions WHERE id=?", [txnId]);
  if (!rows.length) return;
  const txn = rows[0];

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

  await sendMsg(
    chatId,
    `✅ Transaction <code>${txnId}</code> REJECT kar diya.\n📝 Reason: <i>${remark}</i>`
  );

  console.log(`❌ TxnId=${txnId} REJECTED — remark: "${remark}"`);
}

// ──────────────────────────────────────────────────────────────
//  HELPERS
// ──────────────────────────────────────────────────────────────
async function answerCallback(callbackQueryId, text, showAlert = false) {
  try {
    const res = await fetch(`${BASE}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
        show_alert: showAlert,
      }),
    });
    const data = await res.json();
    if (!data.ok) console.error("⚠️ answerCallback error:", JSON.stringify(data));
  } catch (err) {
    console.error("❌ answerCallback error:", err.message);
  }
}

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

    console.log("sky info group");

    if (!data.ok) console.error("⚠️ sendMsg error:", JSON.stringify(data));
  } catch (err) {
    console.error("❌ sendMsg error:", err.message);
  }
}