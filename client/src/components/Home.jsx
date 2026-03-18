import { useState } from 'react'
import { TrendingUp, Coins, Palette, Dices, Trophy, Zap, Users, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// ── Game data ────────────────────────────────────────────────────────────────
const GAMES = [
    {
        id: 'aviator',
        title: 'AVIATOR',
        tagline: 'Watch the multiplier fly',
        desc: 'Cash out before the plane crashes. The higher it flies, the bigger your win.',
        icon: '✈',
        badge: 'LIVE',
        badgeColor: '#22c55e',
        players: '2.4K',
        multiplier: '12.8×',
        color: '#D4A847',
        hot: true,
        url: "/aviator"
    },
    {
        id: 'coin-toss',
        title: 'COIN TOSS',
        tagline: 'Heads or tails',
        desc: 'A classic wager refined for the elite. 50/50 odds, double or nothing.',
        icon: '🪙',
        badge: 'NEW',
        badgeColor: '#D4A847',
        players: '890',
        multiplier: '2×',
        color: '#F0C96A',
        hot: false,
        url: "/"
    },
    {
        id: 'color-game',
        title: 'COLOR GAME',
        tagline: 'Pick your hue, pick your fate',
        desc: 'Choose a color, place your bet, and let the wheel decide your destiny.',
        icon: '🎨',
        badge: 'HOT',
        badgeColor: '#ef4444',
        players: '1.1K',
        multiplier: '5×',
        color: '#C084FC',
        hot: true,
        url: "/"
    },
    {
        id: 'dice',
        title: 'DICE ROYAL',
        tagline: 'Roll the bones',
        desc: 'Predict the outcome. High risk, high reward with multipliers up to 30×.',
        icon: '🎲',
        badge: 'POPULAR',
        badgeColor: '#3b82f6',
        players: '654',
        multiplier: '30×',
        color: '#60a5fa',
        hot: false,
        url: "/"
    },
    {
        id: 'roulette',
        title: 'ROULETTE',
        tagline: 'The wheel of fortune',
        desc: 'The iconic casino classic, reimagined for the digital age.',
        icon: '🎰',
        badge: 'VIP',
        badgeColor: '#a855f7',
        players: '445',
        multiplier: '36×',
        color: '#a855f7',
        hot: false,
        url: "/"

    },
    {
        id: 'mines',
        title: 'MINES',
        tagline: 'Navigate the minefield',
        desc: 'Reveal tiles and multiply your bet — but one mine ends it all.',
        icon: '💣',
        badge: 'NEW',
        badgeColor: '#D4A847',
        players: '320',
        multiplier: '100×',
        color: '#f97316',
        hot: false,
        url: "/"

    },
]

const STATS = [
    { label: 'Active Players', value: '12,847', icon: <Users size={16} />, sub: '+234 today' },
    { label: 'Total Paid Out', value: '₹4.2 Cr', icon: <TrendingUp size={16} />, sub: 'This month' },
    { label: 'Biggest Win', value: '₹98,400', icon: <Star size={16} />, sub: 'Yesterday' },
    { label: 'Games Live', value: '6', icon: <Zap size={16} />, sub: 'All running' },
]

// ── Decorative diamond SVG ────────────────────────────────────────────────────
function Diamond({ size = 20, opacity = 0.4 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
            <polygon points="10,1 19,10 10,19 1,10"
                fill="none" stroke="#D4A847" strokeWidth="1" opacity={opacity} />
            <polygon points="10,5 15,10 10,15 5,10"
                fill="#D4A84718" stroke="#D4A847" strokeWidth="0.5" opacity={opacity} />
        </svg>
    )
}

// ── Game Card ─────────────────────────────────────────────────────────────────
function GameCard({ game, idx, navigate }) {
    const [hovered, setHovered] = useState(false)

    return (
        <div
            className="game-card p-6 flex flex-col gap-4 float-up"
            style={{
                animationDelay: `${0.05 + idx * 0.07}s`,
                boxShadow: hovered
                    ? `0 24px 60px #00000090, 0 0 40px ${game.color}18`
                    : '0 4px 24px #00000060',
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => navigate(game?.url)}
        >
            {/* Top row */}
            <div className="flex items-start justify-between">
                {/* Icon */}
                <div
                    className="flex items-center justify-center rounded-xl text-2xl transition-all duration-300"
                    style={{
                        width: '52px',
                        height: '52px',
                        background: `${game.color}15`,
                        border: `1px solid ${game.color}30`,
                        transform: hovered ? 'scale(1.08)' : 'scale(1)',
                        boxShadow: hovered ? `0 0 24px ${game.color}30` : 'none',
                    }}
                >
                    {game.icon}
                </div>

                {/* Badge */}
                <span
                    className="px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest"
                    style={{
                        background: `${game.badgeColor}20`,
                        color: game.badgeColor,
                        border: `1px solid ${game.badgeColor}40`,
                        fontFamily: "'Space Mono',monospace",
                    }}
                >
                    {game.badge}
                </span>
            </div>

            {/* Title + tagline */}
            <div>
                <h3
                    className="font-cinzel mb-1"
                    style={{ fontSize: '15px', fontWeight: 700, color: '#D4A847', letterSpacing: '2px' }}
                >
                    {game.title}
                </h3>
                <p style={{ fontSize: '10px', color: '#D4A84760', letterSpacing: '1px' }}>
                    {game.tagline}
                </p>
            </div>

            {/* Description */}
            <p style={{ fontSize: '12px', color: '#D4A84875', lineHeight: 1.7, flexGrow: 1 }}>
                {game.desc}
            </p>

            {/* Stats row */}
            <div className="divider-gold" />
            <div className="flex items-center justify-between">
                <div>
                    <div style={{ fontSize: '9px', color: '#D4A84755', letterSpacing: '2px' }}>PLAYERS</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#D4A84799' }}>
                        {game.players}
                    </div>
                </div>
                <div className="text-right">
                    <div style={{ fontSize: '9px', color: '#D4A84755', letterSpacing: '2px' }}>MAX WIN</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: game.color, fontFamily: "'Cinzel',serif" }}>
                        {game.multiplier}
                    </div>
                </div>
            </div>

            {/* Play button */}
            <button
                className="w-full py-3 rounded-lg font-bold tracking-widest transition-all duration-250"
                style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: '10px',
                    letterSpacing: '3px',
                    border: `1px solid ${game.color}40`,
                    background: hovered ? `${game.color}18` : `${game.color}0C`,
                    color: game.color,
                    cursor: 'pointer',
                    boxShadow: hovered ? `0 0 24px ${game.color}25` : 'none',
                }}
            >
                PLAY NOW
            </button>
        </div>
    )
}

