
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Zap, Shield, Clock, CheckCircle2 } from 'lucide-react'

const PAYMENT_API = import.meta.env.VITE_BACKEND_PAYMENT_URL  //|| 'http://localhost:3001'   // payment-server
const PAY_GATEWAY = import.meta.env.VITE_FRONTEND_PAYMENT_URL //'http://localhost:5174'   // payment-gateway website

const G = { gold: '#D4A847', bright: '#F0C96A', bg: '#070604', border: '#D4A84728' }

const PACKAGES = [
    { id: 1, rupees: 100, coins: 130, bonus: 30, pct: '30%', label: 'STARTER', tag: null, popular: false },
    { id: 2, rupees: 250, coins: 350, bonus: 100, pct: '40%', label: 'CLASSIC', tag: 'POPULAR', popular: true },
    { id: 3, rupees: 500, coins: 750, bonus: 250, pct: '50%', label: 'ELITE', tag: 'BEST VALUE', popular: false },
    { id: 4, rupees: 1000, coins: 1600, bonus: 600, pct: '60%', label: 'ROYAL', tag: null, popular: false },
    { id: 5, rupees: 2500, coins: 4250, bonus: 1750, pct: '70%', label: 'PLATINUM', tag: '🔥 HOT', popular: false },
    { id: 6, rupees: 5000, coins: 9000, bonus: 4000, pct: '80%', label: 'DIAMOND', tag: 'MAX BONUS', popular: false },
]

const fmt = (n) => Number(n).toLocaleString('en-IN')

function Gem({ s = 12 }) {
    return (
        <svg width={s} height={s} viewBox="0 0 12 12" style={{ flexShrink: 0 }}>
            <polygon points="6,1 11,6 6,11 1,6" fill="#D4A84718" stroke="#D4A847" strokeWidth="0.8" opacity="0.7" />
        </svg>
    )
}

function Coin({ size = 18, color = G.gold }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill={`${color}22`} stroke={color} strokeWidth="1.5" />
            <text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="700" fill={color} fontFamily="'Cinzel',serif">₵</text>
        </svg>
    )
}

