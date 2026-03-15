// import { useState } from 'react'
// import {
//     Smartphone, CreditCard, Building2, Wallet,
//     ChevronRight, CheckCircle2, ArrowLeft, Zap, Shield, Clock
// } from 'lucide-react'

// // ── Gold palette ───────────────────────────────────────────────────────────────
// const G = {
//     gold: '#D4A847',
//     bright: '#F0C96A',
//     dim: '#8B6914',
//     glow: '#D4A84740',
//     bg: '#070604',
//     card: '#0E0B08',
//     border: '#D4A84728',
// }

// // ── Deposit packages ───────────────────────────────────────────────────────────
// const PACKAGES = [
//     {
//         id: 1,
//         rupees: 100,
//         coins: 130,
//         bonus: 30,
//         bonusPct: '30%',
//         label: 'STARTER',
//         tag: null,
//         color: '#D4A847',
//         popular: false,
//     },
//     {
//         id: 2,
//         rupees: 250,
//         coins: 350,
//         bonus: 100,
//         bonusPct: '40%',
//         label: 'CLASSIC',
//         tag: 'POPULAR',
//         color: '#F0C96A',
//         popular: true,
//     },
//     {
//         id: 3,
//         rupees: 500,
//         coins: 750,
//         bonus: 250,
//         bonusPct: '50%',
//         label: 'ELITE',
//         tag: 'BEST VALUE',
//         color: '#FDE68A',
//         popular: false,
//     },
//     {
//         id: 4,
//         rupees: 1000,
//         coins: 1600,
//         bonus: 600,
//         bonusPct: '60%',
//         label: 'ROYAL',
//         tag: null,
//         color: '#F0C96A',
//         popular: false,
//     },
//     {
//         id: 5,
//         rupees: 2500,
//         coins: 4250,
//         bonus: 1750,
//         bonusPct: '70%',
//         label: 'PLATINUM',
//         tag: '🔥 HOT',
//         color: '#D4A847',
//         popular: false,
//     },
//     {
//         id: 6,
//         rupees: 5000,
//         coins: 9000,
//         bonus: 4000,
//         bonusPct: '80%',
//         label: 'DIAMOND',
//         tag: 'MAX BONUS',
//         color: '#60d4f0',
//         popular: false,
//     },
// ]

// // ── Payment methods ────────────────────────────────────────────────────────────
// const PAYMENT_METHODS = [
//     { id: 'upi', label: 'UPI', sub: 'PhonePe, GPay, Paytm', icon: Smartphone, instant: true },
//     { id: 'card', label: 'Debit / Credit', sub: 'Visa, Mastercard, RuPay', icon: CreditCard, instant: false },
//     { id: 'netbanking', label: 'Net Banking', sub: 'All major banks', icon: Building2, instant: false },
//     { id: 'wallet', label: 'Wallet', sub: 'Paytm, Mobikwik', icon: Wallet, instant: true },
// ]

// // ── Tiny decorative diamond ───────────────────────────────────────────────────
// function Gem({ size = 14, opacity = 0.5 }) {
//     return (
//         <svg width={size} height={size} viewBox="0 0 14 14" style={{ flexShrink: 0 }}>
//             <polygon points="7,1 13,7 7,13 1,7"
//                 fill={`${G.gold}20`} stroke={G.gold} strokeWidth="0.8" opacity={opacity} />
//         </svg>
//     )
// }

// // ── Coin SVG icon ─────────────────────────────────────────────────────────────
// function CoinIcon({ size = 20, color = G.gold }) {
//     return (
//         <svg width={size} height={size} viewBox="0 0 24 24">
//             <circle cx="12" cy="12" r="10" fill={`${color}25`} stroke={color} strokeWidth="1.5" />
//             <circle cx="12" cy="12" r="7" fill={`${color}15`} stroke={color} strokeWidth="0.75" />
//             <text x="12" y="16" textAnchor="middle"
//                 fontSize="10" fontWeight="700" fill={color}
//                 fontFamily="'Cinzel',serif">₵</text>
//         </svg>
//     )
// }

// // ── Format number with commas ─────────────────────────────────────────────────
// const fmt = (n) => n.toLocaleString('en-IN')

