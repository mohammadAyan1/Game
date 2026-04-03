import express from "express"
import http from "http"
import { Server } from "socket.io"
import cors from "cors"
import cookieParser from "cookie-parser";
import authRoutes from "./routers/auth.router.js";
import jwt from "jsonwebtoken"
import pool from "./config/db.js";
import dotenv from "dotenv"
import transactionRouter from "./routers/tracsaction.routes.js";
import adminPackage from "./routers/admin.routes.js"

import bankRoutes from "./routers/bank.routes.js";

import withdrawalRoutes from "./routers/withdrawal.routes.js";

import userRoutes from "./routers/user.routes.js"


import statsRoutes from "./routers/stats.routes.js";


// import { registerTeenPatti } from './game/teenPatti.js'

import { registerTeenPatti } from "./game/teenPatti.js";
// import { registerRummy } from './game/rummy.js'
import { registerRummy } from "./game/rummy.js";

// import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';




const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()

dotenv.config()

app.set("trust proxy", 1);

app.use(cors({
    origin: [
        process.env.FRONTEND_URL_PAYMENT,
        process.env.FRONTEND_URL_MAIN,
        "http://localhost:5173",
        "http://localhost:8081",
        process.env.BACKEND_URL_PAYMENT,
    ],
    credentials: true, // 🔥 MUST
    methods: ['GET', 'POST', 'PATCH', 'DELETE', "PUT"],
}))
app.use(express.json())
app.use(cookieParser());

const server = http.createServer(app)

const io = new Server(server, {
    cors: { origin: "*" }
})

let multiplier = 0
let crashPoint = generateCrash()


function generateCrash() {
    const r = Math.random()
    let crash = Math.floor((1 / (1 - r)) * 100) / 100
    // Add a chance to crash early (e.g., 20% of the time)
    if (Math.random() < 0.2) {
        crash = Math.random() * 0.9 + 0.1   // between 0.1 and 1.0
    }
    if (crash > 5) crash = 5
    return crash
}

function startGame() {

    multiplier = 0 //1
    crashPoint = generateCrash()


    const interval = setInterval(() => {

        multiplier += 0.02

        io.emit("multiplier", {
            multiplier: multiplier.toFixed(2),
            crashPoint
        })

        if (multiplier >= crashPoint) {

            io.emit("crash", crashPoint)

            clearInterval(interval)

            setTimeout(() => {
                startGame()
            }, 5000)

        }

    }, 100)

}

io.on("connection", (socket) => {
    console.log("player connected")
    console.log("player connected:", socket.id)

    // Existing aviator stuff stays as-is
    // (no changes needed to multiplier/crash events)

    // ── Teen Patti ──
    registerTeenPatti(io, socket)

    // ── Rummy ──
    registerRummy(io, socket)
})

startGame()


app.get("/api/checkuser", async (req, res) => {
    try {
        const token = req.cookies?.token;




        console.log(process.env.JWT_SECRET, "FGHJ");


        if (!token) {
            return res.status(401).json({
                message: "Unauthorized. Please login first.",
                success: false
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const [users] = await pool.query(
            "SELECT id, Username, Phone, Role FROM users WHERE id = ?",
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "User not found",
                success: false
            });
        }


        return res.status(200).json({
            success: true,
            id: users[0].id,
            username: users[0].Username,
            phone: users[0].Phone,
            role: users[0].Role

        });

    } catch (error) {
        console.log(error);

        return res.status(401).json({
            message: "Invalid or expired token",
            success: false
        });
    }
})



app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/auth", authRoutes)
app.use("/api/wallet", transactionRouter)
app.use("/api/admin", adminPackage)
app.use("/api/withdrawal", withdrawalRoutes)
app.use("/api/admin/bank", bankRoutes);
app.use("/api/user", userRoutes)

app.use("/api/stats", statsRoutes)

server.listen(5000, () => {
    console.log("Server running on 5000")
})