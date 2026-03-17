// import { useState, useEffect, useRef } from 'react'
// // import QRCode from 'react-qr-code'
// import { QRCode } from 'react-qr-code'

// // ── Config ────────────────────────────────────────────────────────────────────
// const API = 'http://localhost:3001'

// const fmt = (n) => Number(n).toLocaleString('en-IN')

// // ── UPI App deep links ────────────────────────────────────────────────────────
// // Mobile pe app khulta hai, desktop pe web fallback
// function buildUpiLink(appId, upiId, amount) {
//     const base = `pa=${encodeURIComponent(upiId)}&pn=GamePlay&am=${amount}&cu=INR&tn=GamePlay+Deposit`
//     const links = {
//         phonepe: `phonepe://pay?${base}`,
//         gpay: `tez://upi/pay?${base}`,
//         paytm: `paytmmp://pay?${base}`,
//         bhim: `upi://pay?${base}`,
//         amazonpay: `upi://pay?${base}`,
//         whatsapp: `upi://pay?${base}`,
//     }
//     return links[appId] || `upi://pay?${base}`
// }

// const UPI_APPS = [
//     {
//         id: 'phonepe',
//         name: 'PhonePe',
//         bg: '#5f259f',
//         textColor: '#fff',
//         emoji: '📱',
//         label: 'PhonePe',
//     },
//     {
//         id: 'gpay',
//         name: 'Google Pay',
//         bg: '#fff',
//         textColor: '#4285F4',
//         emoji: '🔵',
//         label: 'GPay',
//     },
//     {
//         id: 'paytm',
//         name: 'Paytm',
//         bg: '#00BAF2',
//         textColor: '#fff',
//         emoji: '💙',
//         label: 'Paytm',
//     },
//     {
//         id: 'bhim',
//         name: 'BHIM UPI',
//         bg: '#00529c',
//         textColor: '#fff',
//         emoji: '🇮🇳',
//         label: 'BHIM',
//     },
//     {
//         id: 'amazonpay',
//         name: 'Amazon Pay',
//         bg: '#232F3E',
//         textColor: '#FF9900',
//         emoji: '📦',
//         label: 'Amazon',
//     },
//     {
//         id: 'whatsapp',
//         name: 'WhatsApp Pay',
//         bg: '#25D366',
//         textColor: '#fff',
//         emoji: '💬',
//         label: 'WhatsApp',
//     },
// ]

// // ── Countdown hook ────────────────────────────────────────────────────────────
// function useCountdown(expiresAt) {
//     const [secs, setSecs] = useState(0)
//     useEffect(() => {
//         if (!expiresAt) return
//         const tick = () => {
//             const diff = Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000))
//             setSecs(diff)
//         }
//         tick()
//         const id = setInterval(tick, 1000)
//         return () => clearInterval(id)
//     }, [expiresAt])
//     const m = String(Math.floor(secs / 60)).padStart(2, '0')
//     const s = String(secs % 60).padStart(2, '0')
//     return { display: `${m}:${s}`, expired: secs === 0, secs }
// }

// // ── Copy hook ────────────────────────────────────────────────────────────────
// function useCopy() {
//     const [copied, setCopied] = useState(null)
//     const copy = (text, key) => {
//         navigator.clipboard.writeText(text).catch(() => {
//             // Fallback for mobile
//             const el = document.createElement('textarea')
//             el.value = text
//             document.body.appendChild(el)
//             el.select()
//             document.execCommand('copy')
//             document.body.removeChild(el)
//         })
//         setCopied(key)
//         setTimeout(() => setCopied(null), 2000)
//     }
//     return { copied, copy }
// }

// // ═══════════════════════════════════════════════════════════════════════════════
// //  MAIN PAY PAGE
// // ═══════════════════════════════════════════════════════════════════════════════
// export default function PayPage({ txnId }) {
//     const [txn, setTxn] = useState(null)
//     const [loading, setLoading] = useState(true)
//     const [error, setError] = useState('')
//     const [status, setStatus] = useState('pending')
//     const [tab, setTab] = useState('qr')           // 'qr' | 'bank'
//     const [utrInput, setUtrInput] = useState('')
//     const [verifying, setVerifying] = useState(false)
//     const [verifyErr, setVerifyErr] = useState('')
//     const [appHovered, setAppHovered] = useState(null)
//     const { copied, copy } = useCopy()
//     const pollRef = useRef(null)
//     const { display: timer, expired, secs } = useCountdown(txn?.expires_at)

//     // ── Load transaction ──────────────────────────────────────────────────────
//     useEffect(() => {
//         fetch(`${API}/api/txn/${txnId}`)
//             .then(r => r.json())
//             .then(data => {
//                 if (data.error) { setError(data.error); return }
//                 console.log('====================================');
//                 console.log(data);
//                 console.log('====================================');
//                 setTxn(data)
//                 setStatus(data.status)
//             })
//             .catch(() => setError('Cannot connect to payment server. Make sure it is running on port 3001.'))
//             .finally(() => setLoading(false))
//     }, [txnId])

//     // ── Poll for payment status every 4 seconds ───────────────────────────────
//     useEffect(() => {
//         if (!txnId || status !== 'pending') return
//         pollRef.current = setInterval(async () => {
//             try {
//                 const r = await fetch(`${API}/api/txn/status/${txnId}`)
//                 const data = await r.json()
//                 if (data.status && data.status !== 'pending') {
//                     setStatus(data.status)
//                     clearInterval(pollRef.current)
//                     if (data.status === 'success') {
//                         // Wait 2s to show success, then redirect back to main app
//                         setTimeout(() => {
//                             const returnUrl = txn?.return_url || 'http://localhost:5173'
//                             window.location.href = `${returnUrl}/deposit/success?txnId=${txnId}&coins=${data.coins}&status=success`
//                         }, 2500)
//                     }
//                 }
//             } catch (_) { }
//         }, 4000)
//         return () => clearInterval(pollRef.current)
//     }, [txnId, status, txn])

//     // ── Handle expiry ─────────────────────────────────────────────────────────
//     useEffect(() => {
//         if (expired && status === 'pending' && txn) {
//             setStatus('expired')
//             clearInterval(pollRef.current)
//         }
//     }, [expired, status, txn])

//     // ── Open UPI app ──────────────────────────────────────────────────────────
//     const openUpiApp = (appId) => {
//         if (!txn) return
//         const url = buildUpiLink(appId, txn.upi_id, txn.amount)
//         window.location.href = url
//     }

//     // ── Manual UTR verify ─────────────────────────────────────────────────────
//     const verifyUtr = async () => {
//         if (!utrInput.trim()) return
//         setVerifying(true); setVerifyErr('')
//         try {
//             const r = await fetch(`${API}/api/payment/verify`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ txnId, utrNumber: utrInput.trim() }),
//             })
//             const data = await r.json()
//             if (data.success && data.status === 'success') {
//                 setStatus('success')
//                 setTimeout(() => {
//                     const returnUrl = txn?.return_url || 'http://localhost:5173'
//                     window.location.href = `${returnUrl}/deposit/success?txnId=${txnId}&coins=${txn.coins}&status=success`
//                 }, 2500)
//             } else {
//                 setVerifyErr('Could not verify. Try again or contact support.')
//             }
//         } catch (_) {
//             setVerifyErr('Server error. Please try again.')
//         } finally {
//             setVerifying(false)
//         }
//     }