// // ═══════════════════════════════════════════════════════════════════════════════
// //  DEPOSIT COMPONENT
// // ═══════════════════════════════════════════════════════════════════════════════
// export default function Deposit({ onBack }) {
//     const [step, setStep] = useState('select')   // select | payment | confirm | success
//     const [selected, setSelected] = useState(PACKAGES[1])
//     const [customAmt, setCustomAmt] = useState('')
//     const [useCustom, setUseCustom] = useState(false)
//     const [payMethod, setPayMethod] = useState('upi')
//     const [upiId, setUpiId] = useState('')
//     const [loading, setLoading] = useState(false)
//     const [hovered, setHovered] = useState(null)

//     // Derived values
//     const activeAmt = useCustom ? Number(customAmt) || 0 : selected.rupees
//     const activeCoins = useCustom
//         ? Math.floor((Number(customAmt) || 0) * 1.3)
//         : selected.coins
//     const activeBonus = useCustom
//         ? activeCoins - (Number(customAmt) || 0)
//         : selected.bonus

//     const handlePay = () => {
//         if (activeAmt < 10) return
//         setLoading(true)
//         setTimeout(() => { setLoading(false); setStep('success') }, 2000)
//     }

//     // ── Step: SELECT PACKAGE ────────────────────────────────────────────────
//     if (step === 'select') return (
//         <Wrapper>
//             {/* Section label */}
//             <SectionEyebrow text="CHOOSE YOUR PACK" />

//             <h2 className="font-cinzel text-center shimmer-text"
//                 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 900, letterSpacing: '4px', marginBottom: '6px' }}>
//                 ADD COINS
//             </h2>
//             <p className="text-center" style={{ fontSize: '11px', color: `${G.gold}70`, letterSpacing: '2px', marginBottom: '32px' }}>
//                 DEPOSIT REAL MONEY · RECEIVE BONUS COINS · PLAY INSTANTLY
//             </p>

//             {/* Package grid */}
//             <div style={{
//                 display: 'grid',
//                 gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
//                 gap: '14px',
//                 marginBottom: '28px',
//             }}>
//                 {PACKAGES.map((pkg, i) => {
//                     const isActive = !useCustom && selected.id === pkg.id
//                     const isHover = hovered === pkg.id
//                     return (
//                         <button
//                             key={pkg.id}
//                             onClick={() => { setSelected(pkg); setUseCustom(false) }}
//                             onMouseEnter={() => setHovered(pkg.id)}
//                             onMouseLeave={() => setHovered(null)}
//                             className="float-up"
//                             style={{
//                                 animationDelay: `${i * 0.06}s`,
//                                 position: 'relative',
//                                 borderRadius: '14px',
//                                 border: `1px solid ${isActive ? pkg.color + '70' : G.border}`,
//                                 background: isActive
//                                     ? `linear-gradient(160deg, ${pkg.color}12, ${pkg.color}06)`
//                                     : `linear-gradient(160deg, #0E0B08, #090705)`,
//                                 padding: '20px 18px',
//                                 cursor: 'pointer',
//                                 transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
//                                 boxShadow: isActive
//                                     ? `0 0 30px ${pkg.color}20, 0 8px 32px #00000070`
//                                     : isHover
//                                         ? `0 12px 40px #00000070, 0 0 20px ${pkg.color}10`
//                                         : '0 4px 20px #00000050',
//                                 transform: isActive || isHover ? 'translateY(-4px)' : 'translateY(0)',
//                                 textAlign: 'left',
//                                 fontFamily: "'Space Mono', monospace",
//                             }}
//                         >
//                             {/* Active checkmark */}
//                             {isActive && (
//                                 <div style={{
//                                     position: 'absolute', top: '12px', right: '12px',
//                                     color: pkg.color, display: 'flex',
//                                 }}>
//                                     <CheckCircle2 size={16} />
//                                 </div>
//                             )}

//                             {/* Tag badge */}
//                             {pkg.tag && (
//                                 <div style={{
//                                     position: 'absolute', top: '-10px', left: '16px',
//                                     background: pkg.popular ? `linear-gradient(135deg,#B8860B,${G.gold},${G.bright})` : `${pkg.color}22`,
//                                     border: `1px solid ${pkg.color}55`,
//                                     color: pkg.popular ? '#150F00' : pkg.color,
//                                     fontSize: '8px',
//                                     fontWeight: 700,
//                                     letterSpacing: '2px',
//                                     padding: '3px 10px',
//                                     borderRadius: '99px',
//                                     fontFamily: "'Space Mono',monospace",
//                                 }}>
//                                     {pkg.tag}
//                                 </div>
//                             )}

