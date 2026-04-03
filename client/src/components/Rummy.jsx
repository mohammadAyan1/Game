// client/src/components/Rummy.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useApp } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const socket = io('http://localhost:5000', { autoConnect: false })

const SUIT_COLOR = { '♠': '#e2e8f0', '♣': '#e2e8f0', '♥': '#f87171', '♦': '#f87171' }

function cardKey(c) { return `${c.rank}${c.suit}` }

// ── Card component ──────────────────────────────────────────────────────────
function Card({ card, hidden, selected, onClick, small, joker }) {
    if (!card && !hidden) return null
    const sz = small ? 'w-9 h-13 text-[10px] p-0.5' : 'w-12 h-17 text-xs p-1'

    if (hidden) return (
        <div className={`${sz} rounded-lg flex items-center justify-center cursor-default select-none`}
            style={{ background: 'linear-gradient(135deg,#1e3a5f,#0f2744)', border: '1px solid #ffffff15' }}>
            <span className="text-white/15 text-lg">🂠</span>
        </div>
    )

    return (
        <div onClick={onClick}
            className={`relative rounded-lg flex flex-col items-center justify-between cursor-pointer select-none font-bold transition-all ${sz} ${selected ? '-translate-y-2 ring-2 ring-yellow-400' : 'hover:-translate-y-1'
                }`}
            style={{
                background: selected ? '#1a2744' : '#1a1a2e',
                border: `1px solid ${selected ? '#f59e0b80' : '#ffffff15'}`,
                color: SUIT_COLOR[card.suit]
            }}>
            {joker && <span className="absolute top-0 right-0 text-[7px] bg-yellow-400 text-black rounded-bl px-0.5">J</span>}
            <span>{card.rank}</span>
            <span className="text-base leading-none">{card.suit}</span>
            <span className="rotate-180">{card.rank}</span>
        </div>
    )
}