//     // ── Simulate payment (DEMO only) ──────────────────────────────────────────
//     const simulatePay = async () => {
//         await fetch(`${API}/api/payment/simulate`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ txnId }),
//         })
//     }

//     // UPI string for QR
//     const upiString = txn
//         ? `upi://pay?pa=${txn.upi_id}&pn=${encodeURIComponent(txn.account_name)}&am=${txn.amount}&cu=INR&tn=GamePlay+Deposit`
//         : ''

//     // ── States ────────────────────────────────────────────────────────────────

//     if (loading) return (
//         <FullScreen>
//             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
//                 <svg width="52" height="52" viewBox="0 0 52 52" className="spin">
//                     <polygon points="26,3 49,26 26,49 3,26" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
//                     <polygon points="26,12 40,26 26,40 12,26" fill="#1e3a5f" stroke="#38bdf8" strokeWidth="0.75" />
//                 </svg>
//                 <p style={{ fontSize: '11px', letterSpacing: '4px', color: '#334155' }}>LOADING PAYMENT...</p>
//             </div>
//         </FullScreen>
//     )

//     if (error) return (
//         <FullScreen>
//             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
//                 <svg width="56" height="56" viewBox="0 0 56 56">
//                     <polygon points="28,3 53,28 28,53 3,28" fill="#7f1d1d20" stroke="#ef4444" strokeWidth="1.5" />
//                     <text x="28" y="34" textAnchor="middle" fontSize="22" fill="#ef4444">!</text>
//                 </svg>
//                 <p style={{ fontSize: '14px', color: '#ef4444', letterSpacing: '1px' }}>{error}</p>
//                 <button onClick={() => window.history.back()}
//                     style={{ ...btnStyle('#1e293b', '#94a3b8', '#334155'), marginTop: '8px' }}>
//                     ← GO BACK
//                 </button>
//             </div>
//         </FullScreen>
//     )

//     if (status === 'success') return (
//         <FullScreen>
//             <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
//                 <div style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
//                     <svg width="90" height="90" viewBox="0 0 90 90">
//                         <circle cx="45" cy="45" r="40" fill="#22c55e12" stroke="#22c55e" strokeWidth="2" />
//                         <path d="M27 45L38 57L63 33" stroke="#22c55e" strokeWidth="3"
//                             fill="none" strokeLinecap="round" strokeLinejoin="round" />
//                     </svg>
//                 </div>
//                 <h2 style={{ fontSize: '22px', color: '#22c55e', letterSpacing: '3px', fontFamily: "'Space Mono',monospace" }}>
//                     PAYMENT CONFIRMED
//                 </h2>
//                 <p style={{ fontSize: '11px', color: '#475569', letterSpacing: '2px' }}>
//                     REDIRECTING BACK TO GAMEPLAY...
//                 </p>
//                 <div style={{
//                     fontSize: '2.8rem', fontWeight: 700, color: '#D4A847',
//                     fontFamily: 'monospace', letterSpacing: '2px',
//                 }}>
//                     +{fmt(txn?.coins || 0)} ₵
//                 </div>
//                 <p style={{ fontSize: '10px', color: '#334155' }}>Coins being credited to your account</p>
//             </div>
//         </FullScreen>
//     )

//     if (status === 'expired') return (
//         <FullScreen>
//             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
//                 <svg width="64" height="64" viewBox="0 0 64 64">
//                     <polygon points="32,3 61,32 32,61 3,32" fill="#78350f20" stroke="#f97316" strokeWidth="1.5" />
//                     <text x="32" y="38" textAnchor="middle" fontSize="20" fill="#f97316">⏱</text>
//                 </svg>
//                 <h2 style={{ fontSize: '18px', color: '#f97316', letterSpacing: '2px' }}>SESSION EXPIRED</h2>
//                 <p style={{ fontSize: '11px', color: '#475569', lineHeight: 1.8 }}>
//                     This payment window has expired.
//                     <br />Please create a new deposit.
//                 </p>
//                 <button onClick={() => window.location.href = 'http://localhost:5173/deposit'}
//                     style={{ ...goldBtnStyle, marginTop: '12px' }}>
//                     TRY AGAIN
//                 </button>
//             </div>
//         </FullScreen>
//     )

//     // ── MAIN PAYMENT UI ───────────────────────────────────────────────────────
//     return (
//         <FullScreen>
//             {/* ── TOP BAR ── */}
//             <div style={{
//                 display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//                 marginBottom: '24px', paddingBottom: '20px',
//                 borderBottom: '1px solid #1e293b',
//             }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//                     <div style={{
//                         width: '36px', height: '36px', borderRadius: '10px',
//                         background: '#0d1526', border: '1px solid #1e3a5f',
//                         display: 'flex', alignItems: 'center', justifyContent: 'center',
//                     }}>
//                         <svg width="20" height="20" viewBox="0 0 20 20">
//                             <polygon points="10,1 19,10 10,19 1,10" fill="#1e3a5f" stroke="#38bdf8" strokeWidth="1" />
//                             <text x="10" y="13.5" textAnchor="middle" fontSize="7" fill="#38bdf8"
//                                 fontFamily="monospace" fontWeight="700">GP</text>
//                         </svg>
//                     </div>
//                     <div>
//                         <div style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0', letterSpacing: '1px' }}>
//                             GamePlay Secure Pay
//                         </div>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
//                             <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.5s infinite' }} />
//                             <span style={{ fontSize: '9px', color: '#22c55e', letterSpacing: '2px' }}>SSL SECURED</span>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Timer */}
//                 <div style={{
//                     display: 'flex', alignItems: 'center', gap: '8px',
//                     background: secs < 120 ? '#7f1d1d20' : '#0a1930',
//                     border: `1px solid ${secs < 120 ? '#ef444440' : '#1e3a5f'}`,
//                     borderRadius: '10px', padding: '8px 14px',
//                 }}>
//                     <svg width="12" height="12" viewBox="0 0 12 12">
//                         <circle cx="6" cy="6" r="5" fill="none" stroke={secs < 120 ? '#ef4444' : '#38bdf8'} strokeWidth="1" />
//                         <line x1="6" y1="6" x2="6" y2="2.5" stroke={secs < 120 ? '#ef4444' : '#38bdf8'} strokeWidth="1" strokeLinecap="round" />
//                         <line x1="6" y1="6" x2="8.5" y2="6" stroke={secs < 120 ? '#ef4444' : '#38bdf8'} strokeWidth="1" strokeLinecap="round" />
//                     </svg>
//                     <span style={{
//                         fontSize: '16px', fontWeight: 700,
//                         color: secs < 120 ? '#ef4444' : '#38bdf8',
//                         fontFamily: 'monospace', letterSpacing: '3px',
//                     }}>{timer}</span>
//                 </div>
//             </div>

//             {/* ── AMOUNT STRIP ── */}
//             <div style={{
//                 background: 'linear-gradient(135deg, #0f172a, #1a2744)',
//                 border: '1px solid #1e3a5f', borderRadius: '14px',
//                 padding: '18px 22px', marginBottom: '22px',
//                 display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//                 flexWrap: 'wrap', gap: '12px',
//             }}>
//                 <div>
//                     <div style={{ fontSize: '9px', color: '#475569', letterSpacing: '3px', marginBottom: '4px' }}>
//                         AMOUNT TO PAY
//                     </div>
//                     <div style={{ fontSize: '32px', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace', lineHeight: 1 }}>
//                         ₹{fmt(txn.amount)}
//                     </div>
//                 </div>
//                 <div style={{ width: '1px', height: '40px', background: '#1e293b', flexShrink: 0 }} />
//                 <div style={{ textAlign: 'right' }}>
//                     <div style={{ fontSize: '9px', color: '#475569', letterSpacing: '3px', marginBottom: '4px' }}>
//                         YOU WILL RECEIVE
//                     </div>
//                     <div style={{ fontSize: '22px', fontWeight: 700, color: '#D4A847', fontFamily: 'monospace' }}>
//                         {fmt(txn.coins)} <span style={{ fontSize: '14px', color: '#D4A84790' }}>COINS</span>
//                     </div>
//                 </div>
//             </div>