// ── Home Page ─────────────────────────────────────────────────────────────────
export default function Home() {

    const navigate = useNavigate()

    return (
        <main style={{ background: '#070604', minHeight: '100vh' }}>

            {/* ── Ambient layers ── */}
            <div className="fixed inset-0 pointer-events-none" style={{
                background: 'radial-gradient(ellipse 70% 50% at 50% 20%,#D4A84710 0%,transparent 65%)',
                zIndex: 0,
            }} />
            <div className="fixed inset-0 pointer-events-none" style={{
                backgroundImage: 'linear-gradient(#D4A84706 1px,transparent 1px),linear-gradient(90deg,#D4A84706 1px,transparent 1px)',
                backgroundSize: '44px 44px',
                zIndex: 0,
            }} />

            <div className="relative z-10">

                {/* ══ Hero ══════════════════════════════════════════════════════════ */}
                <section className="relative flex flex-col items-center justify-center text-center px-6 pt-20 pb-16 overflow-hidden">

                    {/* Rotating outer diamond decoration */}
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none"
                        style={{ animation: 'rotateDiamond 24s linear infinite', opacity: 0.08 }}>
                        <svg width="500" height="500" viewBox="0 0 500 500">
                            <polygon points="250,10 490,250 250,490 10,250"
                                fill="none" stroke="#D4A847" strokeWidth="1" />
                            <polygon points="250,80 420,250 250,420 80,250"
                                fill="none" stroke="#D4A847" strokeWidth="0.5" />
                        </svg>
                    </div>

                    {/* Eyebrow */}
                    <div className="flex items-center gap-3 mb-6 float-up float-up-1">
                        <Diamond size={14} />
                        <span style={{ fontSize: '10px', letterSpacing: '5px', color: '#D4A84770' }}>
                            PREMIUM GAMING PLATFORM
                        </span>
                        <Diamond size={14} />
                    </div>

                    {/* Main headline */}
                    <h1
                        className="font-cinzel shimmer-text float-up float-up-2"
                        style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 900, letterSpacing: '4px', lineHeight: 1.1, maxWidth: '800px' }}
                    >
                        WHERE FORTUNE
                        <br />
                        MEETS SKILL
                    </h1>

                    <p
                        className="mt-6 float-up float-up-3"
                        style={{ fontSize: '14px', color: '#D4A84870', maxWidth: '480px', lineHeight: 1.8, letterSpacing: '0.5px' }}
                    >
                        Enter the most refined gaming arena. Real-time multipliers, instant payouts,
                        and the thrill of elite competition.
                    </p>

                    {/* CTA buttons */}
                    <div className="flex flex-wrap gap-4 mt-10 float-up float-up-4">
                        <button
                            onClick={() => navigate('/register')}
                            className="gold-btn"
                            style={{ width: 'auto', padding: '14px 44px', fontSize: '11px', letterSpacing: '3px' }}
                        >
                            START PLAYING
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-10 py-3.5 rounded-lg transition-all duration-200 cursor-pointer"
                            style={{
                                background: 'transparent',
                                border: '1px solid #D4A84730',
                                color: '#D4A84790',
                                fontSize: '11px',
                                letterSpacing: '3px',
                                fontFamily: "'Space Mono',monospace",
                                fontWeight: 700,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4A84760'; e.currentTarget.style.color = '#D4A847' }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#D4A84730'; e.currentTarget.style.color = '#D4A84790' }}
                        >
                            SIGN IN
                        </button>
                    </div>

                    {/* Trust badges */}
                    <div className="flex flex-wrap gap-6 mt-12 float-up float-up-5">
                        {['Instant Withdrawal', 'SSL Secured', '24/7 Support', 'Provably Fair'].map(t => (
                            <div key={t} className="flex items-center gap-2">
                                <span style={{ color: '#D4A847', fontSize: '10px' }}>✦</span>
                                <span style={{ fontSize: '10px', color: '#D4A84760', letterSpacing: '1px' }}>{t}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Divider */}
                <div className="divider-gold mx-6" />

                {/* ══ Stats Bar ══════════════════════════════════════════════════════ */}
                <section className="max-w-7xl mx-auto px-6 py-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {STATS.map((s, i) => (
                            <div
                                key={s.label}
                                className="rounded-xl p-5 float-up"
                                style={{
                                    background: 'linear-gradient(145deg,#0E0B08,#090705)',
                                    border: '1px solid #D4A84720',
                                    animationDelay: `${0.1 + i * 0.07}s`,
                                }}
                            >
                                <div className="flex items-center gap-2 mb-2" style={{ color: '#D4A84760' }}>
                                    {s.icon}
                                    <span style={{ fontSize: '9px', letterSpacing: '2px' }}>{s.label}</span>
                                </div>
                                <div className="font-cinzel" style={{ fontSize: '22px', fontWeight: 700, color: '#D4A847', letterSpacing: '1px' }}>
                                    {s.value}
                                </div>
                                <div style={{ fontSize: '9px', color: '#D4A84750', marginTop: '4px', letterSpacing: '1px' }}>
                                    {s.sub}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ══ Games Grid ═════════════════════════════════════════════════════ */}
                <section className="max-w-7xl mx-auto px-6 pb-20">
                    {/* Section header */}
                    <div className="flex items-center gap-4 mb-10">
                        <Diamond size={18} />
                        <div>
                            <h2 className="font-cinzel" style={{ fontSize: '22px', fontWeight: 700, color: '#D4A847', letterSpacing: '4px' }}>
                                CHOOSE YOUR GAME
                            </h2>
                            <p style={{ fontSize: '10px', color: '#D4A84760', letterSpacing: '2px', marginTop: '4px' }}>
                                SIX GAMES, INFINITE POSSIBILITIES
                            </p>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {GAMES.map((game, idx) => (
                            <GameCard key={game.id} game={game} navigate={navigate} idx={idx} />
                        ))}
                    </div>
                </section>

                {/* ══ Bottom CTA Banner ══════════════════════════════════════════════ */}
                <section
                    className="mx-6 mb-12 rounded-2xl p-12 flex flex-col items-center text-center relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(160deg,#0E0B08,#100D08)',
                        border: '1px solid #D4A84728',
                        boxShadow: '0 0 80px #D4A84710 inset',
                    }}
                >
                    {/* Corner diamonds */}
                    <div className="absolute top-4 left-4 opacity-30"><Diamond size={24} /></div>
                    <div className="absolute top-4 right-4 opacity-30"><Diamond size={24} /></div>
                    <div className="absolute bottom-4 left-4 opacity-30"><Diamond size={24} /></div>
                    <div className="absolute bottom-4 right-4 opacity-30"><Diamond size={24} /></div>

                    <div className="flex items-center gap-3 mb-4">
                        <Diamond size={14} />
                        <span style={{ fontSize: '9px', letterSpacing: '5px', color: '#D4A84770' }}>NEW MEMBER OFFER</span>
                        <Diamond size={14} />
                    </div>

                    <h2 className="font-cinzel shimmer-text" style={{ fontSize: 'clamp(1.5rem,4vw,2.8rem)', fontWeight: 900, letterSpacing: '3px' }}>
                        ₹500 WELCOME BONUS
                    </h2>

                    <p className="mt-4 max-w-md" style={{ fontSize: '13px', color: '#D4A84870', lineHeight: 1.8 }}>
                        Register today and receive a generous welcome bonus.
                        No complicated conditions — just play and win.
                    </p>

                    <button
                        onClick={() => navigate('/register')}
                        className="gold-btn mt-8"
                        style={{ width: 'auto', padding: '14px 52px', fontSize: '11px', letterSpacing: '3px' }}
                    >
                        CLAIM BONUS
                    </button>
                </section>

                {/* Footer strip */}
                <div className="divider-gold mx-0 mb-0" />
                <footer className="py-6 text-center" style={{ fontSize: '10px', color: '#D4A84740', letterSpacing: '2px' }}>
                    ✦ &nbsp; GAMEPLAY PREMIUM &nbsp; · &nbsp; PLAY RESPONSIBLY &nbsp; · &nbsp; 18+ &nbsp; ✦
                </footer>
            </div>
        </main>
    )
}