//                             {/* Package label */}
//                             <div style={{ fontSize: '9px', letterSpacing: '3px', color: `${pkg.color}90`, marginBottom: '10px' }}>
//                                 {pkg.label}
//                             </div>

//                             {/* Rupee amount */}
//                             <div className="font-cinzel" style={{ fontSize: '26px', fontWeight: 900, color: pkg.color, lineHeight: 1, marginBottom: '4px' }}>
//                                 ₹{fmt(pkg.rupees)}
//                             </div>

//                             {/* Divider */}
//                             <div style={{ height: '1px', background: `linear-gradient(90deg, ${pkg.color}30, transparent)`, margin: '12px 0' }} />

//                             {/* Coins row */}
//                             <div className="flex items-center gap-2" style={{ marginBottom: '6px' }}>
//                                 <CoinIcon size={18} color={pkg.color} />
//                                 <span style={{ fontSize: '18px', fontWeight: 700, color: '#fff', fontFamily: "'Cinzel',serif" }}>
//                                     {fmt(pkg.coins)}
//                                 </span>
//                                 <span style={{ fontSize: '10px', color: `${pkg.color}80` }}>COINS</span>
//                             </div>

//                             {/* Bonus line */}
//                             <div style={{
//                                 fontSize: '10px',
//                                 color: `${pkg.color}90`,
//                                 letterSpacing: '1px',
//                                 background: `${pkg.color}10`,
//                                 border: `1px solid ${pkg.color}20`,
//                                 borderRadius: '6px',
//                                 padding: '5px 10px',
//                                 display: 'inline-flex',
//                                 alignItems: 'center',
//                                 gap: '6px',
//                                 marginTop: '4px',
//                             }}>
//                                 <Zap size={10} color={pkg.color} />
//                                 +{fmt(pkg.bonus)} BONUS · {pkg.bonusPct} EXTRA
//                             </div>
//                         </button>
//                     )
//                 })}
//             </div>

//             {/* Custom amount */}
//             <div style={{
//                 borderRadius: '14px',
//                 border: `1px solid ${useCustom ? G.gold + '50' : G.border}`,
//                 background: useCustom ? `${G.gold}08` : '#0E0B08',
//                 padding: '18px 20px',
//                 marginBottom: '28px',
//                 transition: 'all 0.2s',
//             }}>
//                 <div style={{ fontSize: '9px', letterSpacing: '3px', color: `${G.gold}70`, marginBottom: '10px' }}>
//                     CUSTOM AMOUNT
//                 </div>
//                 <div className="flex items-center gap-3">
//                     <div style={{ position: 'relative', flex: 1 }}>
//                         <span style={{
//                             position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
//                             color: G.gold, fontSize: '15px', fontWeight: 700,
//                         }}>₹</span>
//                         <input
//                             type="number"
//                             placeholder="Enter amount (min ₹10)"
//                             value={customAmt}
//                             min="10"
//                             onChange={e => { setCustomAmt(e.target.value); setUseCustom(true) }}
//                             onFocus={() => setUseCustom(true)}
//                             className="gold-input"
//                             style={{ paddingLeft: '32px', fontSize: '15px' }}
//                         />
//                     </div>
//                     {customAmt && Number(customAmt) >= 10 && (
//                         <div style={{ textAlign: 'right', flexShrink: 0 }}>
//                             <div style={{ fontSize: '10px', color: `${G.gold}60`, letterSpacing: '1px' }}>YOU GET</div>
//                             <div style={{ fontSize: '16px', fontWeight: 700, color: G.bright, fontFamily: "'Cinzel',serif" }}>
//                                 {fmt(Math.floor(Number(customAmt) * 1.3))}
//                             </div>
//                             <div style={{ fontSize: '9px', color: `${G.gold}70` }}>COINS</div>
//                         </div>
//                     )}
//                 </div>
//                 {useCustom && Number(customAmt) > 0 && Number(customAmt) < 10 && (
//                     <p style={{ fontSize: '10px', color: '#ef4444', marginTop: '6px', letterSpacing: '1px' }}>
//                         Minimum deposit is ₹10
//                     </p>
//                 )}
//             </div>

