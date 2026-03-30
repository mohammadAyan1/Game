

// ╔══════════════════════════════════════════════════════╗
// ║  FILE: backend/src/services/telegramService.js      ║
// ║  Telegram pe message/photo bhejna                   ║
// ║  2 functions export karta hai:                      ║
// ║    sendPaymentProof()  — user ka proof Telegram pe  ║
// ║    editAdminMessage()  — admin action ke baad       ║
// ║                          message update karna       ║
// ╚══════════════════════════════════════════════════════╝

import FormData from "form-data";
import fetch from "node-fetch";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT = process.env.TELEGRAM_ADMIN_CHAT_ID;
const BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

// ── Helper: Indian number format ─────────────────────────────────────────────
const fmt = (n) => Number(n).toLocaleString("en-IN");

// ── Helper: Build inline keyboard for Accept / Reject ────────────────────────
function buildKeyboard(txnId) {
  return {
    inline_keyboard: [
      [
        // { text: "✅ ACCEPT", url: `http://localhost:3001/health` },
        { text: "✅ ACCEPT", callback_data: `accept:${txnId}` },
        { text: "❌ REJECT", callback_data: `reject:${txnId}` },
      ],
    ],
  };
}

// ── Helper: Message caption text ─────────────────────────────────────────────
function buildCaption({ txnId, amount, coins, utrNumber, userName }) {
  return (
    `🎮 <b>GamePlay — New Payment Proof</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 User    : <code>${userName || "N/A"}</code>\n` +
    `💰 Amount  : <b>₹${fmt(amount)}</b>\n` +
    `🪙 Coins   : <b>${fmt(coins)}</b>\n` +
    `🔖 UTR     : <code>${utrNumber || "Not provided"}</code>\n` +
    `🆔 TxnID   : <code>${txnId}</code>\n` +
    `━━━━━━━━━━━━━━━━━━━━`
  );
}

// ────────────────────────────────────────────────────────────────────────────
//  FUNCTION 1: User ka proof Telegram pe bhejna
//  Arguments:
//    txnId            — transaction ID
//    amount           — amount in rupees
//    coins            — coins to be credited
//    utrNumber        — UTR number (optional)
//    screenshotBuffer — Buffer (file data) — null if not provided
//    screenshotMimeType — "image/jpeg" etc
//    userName         — user ki ID ya name
//  Returns: Telegram message ID (number) — baad mein edit ke liye save karo
// ────────────────────────────────────────────────────────────────────────────
export async function sendPaymentProof({
  txnId,
  amount,
  coins,
  utrNumber,
  screenshotBuffer,
  screenshotMimeType,
  userName,
}) {
  try {
    const caption = buildCaption({ txnId, amount, coins, utrNumber, userName });
    const keyboard = buildKeyboard(txnId);

    let msgId = null;

    if (screenshotBuffer) {
      // ── Photo ke saath bhejna ──────────────────────────────────────────
      const form = new FormData();
      form.append("chat_id", ADMIN_CHAT);
      form.append("caption", caption);
      form.append("parse_mode", "HTML");
      form.append("reply_markup", JSON.stringify(keyboard));
      form.append("photo", screenshotBuffer, {
        filename: "payment_proof.jpg",
        contentType: screenshotMimeType || "image/jpeg",
      });

      const res = await fetch(`${BASE}/sendPhoto`, { method: "POST", body: form });
      const data = await res.json();

      console.log(data, "This is the image data upload");


      if (data.ok) {
        msgId = data.result.message_id;
        console.log(`📸 Photo sent to Telegram, msgId=${msgId}`);
      } else {
        console.error("❌ Telegram sendPhoto error:", JSON.stringify(data));
      }
    } else {
      // ── Sirf text bhejna (screenshot nahi diya) ────────────────────────
      const res = await fetch(`${BASE}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: ADMIN_CHAT,
          text: caption,
          parse_mode: "HTML",
          reply_markup: keyboard,
        }),
      });
      const data = await res.json();

      if (data.ok) {
        msgId = data.result.message_id;
        console.log(`📝 Text sent to Telegram, msgId=${msgId}`);
      } else {
        console.error("❌ Telegram sendMessage error:", JSON.stringify(data));
      }
    }

    return msgId; // null agar koi error aaya
  } catch (err) {
    console.error("❌ sendPaymentProof error:", err.message);
    return null;
  }
}

// ────────────────────────────────────────────────────────────────────────────
//  FUNCTION 2: Admin ke Accept/Reject ke baad Telegram message update karna
//  Arguments:
//    msgId    — Telegram message ID (DB mein save tha)
//    txnId    — transaction ID
//    amount   — amount
//    coins    — coins
//    utrNumber— UTR
//    userName — user ID
//    action   — "accept" ya "reject"
//    remark   — reject ka reason (optional)
// ────────────────────────────────────────────────────────────────────────────
export async function editAdminMessage({
  msgId,
  txnId,
  amount,
  coins,
  utrNumber,
  userName,
  action,
  remark,
}) {
  if (!msgId) {
    console.warn("⚠️ editAdminMessage: msgId missing, skipping edit");
    return;
  }

  try {
    const statusLine =
      action === "accept"
        ? "✅ <b>ACCEPTED</b> by admin"
        : `❌ <b>REJECTED</b> by admin${remark ? `\n📝 Remark: <i>${remark}</i>` : ""}`;

    const newText =
      buildCaption({ txnId, amount, coins, utrNumber, userName }) +
      `\n\n━━━━━━━━━━━━━━━━━━━━\n${statusLine}`;

    const emptyKeyboard = { inline_keyboard: [] }; // buttons hata do

    // Pehle editMessageCaption try karo (agar photo tha)
    let res = await fetch(`${BASE}/editMessageCaption`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT,
        message_id: msgId,
        caption: newText,
        parse_mode: "HTML",
        reply_markup: emptyKeyboard,
      }),
    });
    let data = await res.json();

    // Agar photo nahi tha toh editMessageText use karo
    if (!data.ok) {
      res = await fetch(`${BASE}/editMessageText`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: ADMIN_CHAT,
          message_id: msgId,
          text: newText,
          parse_mode: "HTML",
          reply_markup: emptyKeyboard,
        }),
      });
      data = await res.json();
    }

    if (data.ok) {
      console.log(`✅ Telegram message ${msgId} edited (${action})`);
    } else {
      console.error("❌ editAdminMessage error:", JSON.stringify(data));
    }
  } catch (err) {
    console.error("❌ editAdminMessage error:", err.message);
  }
}