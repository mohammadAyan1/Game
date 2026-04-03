// server/game/teenPatti.js
// ── Teen Patti multiplayer game engine (Socket.io) ──

import { createDeck, shuffle, compareTeenPatti, evalTeenPatti } from './cards.js'
import pool from '../config/db.js'
import { v4 as uuid } from 'uuid'

// roomId → game state
const rooms = new Map()

// ── Helper: broadcast room state (hiding other players' cards) ──
function broadcastState(io, roomId) {
    const room = rooms.get(roomId)
    if (!room) return
    room.players.forEach(player => {
        const stateForPlayer = {
            ...room,
            players: room.players.map(p => ({
                id: p.id,
                name: p.name,
                coins: p.coins,
                bet: p.bet,
                status: p.status,   // 'active'|'folded'|'out'
                isBlind: p.isBlind,
                cardCount: p.hand.length,
                // Only send your own cards OR if showdown
                hand: (p.id === player.id || room.phase === 'showdown') ? p.hand : []
            }))
        }
        io.to(player.socketId).emit('tp:state', stateForPlayer)
    })
}

function getRoom(roomId) { return rooms.get(roomId) }

function activePlayers(room) { return room.players.filter(p => p.status === 'active') }

function nextTurn(room) {
    const active = activePlayers(room)
    if (active.length <= 1) return
    const idx = active.findIndex(p => p.id === room.currentTurnId)
    room.currentTurnId = active[(idx + 1) % active.length].id
}

// ── Determine winner of showdown ──
function determineWinner(room) {
    const active = activePlayers(room)
    if (active.length === 1) return active[0]
    let winner = active[0]
    for (let i = 1; i < active.length; i++) {
        const cmp = compareTeenPatti(active[i].hand, winner.hand)
        if (cmp === 1) winner = active[i]
    }
    return winner
}

