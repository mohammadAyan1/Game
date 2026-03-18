import { useState, useEffect } from 'react'
import { Menu, X, Wallet, User, ChevronDown, Zap } from 'lucide-react'
import { useNavigate, } from 'react-router-dom'


import { useApp } from '../context/AppContext'
const NAV = [
    { label: 'Aviator', id: 'aviator' },
    { label: 'Coin Toss', id: 'coin-toss' },
    { label: 'Color Game', id: 'color-game' },
    { label: 'Leaderboard', id: 'leaderboard' },
]

export default function Header() {
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [active, setActive] = useState('aviator')

    const { coin } = useApp();


    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 12)
        window.addEventListener('scroll', fn)
        return () => window.removeEventListener('scroll', fn)
    }, [])


    return (
        <>
            {/* Top shimmer line */}
            <div className="fixed top-0 left-0 right-0 h-px z-50 pointer-events-none"
                style={{ background: 'linear-gradient(90deg,transparent 5%,#8B6914 30%,#D4A847 50%,#8B6914 70%,transparent 95%)' }} />

            <header
                className="sticky top-0 w-full z-40 transition-all duration-300"
                style={{
                    background: scrolled ? '#0A080599' : '#0A0805',
                    backdropFilter: scrolled ? 'blur(16px)' : 'none',
                    borderBottom: '1px solid #D4A84720',
                    boxShadow: scrolled ? '0 8px 40px #00000080' : 'none',
                    fontFamily: "'Space Mono', monospace",
                }}
            >
                {/* Grid bg */}
                <div className="absolute inset-0 pointer-events-none opacity-60"
                    style={{
                        backgroundImage: 'linear-gradient(#D4A84706 1px,transparent 1px),linear-gradient(90deg,#D4A84706 1px,transparent 1px)',
                        backgroundSize: '44px 44px',
                    }} />

                <div className="relative max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between h-[66px]">

                        {/* Logo */}
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-3 cursor-pointer bg-transparent border-none"
                        >
                            <div className="relative flex-shrink-0">
                                <svg width="38" height="38" viewBox="0 0 38 38">
                                    <polygon points="19,1 37,19 19,37 1,19"
                                        fill="none" stroke="#D4A847" strokeWidth="1.5" />
                                    <polygon points="19,8 30,19 19,30 8,19"
                                        fill="#D4A84720" stroke="#D4A847" strokeWidth="0.75" />
                                    <text x="19" y="23" textAnchor="middle"
                                        fontSize="10" fontWeight="700" fill="#D4A847"
                                        fontFamily="'Cinzel',serif">GP</text>
                                </svg>
                            </div>
                            <div className="flex flex-col gap-0.5 leading-none text-left">
                                <span className="font-cinzel shimmer-text"
                                    style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '6px' }}>
                                    GAMEPLAY
                                </span>
                                <span style={{ fontSize: '8px', letterSpacing: '4px', color: '#D4A84755' }}>
                                    PREMIUM GAMING
                                </span>
                            </div>
                        </button>

                        {/* Desktop nav */}
                        <nav className="hidden md:flex items-center gap-1">
                            {NAV.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActive(item.id)}
                                    className="relative px-4 py-2 bg-transparent border-none cursor-pointer transition-all duration-200"
                                    style={{
                                        color: active === item.id ? '#D4A847' : '#D4A84755',
                                        fontSize: '10px',
                                        letterSpacing: '2px',
                                        fontWeight: active === item.id ? 700 : 400,
                                        fontFamily: "'Space Mono',monospace",
                                    }}
                                    onMouseEnter={e => { if (active !== item.id) e.currentTarget.style.color = '#D4A84788' }}
                                    onMouseLeave={e => { if (active !== item.id) e.currentTarget.style.color = '#D4A84755' }}
                                >
                                    {item.label}
                                    {active === item.id && (
                                        <span className="absolute bottom-0 left-3 right-3 h-px"
                                            style={{ background: 'linear-gradient(90deg,transparent,#D4A847,transparent)' }} />
                                    )}
                                </button>
                            ))}
                        </nav>

                        {/* Right controls */}
                        <div className="hidden md:flex items-center gap-3">
                            {/* Wallet */}
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg"
                                style={{ background: '#D4A84710', border: '1px solid #D4A84728' }}>
                                <Wallet size={14} color="#D4A847" />
                                <span style={{ color: '#D4A847', fontSize: '13px', fontWeight: 700, letterSpacing: '0.5px' }}>
                                    {coin}
                                </span>
                            </div>

                            {/* Deposit */}
                            <button className="gold-btn" style={{ width: 'auto', padding: '9px 22px', fontSize: '10px', letterSpacing: '2.5px' }} onClick={() => navigate("/deposit")}>
                                DEPOSIT
                            </button>

                            {/* Login */}
                            <button
                                onClick={() => navigate('/login')}
                                className="px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer"
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #D4A84730',
                                    color: '#D4A84790',
                                    fontSize: '10px',
                                    letterSpacing: '2px',
                                    fontFamily: "'Space Mono',monospace",
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4A84755'; e.currentTarget.style.color = '#D4A847' }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#D4A84730'; e.currentTarget.style.color = '#D4A84790' }}
                            >
                                LOGIN
                            </button>

                            {/* Avatar */}
                            <button
                                className="flex items-center justify-center rounded-full cursor-pointer transition-all duration-200"
                                style={{ width: '38px', height: '38px', background: '#D4A84712', border: '1px solid #D4A84730' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4A84755'; e.currentTarget.style.background = '#D4A84720' }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#D4A84730'; e.currentTarget.style.background = '#D4A84712' }}
                            >
                                <User size={15} color="#D4A847" />
                            </button>
                        </div>

                        {/* Mobile burger */}
                        <button
                            onClick={() => setOpen(!open)}
                            className="md:hidden bg-transparent border-none cursor-pointer"
                            style={{ color: '#D4A847' }}
                        >
                            {open ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>

                {/* Mobile drawer */}
                <div
                    className="md:hidden overflow-hidden transition-all duration-300"
                    style={{
                        maxHeight: open ? '380px' : '0px',
                        borderTop: open ? '1px solid #D4A84718' : 'none',
                        background: '#070604',
                    }}
                >
                    <div className="px-6 py-4 flex flex-col gap-1">
                        {NAV.map(item => (
                            <button key={item.id}
                                onClick={() => { setActive(item.id); setOpen(false) }}
                                className="text-left py-3 bg-transparent border-none cursor-pointer transition-colors duration-200"
                                style={{
                                    color: active === item.id ? '#D4A847' : '#D4A84755',
                                    fontSize: '10px',
                                    letterSpacing: '2px',
                                    fontWeight: active === item.id ? 700 : 400,
                                    fontFamily: "'Space Mono',monospace",
                                    borderBottom: '1px solid #D4A84710',
                                }}
                            >
                                {active === item.id && <span style={{ color: '#D4A847', marginRight: '10px' }}>✦</span>}
                                {item.label}
                            </button>
                        ))}
                        <div className="flex gap-3 mt-4">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg flex-1 justify-center"
                                style={{ background: '#D4A84710', border: '1px solid #D4A84728' }}>
                                <Wallet size={14} color="#D4A847" />
                                <span style={{ color: '#D4A847', fontSize: '12px', fontWeight: 700 }}>₹1,200</span>
                            </div>
                            <button
                                onClick={() => { navigate('/login'); setOpen(false) }}
                                className="gold-btn flex-1" style={{ padding: '10px', fontSize: '10px', letterSpacing: '2px' }}>
                                LOGIN
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom accent */}
                <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
                    style={{ background: 'linear-gradient(90deg,transparent 5%,#8B691440 30%,#D4A84725 50%,#8B691440 70%,transparent 95%)' }} />
            </header>
        </>
    )
}