//             {/* Selected summary bar */}
//             <div style={{
//                 borderRadius: '12px',
//                 background: `${G.gold}0C`,
//                 border: `1px solid ${G.gold}22`,
//                 padding: '14px 20px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'space-between',
//                 marginBottom: '20px',
//                 flexWrap: 'wrap',
//                 gap: '10px',
//             }}>
//                 <div>
//                     <div style={{ fontSize: '9px', letterSpacing: '2px', color: `${G.gold}60` }}>YOU PAY</div>
//                     <div className="font-cinzel" style={{ fontSize: '20px', fontWeight: 700, color: G.gold }}>
//                         ₹{fmt(activeAmt)}
//                     </div>
//                 </div>
//                 <div style={{ color: `${G.gold}50`, fontSize: '18px' }}>→</div>
//                 <div>
//                     <div style={{ fontSize: '9px', letterSpacing: '2px', color: `${G.gold}60` }}>YOU RECEIVE</div>
//                     <div className="flex items-center gap-2">
//                         <CoinIcon size={20} />
//                         <span className="font-cinzel" style={{ fontSize: '20px', fontWeight: 700, color: G.bright }}>
//                             {fmt(activeCoins)} COINS
//                         </span>
//                     </div>
//                 </div>
//                 <div>
//                     <div style={{ fontSize: '9px', letterSpacing: '2px', color: `${G.gold}60` }}>BONUS</div>
//                     <div style={{ fontSize: '16px', fontWeight: 700, color: '#22c55e', fontFamily: "'Cinzel',serif" }}>
//                         +{fmt(activeBonus)}
//                     </div>
//                 </div>
//             </div>

//             {/* Trust row */}
//             <div className="flex flex-wrap justify-center gap-5" style={{ marginBottom: '24px' }}>
//                 {[
//                     { icon: <Shield size={12} />, text: '100% Secure' },
//                     { icon: <Zap size={12} />, text: 'Instant Credit' },
//                     { icon: <Clock size={12} />, text: 'Easy Refund' },
//                 ].map(t => (
//                     <div key={t.text} className="flex items-center gap-2"
//                         style={{ fontSize: '10px', color: `${G.gold}60`, letterSpacing: '1px' }}>
//                         <span style={{ color: `${G.gold}80` }}>{t.icon}</span>
//                         {t.text}
//                     </div>
//                 ))}
//             </div>

//             {/* CTA */}
//             <button
//                 className="gold-btn"
//                 disabled={activeAmt < 10}
//                 onClick={() => setStep('payment')}
//                 style={{ opacity: activeAmt < 10 ? 0.4 : 1, fontSize: '12px', letterSpacing: '3px' }}
//             >
//                 CONTINUE TO PAYMENT →
//             </button>
//         </Wrapper>
//     )

//     // ── Step: PAYMENT METHOD ────────────────────────────────────────────────
//     if (step === 'payment') return (
//         <Wrapper>
//             <BackBtn onClick={() => setStep('select')} />
//             <SectionEyebrow text="PAYMENT METHOD" />

//             <h2 className="font-cinzel text-center shimmer-text"
//                 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '4px', marginBottom: '6px' }}>
//                 HOW TO PAY?
//             </h2>
//             <p className="text-center" style={{ fontSize: '11px', color: `${G.gold}70`, letterSpacing: '2px', marginBottom: '28px' }}>
//                 CHOOSE YOUR PREFERRED PAYMENT MODE
//             </p>

//             {/* Payment cards */}
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
//                 {PAYMENT_METHODS.map((m, i) => {
//                     const isActive = payMethod === m.id
//                     const Icon = m.icon
//                     return (
//                         <button
//                             key={m.id}
//                             onClick={() => setPayMethod(m.id)}
//                             className="float-up"
//                             style={{
//                                 animationDelay: `${i * 0.06}s`,
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 gap: '14px',
//                                 padding: '16px 18px',
//                                 borderRadius: '12px',
//                                 border: `1px solid ${isActive ? G.gold + '55' : G.border}`,
//                                 background: isActive ? `${G.gold}0E` : '#0E0B08',
//                                 cursor: 'pointer',
//                                 transition: 'all 0.2s',
//                                 textAlign: 'left',
//                                 fontFamily: "'Space Mono',monospace",
//                                 boxShadow: isActive ? `0 0 24px ${G.gold}18` : 'none',
//                             }}
//                         >
//                             {/* Icon box */}
//                             <div style={{
//                                 width: '42px', height: '42px',
//                                 borderRadius: '10px',
//                                 background: isActive ? `${G.gold}18` : `${G.gold}0A`,
//                                 border: `1px solid ${isActive ? G.gold + '40' : G.gold + '18'}`,
//                                 display: 'flex', alignItems: 'center', justifyContent: 'center',
//                                 flexShrink: 0,
//                             }}>
//                                 <Icon size={18} color={isActive ? G.gold : `${G.gold}70`} />
//                             </div>

