// ╔══════════════════════════════════════════════════════╗
// ║  FILE: backend/src/scripts/setupWebhook.js          ║
// ║  Ye script SIRF EK BAAR chalao                      ║
// ║  Command: node src/scripts/setupWebhook.js          ║
// ║  Ye Telegram ko batata hai ki callbacks kahan bhejo ║
// ╚══════════════════════════════════════════════════════╝

import dotenv from "dotenv";
dotenv.config();

const TOKEN      = process.env.TELEGRAM_BOT_TOKEN;
const BACKEND_URL = process.env.BACKEND_URL_PAYMENT;

if (!TOKEN) {
  console.error("\n❌ ERROR: TELEGRAM_BOT_TOKEN .env mein nahi hai!\n");
  process.exit(1);
}

if (!BACKEND_URL) {
  console.error("\n❌ ERROR: BACKEND_URL_PAYMENT .env mein nahi hai!");
  console.error("   Example: BACKEND_URL_PAYMENT=https://yourdomain.com\n");
  process.exit(1);
}

const WEBHOOK_URL = `${BACKEND_URL}/api/payment/telegram-webhook`;
const BASE        = `https://api.telegram.org/bot${TOKEN}`;

async function main() {
  console.log("\n══════════════════════════════════════════");
  console.log("   Telegram Webhook Setup");
  console.log("══════════════════════════════════════════");
  console.log(`Token    : ${TOKEN.slice(0, 12)}...`);
  console.log(`Webhook  : ${WEBHOOK_URL}\n`);

  // STEP 1: Webhook set karo
  console.log("📡 Setting webhook...");
  const setRes  = await fetch(`${BASE}/setWebhook`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
      url:                  WEBHOOK_URL,
      allowed_updates:      ["message", "callback_query"],
      drop_pending_updates: true, // purane queued updates ignore karo
    }),
  });
  const setData = await setRes.json();

  if (setData.ok) {
    console.log("✅ Webhook set ho gaya!\n");
  } else {
    console.error("❌ setWebhook failed:", JSON.stringify(setData, null, 2));
    process.exit(1);
  }

  // STEP 2: Verify karo
  console.log("🔍 Verifying webhook info...");
  const infoRes  = await fetch(`${BASE}/getWebhookInfo`);
  const infoData = await infoRes.json();
  const info     = infoData.result;

  console.log(`URL              : ${info.url}`);
  console.log(`Pending updates  : ${info.pending_update_count}`);
  console.log(`Last error       : ${info.last_error_message || "None (good!)"}`);

  if (info.url === WEBHOOK_URL) {
    console.log("\n🎉 SUCCESS! Telegram webhook active hai.\n");
    console.log("Ab jab admin ACCEPT/REJECT karega, Telegram");
    console.log(`is URL pe message bhejega:\n${WEBHOOK_URL}\n`);
  } else {
    console.warn("\n⚠️  URL mismatch! Kuch galat hua.");
  }

  // STEP 3: Bot info
  const meRes  = await fetch(`${BASE}/getMe`);
  const meData = await meRes.json();
  console.log(`🤖 Bot: @${meData.result?.username} — ${meData.result?.first_name}\n`);
}

main().catch((err) => {
  console.error("❌ Fatal error:", err.message);
  process.exit(1);
});