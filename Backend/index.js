import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log("");
    console.log("╔══════════════════════════════════════╗");
    console.log(`║   GamePlay Payment API — Port ${PORT}   ║`);
    console.log("╚══════════════════════════════════════╝");
    console.log("");
    console.log("  Endpoints:");
    console.log("  POST  /api/txn/create");
    console.log("  GET   /api/txn/:id");
    console.log("  GET   /api/txn/status/:id");
    console.log("  POST  /api/payment/verify");
    console.log("  POST  /api/payment/simulate  [DEMO]");
    console.log("  GET   /api/admin/banks");
    console.log("  POST  /api/admin/banks");
    console.log("");
});