//             {/* ── TAB SWITCHER ── */}
//             <div style={{
//                 display: 'flex', gap: '6px', marginBottom: '22px',
//                 background: '#0a0f1a', borderRadius: '12px', padding: '4px',
//             }}>
//                 {[{ id: 'qr', label: '📱  QR / UPI' }, { id: 'bank', label: '🏦  Bank Transfer' }].map(t => (
//                     <button key={t.id}
//                         onClick={() => setTab(t.id)}
//                         style={{
//                             flex: 1, padding: '11px', borderRadius: '9px', border: 'none', cursor: 'pointer',
//                             background: tab === t.id ? '#1e293b' : 'transparent',
//                             color: tab === t.id ? '#e2e8f0' : '#475569',
//                             fontSize: '11px', fontWeight: 700, letterSpacing: '1px',
//                             fontFamily: "'Space Mono',monospace",
//                             boxShadow: tab === t.id ? '0 2px 12px #00000060' : 'none',
//                             transition: 'all 0.2s',
//                         }}>{t.label}</button>
//                 ))}
//             </div>

//             {/* ══════════════════════════════════════════════════════════════ */}
//             {/*  TAB: QR + UPI                                                */}
//             {/* ══════════════════════════════════════════════════════════════ */}
//             {tab === 'qr' && (
//                 <div className="fade-up">
//                     {/* QR Code */}
//                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
//                         <div style={{
//                             padding: '22px', background: '#fff',
//                             borderRadius: '18px', border: '1px solid #1e293b',
//                             boxShadow: '0 0 40px #38bdf810',
//                         }}>
//                             <QRCode
//                                 value={upiString}
//                                 size={180}
//                                 style={{ background: '#ffffff', padding: '12px', borderRadius: '8px' }}
//                                 fgColor="#020b18"
//                                 bgColor="#ffffff"
//                                 level="H"
//                             />
//                         </div>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px' }}>
//                             <div className="pulse-dot" />
//                             <span style={{ fontSize: '10px', color: '#22c55e', letterSpacing: '2px' }}>
//                                 SCAN WITH ANY UPI APP
//                             </span>
//                         </div>
//                         <p style={{ fontSize: '11px', color: '#475569', marginTop: '6px' }}>
//                             Pay exactly <strong style={{ color: '#e2e8f0' }}>₹{fmt(txn.amount)}</strong> — no more, no less
//                         </p>
//                     </div>

//                     {/* UPI ID copy row */}
//                     <div style={{
//                         background: '#0a0f1a', border: '1px solid #1e293b',
//                         borderRadius: '12px', padding: '16px 18px', marginBottom: '22px',
//                     }}>
//                         <div style={{ fontSize: '9px', letterSpacing: '3px', color: '#334155', marginBottom: '10px' }}>
//                             OR COPY UPI ID
//                         </div>
//                         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
//                             <span style={{
//                                 fontSize: '15px', fontWeight: 700, color: '#38bdf8',
//                                 fontFamily: 'monospace', letterSpacing: '1px', wordBreak: 'break-all',
//                             }}>
//                                 {txn.upi_id}
//                             </span>
//                             <button
//                                 onClick={() => copy(txn.upi_id, 'upi')}
//                                 style={{
//                                     flexShrink: 0,
//                                     ...btnStyle(
//                                         copied === 'upi' ? '#14532d20' : '#1e293b',
//                                         copied === 'upi' ? '#22c55e' : '#64748b',
//                                         copied === 'upi' ? '#22c55e40' : '#334155'
//                                     )
//                                 }}>
//                                 {copied === 'upi' ? '✓ COPIED' : 'COPY'}
//                             </button>
//                         </div>
//                     </div>

//                     {/* UPI App buttons */}
//                     <div style={{ marginBottom: '24px' }}>
//                         <div style={{ fontSize: '9px', letterSpacing: '3px', color: '#334155', marginBottom: '14px' }}>
//                             PAY DIRECTLY WITH
//                         </div>
//                         <div style={{
//                             display: 'grid',
//                             gridTemplateColumns: 'repeat(3, 1fr)',
//                             gap: '10px',
//                         }}>
//                             {UPI_APPS.map(app => (
//                                 <button
//                                     key={app.id}
//                                     onClick={() => openUpiApp(app.id)}
//                                     onMouseEnter={() => setAppHovered(app.id)}
//                                     onMouseLeave={() => setAppHovered(null)}
//                                     style={{
//                                         display: 'flex', flexDirection: 'column',
//                                         alignItems: 'center', gap: '8px',
//                                         padding: '14px 8px',
//                                         background: appHovered === app.id ? '#1e293b' : '#0a0f1a',
//                                         border: `1px solid ${appHovered === app.id ? '#1e4a7f' : '#1e293b'}`,
//                                         borderRadius: '12px', cursor: 'pointer',
//                                         transition: 'all 0.2s',
//                                         transform: appHovered === app.id ? 'translateY(-3px)' : 'translateY(0)',
//                                         boxShadow: appHovered === app.id ? '0 8px 24px #00000070' : 'none',
//                                     }}
//                                 >
//                                     {/* App icon circle */}
//                                     <div style={{
//                                         width: '42px', height: '42px', borderRadius: '12px',
//                                         background: app.bg,
//                                         display: 'flex', alignItems: 'center', justifyContent: 'center',
//                                         fontSize: '18px',
//                                         boxShadow: appHovered === app.id ? `0 4px 16px ${app.bg}50` : 'none',
//                                         transition: 'box-shadow 0.2s',
//                                     }}>
//                                         {/* Custom icons per app */}
//                                         {app.id === 'phonepe' && (
//                                             <span style={{ color: '#fff', fontSize: '14px', fontWeight: 800, fontFamily: 'sans-serif' }}>P</span>
//                                         )}
//                                         {app.id === 'gpay' && (
//                                             <span style={{ color: '#4285F4', fontSize: '11px', fontWeight: 800, fontFamily: 'sans-serif' }}>G Pay</span>
//                                         )}
//                                         {app.id === 'paytm' && (
//                                             <span style={{ color: '#fff', fontSize: '10px', fontWeight: 700, fontFamily: 'sans-serif' }}>Paytm</span>
//                                         )}
//                                         {app.id === 'bhim' && (
//                                             <span style={{ color: '#fff', fontSize: '11px', fontWeight: 700, fontFamily: 'sans-serif' }}>BHIM</span>
//                                         )}
//                                         {app.id === 'amazonpay' && (
//                                             <span style={{ color: '#FF9900', fontSize: '9px', fontWeight: 700, fontFamily: 'sans-serif', textAlign: 'center' }}>AMZ</span>
//                                         )}
//                                         {app.id === 'whatsapp' && (
//                                             <span style={{ color: '#fff', fontSize: '18px' }}>💬</span>
//                                         )}
//                                     </div>
//                                     <span style={{ fontSize: '9px', color: '#64748b', letterSpacing: '0.5px' }}>
//                                         {app.label}
//                                     </span>
//                                 </button>
//                             ))}
//                         </div>
//                         <p style={{ fontSize: '9px', color: '#1e293b', marginTop: '10px', textAlign: 'center', letterSpacing: '1px' }}>
//                             App will open with amount pre-filled
//                         </p>
//                     </div>
//                 </div>
//             )}