//                             {/* Labels */}
//                             <div style={{ flex: 1 }}>
//                                 <div style={{ fontSize: '12px', fontWeight: 700, color: isActive ? G.gold : `${G.gold}90`, letterSpacing: '1px' }}>
//                                     {m.label}
//                                 </div>
//                                 <div style={{ fontSize: '10px', color: `${G.gold}55`, marginTop: '2px' }}>
//                                     {m.sub}
//                                 </div>
//                             </div>

//                             {/* Instant badge */}
//                             {m.instant && (
//                                 <span style={{
//                                     fontSize: '8px', letterSpacing: '1.5px',
//                                     color: '#22c55e', background: '#22c55e15',
//                                     border: '1px solid #22c55e30',
//                                     padding: '3px 8px', borderRadius: '99px',
//                                 }}>
//                                     INSTANT
//                                 </span>
//                             )}

//                             {/* Active dot */}
//                             <div style={{
//                                 width: '16px', height: '16px', borderRadius: '50%',
//                                 border: `1px solid ${isActive ? G.gold : G.gold + '30'}`,
//                                 background: isActive ? `${G.gold}30` : 'transparent',
//                                 display: 'flex', alignItems: 'center', justifyContent: 'center',
//                                 flexShrink: 0,
//                             }}>
//                                 {isActive && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: G.gold }} />}
//                             </div>
//                         </button>
//                     )
//                 })}
//             </div>

//             {/* UPI ID input if UPI selected */}
//             {payMethod === 'upi' && (
//                 <div className="float-up" style={{ marginBottom: '20px' }}>
//                     <label style={{ fontSize: '9px', letterSpacing: '3px', color: `${G.gold}70`, display: 'block', marginBottom: '8px' }}>
//                         UPI ID
//                     </label>
//                     <input
//                         type="text"
//                         placeholder="yourname@upi"
//                         value={upiId}
//                         onChange={e => setUpiId(e.target.value)}
//                         className="gold-input"
//                     />
//                 </div>
//             )}

//             {/* Order summary card */}
//             <div style={{
//                 borderRadius: '12px',
//                 background: '#0A0805',
//                 border: `1px solid ${G.gold}22`,
//                 padding: '16px 20px',
//                 marginBottom: '22px',
//             }}>
//                 <div style={{ fontSize: '9px', letterSpacing: '3px', color: `${G.gold}55`, marginBottom: '12px' }}>
//                     ORDER SUMMARY
//                 </div>
//                 {[
//                     { label: 'Amount', val: `₹${fmt(activeAmt)}` },
//                     { label: 'Base Coins', val: `${fmt(activeAmt)} ₵` },
//                     { label: 'Bonus Coins', val: `+${fmt(activeBonus)} ₵`, green: true },
//                     { label: 'Total Coins', val: `${fmt(activeCoins)} ₵`, gold: true },
//                 ].map((row, i, arr) => (
//                     <div key={row.label} className="flex justify-between items-center"
//                         style={{ padding: '7px 0', borderBottom: i < arr.length - 1 ? `1px solid ${G.gold}0D` : 'none' }}>
//                         <span style={{ fontSize: '11px', color: `${G.gold}70`, letterSpacing: '0.5px' }}>{row.label}</span>
//                         <span style={{
//                             fontSize: '12px', fontWeight: 700,
//                             color: row.gold ? G.bright : row.green ? '#22c55e' : `${G.gold}90`,
//                             fontFamily: "'Cinzel',serif",
//                         }}>{row.val}</span>
//                     </div>
//                 ))}
//             </div>

