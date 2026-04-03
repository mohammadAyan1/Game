// server/game/rummy.js
// ── 13-Card Indian Rummy multiplayer game engine (Socket.io) ──

import { createDeck, shuffle, calcDeadwood, validateRummyDeclaration, cardKey } from './cards.js'
import pool from '../config/db.js'
import { v4 as uuid } from 'uuid'

const rooms = new Map()

// ── Pick the printed joker (one random card = joker for this round) ──
function pickJokerRank(deck) {
    const jokerCard = deck[Math.floor(Math.random() * deck.length)]
    return jokerCard.rank
}

function broadcastState(io, roomId) {
    const room = rooms.get(roomId)
    if (!room) return
    room.players.forEach(player => {
        const state = {
            roomId: room.id,
            name: room.name,
            phase: room.phase,
            currentTurn: room.currentTurnId,
            pot: room.pot,
            jokerRank: room.jokerRank,
            deckCount: room.deck.length,
            topDiscard: room.discardPile.at(-1) || null,
            players: room.players.map(p => ({
                id: p.id,
                name: p.name,
                cardCount: p.hand.length,
                status: p.status,
                score: p.score,
                // Only send your own hand
                hand: p.id === player.id ? p.hand : []
            }))
        }
        io.to(player.socketId).emit('rm:state', state)
    })
}

function activePlayers(room) { return room.players.filter(p => p.status === 'active') }

function nextTurn(room) {
    const active = activePlayers(room)
    if (!active.length) return
    const idx = active.findIndex(p => p.id === room.currentTurnId)
    room.currentTurnId = active[(idx + 1) % active.length].id
    room.turnPhase = 'draw'  // each turn starts with a draw
}

function startRound(io, roomId) {
    const room = rooms.get(roomId)
    if (!room || room.players.length < 2) return

    let deck = shuffle([...createDeck(), ...createDeck()]) // 2 decks for rummy
    room.jokerRank = pickJokerRank(deck)

    // Deal 13 cards each
    room.players.forEach(p => {
        p.hand = deck.splice(0, 13)
        p.status = 'active'
        p.score = 0
        p.drawnThisTurn = false
    })

    // Start discard pile
    room.discardPile = [deck.splice(0, 1)[0]]
    room.deck = deck
    room.phase = 'playing'
    room.pot = room.entryCoins * room.players.length
    room.currentTurnId = room.players[0].id
    room.turnPhase = 'draw'

    broadcastState(io, roomId)
    io.to(roomId).emit('rm:roundstart', { jokerRank: room.jokerRank, pot: room.pot })
}

async function endGame(io, roomId, winner, declaredMelds) {
    const room = rooms.get(roomId)
    if (!room) return
    room.phase = 'finished'

    // Calculate points for losers
    room.players.forEach(p => {
        if (p.id !== winner.id) {
            const jokers = p.hand.filter(c => c.rank === room.jokerRank)
            p.score = Math.min(80, calcDeadwood(p.hand, jokers))
        } else {
            p.score = 0
        }
    })

    // Save to DB
    try {
        await pool.query(
            `INSERT INTO transactions (id, user_id, coins, status, type, game)
       VALUES (?, ?, ?, 'success', 'profit', 'rummy')`,
            [uuid(), winner.id, room.pot]
        )
        await pool.query(
            `INSERT INTO rummy_games (room_id, winner_id, prize_coins, players_json)
       VALUES (?, ?, ?, ?)`,
            [roomId, winner.id, room.pot, JSON.stringify(room.players.map(p => ({
                id: p.id, name: p.name, score: p.score
            })))]
        )
    } catch (e) { console.error('Rummy DB error:', e) }

    broadcastState(io, roomId)
    io.to(roomId).emit('rm:gameover', {
        winnerId: winner.id,
        winnerName: winner.name,
        pot: room.pot,
        declaredMelds,
        players: room.players.map(p => ({ id: p.id, name: p.name, score: p.score, hand: p.hand }))
    })

    setTimeout(() => {
        if (rooms.has(roomId)) resetRoom(io, roomId)
    }, 10000)
}

function resetRoom(io, roomId) {
    const room = rooms.get(roomId)
    if (!room) return
    room.phase = 'waiting'
    room.pot = 0
    room.deck = []
    room.discardPile = []
    room.jokerRank = null
    room.currentTurnId = null
    room.players.forEach(p => { p.hand = []; p.status = 'active'; p.score = 0 })
    broadcastState(io, roomId)
    io.to(roomId).emit('rm:reset')
}