//             {/* ══════════════════════════════════════════════════════════════ */}
//             {/*  TAB: BANK TRANSFER                                            */}
//             {/* ══════════════════════════════════════════════════════════════ */}
//             {tab === 'bank' && (
//                 <div className="fade-up" style={{ marginBottom: '24px' }}>
//                     {[
//                         { label: 'Account Holder', val: txn.account_name, key: 'name' },
//                         { label: 'Account Number', val: txn.account_no, key: 'accno' },
//                         { label: 'IFSC Code', val: txn.ifsc_code, key: 'ifsc' },
//                         { label: 'Bank Name', val: txn.bank_name, key: 'bank' },
//                         { label: 'Branch', val: txn.branch, key: 'branch' },
//                     ].map(row => (
//                         <div key={row.key} style={{
//                             display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//                             padding: '14px 16px', background: '#0a0f1a',
//                             border: '1px solid #1e293b', borderRadius: '11px', marginBottom: '8px',
//                             gap: '12px',
//                         }}>
//                             <div style={{ minWidth: 0 }}>
//                                 <div style={{ fontSize: '9px', color: '#334155', letterSpacing: '2px', marginBottom: '4px' }}>
//                                     {row.label}
//                                 </div>
//                                 <div style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', fontFamily: 'monospace', wordBreak: 'break-all' }}>
//                                     {row.val}
//                                 </div>
//                             </div>
//                             <button
//                                 onClick={() => copy(row.val, row.key)}
//                                 style={{
//                                     flexShrink: 0,
//                                     ...btnStyle(
//                                         copied === row.key ? '#14532d20' : '#1e293b',
//                                         copied === row.key ? '#22c55e' : '#64748b',
//                                         copied === row.key ? '#22c55e40' : '#334155'
//                                     )
//                                 }}>
//                                 {copied === row.key ? '✓' : 'COPY'}
//                             </button>
//                         </div>
//                     ))}

//                     {/* Important note */}
//                     <div style={{
//                         background: '#D4A84710', border: '1px solid #D4A84730',
//                         borderRadius: '11px', padding: '14px 16px', marginTop: '4px',
//                     }}>
//                         <p style={{ fontSize: '11px', color: '#D4A847', letterSpacing: '0.5px', lineHeight: 1.7 }}>
//                             ⚠ Transfer <strong>exactly ₹{fmt(txn.amount)}</strong> from your bank.
//                             Different amount won't be credited automatically.
//                         </p>
//                     </div>
//                 </div>
//             )}

//             {/* ── UTR MANUAL VERIFY ── */}
//             <div style={{
//                 background: '#0a0f1a', border: '1px solid #1e293b',
//                 borderRadius: '12px', padding: '18px', marginBottom: '20px',
//             }}>
//                 <div style={{ fontSize: '9px', letterSpacing: '3px', color: '#334155', marginBottom: '12px' }}>
//                     ALREADY PAID? ENTER UTR / REF NUMBER
//                 </div>
//                 <div style={{ display: 'flex', gap: '10px' }}>
//                     <input
//                         type="text"
//                         placeholder="Enter 12-digit UTR number"
//                         value={utrInput}
//                         onChange={e => setUtrInput(e.target.value)}
//                         onKeyDown={e => e.key === 'Enter' && verifyUtr()}
//                         style={{
//                             flex: 1, padding: '11px 14px',
//                             background: '#060d1a', border: '1px solid #1e293b',
//                             borderRadius: '9px', color: '#e2e8f0',
//                             fontSize: '13px', fontFamily: 'monospace',
//                             outline: 'none', letterSpacing: '1px',
//                         }}
//                     />
//                     <button
//                         onClick={verifyUtr}
//                         disabled={verifying || !utrInput.trim()}
//                         style={{
//                             padding: '11px 18px', flexShrink: 0,
//                             background: '#1e3a5f', border: '1px solid #1e5a8f',
//                             borderRadius: '9px', color: '#38bdf8',
//                             fontSize: '11px', fontWeight: 700, cursor: 'pointer',
//                             fontFamily: "'Space Mono',monospace", letterSpacing: '1px',
//                             opacity: !utrInput.trim() ? 0.5 : 1,
//                             transition: 'all 0.2s',
//                         }}>
//                         {verifying ? '...' : 'VERIFY'}
//                     </button>
//                 </div>
//                 {verifyErr && (
//                     <p style={{ fontSize: '10px', color: '#f97316', marginTop: '8px', letterSpacing: '0.5px' }}>
//                         ⚠ {verifyErr}
//                     </p>
//                 )}
//             </div>

//             {/* ── POLLING INDICATOR ── */}
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '24px' }}>
//                 <div className="pulse-dot" />
//                 <span style={{ fontSize: '9px', color: '#334155', letterSpacing: '3px' }}>
//                     WAITING FOR PAYMENT...
//                 </span>
//             </div>

//             {/* ── DEMO BUTTON ── */}
//             <div style={{
//                 paddingTop: '18px', borderTop: '1px solid #0d1526',
//                 textAlign: 'center',
//             }}>
//                 <p style={{ fontSize: '8px', color: '#1e293b', letterSpacing: '2px', marginBottom: '10px' }}>
//                     ─ DEVELOPMENT MODE ONLY ─
//                 </p>
//                 <button
//                     onClick={simulatePay}
//                     style={{
//                         padding: '10px 24px', background: '#0f172a',
//                         border: '1px solid #1e293b', borderRadius: '8px',
//                         color: '#334155', fontSize: '10px', cursor: 'pointer',
//                         fontFamily: "'Space Mono',monospace", letterSpacing: '2px',
//                         transition: 'all 0.2s',
//                     }}
//                     onMouseEnter={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#334155' }}
//                     onMouseLeave={e => { e.currentTarget.style.color = '#334155'; e.currentTarget.style.borderColor = '#1e293b' }}
//                 >
//                     SIMULATE PAYMENT ← REMOVE IN PRODUCTION
//                 </button>
//             </div>
//         </FullScreen>
//     )
// }

// // ── Layout wrapper ────────────────────────────────────────────────────────────
// function FullScreen({ children }) {
//     return (
//         <div style={{
//             minHeight: '100vh',
//             background: 'radial-gradient(ellipse 80% 60% at 50% 20%, #0a1a30, #020b18)',
//             display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
//             padding: '24px 16px 40px',
//             fontFamily: "'Space Mono',monospace",
//         }}>
//             {/* Background grid */}
//             <div style={{
//                 position: 'fixed', inset: 0, pointerEvents: 'none',
//                 backgroundImage: 'linear-gradient(#38bdf808 1px,transparent 1px),linear-gradient(90deg,#38bdf808 1px,transparent 1px)',
//                 backgroundSize: '32px 32px',
//                 zIndex: 0,
//             }} />