//             <button
//                 className="gold-btn"
//                 onClick={handlePay}
//                 disabled={loading || (payMethod === 'upi' && !upiId.trim())}
//                 style={{ opacity: loading || (payMethod === 'upi' && !upiId.trim()) ? 0.6 : 1, fontSize: '12px', letterSpacing: '3px' }}
//             >
//                 {loading ? 'PROCESSING...' : `PAY ₹${fmt(activeAmt)}`}
//             </button>
//         </Wrapper>
//     )

//     // ── Step: SUCCESS ────────────────────────────────────────────────────────
//     if (step === 'success') return (
//         <Wrapper>
//             <div className="flex flex-col items-center text-center py-6">
//                 {/* Animated success diamond */}
//                 <div style={{ animation: 'pulseGold 2s ease-in-out infinite', marginBottom: '24px' }}>
//                     <svg width="90" height="90" viewBox="0 0 90 90">
//                         <polygon points="45,4 86,45 45,86 4,45"
//                             fill={`${G.gold}15`} stroke={G.gold} strokeWidth="1.5" />
//                         <polygon points="45,18 72,45 45,72 18,45"
//                             fill={`${G.gold}10`} stroke={G.gold} strokeWidth="1" />
//                         <text x="45" y="52" textAnchor="middle"
//                             fontSize="22" fontWeight="700" fill={G.gold}
//                             fontFamily="'Cinzel',serif">✓</text>
//                     </svg>
//                 </div>

//                 <h2 className="font-cinzel shimmer-text"
//                     style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '4px', marginBottom: '8px' }}>
//                     DEPOSIT SUCCESS
//                 </h2>
//                 <p style={{ fontSize: '11px', color: `${G.gold}70`, letterSpacing: '3px', marginBottom: '32px' }}>
//                     COINS ADDED TO YOUR WALLET
//                 </p>

//                 {/* Big coin display */}
//                 <div style={{
//                     borderRadius: '16px',
//                     background: `${G.gold}0C`,
//                     border: `1px solid ${G.gold}28`,
//                     padding: '24px 40px',
//                     marginBottom: '28px',
//                     boxShadow: `0 0 40px ${G.gold}15`,
//                 }}>
//                     <div style={{ fontSize: '10px', letterSpacing: '3px', color: `${G.gold}60`, marginBottom: '10px' }}>
//                         COINS CREDITED
//                     </div>
//                     <div className="flex items-center justify-center gap-3">
//                         <CoinIcon size={36} />
//                         <span className="font-cinzel" style={{ fontSize: '3rem', fontWeight: 900, color: G.bright, lineHeight: 1 }}>
//                             {fmt(activeCoins)}
//                         </span>
//                     </div>
//                     <div style={{ marginTop: '12px', fontSize: '11px', color: '#22c55e', letterSpacing: '1px' }}>
//                         ✦ Includes +{fmt(activeBonus)} bonus coins
//                     </div>
//                 </div>

//                 {/* Receipt summary */}
//                 <div style={{
//                     width: '100%',
//                     borderRadius: '12px',
//                     background: '#0A0805',
//                     border: `1px solid ${G.gold}18`,
//                     padding: '14px 20px',
//                     marginBottom: '28px',
//                 }}>
//                     {[
//                         { label: 'Amount Paid', val: `₹${fmt(activeAmt)}` },
//                         { label: 'Method', val: PAYMENT_METHODS.find(p => p.id === payMethod)?.label },
//                         { label: 'Status', val: '✦ SUCCESS', green: true },
//                         { label: 'Txn ID', val: `GP${Date.now().toString().slice(-8)}` },
//                     ].map(row => (
//                         <div key={row.label} className="flex justify-between"
//                             style={{ padding: '5px 0', fontSize: '11px', borderBottom: `1px solid ${G.gold}08` }}>
//                             <span style={{ color: `${G.gold}60` }}>{row.label}</span>
//                             <span style={{ color: row.green ? '#22c55e' : `${G.gold}90`, fontWeight: 700, fontFamily: "'Space Mono',monospace" }}>
//                                 {row.val}
//                             </span>
//                         </div>
//                     ))}
//                 </div>

//                 <button className="gold-btn" style={{ fontSize: '12px', letterSpacing: '3px' }}
//                     onClick={() => setStep('select')}>
//                     DEPOSIT MORE
//                 </button>
//                 <button
//                     onClick={onBack}
//                     className="bg-transparent border-none cursor-pointer"
//                     style={{ marginTop: '14px', fontSize: '10px', color: `${G.gold}55`, letterSpacing: '2px', fontFamily: "'Space Mono',monospace" }}
//                 >
//                     ← PLAY NOW
//                 </button>
//             </div>
//         </Wrapper>
//     )
// }