export default function Deposit() {
    const navigate = useNavigate()
    const [selected, setSel] = useState(PACKAGES[1])
    const [custom, setCustom] = useState('')
    const [useCustom, setUC] = useState(false)
    const [hovered, setHov] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const amt = useCustom ? Number(custom) || 0 : selected.rupees
    const coins = useCustom ? Math.floor((Number(custom) || 0) * 1.3) : selected.coins
    const bonus = coins - amt

    const handleContinue = async () => {
        if (amt < 10) return
        setLoading(true); setError('')
        try {
            // returnUrl = ye main app ka URL hai, jahan payment ke baad wapas aana hai
            const returnUrl = window.location.origin   // e.g. http://localhost:5173

            const res = await fetch(`${PAYMENT_API}/api/txn/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: amt, coins, returnUrl }),
            })
            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Failed to create transaction')

            // Browser ko payment gateway website pe redirect karo
            // URL format: http://localhost:5174/pay?txnId=xxxx
            window.location.href = `${PAY_GATEWAY}/pay?txnId=${data.txnId}`

        } catch (err) {
            setError(err.message)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-5 py-10 relative overflow-hidden"
            style={{ background: G.bg, fontFamily: "'Space Mono',monospace" }}>

            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 40%,#D4A84712,transparent 70%)' }} />
            <div className="fixed inset-0 pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#D4A84706 1px,transparent 1px),linear-gradient(90deg,#D4A84706 1px,transparent 1px)', backgroundSize: '44px 44px' }} />
            <div className="fixed top-0 left-0 right-0 h-px z-50 pointer-events-none"
                style={{ background: 'linear-gradient(90deg,transparent 5%,#8B6914 30%,#D4A847 50%,#8B6914 70%,transparent 95%)' }} />

            {/* Card */}
            <div className="relative z-10 w-full"
                style={{
                    maxWidth: '840px', borderRadius: '20px', border: `1px solid ${G.border}`,
                    background: 'linear-gradient(160deg,#0E0B08 0%,#090705 100%)',
                    boxShadow: '0 0 0 1px #D4A84712 inset,0 50px 120px #00000095',
                    overflow: 'hidden', padding: '36px',
                }}>

                {/* Top shimmer line */}
                <div className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: 'linear-gradient(90deg,transparent 5%,#8B6914 25%,#D4A847 50%,#8B6914 75%,transparent 95%)' }} />

                {/* Back button */}
                <button onClick={() => navigate('/')}
                    className="flex items-center gap-2 bg-transparent border-none cursor-pointer mb-6"
                    style={{ color: '#D4A84770', fontSize: '10px', letterSpacing: '2px' }}
                    onMouseEnter={e => e.currentTarget.style.color = G.gold}
                    onMouseLeave={e => e.currentTarget.style.color = '#D4A84770'}>
                    <ArrowLeft size={13} /> BACK TO HOME
                </button>

                {/* Header */}
                <div className="flex items-center justify-center gap-3 mb-3">
                    <Gem /><span style={{ fontSize: '9px', letterSpacing: '5px', color: '#D4A84760' }}>ADD COINS TO WALLET</span><Gem />
                </div>
                <h2 className="font-cinzel text-center shimmer-text"
                    style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 900, letterSpacing: '4px', marginBottom: '6px' }}>
                    DEPOSIT
                </h2>
                <p className="text-center" style={{ fontSize: '11px', color: '#D4A84770', letterSpacing: '2px', marginBottom: '32px' }}>
                    DEPOSIT REAL MONEY · RECEIVE BONUS COINS · PLAY INSTANTLY
                </p>

                {/* ── Packages grid ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '14px', marginBottom: '24px' }}>
                    {PACKAGES.map((pkg, i) => {
                        const isActive = !useCustom && selected.id === pkg.id
                        const isHover = hovered === pkg.id
                        const c = pkg.label === 'DIAMOND' ? '#60d4f0' : pkg.popular ? G.bright : G.gold
                        return (
                            <button key={pkg.id}
                                onClick={() => { setSel(pkg); setUC(false) }}
                                onMouseEnter={() => setHov(pkg.id)}
                                onMouseLeave={() => setHov(null)}
                                style={{
                                    position: 'relative', borderRadius: '14px',
                                    border: `1px solid ${isActive ? c + '70' : G.border}`,
                                    background: isActive ? `linear-gradient(160deg,${c}12,${c}06)` : 'linear-gradient(160deg,#0E0B08,#090705)',
                                    padding: '20px 18px', cursor: 'pointer',
                                    transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
                                    boxShadow: isActive ? `0 0 30px ${c}20,0 8px 32px #00000070` : '0 4px 20px #00000050',
                                    transform: isActive || isHover ? 'translateY(-4px)' : 'translateY(0)',
                                    textAlign: 'left', fontFamily: "'Space Mono',monospace",
                                    animationDelay: `${i * 0.06}s`,
                                }}>
                                {isActive && <div style={{ position: 'absolute', top: '12px', right: '12px', color: c }}><CheckCircle2 size={16} /></div>}
                                {pkg.tag && (
                                    <div style={{
                                        position: 'absolute', top: '-10px', left: '16px',
                                        background: pkg.popular ? `linear-gradient(135deg,#B8860B,${G.gold},${G.bright})` : `${c}22`,
                                        border: `1px solid ${c}55`, color: pkg.popular ? '#150F00' : c,
                                        fontSize: '8px', fontWeight: 700, letterSpacing: '2px',
                                        padding: '3px 10px', borderRadius: '99px',
                                    }}>{pkg.tag}</div>
                                )}
                                <div style={{ fontSize: '9px', letterSpacing: '3px', color: `${c}90`, marginBottom: '10px' }}>{pkg.label}</div>
                                <div className="font-cinzel" style={{ fontSize: '26px', fontWeight: 900, color: c, lineHeight: 1, marginBottom: '4px' }}>₹{fmt(pkg.rupees)}</div>
                                <div style={{ height: '1px', background: `linear-gradient(90deg,${c}30,transparent)`, margin: '12px 0' }} />
                                <div className="flex items-center gap-2" style={{ marginBottom: '6px' }}>
                                    <Coin size={18} color={c} />
                                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#fff', fontFamily: "'Cinzel',serif" }}>{fmt(pkg.coins)}</span>
                                    <span style={{ fontSize: '10px', color: `${c}80` }}>COINS</span>
                                </div>
                                <div style={{ fontSize: '10px', color: `${c}90`, background: `${c}10`, border: `1px solid ${c}20`, borderRadius: '6px', padding: '5px 10px', display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                    <Zap size={10} color={c} /> +{fmt(pkg.bonus)} BONUS · {pkg.pct} EXTRA
                                </div>
                            </button>
                        )
                    })}
                </div>

                {/* ── Custom amount ── */}
                <div style={{
                    borderRadius: '14px', border: `1px solid ${useCustom ? G.gold + '50' : G.border}`,
                    background: useCustom ? `${G.gold}08` : '#0E0B08',
                    padding: '18px 20px', marginBottom: '24px', transition: 'all 0.2s',
                }}>
                    <div style={{ fontSize: '9px', letterSpacing: '3px', color: '#D4A84770', marginBottom: '10px' }}>
                        CUSTOM AMOUNT
                    </div>
                    <div className="flex items-center gap-3">
                        <div style={{ position: 'relative', flex: 1 }}>
                            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: G.gold, fontSize: '15px', fontWeight: 700 }}>₹</span>
                            <input type="number" placeholder="Enter amount (min ₹10)"
                                value={custom} min="10"
                                onChange={e => { setCustom(e.target.value); setUC(true) }}
                                onFocus={() => setUC(true)}
                                className="gold-input"
                                style={{ paddingLeft: '32px', fontSize: '15px' }} />
                        </div>
                        {custom && Number(custom) >= 10 && (
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div style={{ fontSize: '9px', color: '#D4A84760' }}>YOU GET</div>
                                <div style={{ fontSize: '16px', fontWeight: 700, color: G.bright, fontFamily: "'Cinzel',serif" }}>
                                    {fmt(Math.floor(Number(custom) * 1.3))}
                                </div>
                                <div style={{ fontSize: '9px', color: '#D4A84770' }}>COINS</div>
                            </div>
                        )}
                    </div>
                    {useCustom && Number(custom) > 0 && Number(custom) < 10 && (
                        <p style={{ fontSize: '10px', color: '#ef4444', marginTop: '8px' }}>Minimum deposit is ₹10</p>
                    )}
                </div>

                {/* ── Summary bar ── */}
                <div style={{
                    borderRadius: '12px', background: '#D4A8470C', border: `1px solid ${G.gold}22`,
                    padding: '16px 20px', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px',
                }}>
                    <div>
                        <div style={{ fontSize: '9px', letterSpacing: '2px', color: '#D4A84760' }}>YOU PAY</div>
                        <div className="font-cinzel" style={{ fontSize: '20px', fontWeight: 700, color: G.gold }}>₹{fmt(amt)}</div>
                    </div>
                    <div style={{ fontSize: '22px', color: '#D4A84740' }}>→</div>
                    <div>
                        <div style={{ fontSize: '9px', letterSpacing: '2px', color: '#D4A84760' }}>YOU RECEIVE</div>
                        <div className="flex items-center gap-2">
                            <Coin size={20} />
                            <span className="font-cinzel" style={{ fontSize: '20px', fontWeight: 700, color: G.bright }}>{fmt(coins)} COINS</span>
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '9px', letterSpacing: '2px', color: '#D4A84760' }}>BONUS</div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#22c55e', fontFamily: "'Cinzel',serif" }}>+{fmt(bonus)}</div>
                    </div>
                </div>

                {/* ── Trust badges ── */}
                <div className="flex flex-wrap justify-center gap-5" style={{ marginBottom: '22px' }}>
                    {[{ i: <Shield size={12} />, t: '100% Secure' }, { i: <Zap size={12} />, t: 'Instant Credit' }, { i: <Clock size={12} />, t: '15 Min Window' }].map(x => (
                        <div key={x.t} className="flex items-center gap-2" style={{ fontSize: '10px', color: '#D4A84760', letterSpacing: '1px' }}>
                            <span style={{ color: '#D4A84780' }}>{x.i}</span>{x.t}
                        </div>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="text-center mb-4" style={{ fontSize: '11px', color: '#ef4444', letterSpacing: '0.5px' }}>
                        ⚠ {error}
                    </div>
                )}

                {/* CTA */}
                <button className="gold-btn" onClick={handleContinue}
                    disabled={amt < 10 || loading}
                    style={{ opacity: amt < 10 ? 0.4 : 1, fontSize: '12px', letterSpacing: '3px' }}>
                    {loading ? 'CREATING PAYMENT...' : 'CONTINUE TO PAYMENT →'}
                </button>

                <p className="text-center" style={{ fontSize: '9px', color: '#D4A84740', marginTop: '14px', letterSpacing: '2px' }}>
                    You will be redirected to our secure payment page
                </p>
            </div>
        </div>
    )
}