//             {/* Card */}
//             <div style={{
//                 position: 'relative', zIndex: 1,
//                 width: '100%', maxWidth: '460px',
//                 background: '#0d1526',
//                 borderRadius: '20px',
//                 border: '1px solid #1e293b',
//                 boxShadow: '0 40px 120px #00000090, 0 0 0 1px #1e3a5f55 inset',
//                 padding: '28px 26px 32px',
//                 marginTop: '16px',
//             }}>
//                 {children}
//             </div>
//         </div>
//     )
// }

// // ── Style helpers ─────────────────────────────────────────────────────────────
// function btnStyle(bg, color, border) {
//     return {
//         padding: '7px 14px', background: bg,
//         border: `1px solid ${border}`, borderRadius: '8px',
//         color, fontSize: '9px', fontWeight: 700,
//         cursor: 'pointer', fontFamily: "'Space Mono',monospace",
//         letterSpacing: '1.5px', transition: 'all 0.2s',
//         flexShrink: 0,
//     }
// }

// const goldBtnStyle = {
//     padding: '13px 36px', borderRadius: '10px',
//     border: '1px solid #F0C96A44',
//     background: 'linear-gradient(135deg,#B8860B,#D4A847,#F0C96A,#D4A847,#B8860B)',
//     color: '#150F00', fontSize: '11px', fontWeight: 700,
//     fontFamily: "'Space Mono',monospace", letterSpacing: '3px',
//     cursor: 'pointer',
// }


import { useState, useEffect, useRef, useCallback } from 'react'
import { QRCode } from 'react-qr-code'

// ─────────────────────────────────────────────────────────────────────────────
//  CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_BACKEND_PAYMENT_URL //'http://localhost:3001'
const POLL_INTERVAL = 4000   // normal poll every 4s
const FOCUS_DELAY = 1200   // jab user wapas aaye to 1.2s baad check (UPI app close hone ka time)

const fmt = (n) => Number(n).toLocaleString('en-IN')

// ─────────────────────────────────────────────────────────────────────────────
//  UPI DEEP LINKS
//  Mobile: direct app scheme   |  Desktop: generic UPI link
// ─────────────────────────────────────────────────────────────────────────────
function buildDeepLink(appId, upiId, amount, name = 'GamePlay') {
    const note = 'GamePlay+Deposit'
    const base = `pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${note}`
    const upi = `upi://pay?${base}`

    const schemes = {
        phonepe: `phonepe://pay?${base}`,
        gpay: `tez://upi/pay?${base}`,
        paytm: `paytmmp://pay?${base}`,
        bhim: `upi://pay?${base}`,
        amazonpay: `upi://pay?${base}`,
        whatsapp: `whatsapp://send?text=upi://pay?${base}`, // fallback
    }
    return schemes[appId] || upi
}

const UPI_APPS = [
    { id: 'phonepe', label: 'PhonePe', bg: '#5f259f', fg: '#fff', initials: 'Pe' },
    { id: 'gpay', label: 'GPay', bg: '#fff', fg: '#4285F4', initials: 'G' },
    { id: 'paytm', label: 'Paytm', bg: '#00BAF2', fg: '#fff', initials: 'Pay' },
    { id: 'bhim', label: 'BHIM', bg: '#00529c', fg: '#fff', initials: '🇮🇳' },
    { id: 'amazonpay', label: 'Amazon Pay', bg: '#232F3E', fg: '#FF9900', initials: 'A' },
    { id: 'whatsapp', label: 'WhatsApp', bg: '#25D366', fg: '#fff', initials: 'WA' },
]

// ─────────────────────────────────────────────────────────────────────────────
//  HOOKS
// ─────────────────────────────────────────────────────────────────────────────
function useCountdown(expiresAt) {
    const [secs, setSecs] = useState(900)
    useEffect(() => {
        if (!expiresAt) return
        const tick = () => setSecs(Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000)))
        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [expiresAt])
    const m = String(Math.floor(secs / 60)).padStart(2, '0')
    const s = String(secs % 60).padStart(2, '0')
    return { display: `${m}:${s}`, expired: secs === 0, secs, pct: Math.min(100, (secs / 900) * 100) }
}