// // ── Reusable shell ────────────────────────────────────────────────────────────
// function Wrapper({ children }) {
//     return (
//         <div className="min-h-screen flex items-center justify-center p-5 py-10"
//             style={{ background: G.bg, fontFamily: "'Space Mono',monospace" }}>

//             {/* Ambient */}
//             <div className="fixed inset-0 pointer-events-none"
//                 style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 40%,#D4A84712,transparent 70%)' }} />
//             <div className="fixed inset-0 pointer-events-none"
//                 style={{
//                     backgroundImage: 'linear-gradient(#D4A84706 1px,transparent 1px),linear-gradient(90deg,#D4A84706 1px,transparent 1px)',
//                     backgroundSize: '44px 44px',
//                 }} />

//             {/* Top line */}
//             <div className="fixed top-0 left-0 right-0 h-px z-50 pointer-events-none"
//                 style={{ background: 'linear-gradient(90deg,transparent 5%,#8B6914 30%,#D4A847 50%,#8B6914 70%,transparent 95%)' }} />

//             {/* Card */}
//             <div className="relative z-10 w-full float-up"
//                 style={{
//                     maxWidth: '780px',
//                     borderRadius: '20px',
//                     border: `1px solid ${G.border}`,
//                     background: 'linear-gradient(160deg,#0E0B08 0%,#090705 100%)',
//                     boxShadow: '0 0 0 1px #D4A84712 inset, 0 50px 120px #00000095, 0 0 60px #D4A8470C',
//                     overflow: 'hidden',
//                     padding: '36px 36px 32px',
//                 }}
//             >
//                 {/* Top shimmer */}
//                 <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
//                     style={{ background: 'linear-gradient(90deg,transparent 5%,#8B6914 25%,#D4A847 50%,#8B6914 75%,transparent 95%)' }} />

//                 {/* Corner gems */}
//                 {[{ top: '14px', left: '14px' }, { top: '14px', right: '14px' }].map((pos, i) => (
//                     <svg key={i} width="16" height="16" viewBox="0 0 16 16"
//                         className="absolute pointer-events-none" style={{ ...pos, opacity: 0.4 }}>
//                         <path d="M1 8L8 1L15 8" fill="none" stroke="#D4A847" strokeWidth="0.8" />
//                     </svg>
//                 ))}

//                 {children}

//                 {/* Bottom shimmer */}
//                 <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
//                     style={{ background: 'linear-gradient(90deg,transparent 5%,#8B691435 30%,#D4A84720 50%,#8B691435 70%,transparent 95%)' }} />
//             </div>
//         </div>
//     )
// }

// function SectionEyebrow({ text }) {
//     return (
//         <div className="flex items-center justify-center gap-3 mb-5">
//             <Gem size={12} />
//             <span style={{ fontSize: '9px', letterSpacing: '5px', color: `${G.gold}60` }}>{text}</span>
//             <Gem size={12} />
//         </div>
//     )
// }

// function BackBtn({ onClick }) {
//     return (
//         <button onClick={onClick}
//             className="flex items-center gap-2 bg-transparent border-none cursor-pointer mb-6"
//             style={{ color: `${G.gold}70`, fontSize: '10px', letterSpacing: '2px', fontFamily: "'Space Mono',monospace" }}
//             onMouseEnter={e => e.currentTarget.style.color = G.gold}
//             onMouseLeave={e => e.currentTarget.style.color = `${G.gold}70`}
//         >
//             <ArrowLeft size={14} />
//             BACK
//         </button>
//     )
// }


// src/components/Deposit.jsx
//
// YE FILE: Aapki main gaming app ke Deposit page ke liye hai
// Ye page /deposit route pe render hota hai
// "Continue" press karne pe payment-server ko call karta hai,
// phir browser ko payment-gateway website (port 5174) pe bhej deta hai

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Zap, Shield, Clock, CheckCircle2 } from 'lucide-react'

const PAYMENT_API = 'http://localhost:3001'   // payment-server
const PAY_GATEWAY = 'http://localhost:5174'   // payment-gateway website

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