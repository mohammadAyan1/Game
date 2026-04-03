// client/src/components/TeenPatti.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useApp } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const socket = io('http://localhost:5000', { autoConnect: false })

// ── Card colours ──────────────────────────────────────
const SUIT_COLOR = { '♠': '#e2e8f0', '♣': '#e2e8f0', '♥': '#f87171', '♦': '#f87171' }

function PlayingCard({ card, hidden = false, small = false }) {
    const sz = small ? 'w-8 h-11 text-[10px]' : 'w-14 h-20 text-base'
    if (hidden) return (
        <div className={`${sz} rounded-lg flex items-center justify-center border border-white/10 select-none`}
            style={{ background: 'linear-gradient(135deg,#1e3a5f,#0f2744)' }}>
            <span className="text-white/20 text-xl">🂠</span>
        </div>
    )
    return (
        <div className={`${sz} rounded-lg flex flex-col items-center justify-between p-1 border border-white/10 select-none font-bold`}
            style={{ background: '#1a1a2e', color: SUIT_COLOR[card.suit] }}>
            <span>{card.rank}</span>
            <span className="text-xl leading-none">{card.suit}</span>
            <span className="rotate-180">{card.rank}</span>
        </div>
    )
}

function PlayerSeat({ player, isMe, isTurn, pot }) {
    const statusColor = player.status === 'folded' ? 'opacity-40' : ''
    return (
        <div className={`flex flex-col items-center gap-2 ${statusColor} transition-all`}>
            {/* Avatar */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-black border-2 transition-all ${isTurn ? 'border-yellow-400 shadow-[0_0_16px_#f59e0b]' : 'border-white/10'
                }`} style={{ background: '#0d1b2a' }}>
                {player.name[0].toUpperCase()}
            </div>
            <span className="text-[11px] font-semibold tracking-wide text-white/70">{player.name}</span>

            {/* Cards */}
            <div className="flex gap-1">
                {isMe && player.hand?.length
                    ? player.hand.map((c, i) => <PlayingCard key={i} card={c} small />)
                    : Array(3).fill(0).map((_, i) => <PlayingCard key={i} hidden small />)
                }
            </div>

            {/* Bet chip */}
            {player.bet > 0 && (
                <div className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: '#d4a84720', border: '1px solid #d4a84740', color: '#d4a847' }}>
                    ₹{player.bet}
                </div>
            )}
            {player.status === 'folded' && (
                <span className="text-[10px] text-red-400 font-bold tracking-widest">FOLDED</span>
            )}
            {player.isBlind === false && (
                <span className="text-[10px] text-cyan-400 font-semibold">SEEN</span>
            )}
        </div>
    )
}

// ── Main component ─────────────────────────────────────────────────────────
export default function TeenPatti() {
    const { user } = useApp()
    const navigate = useNavigate()

    const [view, setView] = useState('lobby')   // lobby | game
    const [rooms, setRooms] = useState([])
    const [roomId, setRoomId] = useState(null)
    const [gameState, setGame] = useState(null)
    const [myHand, setMyHand] = useState([])
    const [pot, setPot] = useState(0)
    const [log, setLog] = useState([])
    const [newRoom, setNewRoom] = useState({ name: '', bootAmount: 10 })
    const [gameover, setGameover] = useState(null)
    const [chaalAmt, setChaalAmt] = useState(10)
    const logRef = useRef(null)

    const myId = user?.id ? String(user.id) : null

    const addLog = useCallback((msg) => {
        setLog(prev => [...prev.slice(-30), { id: Date.now(), msg }])
    }, [])

    useEffect(() => {
        if (!user?.success) { navigate('/login'); return }
        socket.connect()
        socket.emit('tp:rooms')

        socket.on('tp:roomlist', setRooms)
        socket.on('tp:created', ({ roomId: rid }) => { setRoomId(rid); setView('game') })
        socket.on('tp:state', (state) => {
            setGame(state)
            setPot(state.pot)
            const me = state.players.find(p => String(p.id) === myId)
            if (me?.hand?.length) setMyHand(me.hand)
        })
        socket.on('tp:roundstart', ({ pot: p, bootAmount }) => { setPot(p); addLog(`Round started! Boot: ₹${bootAmount}`) })
        socket.on('tp:playerjoined', ({ name }) => addLog(`${name} joined`))
        socket.on('tp:seen', ({ name }) => addLog(`${name} saw their cards`))
        socket.on('tp:chaal', ({ name, amount, pot: p }) => { setPot(p); addLog(`${name} played ₹${amount}`) })
        socket.on('tp:fold', ({ name }) => addLog(`${name} folded`))
        socket.on('tp:showdown', ({ players }) => addLog(`Showdown! ${players.map(p => p.name).join(' vs ')}`))
        socket.on('tp:gameover', (data) => { setGameover(data); addLog(`🏆 ${data.winnerName} won ₹${data.pot}! (${data.handName})`) })
        socket.on('tp:reset', () => { setGameover(null); addLog('New round starting...') })
        socket.on('tp:error', (msg) => addLog(`❌ ${msg}`))

        return () => {
            socket.off('tp:roomlist'); socket.off('tp:created'); socket.off('tp:state')
            socket.off('tp:roundstart'); socket.off('tp:playerjoined'); socket.off('tp:seen')
            socket.off('tp:chaal'); socket.off('tp:fold'); socket.off('tp:showdown')
            socket.off('tp:gameover'); socket.off('tp:reset'); socket.off('tp:error')
            socket.disconnect()
        }
    }, [])

    useEffect(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
    }, [log])

    const createRoom = () => {
        socket.emit('tp:create', { ...newRoom, userId: myId, userName: user.username })
    }
    const joinRoom = (rid) => {
        setRoomId(rid)
        socket.emit('tp:join', { roomId: rid, userId: myId, userName: user.username })
        setView('game')
    }
    const startGame = () => socket.emit('tp:start', { roomId, userId: myId })
    const seeCards = () => socket.emit('tp:see', { roomId, userId: myId })
    const fold = () => socket.emit('tp:fold', { roomId, userId: myId })
    const chaal = () => socket.emit('tp:chaal', { roomId, userId: myId, amount: chaalAmt })
    const show = () => socket.emit('tp:show', { roomId, userId: myId })
    const leaveRoom = () => {
        socket.emit('tp:leave', { roomId, userId: myId })
        setView('lobby'); setRoomId(null); setGame(null); setMyHand([])
    }

    const me = gameState?.players?.find(p => String(p.id) === myId)
    const isMyTurn = gameState?.currentTurnId === myId
    const isPlaying = gameState?.phase === 'playing'
    const isHost = gameState?.players?.[0]?.id === myId

    // ── LOBBY ─────────────────────────────────────────────────────────────────
    if (view === 'lobby') return (
        <div className="min-h-screen flex flex-col items-center py-12 px-4"
            style={{ background: '#07090f', fontFamily: "'Courier New',monospace" }}>
            <h1 className="text-3xl font-black tracking-[6px] mb-2" style={{ color: '#d4a847' }}>♠ TEEN PATTI ♠</h1>
            <p className="text-white/30 text-xs tracking-widest mb-10">3-CARD POKER • MULTIPLAYER</p>

            {/* Create room */}
            <div className="w-full max-w-md rounded-xl p-5 mb-6"
                style={{ background: '#0c1322', border: '1px solid #d4a84720' }}>
                <h2 className="text-sm tracking-[3px] text-white/50 mb-4">CREATE ROOM</h2>
                <div className="flex flex-col gap-3">
                    <input placeholder="Room Name"
                        value={newRoom.name}
                        onChange={e => setNewRoom(p => ({ ...p, name: e.target.value }))}
                        className="rounded-lg px-3 py-2 text-sm text-white outline-none"
                        style={{ background: '#ffffff0a', border: '1px solid #ffffff15', fontFamily: 'inherit' }} />
                    <div className="flex gap-3 items-center">
                        <label className="text-xs text-white/40">Boot Amount:</label>
                        <input type="number" min="10" max="1000"
                            value={newRoom.bootAmount}
                            onChange={e => setNewRoom(p => ({ ...p, bootAmount: +e.target.value }))}
                            className="w-24 rounded-lg px-3 py-2 text-sm text-white outline-none"
                            style={{ background: '#ffffff0a', border: '1px solid #ffffff15', fontFamily: 'inherit' }} />
                    </div>
                    <button onClick={createRoom}
                        className="py-2.5 rounded-lg text-sm font-black tracking-widest transition-all"
                        style={{ background: 'linear-gradient(135deg,#d4a847,#b8912e)', color: '#0a0805' }}>
                        CREATE TABLE
                    </button>
                </div>
            </div>

            {/* Room list */}
            <div className="w-full max-w-md">
                <h2 className="text-sm tracking-[3px] text-white/50 mb-3">JOIN A TABLE</h2>
                {rooms.length === 0 && (
                    <p className="text-white/20 text-sm text-center py-8">No tables available. Create one!</p>
                )}
                {rooms.map(r => (
                    <div key={r.id} className="flex items-center justify-between rounded-xl px-4 py-3 mb-2"
                        style={{ background: '#0c1322', border: '1px solid #d4a84715' }}>
                        <div>
                            <p className="text-sm font-bold text-white/80">{r.name}</p>
                            <p className="text-xs text-white/30">Boot: ₹{r.bootAmount} • {r.players}/{r.maxPlayers} players</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${r.phase === 'waiting' ? 'text-green-400 bg-green-400/10' : 'text-yellow-400 bg-yellow-400/10'}`}>
                                {r.phase}
                            </span>
                            {r.phase === 'waiting' && (
                                <button onClick={() => joinRoom(r.id)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                    style={{ background: '#d4a84720', border: '1px solid #d4a84740', color: '#d4a847' }}>
                                    JOIN
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )

    // ── GAME TABLE ──────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen flex flex-col"
            style={{ background: '#07090f', fontFamily: "'Courier New',monospace" }}>

            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-3"
                style={{ borderBottom: '1px solid #ffffff08' }}>
                <div className="flex items-center gap-3">
                    <span className="text-lg font-black tracking-widest" style={{ color: '#d4a847' }}>♠ TEEN PATTI</span>
                    <span className="text-xs text-white/30">{gameState?.name}</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded-lg text-sm font-bold"
                        style={{ background: '#d4a84715', color: '#d4a847' }}>
                        POT: ₹{pot}
                    </div>
                    <button onClick={leaveRoom}
                        className="px-3 py-1 rounded-lg text-xs text-white/40 hover:text-white/70 transition-colors"
                        style={{ border: '1px solid #ffffff10' }}>
                        LEAVE
                    </button>
                </div>
            </div>

            <div className="flex flex-1 gap-4 p-4">

                {/* ── Game Table ── */}
                <div className="flex-1 flex flex-col">

                    {/* Players around table */}
                    <div className="flex-1 relative rounded-2xl overflow-hidden flex items-center justify-center"
                        style={{
                            background: 'radial-gradient(ellipse at center, #0a2a0a 0%, #050d05 100%)',
                            border: '2px solid #ffffff08', minHeight: '380px'
                        }}>

                        {/* Green felt texture */}
                        <div className="absolute inset-0 opacity-10"
                            style={{
                                backgroundImage: 'repeating-linear-gradient(45deg,#ffffff 0,#ffffff 1px,transparent 0,transparent 50%)',
                                backgroundSize: '8px 8px'
                            }} />

                        {/* Center: pot display */}
                        <div className="text-center z-10">
                            <div className="text-3xl mb-1">🪙</div>
                            <div className="text-xl font-black" style={{ color: '#d4a847' }}>₹{pot}</div>
                            <div className="text-xs text-white/30 mt-1 tracking-widest">
                                {gameState?.phase === 'waiting' ? 'WAITING FOR PLAYERS' : gameState?.phase?.toUpperCase()}
                            </div>
                            {gameover && (
                                <div className="mt-3 px-4 py-2 rounded-xl"
                                    style={{ background: '#d4a84720', border: '1px solid #d4a84750' }}>
                                    <p className="text-yellow-400 font-black text-sm">{gameover.winnerName} wins!</p>
                                    <p className="text-white/50 text-xs">{gameover.handName} • ₹{gameover.pot}</p>
                                </div>
                            )}
                        </div>

                        {/* Players (positioned absolutely around table) */}
                        {gameState?.players?.map((player, i) => {
                            const positions = [
                                'bottom-4 left-1/2 -translate-x-1/2',
                                'bottom-4 left-4',
                                'top-4 left-4',
                                'top-4 left-1/2 -translate-x-1/2',
                                'top-4 right-4',
                                'bottom-4 right-4',
                            ]
                            return (
                                <div key={player.id} className={`absolute ${positions[i]}`}>
                                    <PlayerSeat
                                        player={player}
                                        isMe={String(player.id) === myId}
                                        isTurn={gameState.currentTurnId === player.id}
                                        pot={pot}
                                    />
                                </div>
                            )
                        })}
                    </div>

                    {/* My hand (big cards) */}
                    {myHand.length > 0 && (
                        <div className="mt-4 flex items-center justify-center gap-3">
                            {myHand.map((c, i) => <PlayingCard key={i} card={c} />)}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                        {gameState?.phase === 'waiting' && isHost && (
                            <button onClick={startGame}
                                className="px-8 py-3 rounded-xl font-black tracking-widest text-sm transition-all"
                                style={{ background: 'linear-gradient(135deg,#d4a847,#b8912e)', color: '#0a0805' }}>
                                START GAME
                            </button>
                        )}

                        {isPlaying && isMyTurn && (
                            <>
                                {/* See cards */}
                                {me?.isBlind && (
                                    <button onClick={seeCards}
                                        className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                                        style={{ background: '#1e40af20', border: '1px solid #3b82f640', color: '#60a5fa' }}>
                                        SEE CARDS
                                    </button>
                                )}

                                {/* Chaal */}
                                <div className="flex items-center gap-2">
                                    <input type="number" value={chaalAmt} min={10} step={10}
                                        onChange={e => setChaalAmt(+e.target.value)}
                                        className="w-20 px-2 py-2 rounded-lg text-sm text-white outline-none"
                                        style={{ background: '#ffffff0a', border: '1px solid #ffffff15', fontFamily: 'inherit' }} />
                                    <button onClick={chaal}
                                        className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                                        style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', color: 'white' }}>
                                        CHAAL ₹{chaalAmt}
                                    </button>
                                </div>

                                {/* Show */}
                                {!me?.isBlind && (
                                    <button onClick={show}
                                        className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                                        style={{ background: 'linear-gradient(135deg,#d4a847,#b8912e)', color: '#0a0805' }}>
                                        SHOW
                                    </button>
                                )}

                                {/* Fold */}
                                <button onClick={fold}
                                    className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                                    style={{ background: '#7f1d1d20', border: '1px solid #f8717140', color: '#f87171' }}>
                                    FOLD
                                </button>
                            </>
                        )}

                        {isPlaying && !isMyTurn && (
                            <div className="text-sm text-white/30 tracking-widest animate-pulse">
                                Waiting for {gameState?.players?.find(p => p.id === gameState.currentTurnId)?.name}...
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Activity log ── */}
                <div className="w-56 rounded-xl flex flex-col"
                    style={{ background: '#0c1322', border: '1px solid #ffffff08' }}>
                    <div className="px-4 py-3 text-xs tracking-widest text-white/30"
                        style={{ borderBottom: '1px solid #ffffff08' }}>ACTIVITY</div>
                    <div ref={logRef} className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1.5"
                        style={{ maxHeight: '400px' }}>
                        {log.map(l => (
                            <p key={l.id} className="text-xs text-white/50 leading-relaxed">{l.msg}</p>
                        ))}
                    </div>
                </div>
            </div>

            {/* Gameover overlay */}
            {gameover && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="rounded-2xl p-8 text-center max-w-sm w-full mx-4"
                        style={{ background: '#0c1322', border: '1px solid #d4a84740' }}>
                        <div className="text-5xl mb-4">🏆</div>
                        <h2 className="text-2xl font-black mb-1" style={{ color: '#d4a847' }}>{gameover.winnerName}</h2>
                        <p className="text-white/50 text-sm mb-2">WINS ₹{gameover.pot}</p>
                        <p className="text-white/30 text-xs mb-6 tracking-widest">{gameover.handName}</p>
                        <div className="flex flex-col gap-2">
                            {gameover.players?.map(p => (
                                <div key={p.id} className="flex items-center justify-between text-sm px-3 py-1.5 rounded-lg"
                                    style={{ background: '#ffffff08' }}>
                                    <span className={p.id === gameover.winnerId ? 'text-yellow-400 font-bold' : 'text-white/50'}>
                                        {p.name}
                                    </span>
                                    <div className="flex gap-2 items-center">
                                        {p.hand?.map((c, i) => <span key={i} style={{ color: SUIT_COLOR[c.suit] }}>{c.rank}{c.suit}</span>)}
                                    </div>
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