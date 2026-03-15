import express from "express"
import http from "http"
import { Server } from "socket.io"
import cors from "cors"

const app = express()
app.use(cors())

const server = http.createServer(app)

const io = new Server(server, {
    cors: { origin: "*" }
})

let multiplier = 1
let crashPoint = generateCrash()

function generateCrash() {
    const r = Math.random()

    let crash = Math.floor((1 / (1 - r)) * 100) / 100

    if (crash > 10) {
        crash = 10
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

server.listen(5000, () => {
    console.log("Server running on 5000")
})