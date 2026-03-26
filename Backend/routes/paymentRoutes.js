
import express from "express";
import multer from "multer";
import {
  verifyPayment,
  simulatePayment,
  submitProof,
  adminCallback,
  getPaymentResult,
} from "../controller/paymentController.js";

const router = express.Router();

// ── Multer setup (screenshot upload ke liye) ──────────────────────────────────
// memory storage use karo — file buffer directly Telegram pe bhejte hain
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // max 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true); // allow
    } else {
      cb(new Error("Sirf image files allowed hain (JPG, PNG, etc.)"));
    }
  },
});

// ── Routes ────────────────────────────────────────────────────────────────────

// Purana UTR verify system (optional - rakh sakte ho)
router.post("/verify", verifyPayment);

// Dev mode simulate (PRODUCTION MEIN HATA DO)
router.post("/simulate", simulatePayment);

// User payment proof submit karta hai (screenshot + UTR)
// upload.single("screenshot") — "screenshot" naam ka field accept karega
router.post("/submit-proof", upload.single("screenshot"), submitProof);

// Telegram bot ka webhook — admin ke button press yahan aate hain
// ⚠️ IMPORTANT: Is URL ko Telegram pe register karna padega (setupWebhook.js se)
router.post("/telegram-webhook", adminCallback);

// Frontend polling — admin ne kuch kiya ya nahi?
router.get("/result/:txnId", getPaymentResult);

export default router;