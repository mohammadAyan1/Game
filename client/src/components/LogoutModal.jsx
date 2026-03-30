import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

// ── Decorative diamond SVG ─────────────────────────────────────────────────
function OrnamentalLine() {
    return (
        <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px"
                style={{ background: 'linear-gradient(90deg,transparent,#D4A84730)' }} />
            <svg width="12" height="12" viewBox="0 0 12 12">
                <polygon points="6,1 11,6 6,11 1,6"
                    fill="#D4A84715" stroke="#D4A847" strokeWidth="0.7" />
            </svg>
            <div className="flex-1 h-px"
                style={{ background: 'linear-gradient(90deg,#D4A84730,transparent)' }} />
        </div>
    )
}

// ── Corner ornament ────────────────────────────────────────────────────────
function CornerOrn({ style }) {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16"
            className="absolute pointer-events-none"
            style={{ ...style, opacity: 0.45 }}>
            <path d="M1 8L8 1L15 8" fill="none" stroke="#D4A847" strokeWidth="0.8" />
            <path d="M4 8L8 4L12 8" fill="none" stroke="#D4A847" strokeWidth="0.5" opacity="0.5" />
        </svg>
    )
}

// ── Main LogoutModal ───────────────────────────────────────────────────────
export default function LogoutModal({ isOpen, onClose }) {
    const navigate = useNavigate()
    const { logout } = useApp()         // apne AppContext ka logout function
    const [loading, setLoading] = useState(false)

    // Backdrop click se close
    const handleBackdrop = (e) => {
        if (e.target === e.currentTarget) onClose()
    }

    // YES — logout API call
    const handleLogout = async () => {
        setLoading(true)
        try {
            // Agar tumhara logout API call hai to yahan karo
            // await fetch('/api/auth/logout', { method: 'POST', ... })

            // Context se logout (token clear, user null set)
            logout()

            onClose()
            navigate('/')
        } catch (err) {
            console.error('[logout error]', err)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        // ── Backdrop ──────────────────────────────────────────────────────────
        <div
            onClick={handleBackdrop}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
            style={{
                background: 'rgba(4,3,2,0.82)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                fontFamily: "'Space Mono',monospace",
                animation: 'gpFadeIn 0.2s ease forwards',
            }}
        >
            {/* ── Modal Card ── */}
            <div
                className="relative w-full overflow-hidden"
                style={{
                    maxWidth: '360px',
                    borderRadius: '18px',
                    border: '1px solid #D4A84728',
                    background: 'linear-gradient(160deg,#0E0B08 0%,#090705 100%)',
                    boxShadow: '0 0 0 1px #D4A84710 inset, 0 40px 100px #000000A0, 0 0 60px #D4A8470A',
                    animation: 'gpSlideUp 0.25s cubic-bezier(0.16,1,0.3,1) forwards',
                }}
            >
                {/* Top shimmer */}
                <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                    style={{ background: 'linear-gradient(90deg,transparent 5%,#8B6914 25%,#D4A847 50%,#8B6914 75%,transparent 95%)' }} />

                {/* Corner ornaments */}
                <CornerOrn style={{ top: '12px', left: '12px' }} />
                <CornerOrn style={{ top: '12px', right: '12px' }} />

                <div className="px-8 py-8">

                    {/* ── Icon ── */}
                    <div className="flex justify-center mb-5">
                        <svg width="58" height="58" viewBox="0 0 58 58"
                            style={{ animation: 'pulseGold 3s ease-in-out infinite' }}>
                            <polygon points="29,3 55,29 29,55 3,29"
                                fill="#D4A84708" stroke="#D4A847" strokeWidth="1.2" />
                            <polygon points="29,12 46,29 29,46 12,29"
                                fill="#D4A84705" stroke="#D4A847" strokeWidth="0.6" />
                            {/* Power icon inside diamond */}
                            <circle cx="29" cy="29" r="9"
                                fill="none" stroke="#D4A847" strokeWidth="1.2"
                                strokeDasharray="38 14" strokeDashoffset="-3" />
                            <line x1="29" y1="20" x2="29" y2="27"
                                stroke="#D4A847" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                    </div>

                    {/* ── Header ── */}
                    <div className="text-center mb-1">
                        <div style={{ fontSize: '9px', letterSpacing: '5px', color: '#D4A84750', marginBottom: '8px' }}>
                            CONFIRM ACTION
                        </div>
                        <h2 className="font-cinzel shimmer-text"
                            style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '4px' }}>
                            LOGOUT
                        </h2>
                    </div>

                    <OrnamentalLine />

                    {/* ── Message ── */}
                    <p style={{
                        textAlign: 'center',
                        fontSize: '11px',
                        color: '#D4A84760',
                        lineHeight: 1.9,
                        letterSpacing: '0.5px',
                        marginBottom: '24px',
                    }}>
                        Are you sure you want to logout<br />
                        from your GamePlay account?
                    </p>

                    {/* ── Buttons ── */}
                    <div className="flex gap-3">

                        {/* YES — red accent */}
                        <button
                            onClick={handleLogout}
                            disabled={loading}
                            className="flex-1 py-3 rounded-lg font-bold cursor-pointer transition-all duration-200"
                            style={{
                                fontFamily: "'Space Mono',monospace",
                                fontSize: '10px',
                                letterSpacing: '2.5px',
                                background: loading ? '#ef444408' : '#ef444412',
                                border: '1px solid #ef444435',
                                color: '#ef4444',
                                opacity: loading ? 0.6 : 1,
                            }}
                            onMouseEnter={e => {
                                if (!loading) {
                                    e.currentTarget.style.background = '#ef444422'
                                    e.currentTarget.style.borderColor = '#ef444455'
                                    e.currentTarget.style.boxShadow = '0 0 20px #ef444415'
                                }
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = '#ef444412'
                                e.currentTarget.style.borderColor = '#ef444435'
                                e.currentTarget.style.boxShadow = 'none'
                            }}
                        >
                            {loading ? 'LOGGING OUT...' : 'YES, LOGOUT'}
                        </button>

                        {/* CANCEL — gold accent */}
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 py-3 rounded-lg font-bold cursor-pointer transition-all duration-200"
                            style={{
                                fontFamily: "'Space Mono',monospace",
                                fontSize: '10px',
                                letterSpacing: '2.5px',
                                background: '#D4A84710',
                                border: '1px solid #D4A84730',
                                color: '#D4A847',
                                opacity: loading ? 0.5 : 1,
                            }}
                            onMouseEnter={e => {
                                if (!loading) {
                                    e.currentTarget.style.background = '#D4A84720'
                                    e.currentTarget.style.borderColor = '#D4A84750'
                                    e.currentTarget.style.boxShadow = '0 0 20px #D4A84715'
                                }
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = '#D4A84710'
                                e.currentTarget.style.borderColor = '#D4A84730'
                                e.currentTarget.style.boxShadow = 'none'
                            }}
                        >
                            CANCEL
                        </button>
                    </div>
                </div>

                {/* Bottom accent */}
                <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
                    style={{ background: 'linear-gradient(90deg,transparent 5%,#8B691440 30%,#D4A84725 50%,#8B691440 70%,transparent 95%)' }} />
            </div>

            {/* Animations */}
            <style>{`
        @keyframes gpFadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes gpSlideUp { from{opacity:0;transform:translateY(20px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
      `}</style>
        </div>
    )
}