function useCopy() {
    const [k, setK] = useState(null)
    const copy = (text, key) => {
        try { navigator.clipboard.writeText(text) } catch {
            const el = Object.assign(document.createElement('textarea'), { value: text })
            document.body.appendChild(el); el.select(); document.execCommand('copy'); el.remove()
        }
        setK(key); setTimeout(() => setK(null), 2000)
    }
    return { copied: k, copy }
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function PayPage({ txnId }) {
    const [txn, setTxn] = useState(null)
    const [loading, setLoading] = useState(true)
    const [fetchErr, setFetchErr] = useState('')
    const [status, setStatus] = useState('pending')   // pending | success | expired
    const [tab, setTab] = useState('qr')         // qr | bank
    const [utrVal, setUtrVal] = useState('')
    const [verifying, setVerifying] = useState(false)
    const [verifyMsg, setVerifyMsg] = useState({ text: '', ok: false })
    const [checkingNow, setCheckingNow] = useState(false)  // manual "check now" spinner
    const [appHov, setAppHov] = useState(null)
    const [justLaunched, setJustLaunched] = useState(null) // which app was just opened
    const { copied, copy } = useCopy()
    const pollRef = useRef(null)
    const timer = useCountdown(txn?.expires_at)

    // ── Fetch transaction details ─────────────────────────────────────────────
    useEffect(() => {
        if (!txnId) { setFetchErr('No transaction ID in URL.'); setLoading(false); return }
        fetch(`${API}/api/txn/${txnId}`)
            .then(r => r.json())
            .then(data => {
                if (data.error) throw new Error(data.error)
                setTxn(data)
                setStatus(data.status)
            })
            .catch(e => setFetchErr(e.message || 'Cannot connect to payment server (port 3001).'))
            .finally(() => setLoading(false))
    }, [txnId])

    // ── Core: check payment status once ──────────────────────────────────────
    const checkStatus = useCallback(async (showSpinner = false) => {
        if (!txnId) return
        if (showSpinner) setCheckingNow(true)
        try {
            const r = await fetch(`${API}/api/txn/status/${txnId}`)
            const data = await r.json()
            if (data.status && data.status !== 'pending') {
                setStatus(data.status)
                clearInterval(pollRef.current)
                if (data.status === 'success') {
                    // 2 second success screen, phir redirect
                    setTimeout(() => {
                        const ret = txn?.return_url || import.meta.env.VITE_FRONTEND_MAIN_URL //'http://localhost:5173'
                        window.location.href = `${ret}/deposit/success?txnId=${txnId}&coins=${data.coins}&status=success`
                    }, 2200)
                }
            }
        } catch (_) { }
        finally { if (showSpinner) setCheckingNow(false) }
    }, [txnId, txn])

    // ── Background polling (every 4s) ─────────────────────────────────────────
    useEffect(() => {
        if (!txnId || status !== 'pending') return
        pollRef.current = setInterval(() => checkStatus(false), POLL_INTERVAL)
        return () => clearInterval(pollRef.current)
    }, [txnId, status, checkStatus])

    // ── KEY FEATURE: visibilitychange + focus — jab UPI app se wapas aaye ──
    // Jab user UPI app mein chala jaata hai → tab hidden hoti hai
    // Jab wapas aata hai → tab visible/focused hoti hai → turant check karo
    useEffect(() => {
        if (status !== 'pending') return

        const onVisible = () => {
            if (document.visibilityState === 'visible') {
                // Thoda wait karo — UPI app close hone ke baad backend update hone mein time lagta hai
                setTimeout(() => checkStatus(true), FOCUS_DELAY)
            }
        }

        const onFocus = () => {
            setTimeout(() => checkStatus(true), FOCUS_DELAY)
        }

        document.addEventListener('visibilitychange', onVisible)
        window.addEventListener('focus', onFocus)

        return () => {
            document.removeEventListener('visibilitychange', onVisible)
            window.removeEventListener('focus', onFocus)
        }
    }, [status, checkStatus])

    // ── Handle timer expiry ───────────────────────────────────────────────────
    useEffect(() => {
        if (timer.expired && status === 'pending' && txn) {
            clearInterval(pollRef.current)
            setStatus('expired')
        }
    }, [timer.expired, status, txn])

    // ── Open UPI app ──────────────────────────────────────────────────────────
    const openApp = (appId) => {
        if (!txn) return
        setJustLaunched(appId)
        setTimeout(() => setJustLaunched(null), 4000)

        const url = buildDeepLink(appId, txn.upi_id, txn.amount, txn.account_name)

        // Try scheme — if app not installed, browser will do nothing / show error
        // On desktop, fallback to generic UPI intent
        window.location.href = url

        // After 3s if still on page (app not installed or desktop), show fallback info
    }

    // ── UTR manual verify ─────────────────────────────────────────────────────
    const verifyUtr = async () => {
        if (!utrVal.trim()) return
        setVerifying(true); setVerifyMsg({ text: '', ok: false })
        try {
            const r = await fetch(`${API}/api/payment/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ txnId, utrNumber: utrVal.trim() }),
            })
            const data = await r.json()
            if (data.success && data.status === 'success') {
                setStatus('success')
                setTimeout(() => {
                    const ret = txn?.return_url || import.meta.env.VITE_FRONTEND_MAIN_URL //|| 'http://localhost:5173'
                    window.location.href = `${ret}/deposit/success?txnId=${txnId}&coins=${txn.coins}&status=success`
                }, 2200)
            } else {
                setVerifyMsg({ text: 'UTR not matched. Check and try again, or contact support.', ok: false })
            }
        } catch {
            setVerifyMsg({ text: 'Server error. Please try again.', ok: false })
        } finally { setVerifying(false) }
    }

    // ── Simulate payment (DEMO) ───────────────────────────────────────────────
    const simulate = async () => {
        setCheckingNow(true)
        await fetch(`${API}/api/payment/simulate`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ txnId }),
        })
        await checkStatus(false)
        setCheckingNow(false)
    }

    const upiStr = txn
        ? `upi://pay?pa=${txn.upi_id}&pn=${encodeURIComponent(txn.account_name)}&am=${txn.amount}&cu=INR&tn=GamePlay+Deposit`
        : ''

    // ═════════════════════════════════════════════════════════════════════════
    //  LOADING
    // ═════════════════════════════════════════════════════════════════════════
    if (loading) return (
        <Shell>
            <Center>
                <div style={{ animation: 'gpSpin 1.2s linear infinite' }}>
                    <svg width="48" height="48" viewBox="0 0 48 48">
                        <polygon points="24,2 46,24 24,46 2,24"
                            fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                        <polygon points="24,12 36,24 24,36 12,24"
                            fill="#1e3a5f" stroke="#38bdf8" strokeWidth="0.75" />
                    </svg>
                </div>
                <p style={S.muted}>LOADING PAYMENT...</p>
            </Center>
        </Shell>
    )

    // ═════════════════════════════════════════════════════════════════════════
    //  ERROR
    // ═════════════════════════════════════════════════════════════════════════
    if (fetchErr) return (
        <Shell>
            <Center>
                <svg width="52" height="52" viewBox="0 0 52 52">
                    <polygon points="26,2 50,26 26,50 2,26" fill="#7f1d1d20" stroke="#ef4444" strokeWidth="1.5" />
                    <text x="26" y="32" textAnchor="middle" fontSize="20" fill="#ef4444">!</text>
                </svg>
                <p style={{ ...S.muted, color: '#ef4444' }}>{fetchErr}</p>
                <button onClick={() => window.history.back()} style={S.ghostBtn}>← GO BACK</button>
            </Center>
        </Shell>
    )

    // ═════════════════════════════════════════════════════════════════════════
    //  SUCCESS
    // ═════════════════════════════════════════════════════════════════════════
    if (status === 'success') return (
        <Shell>
            <Center>
                <div style={{ animation: 'gpPulse 1.5s ease-in-out infinite' }}>
                    <svg width="88" height="88" viewBox="0 0 88 88">
                        <circle cx="44" cy="44" r="40" fill="#22c55e12" stroke="#22c55e" strokeWidth="2" />
                        <path d="M26 44L37 56L62 32" stroke="#22c55e" strokeWidth="3"
                            fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <h2 style={{ fontSize: '20px', color: '#22c55e', letterSpacing: '3px' }}>PAYMENT CONFIRMED</h2>
                <p style={S.muted}>Redirecting back to GamePlay...</p>
                <div style={{ fontSize: '2.6rem', fontWeight: 700, color: '#D4A847', fontFamily: 'monospace', letterSpacing: '2px' }}>
                    +{fmt(txn?.coins || 0)} ₵
                </div>
            </Center>
        </Shell>
    )

    // ═════════════════════════════════════════════════════════════════════════
    //  EXPIRED
    // ═════════════════════════════════════════════════════════════════════════
    if (status === 'expired') return (
        <Shell>
            <Center>
                <svg width="64" height="64" viewBox="0 0 64 64">
                    <polygon points="32,2 62,32 32,62 2,32" fill="#78350f20" stroke="#f97316" strokeWidth="1.5" />
                    <text x="32" y="38" textAnchor="middle" fontSize="22" fill="#f97316">⏱</text>
                </svg>
                <h2 style={{ fontSize: '18px', color: '#f97316', letterSpacing: '2px' }}>SESSION EXPIRED</h2>
                <p style={S.muted}>This payment window has expired. Please create a new deposit.</p>
                <button onClick={() => window.location.href = `${import.meta.env.VITE_FRONTEND_MAIN_URL}/deposit`}
                    // http://localhost:5173/deposit
                    style={S.goldBtn}>
                    CREATE NEW DEPOSIT
                </button>
            </Center>
        </Shell>
    )

    // ═════════════════════════════════════════════════════════════════════════
    //  MAIN PAYMENT UI
    // ═════════════════════════════════════════════════════════════════════════
    return (
        <Shell>
            {/* ── TOP BAR ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', paddingBottom: '18px', borderBottom: '1px solid #1e293b' }}>
                {/* Brand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#0d1526', border: '1px solid #1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="18" height="18" viewBox="0 0 18 18">
                            <polygon points="9,1 17,9 9,17 1,9" fill="#1e3a5f" stroke="#38bdf8" strokeWidth="1" />
                            <text x="9" y="12.5" textAnchor="middle" fontSize="6" fill="#38bdf8" fontFamily="monospace" fontWeight="700">GP</text>
                        </svg>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0', letterSpacing: '1px' }}>GamePlay Secure Pay</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22c55e', animation: 'gpPulse 1.5s infinite' }} />
                            <span style={{ fontSize: '8px', color: '#22c55e', letterSpacing: '2px' }}>SSL SECURED</span>
                        </div>
                    </div>
                </div>

                {/* Countdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: timer.secs < 120 ? '#7f1d1d20' : '#0a1930', border: `1px solid ${timer.secs < 120 ? '#ef444440' : '#1e3a5f'}`, borderRadius: '10px', padding: '7px 13px' }}>
                    <svg width="11" height="11" viewBox="0 0 11 11">
                        <circle cx="5.5" cy="5.5" r="4.5" fill="none" stroke={timer.secs < 120 ? '#ef4444' : '#38bdf8'} strokeWidth="1" />
                        <line x1="5.5" y1="5.5" x2="5.5" y2="2.5" stroke={timer.secs < 120 ? '#ef4444' : '#38bdf8'} strokeWidth="1" strokeLinecap="round" />
                        <line x1="5.5" y1="5.5" x2="8" y2="5.5" stroke={timer.secs < 120 ? '#ef4444' : '#38bdf8'} strokeWidth="1" strokeLinecap="round" />
                    </svg>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: timer.secs < 120 ? '#ef4444' : '#38bdf8', fontFamily: 'monospace', letterSpacing: '3px' }}>
                        {timer.display}
                    </span>
                </div>
            </div>

            {/* ── AMOUNT STRIP ── */}
            <div style={{ background: 'linear-gradient(135deg,#0f172a,#1a2744)', border: '1px solid #1e3a5f', borderRadius: '14px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                    <div style={S.label}>AMOUNT TO PAY</div>
                    <div style={{ fontSize: '30px', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace', lineHeight: 1 }}>₹{fmt(txn.amount)}</div>
                </div>
                <div style={{ width: '1px', height: '36px', background: '#1e293b' }} />
                <div style={{ textAlign: 'right' }}>
                    <div style={S.label}>YOU RECEIVE</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#D4A847', fontFamily: 'monospace' }}>
                        {fmt(txn.coins)} <span style={{ fontSize: '13px', color: '#D4A84780' }}>COINS</span>
                    </div>
                </div>
            </div>

            {/* ── TAB SWITCHER ── */}
            <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', background: '#0a0f1a', borderRadius: '12px', padding: '4px' }}>
                {[{ id: 'qr', label: '📱  QR / UPI' }, { id: 'bank', label: '🏦  Bank Transfer' }].map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)} style={{
                        flex: 1, padding: '10px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                        background: tab === t.id ? '#1e293b' : 'transparent',
                        color: tab === t.id ? '#e2e8f0' : '#475569',
                        fontSize: '11px', fontWeight: 700, letterSpacing: '1px',
                        fontFamily: "'Space Mono',monospace",
                        boxShadow: tab === t.id ? '0 2px 10px #00000060' : 'none',
                        transition: 'all 0.2s',
                    }}>{t.label}</button>
                ))}
            </div>

            {/* ══════════════════════════════════════════════════ */}
            {/* TAB: QR + UPI APPS                                */}
            {/* ══════════════════════════════════════════════════ */}
            {tab === 'qr' && (
                <div>
                    {/* QR Code */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '22px' }}>
                        <div style={{ padding: '20px', background: '#ffffff', borderRadius: '18px', border: '1px solid #1e293b', boxShadow: '0 0 40px #38bdf812' }}>
                            <QRCode
                                value={upiStr}
                                size={190}
                                fgColor="#020b18"
                                bgColor="#ffffff"
                                level="H"
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', animation: 'gpPulse 1.5s infinite' }} />
                            <span style={{ fontSize: '10px', color: '#22c55e', letterSpacing: '2px' }}>SCAN WITH ANY UPI APP</span>
                        </div>
                        <p style={{ fontSize: '11px', color: '#475569', marginTop: '5px', textAlign: 'center' }}>
                            Pay exactly <strong style={{ color: '#e2e8f0' }}>₹{fmt(txn.amount)}</strong> — amount must match exactly
                        </p>
                    </div>

                    {/* UPI ID row */}
                    <div style={{ background: '#0a0f1a', border: '1px solid #1e293b', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px' }}>
                        <div style={S.label}>OR COPY UPI ID</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginTop: '8px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace', letterSpacing: '0.5px', wordBreak: 'break-all' }}>
                                {txn.upi_id}
                            </span>
                            <button onClick={() => copy(txn.upi_id, 'upi')} style={copyBtn(copied === 'upi')}>
                                {copied === 'upi' ? '✓ COPIED' : 'COPY'}
                            </button>
                        </div>
                    </div>

                    {/* ── UPI APP BUTTONS ── */}
                    <div style={{ marginBottom: '22px' }}>
                        <div style={S.label}>PAY DIRECTLY WITH APP</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginTop: '12px' }}>
                            {UPI_APPS.map(app => {
                                const isHov = appHov === app.id
                                const isLaunched = justLaunched === app.id
                                return (
                                    <button key={app.id}
                                        onClick={() => openApp(app.id)}
                                        onMouseEnter={() => setAppHov(app.id)}
                                        onMouseLeave={() => setAppHov(null)}
                                        style={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px',
                                            padding: '13px 6px',
                                            background: isLaunched ? '#14532d20' : isHov ? '#1e293b' : '#0a0f1a',
                                            border: `1px solid ${isLaunched ? '#22c55e40' : isHov ? '#2a4a7f' : '#1e293b'}`,
                                            borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
                                            transform: isHov ? 'translateY(-3px)' : 'translateY(0)',
                                            boxShadow: isHov ? '0 8px 24px #00000070' : 'none',
                                        }}>
                                        {/* Icon */}
                                        <div style={{
                                            width: '44px', height: '44px', borderRadius: '12px',
                                            background: app.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: isHov ? `0 4px 16px ${app.bg}60` : 'none',
                                            transition: 'box-shadow 0.2s',
                                        }}>
                                            <span style={{ color: app.fg, fontSize: app.initials.length > 2 ? '18px' : '13px', fontWeight: 800, fontFamily: 'sans-serif' }}>
                                                {app.initials}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '9px', color: isLaunched ? '#22c55e' : '#64748b', letterSpacing: '0.5px' }}>
                                            {isLaunched ? '✓ Opening...' : app.label}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>

                        {/* Info box — app ke baad wapas aane pe auto detect */}
                        <div style={{ marginTop: '12px', background: '#0d1f36', border: '1px solid #1e3a5f', borderRadius: '10px', padding: '12px 14px' }}>
                            <p style={{ fontSize: '10px', color: '#38bdf880', lineHeight: 1.7, letterSpacing: '0.3px' }}>
                                <span style={{ color: '#38bdf8', fontWeight: 700 }}>ℹ Auto-detect ON</span> —
                                Pay mein karo, phir is tab pe wapas aao.
                                Payment automatic detect ho jayegi.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════ */}
            {/* TAB: BANK TRANSFER                                */}
            {/* ══════════════════════════════════════════════════ */}
            {tab === 'bank' && (
                <div style={{ marginBottom: '22px' }}>
                    {[
                        { l: 'Account Holder', v: txn.account_name, k: 'name' },
                        { l: 'Account Number', v: txn.account_no, k: 'accno' },
                        { l: 'IFSC Code', v: txn.ifsc_code, k: 'ifsc' },
                        { l: 'Bank Name', v: txn.bank_name, k: 'bank' },
                        { l: 'Branch', v: txn.branch, k: 'branch' },
                    ].map(row => (
                        <div key={row.k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 15px', background: '#0a0f1a', border: '1px solid #1e293b', borderRadius: '10px', marginBottom: '7px', gap: '10px' }}>
                            <div>
                                <div style={S.label}>{row.l}</div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', fontFamily: 'monospace', wordBreak: 'break-all', marginTop: '3px' }}>{row.v}</div>
                            </div>
                            <button onClick={() => copy(row.v, row.k)} style={copyBtn(copied === row.k)}>
                                {copied === row.k ? '✓' : 'COPY'}
                            </button>
                        </div>
                    ))}
                    <div style={{ background: '#D4A84710', border: '1px solid #D4A84730', borderRadius: '10px', padding: '12px 15px', marginTop: '6px' }}>
                        <p style={{ fontSize: '11px', color: '#D4A847', lineHeight: 1.7 }}>
                            ⚠ Transfer <strong>exactly ₹{fmt(txn.amount)}</strong>. Any other amount won't be auto-credited.
                        </p>
                    </div>
                </div>
            )}

            {/* ── CHECK NOW button ── */}
            <button
                onClick={() => checkStatus(true)}
                disabled={checkingNow}
                style={{
                    width: '100%', padding: '12px', marginBottom: '16px',
                    background: checkingNow ? '#1e3a5f' : '#0d1f36',
                    border: `1px solid ${checkingNow ? '#38bdf860' : '#1e3a5f'}`,
                    borderRadius: '10px', cursor: checkingNow ? 'not-allowed' : 'pointer',
                    color: checkingNow ? '#38bdf8' : '#475569',
                    fontSize: '11px', fontWeight: 700, letterSpacing: '2px',
                    fontFamily: "'Space Mono',monospace", transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                }}
                onMouseEnter={e => { if (!checkingNow) { e.currentTarget.style.borderColor = '#38bdf840'; e.currentTarget.style.color = '#38bdf8' } }}
                onMouseLeave={e => { if (!checkingNow) { e.currentTarget.style.borderColor = '#1e3a5f'; e.currentTarget.style.color = '#475569' } }}
            >
                {checkingNow
                    ? <><span style={{ animation: 'gpSpin 1s linear infinite', display: 'inline-block', fontSize: '14px' }}>↻</span> CHECKING...</>
                    : '✓  I HAVE PAID — CHECK NOW'
                }
            </button>

            {/* ── UTR manual verify ── */}
            <div style={{ background: '#0a0f1a', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', marginBottom: '18px' }}>
                <div style={S.label}>ALREADY PAID? ENTER UTR / REF NUMBER</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <input
                        type="text"
                        placeholder="12-digit UTR number"
                        value={utrVal}
                        onChange={e => setUtrVal(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && verifyUtr()}
                        style={{ flex: 1, padding: '10px 13px', background: '#060d1a', border: '1px solid #1e293b', borderRadius: '8px', color: '#e2e8f0', fontSize: '13px', fontFamily: 'monospace', outline: 'none', letterSpacing: '1px' }}
                    />
                    <button
                        onClick={verifyUtr}
                        disabled={verifying || !utrVal.trim()}
                        style={{ padding: '10px 16px', flexShrink: 0, background: '#1e3a5f', border: '1px solid #1e5a8f', borderRadius: '8px', color: '#38bdf8', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Space Mono',monospace", letterSpacing: '1px', opacity: !utrVal.trim() ? 0.5 : 1, transition: 'all 0.2s' }}>
                        {verifying ? '...' : 'VERIFY'}
                    </button>
                </div>
                {verifyMsg.text && (
                    <p style={{ fontSize: '10px', color: verifyMsg.ok ? '#22c55e' : '#f97316', marginTop: '8px' }}>
                        {verifyMsg.ok ? '✓' : '⚠'} {verifyMsg.text}
                    </p>
                )}
            </div>

            {/* ── Polling pulse ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '22px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', animation: 'gpPulse 1.8s infinite' }} />
                <span style={{ fontSize: '9px', color: '#334155', letterSpacing: '3px' }}>
                    AUTO-CHECKING PAYMENT EVERY 4 SECONDS
                </span>
            </div>

            {/* ── DEMO simulate ── */}
            <div style={{ paddingTop: '16px', borderTop: '1px solid #0d1526', textAlign: 'center' }}>
                <p style={{ fontSize: '8px', color: '#1e293b', letterSpacing: '2px', marginBottom: '8px' }}>
                    ─ DEVELOPMENT ONLY — REMOVE IN PRODUCTION ─
                </p>
                <button
                    onClick={simulate}
                    style={{ padding: '9px 22px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#334155', fontSize: '10px', cursor: 'pointer', fontFamily: "'Space Mono',monospace", letterSpacing: '1.5px', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#334155' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#334155'; e.currentTarget.style.borderColor = '#1e293b' }}
                >
                    SIMULATE PAYMENT
                </button>
            </div>
        </Shell>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
//  LAYOUT SHELL
// ─────────────────────────────────────────────────────────────────────────────
function Shell({ children }) {
    return (
        <>
            <style>{`
                @keyframes gpSpin  { from{transform:rotate(0deg)}  to{transform:rotate(360deg)} }
                @keyframes gpPulse { 0%,100%{opacity:1}            50%{opacity:0.35}             }
                @keyframes gpUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { background: #020b18; font-family: 'Space Mono', monospace; }
                input::placeholder { color: #334155; }
                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-track  { background: #0d1526; }
                ::-webkit-scrollbar-thumb  { background: #1e3a5f; border-radius: 99px; }
            `}</style>

            <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse 80% 55% at 50% 15%,#0a1a30,#020b18)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px 14px 48px', fontFamily: "'Space Mono',monospace" }}>
                {/* BG grid */}
                <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(#38bdf808 1px,transparent 1px),linear-gradient(90deg,#38bdf808 1px,transparent 1px)', backgroundSize: '30px 30px', zIndex: 0 }} />

                {/* Card */}
                <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '460px', background: '#0d1526', borderRadius: '20px', border: '1px solid #1e293b', boxShadow: '0 40px 120px #00000090, 0 0 0 1px #1e3a5f50 inset', padding: '26px 24px 30px', marginTop: '16px' }}>
                    {children}
                </div>
            </div>
        </>
    )
}

function Center({ children }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '18px', minHeight: '400px', textAlign: 'center' }}>
            {children}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
//  STYLE HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const S = {
    label: { fontSize: '9px', letterSpacing: '3px', color: '#334155' },
    muted: { fontSize: '11px', letterSpacing: '2px', color: '#475569' },
    goldBtn: { padding: '13px 36px', borderRadius: '10px', border: '1px solid #F0C96A44', background: 'linear-gradient(135deg,#B8860B,#D4A847,#F0C96A,#D4A847,#B8860B)', color: '#150F00', fontSize: '11px', fontWeight: 700, fontFamily: "'Space Mono',monospace", letterSpacing: '3px', cursor: 'pointer' },
    ghostBtn: { padding: '9px 22px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#94a3b8', fontSize: '10px', cursor: 'pointer', fontFamily: "'Space Mono',monospace", letterSpacing: '1.5px' },
}

function copyBtn(active) {
    return {
        flexShrink: 0, padding: '6px 12px',
        background: active ? '#14532d20' : '#1e293b',
        border: `1px solid ${active ? '#22c55e40' : '#334155'}`,
        borderRadius: '7px', color: active ? '#22c55e' : '#64748b',
        fontSize: '9px', fontWeight: 700, cursor: 'pointer',
        fontFamily: "'Space Mono',monospace", letterSpacing: '1.5px', transition: 'all 0.2s',
    }
}