// ── End game, award pot ──
async function endGame(io, roomId, winner) {
    const room = rooms.get(roomId)
    if (!room) return
    room.phase = 'showdown'
    room.winnerId = winner.id
    room.winnerName = winner.name
    room.winnerHand = evalTeenPatti(winner.hand)

    // Award pot to winner (deduct from pot, add to user's wallet)
    try {
        await pool.query(
            `INSERT INTO transactions (id, user_id, coins, status, type, game)
       VALUES (?, ?, ?, 'success', 'profit', 'teen_patti')`,
            [uuid(), winner.id, room.pot]
        )
        await pool.query(
            `UPDATE transactions SET coins = coins + ? WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
            [room.pot, winner.id]
        )
        // Save game history
        await pool.query(
            `INSERT INTO teen_patti_games (room_id, winner_id, pot_amount, hand_type, players_json)
       VALUES (?, ?, ?, ?, ?)`,
            [roomId, winner.id, room.pot, room.winnerHand.name, JSON.stringify(room.players)]
        )
    } catch (e) { console.error('TP DB error:', e) }

    broadcastState(io, roomId)
    io.to(roomId).emit('tp:gameover', {
        winnerId: winner.id,
        winnerName: winner.name,
        pot: room.pot,
        handName: room.winnerHand.name,
        players: room.players.map(p => ({ ...p, hand: p.hand }))
    })

    // Reset after 8 seconds
    setTimeout(() => {
        if (rooms.has(roomId)) resetRoom(io, roomId)
    }, 8000)
}

function resetRoom(io, roomId) {
    const room = rooms.get(roomId)
    if (!room) return
    room.phase = 'waiting'
    room.pot = 0
    room.currentTurnId = null
    room.winnerId = null
    room.players.forEach(p => {
        p.hand = []
        p.bet = 0
        p.status = 'active'
        p.isBlind = true
    })
    broadcastState(io, roomId)
    io.to(roomId).emit('tp:reset')
}

// ── Start a round ──
function startRound(io, roomId) {
    const room = rooms.get(roomId)
    if (!room || room.players.length < 2) return

    let deck = shuffle(createDeck())
    room.players.forEach(p => {
        p.hand = deck.splice(0, 3)
        p.bet = room.bootAmount
        p.status = 'active'
        p.isBlind = true
    })
    room.pot = room.bootAmount * room.players.length
    room.phase = 'playing'
    room.currentTurnId = room.players[0].id
    broadcastState(io, roomId)
    io.to(roomId).emit('tp:roundstart', { pot: room.pot, bootAmount: room.bootAmount })
}

// ── Register all Teen Patti socket events ──
export function registerTeenPatti(io, socket) {

    // Create a new room
    socket.on('tp:create', async ({ name, bootAmount = 10, userId, userName }) => {
        const roomId = uuid()
        rooms.set(roomId, {
            id: roomId,
            name: name || `Room-${roomId.slice(0, 6)}`,
            bootAmount: Math.max(10, bootAmount),
            phase: 'waiting',
            pot: 0,
            currentTurnId: null,
            winnerId: null,
            players: []
        })
        socket.join(roomId)
        const room = rooms.get(roomId)
        room.players.push({
            id: userId, name: userName, socketId: socket.id,
            hand: [], bet: 0, status: 'active', isBlind: true, coins: 0
        })
        socket.emit('tp:created', { roomId, room })
        io.emit('tp:roomlist', getRoomList())
    })

    // Join existing room
    socket.on('tp:join', ({ roomId, userId, userName }) => {
        const room = rooms.get(roomId)
        if (!room) return socket.emit('tp:error', 'Room not found')
        if (room.phase !== 'waiting') return socket.emit('tp:error', 'Game already started')
        if (room.players.length >= 6) return socket.emit('tp:error', 'Room is full')
        if (room.players.find(p => p.id === userId)) return socket.emit('tp:error', 'Already in room')

        socket.join(roomId)
        room.players.push({
            id: userId, name: userName, socketId: socket.id,
            hand: [], bet: 0, status: 'active', isBlind: true, coins: 0
        })
        broadcastState(io, roomId)
        io.to(roomId).emit('tp:playerjoined', { name: userName, count: room.players.length })
        io.emit('tp:roomlist', getRoomList())
    })

    // Start game (host only)
    socket.on('tp:start', ({ roomId, userId }) => {
        const room = rooms.get(roomId)
        if (!room) return
        if (room.players[0]?.id !== userId) return socket.emit('tp:error', 'Only host can start')
        if (room.players.length < 2) return socket.emit('tp:error', 'Need at least 2 players')
        startRound(io, roomId)
    })

    // See cards (blind → seen)
    socket.on('tp:see', ({ roomId, userId }) => {
        const room = rooms.get(roomId)
        if (!room || room.phase !== 'playing') return
        const player = room.players.find(p => p.id === userId)
        if (!player || player.status !== 'active') return
        player.isBlind = false
        socket.emit('tp:state', {
            ...room,
            players: room.players.map(p => ({
                ...p,
                hand: p.id === userId ? p.hand : []
            }))
        })
        io.to(roomId).emit('tp:seen', { name: player.name })
    })

    // Chaal (call/raise)
    socket.on('tp:chaal', ({ roomId, userId, amount }) => {
        const room = rooms.get(roomId)
        if (!room || room.phase !== 'playing') return
        if (room.currentTurnId !== userId) return socket.emit('tp:error', 'Not your turn')

        const player = room.players.find(p => p.id === userId)
        if (!player || player.status !== 'active') return

        const callAmt = player.isBlind ? Math.max(room.bootAmount, amount) : Math.max(room.bootAmount * 2, amount)
        player.bet += callAmt
        room.pot += callAmt

        io.to(roomId).emit('tp:chaal', { name: player.name, amount: callAmt, pot: room.pot })
        nextTurn(room)
        broadcastState(io, roomId)
    })

    // Fold
    socket.on('tp:fold', ({ roomId, userId }) => {
        const room = rooms.get(roomId)
        if (!room || room.phase !== 'playing') return
        if (room.currentTurnId !== userId) return socket.emit('tp:error', 'Not your turn')

        const player = room.players.find(p => p.id === userId)
        if (!player) return
        player.status = 'folded'
        io.to(roomId).emit('tp:fold', { name: player.name })

        const active = activePlayers(room)
        if (active.length === 1) {
            endGame(io, roomId, active[0])
        } else {
            nextTurn(room)
            broadcastState(io, roomId)
        }
    })

    // Show (challenge another player)
    socket.on('tp:show', ({ roomId, userId }) => {
        const room = rooms.get(roomId)
        if (!room || room.phase !== 'playing') return
        if (room.currentTurnId !== userId) return socket.emit('tp:error', 'Not your turn')

        const active = activePlayers(room)
        if (active.length < 2) return

        // Show costs double boot
        const player = room.players.find(p => p.id === userId)
        player.bet += room.bootAmount * 2
        room.pot += room.bootAmount * 2

        room.phase = 'showdown'
        io.to(roomId).emit('tp:showdown', {
            players: active.map(p => ({ id: p.id, name: p.name, hand: p.hand, eval: evalTeenPatti(p.hand) }))
        })

        const winner = determineWinner(room)
        endGame(io, roomId, winner)
    })

    // Get room list
    socket.on('tp:rooms', () => {
        socket.emit('tp:roomlist', getRoomList())
    })

    // Leave
    socket.on('tp:leave', ({ roomId, userId }) => {
        const room = rooms.get(roomId)
        if (!room) return
        room.players = room.players.filter(p => p.id !== userId)
        socket.leave(roomId)
        if (room.players.length === 0) {
            rooms.delete(roomId)
        } else {
            broadcastState(io, roomId)
        }
        io.emit('tp:roomlist', getRoomList())
    })

    // Cleanup on disconnect
    socket.on('disconnect', () => {
        rooms.forEach((room, roomId) => {
            const player = room.players.find(p => p.socketId === socket.id)
            if (player) {
                player.status = 'folded'
                const active = activePlayers(room)
                if (active.length === 1 && room.phase === 'playing') {
                    endGame(io, roomId, active[0])
                }
            }
        })
    })
}

function getRoomList() {
    return [...rooms.values()].map(r => ({
        id: r.id,
        name: r.name,
        bootAmount: r.bootAmount,
        phase: r.phase,
        players: r.players.length,
        maxPlayers: 6
    }))
}