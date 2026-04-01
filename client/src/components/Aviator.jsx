

import { useEffect, useState, useRef, useCallback } from "react"
import { io } from "socket.io-client"
import { useApp } from "../context/AppContext"
import { Check } from 'lucide-react';

const socket = io(import.meta.env.VITE_BACKEND_MAIN_URL)

// ── helpers ───────────────────────────────────────────────────────────────────
const W = 700, H = 340
const PAD = { left: 52, bottom: 48, right: 24, top: 24 }
const INNER_W = W - PAD.left - PAD.right
const INNER_H = H - PAD.top - PAD.bottom


// New maximum multiplier (crash point capped at 5)
const MAX_MULTIPLIER = 5


function mToXY(m) {
    // const t = Math.min((m - 1) / 9, 1)
    // t ranges from 0 (m=0) to 1 (m=MAX_MULTIPLIER)
    const t = Math.min(m / MAX_MULTIPLIER, 1)
    const x = PAD.left + t * INNER_W
    const easedT = Math.pow(t, 0.55)
    const y = H - PAD.bottom - easedT * INNER_H
    return { x, y }
}

function buildPath(pts) {
    if (pts.length < 2) return ""
    let d = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1], cur = pts[i]
        const cx = (prev.x + cur.x) / 2
        d += ` C ${cx} ${prev.y}, ${cx} ${cur.y}, ${cur.x} ${cur.y}`
    }
    return d
}

const X_TICKS = [0, 1, 2, 3, 4, 5, 6].map(i => ({
    label: `${i * 10}s`,
    x: PAD.left + (i / 6) * INNER_W,
}))

const Y_TICKS = [1, 2, 3, 5, 10].map(v => ({
    label: `${v}x`,
    // y: H - PAD.bottom - Math.pow(Math.min((v - 1) / 9, 1), 0.55) * INNER_H,
    y: H - PAD.bottom - Math.pow(Math.min(v / MAX_MULTIPLIER, 1), 0.55) * INNER_H,
}))

// ── Gold palette ──────────────────────────────────────────────────────────────
const GOLD = "#D4A847"
const GOLD_BRIGHT = "#F0C96A"
const GOLD_DIM = "#8B6914"
const GOLD_GLOW = "#D4A84760"
const RED_CRASH = "#C0392B"

// ── API helper ────────────────────────────────────────────────────────────────
async function saveGameResult({ coins, type, game = "aviator" }) {
    try {


        console.log(game, "this is the game");


        const res = await fetch(
            `${import.meta.env.VITE_BACKEND_MAIN_URL}/api/wallet/save-game-result`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",        // sends cookie (JWT)
                body: JSON.stringify({ coins, type, game: game || "aviator" }),
            }
        )
        const data = await res.json()

        return data
    } catch (err) {
        console.error("saveGameResult error:", err)
    }
}