// ── Register Rummy Socket Events ──
export function registerRummy(io, socket) {

    socket.on('rm:create', ({ name, entryCoins = 50, userId, userName }) => {
        const roomId = uuid()
        rooms.set(roomId, {
            id: roomId, name: name || `Rummy-${roomId.slice(0, 6)}`,
            entryCoins: Math.max(10, entryCoins),
            phase: 'waiting', pot: 0,
            deck: [], discardPile: [], jokerRank: null,
            currentTurnId: null, turnPhase: 'draw',
            players: []
        })
        socket.join(roomId)
        rooms.get(roomId).players.push({
            id: userId, name: userName, socketId: socket.id,
            hand: [], status: 'active', score: 0, drawnThisTurn: false
        })
        socket.emit('rm:created', { roomId })
        io.emit('rm:roomlist', getRoomList())
    })

    socket.on('rm:join', ({ roomId, userId, userName }) => {
        const room = rooms.get(roomId)
        if (!room) return socket.emit('rm:error', 'Room not found')
        if (room.phase !== 'waiting') return socket.emit('rm:error', 'Game already started')
        if (room.players.length >= 6) return socket.emit('rm:error', 'Room full')
        if (room.players.find(p => p.id === userId)) return

        socket.join(roomId)
        room.players.push({
            id: userId, name: userName, socketId: socket.id,
            hand: [], status: 'active', score: 0, drawnThisTurn: false
        })
        broadcastState(io, roomId)
        io.to(roomId).emit('rm:playerjoined', { name: userName, count: room.players.length })
        io.emit('rm:roomlist', getRoomList())
    })

    socket.on('rm:start', ({ roomId, userId }) => {
        const room = rooms.get(roomId)
        if (!room) return
        if (room.players[0]?.id !== userId) return socket.emit('rm:error', 'Only host can start')
        if (room.players.length < 2) return socket.emit('rm:error', 'Need 2+ players')
        startRound(io, roomId)
    })

    // Draw from deck
    socket.on('rm:drawdeck', ({ roomId, userId }) => {
        const room = rooms.get(roomId)
        if (!room || room.phase !== 'playing') return
        if (room.currentTurnId !== userId) return socket.emit('rm:error', 'Not your turn')
        if (room.turnPhase !== 'draw') return socket.emit('rm:error', 'Already drew')
        if (!room.deck.length) {
            // Reshuffle discard pile (except top card) back into deck
            const top = room.discardPile.pop()
            room.deck = shuffle(room.discardPile)
            room.discardPile = [top]
        }
        const card = room.deck.pop()
        const player = room.players.find(p => p.id === userId)
        player.hand.push(card)
        player.drawnThisTurn = true
        room.turnPhase = 'discard'
        broadcastState(io, roomId)
        socket.emit('rm:drew', { card, from: 'deck' })
    })

    // Draw from discard pile
    socket.on('rm:drawdiscard', ({ roomId, userId }) => {
        const room = rooms.get(roomId)
        if (!room || room.phase !== 'playing') return
        if (room.currentTurnId !== userId) return socket.emit('rm:error', 'Not your turn')
        if (room.turnPhase !== 'draw') return socket.emit('rm:error', 'Already drew')
        if (!room.discardPile.length) return socket.emit('rm:error', 'Discard pile empty')

        const card = room.discardPile.pop()
        const player = room.players.find(p => p.id === userId)
        player.hand.push(card)
        player.drawnThisTurn = true
        room.turnPhase = 'discard'
        broadcastState(io, roomId)
        socket.emit('rm:drew', { card, from: 'discard' })
    })

    // Discard a card
    socket.on('rm:discard', ({ roomId, userId, cardKey: ck }) => {
        const room = rooms.get(roomId)
        if (!room || room.phase !== 'playing') return
        if (room.currentTurnId !== userId) return socket.emit('rm:error', 'Not your turn')
        if (room.turnPhase !== 'discard') return socket.emit('rm:error', 'Draw first')

        const player = room.players.find(p => p.id === userId)
        const idx = player.hand.findIndex(c => cardKey(c) === ck)
        if (idx === -1) return socket.emit('rm:error', 'Card not in hand')

        const [discarded] = player.hand.splice(idx, 1)
        room.discardPile.push(discarded)
        player.drawnThisTurn = false
        room.turnPhase = 'draw'

        io.to(roomId).emit('rm:discarded', { name: player.name, card: discarded })
        nextTurn(room)
        broadcastState(io, roomId)
    })

    // Declare (finish the game)
    socket.on('rm:declare', ({ roomId, userId, melds }) => {
        const room = rooms.get(roomId)
        if (!room || room.phase !== 'playing') return
        if (room.currentTurnId !== userId) return socket.emit('rm:error', 'Not your turn')

        const player = room.players.find(p => p.id === userId)
        const jokers = player.hand.filter(c => c.rank === room.jokerRank)
        const result = validateRummyDeclaration(melds, jokers)

        if (!result.valid) return socket.emit('rm:error', result.msg)

        io.to(roomId).emit('rm:declaring', { name: player.name })
        endGame(io, roomId, player, melds)
    })

    // Drop (fold) — penalty points
    socket.on('rm:drop', ({ roomId, userId }) => {
        const room = rooms.get(roomId)
        if (!room || room.phase !== 'playing') return

        const player = room.players.find(p => p.id === userId)
        if (!player || player.status !== 'active') return

        // First drop = 20 points, middle drop = 40 points
        player.status = 'folded'
        player.score = player.drawnThisTurn ? 40 : 20

        io.to(roomId).emit('rm:dropped', { name: player.name, penalty: player.score })

        const active = activePlayers(room)
        if (active.length === 1) {
            endGame(io, roomId, active[0], [])
        } else {
            if (room.currentTurnId === userId) nextTurn(room)
            broadcastState(io, roomId)
        }
    })

    socket.on('rm:rooms', () => { socket.emit('rm:roomlist', getRoomList()) })

    socket.on('rm:leave', ({ roomId, userId }) => {
        const room = rooms.get(roomId)
        if (!room) return
        room.players = room.players.filter(p => p.id !== userId)
        socket.leave(roomId)
        if (!room.players.length) rooms.delete(roomId)
        else broadcastState(io, roomId)
        io.emit('rm:roomlist', getRoomList())
    })

    socket.on('disconnect', () => {
        rooms.forEach((room, roomId) => {
            const player = room.players.find(p => p.socketId === socket.id)
            if (player && room.phase === 'playing') {
                player.status = 'folded'
                player.score = 40
                const active = activePlayers(room)
                if (active.length === 1) endGame(io, roomId, active[0], [])
            }
        })
    })
}

function getRoomList() {
    return [...rooms.values()].map(r => ({
        id: r.id,
        name: r.name,
        entryCoins: r.entryCoins,
        phase: r.phase,
        players: r.players.length,
        maxPlayers: 6
    }))
}