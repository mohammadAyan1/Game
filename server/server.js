import express from "express"
import http from "http"
import { Server } from "socket.io"
import cors from "cors"
import cookieParser from "cookie-parser";
import userRoutes from "./routers/user.router.js";
import jwt from "jsonwebtoken"
import pool from "./config/db.js";
import dotenv from "dotenv"
import transactionRouter from "./routers/tracsaction.routes.js";
const app = express()

dotenv.config()

app.use(cors({
    origin: [
        process.env.FRONTEND_URL_PAYMENT,
        process.env.FRONTEND_URL_MAIN,
        "http://localhost:5173",
        "http://localhost:8081",
        process.env.BACKEND_URL_PAYMENT,
    ],
    credentials: true, // 🔥 MUST
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}))
app.use(express.json())
app.use(cookieParser());

const server = http.createServer(app)

const io = new Server(server, {
    cors: { origin: "*" }
})

let multiplier = 1
let crashPoint = generateCrash()

function generateCrash() {
    const r = Math.random()

    let crash = Math.floor((1 / (1 - r)) * 100) / 100

    if (crash > 5) {
        crash = 5
    }

    return crash
}

function startGame() {

    multiplier = 1
    crashPoint = generateCrash()

    console.log('====================================');
    console.log(crashPoint);
    console.log('====================================');

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
})

startGame()


app.get("/api/checkuser", async (req, res) => {
    try {
        const token = req.cookies?.token;

        console.log(token, 'ASDFGHJKL');


        console.log(process.env.JWT_SECRET, "FGHJ");


        if (!token) {
            return res.status(401).json({
                message: "Unauthorized. Please login first.",
                success: false
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const [users] = await pool.query(
            "SELECT id, Username, Email, Phone, Role FROM Users WHERE id = ?",
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
            email: users[0].Email,
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

app.use("/api/user", userRoutes)
app.use("/api/wallet", transactionRouter)


server.listen(5000, () => {
    console.log("Server running on 5000")
})