// ── component ─────────────────────────────────────────────────────────────────
export default function Aviator() {
    const [multiplier, setMultiplier] = useState(0)
    const [crashed, setCrashed] = useState(false)
    const [cashout, setCashout] = useState(null)
    const [betAmount, setBetAmount] = useState("0")
    const [autoCashout, setAutoCashout] = useState("")
    const [showCheck, setShowCheck] = useState(false)
    const [phase, setPhase] = useState("waiting")
    const [history, setHistory] = useState([])
    const [pts, setPts] = useState([mToXY(0)])
    const crashRef = useRef(null)

    // Track whether user has an active bet this round
    // activeBetRef stores the bet amount for the current round (0 = no bet)
    const activeBetRef = useRef(0)
    // Track if user already cashed out this round (to avoid double-saving)
    const cashedOutRef = useRef(false)

    const { coin, refreshCoins } = useApp()   // 🔥 add refreshCoins in AppContext if not present

    // Inject Google Fonts once
    useEffect(() => {
        const id = "aviator-gfonts"
        if (!document.getElementById(id)) {
            const link = document.createElement("link")
            link.id = id
            link.rel = "stylesheet"
            link.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Space+Mono:wght@400;700&display=swap"
            document.head.appendChild(link)
        }
    }, [])

    // ── socket events ──────────────────────────────────────────────────────────
    useEffect(() => {
        socket.on("multiplier", ({ multiplier: m }) => {
            const num = Number(m)
            setMultiplier(num)
            setCrashed(false)
            setPhase("flying")
            setPts(prev => [...prev, mToXY(num)])

            // ── Auto cashout check ──────────────────────────────────────────
            const autoVal = parseFloat(autoCashout)
            if (
                activeBetRef.current > 0 &&
                !cashedOutRef.current &&
                !isNaN(autoVal) &&
                autoVal >= 0.1 && //1.1
                num >= autoVal
            ) {
                triggerCashout(num)
            }
        })

        socket.on("crash", async (cp) => {
            setCrashed(true)
            setPhase("crashed")
            crashRef.current = cp
            setHistory(h => [{ value: cp, id: Date.now() }, ...h.slice(0, 9)])



            const betAmountAtCrash = activeBetRef.current
            const alreadyCashed = cashedOutRef.current

            if (betAmountAtCrash > 0 && !alreadyCashed) {
                await saveGameResult({
                    coins: betAmountAtCrash,
                    type: "loss",
                    game: "aviator"
                })
            }

            // Reset round state
            activeBetRef.current = 0
            cashedOutRef.current = false
            setCashout(null)
            setShowCheck(false)

            setTimeout(() => {
                setPhase("waiting")
                setPts([mToXY(0)])
                setMultiplier(0)
            }, 2900)
        })

        return () => { socket.off("multiplier"); socket.off("crash") }
    }, [autoCashout])   // autoCashout in dep so auto-cashout always reads latest value

    // ── Cashout logic (shared by manual + auto) ────────────────────────────────
    const triggerCashout = useCallback(async (currentMultiplier) => {
        if (cashedOutRef.current) return          // already cashed out
        if (activeBetRef.current <= 0) return     // no active bet

        cashedOutRef.current = true
        // const winnings = Math.floor(activeBetRef.current * currentMultiplier)

        // const totalReturn = Math.floor(activeBetRef.current * currentMultiplier)


        const bet = activeBetRef.current
        const totalReturn = bet * currentMultiplier
        const net = totalReturn - bet   // positive = profit, negative = loss
        const profit = totalReturn - activeBetRef.current

        setCashout(currentMultiplier)


        // Determine type based on multiplier
        const type = currentMultiplier >= 1 ? "profit" : "loss"
        // The amount to store is always positive
        const coinsToSave = type === "profit" ? net : -net

        // Save PROFIT transaction
        await saveGameResult({ coins: coinsToSave, type, game: "aviator" })
        if (typeof refreshCoins === "function") refreshCoins()
    }, [])

    // ── Manual cashout button ──────────────────────────────────────────────────
    const handleCashout = useCallback(() => {
        if (phase === "flying" && activeBetRef.current > 0 && !cashedOutRef.current) {
            triggerCashout(multiplier)
        }
    }, [phase, multiplier, triggerCashout])

    // ── Place Bet (called when round starts / waiting phase) ──────────────────
    const handlePlaceBet = useCallback(() => {
        const bet = Number(betAmount)
        if (bet <= 0 || phase !== "waiting") return
        setShowCheck(true)
        activeBetRef.current = bet
        cashedOutRef.current = false
        // Optionally: deduct coins optimistically in UI here
    }, [betAmount, phase])

    // ── derived ────────────────────────────────────────────────────────────────
    const tip = mToXY(multiplier)
    const svgPath = buildPath(pts)
    const gradColor = crashed ? RED_CRASH : multiplier >= 5 ? GOLD_BRIGHT : GOLD

    const chipStyle = (v) => {
        if (v < 2) return { bg: "#2A1010", color: "#E07070", border: "#C0392B55" }
        if (v < 5) return { bg: "#1A1A08", color: GOLD, border: `${GOLD}55` }
        return { bg: "#201808", color: GOLD_BRIGHT, border: `${GOLD_BRIGHT}77` }
    }

    const inputStyle = {
        padding: "10px 14px",
        background: "#D4A84710",
        border: "1px solid #D4A84730",
        borderRadius: "8px",
        color: GOLD,
        fontSize: "15px",
        fontWeight: 700,
        fontFamily: "'Space Mono', monospace",
        outline: "none",
    }

    const labelStyle = {
        fontSize: "9px",
        letterSpacing: "3px",
        color: "#D4A84770",
        fontFamily: "'Space Mono', monospace",
    }

    const hasBet = activeBetRef.current > 0

    return (
        <div
            className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
            style={{ background: "#070604", fontFamily: "'Space Mono', monospace" }}
        >
            {/* Deep radial ambient */}
            <div className="fixed inset-0 pointer-events-none" style={{
                background: "radial-gradient(ellipse 65% 55% at 50% 65%, #D4A84710 0%, transparent 70%)"
            }} />

            {/* Subtle gold grid */}
            <div className="fixed inset-0 pointer-events-none" style={{
                backgroundImage: `
                    linear-gradient(#D4A84706 1px, transparent 1px),
                    linear-gradient(90deg, #D4A84706 1px, transparent 1px)
                `,
                backgroundSize: "44px 44px",
            }} />

            {/* Grain texture */}
            <svg className="fixed inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.045, zIndex: 0 }}>
                <filter id="grain">
                    <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
                    <feColorMatrix type="saturate" values="0" />
                </filter>
                <rect width="100%" height="100%" filter="url(#grain)" />
            </svg>

            {/* ── Main Card ── */}
            <div
                className="relative z-10 overflow-hidden"
                style={{
                    width: "780px",
                    borderRadius: "20px",
                    border: "1px solid #D4A84728",
                    background: "linear-gradient(170deg, #0E0B08 0%, #090705 55%, #0C0906 100%)",
                    boxShadow: `0 0 0 1px #D4A84715 inset, 0 50px 130px #00000095, 0 0 80px #D4A8470C`,
                }}
            >
                {/* Top shimmer line */}
                <div className="absolute top-0 left-0 right-0 h-px" style={{
                    background: `linear-gradient(90deg, transparent 5%, ${GOLD_DIM} 30%, ${GOLD} 50%, ${GOLD_DIM} 70%, transparent 95%)`
                }} />

                {/* Corner ornaments */}
                {[
                    { top: "12px", left: "12px", rotate: "0deg" },
                    { top: "12px", right: "12px", rotate: "90deg" },
                ].map((pos, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 16 16"
                        className="absolute pointer-events-none"
                        style={{ ...pos, opacity: 0.5 }}>
                        <path d="M1 8 L8 1 L15 8" fill="none" stroke={GOLD} strokeWidth="0.75" />
                        <path d="M4 8 L8 4 L12 8" fill="none" stroke={GOLD} strokeWidth="0.5" opacity="0.5" />
                    </svg>
                ))}

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 py-4"
                    style={{ borderBottom: "1px solid #D4A84718" }}>
                    <div className="flex items-center gap-3">
                        <svg width="26" height="26" viewBox="0 0 26 26" style={{ flexShrink: 0 }}>
                            <polygon points="13,1 25,13 13,25 1,13" fill="none" stroke={GOLD} strokeWidth="1.25" />
                            <polygon points="13,6 20,13 13,20 6,13" fill={GOLD} fillOpacity="0.2" stroke={GOLD} strokeWidth="0.6" />
                        </svg>
                        <span style={{
                            fontFamily: "'Cinzel', serif", fontSize: "18px", fontWeight: 900,
                            letterSpacing: "8px", color: GOLD,
                            textShadow: `0 0 24px ${GOLD_GLOW}, 0 0 50px #D4A84720`,
                        }}>
                            AVIATOR
                        </span>
                        <svg width="26" height="26" viewBox="0 0 26 26" style={{ flexShrink: 0 }}>
                            <polygon points="13,1 25,13 13,25 1,13" fill="none" stroke={GOLD} strokeWidth="1.25" />
                            <polygon points="13,6 20,13 13,20 6,13" fill={GOLD} fillOpacity="0.2" stroke={GOLD} strokeWidth="0.6" />
                        </svg>
                    </div>

                    {/* History chips */}
                    <div className="flex gap-1.5 flex-wrap justify-end" style={{ maxWidth: "460px" }}>
                        {history.map(h => {
                            const s = chipStyle(h.value)
                            return (
                                <span key={h.id} style={{
                                    padding: "3px 11px", borderRadius: "999px",
                                    fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px",
                                    background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                                }}>
                                    {Number(h.value).toFixed(2)}×
                                </span>
                            )
                        })}
                    </div>
                </div>

                {/* ── SVG Game Canvas ── */}
                <div style={{ background: "#050402", borderBottom: "1px solid #D4A84714", overflow: "hidden" }}>
                    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}
                        style={{ display: "block", width: "100%", height: "auto" }}>
                        <defs>
                            <linearGradient id="curveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor={gradColor} stopOpacity="0.1" />
                                <stop offset="100%" stopColor={gradColor} stopOpacity="1" />
                            </linearGradient>
                            <linearGradient id="fillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor={gradColor} stopOpacity="0.2" />
                                <stop offset="100%" stopColor={gradColor} stopOpacity="0.01" />
                            </linearGradient>
                            <radialGradient id="tipGlow" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor={gradColor} stopOpacity="0.45" />
                                <stop offset="100%" stopColor={gradColor} stopOpacity="0" />
                            </radialGradient>
                            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                                <feGaussianBlur stdDeviation="4" result="blur" />
                                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                            </filter>
                            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="2.5" result="blur" />
                                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                            </filter>
                            <clipPath id="canvasClip">
                                <rect x={PAD.left} y={PAD.top} width={INNER_W} height={INNER_H} />
                            </clipPath>
                        </defs>

                        {/* Grid */}
                        {Y_TICKS.map(({ y, label }) => (
                            <g key={label}>
                                <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#D4A8470A" strokeWidth="1" />
                                <text x={PAD.left - 10} y={y + 4} textAnchor="end" fill="#D4A84745"
                                    fontSize="10" fontFamily="'Space Mono', monospace">{label}</text>
                            </g>
                        ))}
                        {X_TICKS.map(({ x, label }) => (
                            <g key={label}>
                                <line x1={x} y1={PAD.top} x2={x} y2={H - PAD.bottom} stroke="#D4A8470A" strokeWidth="1" />
                                <text x={x} y={H - PAD.bottom + 16} textAnchor="middle" fill="#D4A84738"
                                    fontSize="9" fontFamily="'Space Mono', monospace">{label}</text>
                            </g>
                        ))}

                        {/* Axes */}
                        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={H - PAD.bottom} stroke="#D4A84722" strokeWidth="1" />
                        <line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom} stroke="#D4A84722" strokeWidth="1" />

                        {/* Fill below curve */}
                        {svgPath && pts.length > 1 && (
                            <path
                                d={`${svgPath} L ${tip.x} ${H - PAD.bottom} L ${PAD.left} ${H - PAD.bottom} Z`}
                                fill="url(#fillGrad)" clipPath="url(#canvasClip)"
                            />
                        )}

                        {/* Curve */}
                        {svgPath && (
                            <path d={svgPath} fill="none" stroke="url(#curveGrad)" strokeWidth="2"
                                strokeLinecap="round" filter="url(#softGlow)" clipPath="url(#canvasClip)" />
                        )}

                        {/* Plane tip */}
                        {phase !== "waiting" && (
                            <g transform={`translate(${tip.x}, ${tip.y})`} filter="url(#glow)"
                                style={{ transition: "transform 0.1s linear" }}>
                                <circle r="30" fill="url(#tipGlow)" />
                                <circle r="9" fill={gradColor} opacity="0.28" />
                                <text textAnchor="middle" dominantBaseline="middle" fontSize="20" style={{ userSelect: "none" }}>
                                    {crashed ? "💥" : "✈️"}
                                </text>
                                <line x1="0" y1="5" x2="0" y2={H - PAD.bottom - tip.y - 5}
                                    stroke={gradColor} strokeWidth="1" strokeDasharray="3 5" opacity="0.22" />
                            </g>
                        )}

                        {/* Big multiplier */}
                        <text x={W / 2} y={H / 2 - 8} textAnchor="middle" dominantBaseline="middle"
                            fontSize={crashed ? "52" : "60"} fontWeight="700" fontFamily="'Cinzel', serif"
                            fill={crashed ? RED_CRASH : gradColor} filter="url(#glow)"
                            style={{ opacity: phase === "waiting" ? 0.22 : 1, transition: "fill 0.3s, font-size 0.15s" }}>
                            {multiplier.toFixed(2)}×
                        </text>

                        {/* Status text */}
                        <text x={W / 2} y={H / 2 + 40} textAnchor="middle" fontSize="10"
                            fontFamily="'Space Mono', monospace"
                            fill={crashed ? `${RED_CRASH}99` : "#D4A84748"} letterSpacing="5">
                            {crashed ? "CRASHED" : phase === "waiting" ? "NEXT ROUND" : "FLYING"}
                        </text>

                        {/* Cashout tag */}
                        {cashout && phase === "flying" && (
                            <g transform={`translate(${W / 2}, ${H / 2 - 76})`}>
                                <rect x="-88" y="-17" width="176" height="34" rx="6"
                                    fill="#D4A84712" stroke={GOLD} strokeWidth="0.75" strokeOpacity="0.55" />
                                <text textAnchor="middle" dominantBaseline="middle" fontSize="12"
                                    fill={GOLD} fontWeight="700" fontFamily="'Space Mono', monospace">
                                    CASHED OUT {cashout.toFixed(2)}×
                                </text>
                            </g>
                        )}
                    </svg>
                </div>

                {/* ── Controls ── */}
                <div className="flex items-end gap-5 flex-wrap px-6 py-5">

                    {/* Bet Amount */}
                    <div className="flex flex-col gap-2">
                        <label style={labelStyle}>BET AMOUNT</label>
                        <div className="flex items-center gap-1.5">
                            <input
                                type="number"
                                value={betAmount}
                                onFocus={() => { if (betAmount === "0") setBetAmount("") }}
                                onChange={(e) => {
                                    let value = e.target.value
                                    if (value === "") { setBetAmount(""); return }
                                    let num = Number(value)
                                    if (isNaN(num)) return
                                    if (num > coin) num = coin
                                    if (num < 0) num = 0
                                    setBetAmount(num.toString())
                                }}
                                min="1"
                                max={coin}
                                disabled={hasBet}   // lock input while bet is active
                                style={{ ...inputStyle, width: "90px", opacity: hasBet ? 0.5 : 1 }}
                            />
                            {[5, 10, 50, 100].map(v => (
                                <button key={v}
                                    onClick={() => !hasBet && setBetAmount(String(v))}
                                    disabled={hasBet}
                                    className="transition-all duration-150"
                                    style={{
                                        padding: "10px 10px", background: "#D4A8470E",
                                        border: "1px solid #D4A84722", borderRadius: "8px",
                                        color: "#D4A84785", fontSize: "11px", cursor: hasBet ? "not-allowed" : "pointer",
                                        fontFamily: "'Space Mono', monospace", opacity: hasBet ? 0.4 : 1,
                                    }}
                                    onMouseEnter={e => {
                                        if (hasBet) return
                                        e.currentTarget.style.background = "#D4A84720"
                                        e.currentTarget.style.borderColor = "#D4A84750"
                                        e.currentTarget.style.color = GOLD
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = "#D4A8470E"
                                        e.currentTarget.style.borderColor = "#D4A84722"
                                        e.currentTarget.style.color = "#D4A84785"
                                    }}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Auto Cashout */}
                    {/* <div className="flex flex-col gap-2">
                        <label style={labelStyle}>AUTO CASHOUT</label>
                        <input
                            type="number"
                            placeholder="e.g. 2.00"
                            value={autoCashout}
                            onChange={e => setAutoCashout(e.target.value)}
                            step="0.1"
                            min="1.1"
                            style={{ ...inputStyle, width: "120px" }}
                        />
                    </div> */}

                    <div className="flex flex-col gap-2">
                        {showCheck && (<Check />)}
                    </div>

                    {/* Place Bet / Cash Out button */}
                    {phase === "waiting" ? (
                        // ── PLACE BET button (shown during waiting phase) ──
                        <button
                            onClick={handlePlaceBet}
                            disabled={Number(betAmount) <= 0 || hasBet}
                            style={{
                                marginLeft: "auto",
                                padding: "14px 40px",
                                borderRadius: "10px",
                                fontSize: "13px",
                                fontWeight: 700,
                                letterSpacing: "3px",
                                fontFamily: "'Space Mono', monospace",
                                border: "1px solid transparent",
                                minWidth: "170px",
                                transition: "all 0.2s",
                                cursor: Number(betAmount) > 0 && !hasBet ? "pointer" : "not-allowed",
                                ...(Number(betAmount) > 0 && !hasBet
                                    ? {
                                        background: `linear-gradient(135deg, #B8860B, #D4A847, #F0C96A, #D4A847, #B8860B)`,
                                        color: "#150F00",
                                        borderColor: "#F0C96A50",
                                        boxShadow: `0 0 35px #D4A84740, 0 4px 24px #00000070`,
                                    }
                                    : {
                                        background: "#D4A8470C",
                                        color: "#D4A84745",
                                        borderColor: "#D4A8471A",
                                    })
                            }}
                        >
                            {hasBet ? `✓ BET: ${activeBetRef.current}` : "PLACE BET"}
                        </button>
                    ) : (
                        // ── CASH OUT button (shown during flying/crashed phase) ──
                        <button
                            onClick={handleCashout}
                            disabled={phase !== "flying" || !!cashout || !hasBet}
                            style={{
                                marginLeft: "auto",
                                padding: "14px 40px",
                                borderRadius: "10px",
                                fontSize: "13px",
                                fontWeight: 700,
                                letterSpacing: "3px",
                                fontFamily: "'Space Mono', monospace",
                                border: "1px solid transparent",
                                minWidth: "170px",
                                transition: "all 0.2s",
                                cursor: phase === "flying" && !cashout && hasBet ? "pointer" : "not-allowed",
                                ...(phase === "flying" && !cashout && hasBet
                                    ? {
                                        background: `linear-gradient(135deg, #B8860B, #D4A847, #F0C96A, #D4A847, #B8860B)`,
                                        backgroundSize: "200% 100%",
                                        color: "#150F00",
                                        borderColor: "#F0C96A50",
                                        boxShadow: `0 0 35px #D4A84740, 0 4px 24px #00000070`,
                                    }
                                    : {
                                        background: "#D4A8470C",
                                        color: "#D4A84745",
                                        borderColor: "#D4A8471A",
                                    })
                            }}
                        >
                            {cashout
                                ? `✓  ${cashout.toFixed(2)}×`
                                : phase === "flying"
                                    ? hasBet ? "CASH OUT" : "NO BET"
                                    : "WAITING..."}
                        </button>
                    )}
                </div>

                {/* ── Win Banner ── */}
                {cashout && (
                    <div style={{
                        textAlign: "center", padding: "13px 24px",
                        background: "#D4A84708", borderTop: `1px solid #D4A84720`,
                        color: "#D4A84788", fontFamily: "'Space Mono', monospace",
                        fontSize: "12px", letterSpacing: "1px",
                    }}>
                        ✦&nbsp;&nbsp;Cashed out at&nbsp;
                        <strong style={{ color: GOLD_BRIGHT }}>{cashout.toFixed(2)}×</strong>
                        &nbsp;—&nbsp;Win:&nbsp;
                        <strong style={{ color: GOLD_BRIGHT }}>
                            ₹{Math.floor(activeBetRef.current * cashout)}
                        </strong>
                        &nbsp;&nbsp;✦
                    </div>
                )}

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-px" style={{
                    background: `linear-gradient(90deg, transparent 5%, ${GOLD_DIM} 30%, ${GOLD_DIM} 70%, transparent 95%)`
                }} />
            </div>
        </div>
    )
}