// ── Meld builder — drag-and-drop style via selection ──────────────────────
function MeldBuilder({ hand, jokerRank, onDeclare }) {
    const [melds, setMelds] = useState([[], [], [], []])
    const [unmelded, setUnmelded] = useState([...hand])

    const moveToMeld = (card, meldIdx) => {
        setUnmelded(prev => prev.filter(c => cardKey(c) !== cardKey(card)))
        setMelds(prev => prev.map((m, i) => i === meldIdx ? [...m, card] : m))
    }
    const removeFromMeld = (card, meldIdx) => {
        setMelds(prev => prev.map((m, i) => i === meldIdx ? m.filter(c => cardKey(c) !== cardKey(card)) : m))
        setUnmelded(prev => [...prev, card])
    }

    const isJoker = (c) => c.rank === jokerRank

    return (
        <div className="flex flex-col gap-4 p-4 rounded-xl"
            style={{ background: '#0c1322', border: '1px solid #ffffff08' }}>
            <h3 className="text-xs tracking-[3px] text-white/40">ARRANGE YOUR MELDS</h3>

            {/* Unmelded cards */}
            <div>
                <p className="text-[10px] text-white/30 mb-2">YOUR HAND — click to move to a group</p>
                <div className="flex flex-wrap gap-1.5">
                    {unmelded.map(c => (
                        <div key={cardKey(c)} className="flex flex-col items-center gap-1">
                            <Card card={c} joker={isJoker(c)} small />
                            <div className="flex gap-0.5">
                                {[0, 1, 2, 3].map(i => (
                                    <button key={i} onClick={() => moveToMeld(c, i)}
                                        className="w-5 h-5 rounded text-[8px] font-bold transition-colors"
                                        style={{ background: '#d4a84720', color: '#d4a847' }}>
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                    {unmelded.length === 0 && <p className="text-white/20 text-xs">All cards arranged</p>}
                </div>
            </div>

            {/* Meld groups */}
            <div className="grid grid-cols-2 gap-3">
                {melds.map((meld, i) => (
                    <div key={i} className="rounded-lg p-2 min-h-[60px]"
                        style={{ background: '#ffffff05', border: '1px solid #ffffff0a' }}>
                        <p className="text-[9px] text-white/25 mb-1">GROUP {i + 1}</p>
                        <div className="flex flex-wrap gap-1">
                            {meld.map(c => (
                                <div key={cardKey(c)} onClick={() => removeFromMeld(c, i)} title="Click to remove">
                                    <Card card={c} joker={isJoker(c)} small />
                                </div>
                            ))}
                            {meld.length === 0 && <span className="text-white/10 text-[10px]">Empty</span>}
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={() => onDeclare(melds.filter(m => m.length > 0))}
                disabled={unmelded.length > 0}
                className="py-2.5 rounded-xl font-black tracking-widest text-sm transition-all"
                style={{
                    background: unmelded.length === 0 ? 'linear-gradient(135deg,#d4a847,#b8912e)' : '#ffffff10',
                    color: unmelded.length === 0 ? '#0a0805' : '#ffffff30',
                    cursor: unmelded.length === 0 ? 'pointer' : 'not-allowed'
                }}>
                {unmelded.length === 0 ? '🏆 DECLARE' : `Arrange ${unmelded.length} more card(s)`}
            </button>
        </div>
    )
}

// ── Main component ──────────────────────────────────────────────────────────
export default function Rummy() {
    const { user } = useApp()
    const navigate = useNavigate()

    const [view, setView] = useState('lobby')
    const [rooms, setRooms] = useState([])
    const [roomId, setRoomId] = useState(null)
    const [gameState, setGame] = useState(null)
    const [myHand, setMyHand] = useState([])
    const [log, setLog] = useState([])
    const [newRoom, setNewRoom] = useState({ name: '', entryCoins: 50 })
    const [gameover, setGameover] = useState(null)
    const [showMeldUI, setMeldUI] = useState(false)
    const [selectedDiscard, setSelDiscard] = useState(null)
    const [turnPhase, setTurnPhase] = useState('draw')
    const logRef = useRef(null)

    const myId = user?.id ? String(user.id) : null
    const addLog = useCallback((msg) => setLog(prev => [...prev.slice(-30), { id: Date.now(), msg }]), [])

    useEffect(() => {
        if (!user?.success) { navigate('/login'); return }
        socket.connect()
        socket.emit('rm:rooms')

        socket.on('rm:roomlist', setRooms)
        socket.on('rm:created', ({ roomId: rid }) => { setRoomId(rid); setView('game') })
        socket.on('rm:state', state => {
            setGame(state)
            setTurnPhase(state.turnPhase || 'draw')
            const me = state.players.find(p => String(p.id) === myId)
            if (me?.hand?.length) setMyHand(me.hand)
        })
        socket.on('rm:roundstart', ({ jokerRank, pot }) => addLog(`Round started! Joker: ${jokerRank} | Pot: ₹${pot}`))
        socket.on('rm:drew', ({ card, from }) => {
            if (from === 'deck') addLog(`You drew from deck`)
            else addLog(`You drew ${card.rank}${card.suit} from discard`)
        })
        socket.on('rm:discarded', ({ name, card }) => addLog(`${name} discarded ${card.rank}${card.suit}`))
        socket.on('rm:playerjoined', ({ name }) => addLog(`${name} joined`))
        socket.on('rm:declaring', ({ name }) => addLog(`⚡ ${name} is declaring!`))
        socket.on('rm:dropped', ({ name, penalty }) => addLog(`${name} dropped (${penalty} pts penalty)`))
        socket.on('rm:gameover', (data) => { setGameover(data); setMeldUI(false); addLog(`🏆 ${data.winnerName} wins ₹${data.pot}!`) })
        socket.on('rm:reset', () => { setGameover(null); setMyHand([]); addLog('New round...') })
        socket.on('rm:error', msg => addLog(`❌ ${msg}`))

        return () => {
            ['rm:roomlist', 'rm:created', 'rm:state', 'rm:roundstart', 'rm:drew',
                'rm:discarded', 'rm:playerjoined', 'rm:declaring', 'rm:dropped',
                'rm:gameover', 'rm:reset', 'rm:error'].forEach(e => socket.off(e))
            socket.disconnect()
        }
    }, [])

    useEffect(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
    }, [log])

    const createRoom = () => socket.emit('rm:create', { ...newRoom, userId: myId, userName: user.username })
    const joinRoom = rid => { setRoomId(rid); socket.emit('rm:join', { roomId: rid, userId: myId, userName: user.username }); setView('game') }
    const startGame = () => socket.emit('rm:start', { roomId, userId: myId })
    const drawDeck = () => socket.emit('rm:drawdeck', { roomId, userId: myId })
    const drawDiscard = () => socket.emit('rm:drawdiscard', { roomId, userId: myId })
    const discard = () => {
        if (!selectedDiscard) return addLog('Select a card to discard')
        socket.emit('rm:discard', { roomId, userId: myId, cardKey: selectedDiscard })
        setSelDiscard(null)
    }
    const drop = () => { if (window.confirm('Drop? You\'ll get penalty points.')) socket.emit('rm:drop', { roomId, userId: myId }) }
    const declare = (melds) => { socket.emit('rm:declare', { roomId, userId: myId, melds }); setMeldUI(false) }
    const leaveRoom = () => { socket.emit('rm:leave', { roomId, userId: myId }); setView('lobby'); setRoomId(null); setGame(null); setMyHand([]) }

    const me = gameState?.players?.find(p => String(p.id) === myId)
    const isMyTurn = gameState?.currentTurnId === myId
    const isPlaying = gameState?.phase === 'playing'
    const isHost = String(gameState?.players?.[0]?.id) === myId
    const topDiscard = gameState?.topDiscard

    // ── LOBBY ─────────────────────────────────────────────────────────────────
    if (view === 'lobby') return (
        <div className="min-h-screen flex flex-col items-center py-12 px-4"
            style={{ background: '#07090f', fontFamily: "'Courier New',monospace" }}>
            <h1 className="text-3xl font-black tracking-[6px] mb-2" style={{ color: '#10b981' }}>♦ RUMMY ♦</h1>
            <p className="text-white/30 text-xs tracking-widest mb-10">13-CARD INDIAN RUMMY • MULTIPLAYER</p>

            <div className="w-full max-w-md rounded-xl p-5 mb-6"
                style={{ background: '#0c1322', border: '1px solid #10b98120' }}>
                <h2 className="text-sm tracking-[3px] text-white/50 mb-4">CREATE ROOM</h2>
                <div className="flex flex-col gap-3">
                    <input placeholder="Room Name"
                        value={newRoom.name}
                        onChange={e => setNewRoom(p => ({ ...p, name: e.target.value }))}
                        className="rounded-lg px-3 py-2 text-sm text-white outline-none"
                        style={{ background: '#ffffff0a', border: '1px solid #ffffff15', fontFamily: 'inherit' }} />
                    <div className="flex gap-3 items-center">
                        <label className="text-xs text-white/40">Entry Coins:</label>
                        <input type="number" min="10" max="5000"
                            value={newRoom.entryCoins}
                            onChange={e => setNewRoom(p => ({ ...p, entryCoins: +e.target.value }))}
                            className="w-24 rounded-lg px-3 py-2 text-sm text-white outline-none"
                            style={{ background: '#ffffff0a', border: '1px solid #ffffff15', fontFamily: 'inherit' }} />
                    </div>
                    <button onClick={createRoom}
                        className="py-2.5 rounded-lg text-sm font-black tracking-widest"
                        style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white' }}>
                        CREATE TABLE
                    </button>
                </div>
            </div>

            <div className="w-full max-w-md">
                <h2 className="text-sm tracking-[3px] text-white/50 mb-3">JOIN A TABLE</h2>
                {rooms.length === 0 && <p className="text-white/20 text-sm text-center py-8">No tables. Create one!</p>}
                {rooms.map(r => (
                    <div key={r.id} className="flex items-center justify-between rounded-xl px-4 py-3 mb-2"
                        style={{ background: '#0c1322', border: '1px solid #10b98115' }}>
                        <div>
                            <p className="text-sm font-bold text-white/80">{r.name}</p>
                            <p className="text-xs text-white/30">Entry: {r.entryCoins} coins • {r.players}/{r.maxPlayers}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${r.phase === 'waiting' ? 'text-green-400 bg-green-400/10' : 'text-yellow-400 bg-yellow-400/10'}`}>
                                {r.phase}
                            </span>
                            {r.phase === 'waiting' && (
                                <button onClick={() => joinRoom(r.id)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold"
                                    style={{ background: '#10b98120', border: '1px solid #10b98140', color: '#10b981' }}>
                                    JOIN
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )

    // ── GAME ──────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen flex flex-col"
            style={{ background: '#07090f', fontFamily: "'Courier New',monospace" }}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3"
                style={{ borderBottom: '1px solid #ffffff08' }}>
                <div className="flex items-center gap-3">
                    <span className="text-lg font-black tracking-widest" style={{ color: '#10b981' }}>♦ RUMMY</span>
                    {gameState?.jokerRank && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ background: '#f59e0b20', color: '#f59e0b', border: '1px solid #f59e0b40' }}>
                            JOKER: {gameState.jokerRank}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded-lg text-sm font-bold"
                        style={{ background: '#10b98115', color: '#10b981' }}>
                        POT: {gameState?.pot} coins
                    </div>
                    <button onClick={leaveRoom}
                        className="px-3 py-1 rounded-lg text-xs text-white/40 hover:text-white/70"
                        style={{ border: '1px solid #ffffff10' }}>LEAVE</button>
                </div>
            </div>

            <div className="flex flex-1 gap-4 p-4">

                {/* Main game area */}
                <div className="flex-1 flex flex-col gap-4">

                    {/* Players */}
                    <div className="grid grid-cols-3 gap-3">
                        {gameState?.players?.map(p => (
                            <div key={p.id}
                                className={`rounded-xl p-3 flex flex-col items-center gap-2 transition-all ${p.status === 'folded' ? 'opacity-40' : ''
                                    }`}
                                style={{
                                    background: '#0c1322',
                                    border: `1px solid ${gameState.currentTurnId === p.id ? '#10b98140' : '#ffffff08'}`,
                                    boxShadow: gameState.currentTurnId === p.id ? '0 0 12px #10b98120' : 'none'
                                }}>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg"
                                    style={{ background: '#10b98115', color: '#10b981' }}>
                                    {p.name[0].toUpperCase()}
                                </div>
                                <p className="text-xs font-bold text-white/70">{p.name}</p>
                                <p className="text-[10px] text-white/30">{p.cardCount} cards</p>
                                {p.score > 0 && <p className="text-xs text-red-400 font-bold">{p.score} pts</p>}
                                {p.status === 'folded' && <p className="text-[10px] text-red-400 tracking-widest">DROPPED</p>}
                                {gameState.currentTurnId === p.id && (
                                    <p className="text-[10px] text-green-400 font-bold animate-pulse tracking-widest">YOUR TURN</p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Draw piles */}
                    <div className="flex items-center justify-center gap-8 py-4">
                        {/* Deck */}
                        <div className="flex flex-col items-center gap-2">
                            <div onClick={isMyTurn && turnPhase === 'draw' ? drawDeck : undefined}
                                className={`w-16 h-22 rounded-xl flex items-center justify-center transition-all ${isMyTurn && turnPhase === 'draw' ? 'cursor-pointer hover:scale-105' : 'cursor-default'
                                    }`}
                                style={{ background: 'linear-gradient(135deg,#1e3a5f,#0f2744)', border: '2px solid #3b82f640' }}>
                                <span className="text-white/20 text-2xl">🂠</span>
                            </div>
                            <p className="text-[10px] text-white/30">{gameState?.deckCount} cards</p>
                            {isMyTurn && turnPhase === 'draw' && (
                                <button onClick={drawDeck}
                                    className="text-[10px] px-2 py-1 rounded font-bold"
                                    style={{ background: '#3b82f620', color: '#60a5fa' }}>DRAW</button>
                            )}
                        </div>

                        <div className="text-white/20 text-xl">⇄</div>

                        {/* Discard pile */}
                        <div className="flex flex-col items-center gap-2">
                            <div onClick={isMyTurn && turnPhase === 'draw' ? drawDiscard : undefined}
                                className={isMyTurn && turnPhase === 'draw' ? 'cursor-pointer hover:scale-105 transition-all' : ''}>
                                {topDiscard
                                    ? <Card card={topDiscard} joker={topDiscard.rank === gameState?.jokerRank} />
                                    : <div className="w-12 h-17 rounded-xl flex items-center justify-center"
                                        style={{ border: '1px dashed #ffffff15' }}>
                                        <span className="text-white/15 text-xs">empty</span>
                                    </div>
                                }
                            </div>
                            <p className="text-[10px] text-white/30">Discard pile</p>
                            {isMyTurn && turnPhase === 'draw' && topDiscard && (
                                <button onClick={drawDiscard}
                                    className="text-[10px] px-2 py-1 rounded font-bold"
                                    style={{ background: '#10b98120', color: '#10b981' }}>PICK</button>
                            )}
                        </div>
                    </div>

                    {/* My Hand */}
                    {myHand.length > 0 && (
                        <div className="rounded-xl p-4"
                            style={{ background: '#0c1322', border: '1px solid #ffffff08' }}>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[10px] tracking-[2px] text-white/30">YOUR HAND</p>
                                <p className="text-[10px] text-white/20">{turnPhase === 'discard' ? 'Click a card to select, then DISCARD' : ''}</p>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {myHand.map(c => (
                                    <Card key={cardKey(c)} card={c}
                                        joker={c.rank === gameState?.jokerRank}
                                        selected={selectedDiscard === cardKey(c)}
                                        onClick={() => setSelDiscard(prev => prev === cardKey(c) ? null : cardKey(c))}
                                        small />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    {isPlaying && isMyTurn && !showMeldUI && (
                        <div className="flex flex-wrap gap-3 justify-center">
                            {turnPhase === 'discard' && (
                                <>
                                    <button onClick={discard} disabled={!selectedDiscard}
                                        className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
                                        style={{
                                            background: selectedDiscard ? 'linear-gradient(135deg,#ef4444,#dc2626)' : '#ffffff10',
                                            color: selectedDiscard ? 'white' : '#ffffff30',
                                            cursor: selectedDiscard ? 'pointer' : 'not-allowed'
                                        }}>
                                        DISCARD {selectedDiscard || '(select card)'}
                                    </button>
                                    <button onClick={() => setMeldUI(true)}
                                        className="px-5 py-2.5 rounded-xl font-bold text-sm"
                                        style={{ background: 'linear-gradient(135deg,#d4a847,#b8912e)', color: '#0a0805' }}>
                                        DECLARE 🏆
                                    </button>
                                    <button onClick={drop}
                                        className="px-4 py-2.5 rounded-xl font-bold text-sm"
                                        style={{ background: '#7f1d1d20', border: '1px solid #f8717140', color: '#f87171' }}>
                                        DROP
                                    </button>
                                </>
                            )}
                            {turnPhase === 'draw' && !isMyTurn && (
                                <p className="text-white/30 text-sm animate-pulse">Draw a card first</p>
                            )}
                        </div>
                    )}

                    {isPlaying && !isMyTurn && (
                        <p className="text-center text-white/30 text-sm animate-pulse">
                            Waiting for {gameState?.players?.find(p => p.id === gameState.currentTurnId)?.name}...
                        </p>
                    )}

                    {gameState?.phase === 'waiting' && isHost && (
                        <div className="text-center">
                            <button onClick={startGame}
                                className="px-8 py-3 rounded-xl font-black tracking-widest text-sm"
                                style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white' }}>
                                START GAME
                            </button>
                        </div>
                    )}

                    {/* Meld UI */}
                    {showMeldUI && (
                        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                                <MeldBuilder hand={myHand} jokerRank={gameState?.jokerRank} onDeclare={declare} />
                                <button onClick={() => setMeldUI(false)}
                                    className="mt-3 w-full py-2 rounded-xl text-sm text-white/40 hover:text-white/70"
                                    style={{ border: '1px solid #ffffff10' }}>CANCEL</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Activity log */}
                <div className="w-52 rounded-xl flex flex-col"
                    style={{ background: '#0c1322', border: '1px solid #ffffff08' }}>
                    <div className="px-4 py-3 text-xs tracking-widest text-white/30"
                        style={{ borderBottom: '1px solid #ffffff08' }}>ACTIVITY</div>
                    <div ref={logRef} className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1.5"
                        style={{ maxHeight: '500px' }}>
                        {log.map(l => (
                            <p key={l.id} className="text-xs text-white/50 leading-relaxed">{l.msg}</p>
                        ))}
                    </div>
                </div>
            </div>

            {/* Gameover overlay */}
            {gameover && (
                <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
                    <div className="rounded-2xl p-8 text-center max-w-md w-full mx-4"
                        style={{ background: '#0c1322', border: '1px solid #10b98140' }}>
                        <div className="text-5xl mb-4">🏆</div>
                        <h2 className="text-2xl font-black mb-1" style={{ color: '#10b981' }}>{gameover.winnerName}</h2>
                        <p className="text-white/50 text-sm mb-6">WINS {gameover.pot} COINS</p>
                        <div className="flex flex-col gap-2 text-left">
                            {gameover.players?.map(p => (
                                <div key={p.id} className="flex items-center justify-between px-3 py-2 rounded-lg"
                                    style={{ background: '#ffffff08' }}>
                                    <span className={p.id === gameover.winnerId ? 'text-green-400 font-bold' : 'text-white/50'}>
                                        {p.name}
                                    </span>
                                    <span className={p.score > 0 ? 'text-red-400 text-xs' : 'text-green-400 text-xs font-bold'}>
                                        {p.score > 0 ? `${p.score} pts` : '🏆 Winner'}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <p className="text-white/20 text-xs mt-4">Next round starting automatically...</p>
                    </div>
                </div>
            )}
        </div>
    )
}