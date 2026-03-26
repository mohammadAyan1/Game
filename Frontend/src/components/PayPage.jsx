
// import { useState, useEffect, useRef, useCallback } from 'react'
// import { QRCode } from 'react-qr-code'

// // ─────────────────────────────────────────────────────────────────────────────
// //  CONFIG
// // ─────────────────────────────────────────────────────────────────────────────
// const API = import.meta.env.VITE_BACKEND_PAYMENT_URL //'http://localhost:3001'
// const POLL_INTERVAL = 4000   // normal poll every 4s
// const FOCUS_DELAY = 1200   // jab user wapas aaye to 1.2s baad check (UPI app close hone ka time)

// const fmt = (n) => Number(n).toLocaleString('en-IN')

// // ─────────────────────────────────────────────────────────────────────────────
// //  UPI DEEP LINKS
// //  Mobile: direct app scheme   |  Desktop: generic UPI link
// // ─────────────────────────────────────────────────────────────────────────────
// function buildDeepLink(appId, upiId, amount, name = 'GamePlay') {
//     const note = 'GamePlay+Deposit'
//     const base = `pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${note}`
//     const upi = `upi://pay?${base}`

//     const schemes = {
//         phonepe: `phonepe://pay?${base}`,
//         gpay: `tez://upi/pay?${base}`,
//         paytm: `paytmmp://pay?${base}`,
//         bhim: `upi://pay?${base}`,
//         amazonpay: `upi://pay?${base}`,
//         whatsapp: `whatsapp://send?text=upi://pay?${base}`, // fallback
//     }
//     return schemes[appId] || upi
// }

// const UPI_APPS = [
//     { id: 'phonepe', label: 'PhonePe', bg: '#5f259f', fg: '#fff', initials: 'Pe' },
//     { id: 'gpay', label: 'GPay', bg: '#fff', fg: '#4285F4', initials: 'G' },
//     { id: 'paytm', label: 'Paytm', bg: '#00BAF2', fg: '#fff', initials: 'Pay' },
//     { id: 'bhim', label: 'BHIM', bg: '#00529c', fg: '#fff', initials: '🇮🇳' },
//     { id: 'amazonpay', label: 'Amazon Pay', bg: '#232F3E', fg: '#FF9900', initials: 'A' },
//     { id: 'whatsapp', label: 'WhatsApp', bg: '#25D366', fg: '#fff', initials: 'WA' },
// ]

// // ─────────────────────────────────────────────────────────────────────────────
// //  HOOKS
// // ─────────────────────────────────────────────────────────────────────────────
// function useCountdown(expiresAt) {
//     const [secs, setSecs] = useState(900)
//     useEffect(() => {
//         if (!expiresAt) return
//         const tick = () => setSecs(Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000)))
//         tick()
//         const id = setInterval(tick, 1000)
//         return () => clearInterval(id)
//     }, [expiresAt])
//     const m = String(Math.floor(secs / 60)).padStart(2, '0')
//     const s = String(secs % 60).padStart(2, '0')
//     return { display: `${m}:${s}`, expired: secs === 0, secs, pct: Math.min(100, (secs / 900) * 100) }
// }

// function useCopy() {
//     const [k, setK] = useState(null)
//     const copy = (text, key) => {
//         try { navigator.clipboard.writeText(text) } catch {
//             const el = Object.assign(document.createElement('textarea'), { value: text })
//             document.body.appendChild(el); el.select(); document.execCommand('copy'); el.remove()
//         }
//         setK(key); setTimeout(() => setK(null), 2000)
//     }
//     return { copied: k, copy }
// }

// // ─────────────────────────────────────────────────────────────────────────────
// //  MAIN COMPONENT
// // ─────────────────────────────────────────────────────────────────────────────
// export default function PayPage({ txnId }) {

//     useEffect(() => {
//         console.log('====================================');
//         console.log(txnId);
//         console.log('====================================');
//     }, [txnId])

//     const [txn, setTxn] = useState(null)
//     const [loading, setLoading] = useState(true)
//     const [fetchErr, setFetchErr] = useState('')
//     const [status, setStatus] = useState('pending')   // pending | success | expired
//     const [tab, setTab] = useState('qr')         // qr | bank
//     const [utrVal, setUtrVal] = useState('')
//     const [verifying, setVerifying] = useState(false)
//     const [verifyMsg, setVerifyMsg] = useState({ text: '', ok: false })
//     const [checkingNow, setCheckingNow] = useState(false)  // manual "check now" spinner
//     const [appHov, setAppHov] = useState(null)
//     const [justLaunched, setJustLaunched] = useState(null) // which app was just opened
//     const { copied, copy } = useCopy()
//     const pollRef = useRef(null)
//     const timer = useCountdown(txn?.expires_at)

//     // ── Fetch transaction details ─────────────────────────────────────────────
//     useEffect(() => {
//         if (!txnId) { setFetchErr('No transaction ID in URL.'); setLoading(false); return }
//         fetch(`${API}/api/txn/${txnId}`)
//             .then(r => r.json())
//             .then(data => {
//                 if (data.error) throw new Error(data.error)
//                 setTxn(data)
//                 setStatus(data.status)
//             })
//             .catch(e => setFetchErr(e.message || 'Cannot connect to payment server (port 3001).'))
//             .finally(() => setLoading(false))
//     }, [txnId])

//     // ── Core: check payment status once ──────────────────────────────────────
//     const checkStatus = useCallback(async (showSpinner = false) => {
//         if (!txnId) return
//         if (showSpinner) setCheckingNow(true)
//         try {
//             const r = await fetch(`${API}/api/txn/status/${txnId}`)
//             const data = await r.json()
//             if (data.status && data.status !== 'pending') {
//                 setStatus(data.status)
//                 clearInterval(pollRef.current)
//                 if (data.status === 'success') {
//                     // 2 second success screen, phir redirect
//                     setTimeout(() => {
//                         const ret = txn?.return_url || import.meta.env.VITE_FRONTEND_MAIN_URL //'http://localhost:5173'
//                         window.location.href = `${ret}/deposit/success?txnId=${txnId}&coins=${data.coins}&status=success`
//                     }, 2200)
//                 }
//             }
//         } catch (err) {
//             console.error(err);
//         }
//         finally { if (showSpinner) setCheckingNow(false) }
//     }, [txnId, txn])

//     // ── Background polling (every 4s) ─────────────────────────────────────────
//     useEffect(() => {
//         if (!txnId || status !== 'pending') return
//         pollRef.current = setInterval(() => checkStatus(false), POLL_INTERVAL)
//         return () => clearInterval(pollRef.current)
//     }, [txnId, status, checkStatus])

//     // ── KEY FEATURE: visibilitychange + focus — jab UPI app se wapas aaye ──
//     // Jab user UPI app mein chala jaata hai → tab hidden hoti hai
//     // Jab wapas aata hai → tab visible/focused hoti hai → turant check karo
//     useEffect(() => {
//         if (status !== 'pending') return

//         const onVisible = () => {
//             if (document.visibilityState === 'visible') {
//                 // Thoda wait karo — UPI app close hone ke baad backend update hone mein time lagta hai
//                 setTimeout(() => checkStatus(true), FOCUS_DELAY)
//             }
//         }

//         const onFocus = () => {
//             setTimeout(() => checkStatus(true), FOCUS_DELAY)
//         }

//         document.addEventListener('visibilitychange', onVisible)
//         window.addEventListener('focus', onFocus)

//         return () => {
//             document.removeEventListener('visibilitychange', onVisible)
//             window.removeEventListener('focus', onFocus)
//         }
//     }, [status, checkStatus])

//     // ── Handle timer expiry ───────────────────────────────────────────────────
//     useEffect(() => {
//         if (timer.expired && status === 'pending' && txn) {
//             clearInterval(pollRef.current)
//             setStatus('expired')
//         }
//     }, [timer.expired, status, txn])

//     // ── Open UPI app ──────────────────────────────────────────────────────────
//     const openApp = (appId) => {
//         if (!txn) return
//         setJustLaunched(appId)
//         setTimeout(() => setJustLaunched(null), 4000)

//         const url = buildDeepLink(appId, txn.upi_id, txn.amount, txn.account_name)

//         // Try scheme — if app not installed, browser will do nothing / show error
//         // On desktop, fallback to generic UPI intent
//         window.location.href = url

//         // After 3s if still on page (app not installed or desktop), show fallback info
//     }



//     // ── UTR manual verify ─────────────────────────────────────────────────────
//     const verifyUtr = async () => {
//         if (!utrVal.trim()) return
//         setVerifying(true); setVerifyMsg({ text: '', ok: false })
//         try {
//             const r = await fetch(`${API}/api/payment/verify`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ txnId, utrNumber: utrVal.trim() }),
//             })
//             const data = await r.json()
//             if (data.success && data.status === 'success') {
//                 setStatus('success')
//                 setTimeout(() => {
//                     const ret = txn?.return_url || import.meta.env.VITE_FRONTEND_MAIN_URL //|| 'http://localhost:5173'
//                     window.location.href = `${ret}/deposit/success?txnId=${txnId}&coins=${txn.coins}&status=success`
//                 }, 2200)
//             } else {
//                 setVerifyMsg({ text: 'UTR not matched. Check and try again, or contact support.', ok: false })
//             }
//         } catch {
//             setVerifyMsg({ text: 'Server error. Please try again.', ok: false })
//         } finally { setVerifying(false) }
//     }

//     // ── Simulate payment (DEMO) ───────────────────────────────────────────────
//     const simulate = async () => {
//         setCheckingNow(true)
//         await fetch(`${API}/api/payment/simulate`, {
//             method: 'POST', headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ txnId }),
//         })
//         await checkStatus(false)
//         setCheckingNow(false)
//     }

//     // const upiStr = txn
//     //     ? `upi://pay?pa=${txn.upi_id}&pn=${encodeURIComponent(txn.account_name)}&am=${txn.amount}&cu=INR&tn=GamePlay+Deposit`
//     //     : ''

//     const upiStr = txn
//         ? `upi://pay?pa=${encodeURIComponent(txn.upi_id)}&pn=${encodeURIComponent(txn.account_name)}&am=${txn.amount}&cu=INR&tn=${encodeURIComponent("GamePlay Deposit")}`
//         : ''

//     // ═════════════════════════════════════════════════════════════════════════
//     //  LOADING
//     // ═════════════════════════════════════════════════════════════════════════
//     if (loading) return (
//         <Shell>
//             <Center>
//                 <div style={{ animation: 'gpSpin 1.2s linear infinite' }}>
//                     <svg width="48" height="48" viewBox="0 0 48 48">
//                         <polygon points="24,2 46,24 24,46 2,24"
//                             fill="none" stroke="#38bdf8" strokeWidth="1.5" />
//                         <polygon points="24,12 36,24 24,36 12,24"
//                             fill="#1e3a5f" stroke="#38bdf8" strokeWidth="0.75" />
//                     </svg>
//                 </div>
//                 <p style={S.muted}>LOADING PAYMENT...</p>
//             </Center>
//         </Shell>
//     )

//     // ═════════════════════════════════════════════════════════════════════════
//     //  ERROR
//     // ═════════════════════════════════════════════════════════════════════════
//     if (fetchErr) return (
//         <Shell>
//             <Center>
//                 <svg width="52" height="52" viewBox="0 0 52 52">
//                     <polygon points="26,2 50,26 26,50 2,26" fill="#7f1d1d20" stroke="#ef4444" strokeWidth="1.5" />
//                     <text x="26" y="32" textAnchor="middle" fontSize="20" fill="#ef4444">!</text>
//                 </svg>
//                 <p style={{ ...S.muted, color: '#ef4444' }}>{fetchErr}</p>
//                 <button onClick={() => window.history.back()} style={S.ghostBtn}>← GO BACK</button>
//             </Center>
//         </Shell>
//     )

//     // ═════════════════════════════════════════════════════════════════════════
//     //  SUCCESS
//     // ═════════════════════════════════════════════════════════════════════════
//     if (status === 'success') return (
//         <Shell>
//             <Center>
//                 <div style={{ animation: 'gpPulse 1.5s ease-in-out infinite' }}>
//                     <svg width="88" height="88" viewBox="0 0 88 88">
//                         <circle cx="44" cy="44" r="40" fill="#22c55e12" stroke="#22c55e" strokeWidth="2" />
//                         <path d="M26 44L37 56L62 32" stroke="#22c55e" strokeWidth="3"
//                             fill="none" strokeLinecap="round" strokeLinejoin="round" />
//                     </svg>
//                 </div>
//                 <h2 style={{ fontSize: '20px', color: '#22c55e', letterSpacing: '3px' }}>PAYMENT CONFIRMED</h2>
//                 <p style={S.muted}>Redirecting back to GamePlay...</p>
//                 <div style={{ fontSize: '2.6rem', fontWeight: 700, color: '#D4A847', fontFamily: 'monospace', letterSpacing: '2px' }}>
//                     +{fmt(txn?.coins || 0)} ₵
//                 </div>
//             </Center>
//         </Shell>
//     )

//     // ═════════════════════════════════════════════════════════════════════════
//     //  EXPIRED
//     // ═════════════════════════════════════════════════════════════════════════
//     if (status === 'expired') return (
//         <Shell>
//             <Center>
//                 <svg width="64" height="64" viewBox="0 0 64 64">
//                     <polygon points="32,2 62,32 32,62 2,32" fill="#78350f20" stroke="#f97316" strokeWidth="1.5" />
//                     <text x="32" y="38" textAnchor="middle" fontSize="22" fill="#f97316">⏱</text>
//                 </svg>
//                 <h2 style={{ fontSize: '18px', color: '#f97316', letterSpacing: '2px' }}>SESSION EXPIRED</h2>
//                 <p style={S.muted}>This payment window has expired. Please create a new deposit.</p>
//                 <button onClick={() => window.location.href = `${import.meta.env.VITE_FRONTEND_MAIN_URL}/deposit`}
//                     // http://localhost:5173/deposit
//                     style={S.goldBtn}>
//                     CREATE NEW DEPOSIT
//                 </button>
//             </Center>
//         </Shell>
//     )

//     // ═════════════════════════════════════════════════════════════════════════
//     //  MAIN PAYMENT UI
//     // ═════════════════════════════════════════════════════════════════════════
//     return (
//         <Shell>
//             {/* ── TOP BAR ── */}
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', paddingBottom: '18px', borderBottom: '1px solid #1e293b' }}>
//                 {/* Brand */}
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                     <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#0d1526', border: '1px solid #1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                         <svg width="18" height="18" viewBox="0 0 18 18">
//                             <polygon points="9,1 17,9 9,17 1,9" fill="#1e3a5f" stroke="#38bdf8" strokeWidth="1" />
//                             <text x="9" y="12.5" textAnchor="middle" fontSize="6" fill="#38bdf8" fontFamily="monospace" fontWeight="700">GP</text>
//                         </svg>
//                     </div>
//                     <div>
//                         <div style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0', letterSpacing: '1px' }}>GamePlay Secure Pay</div>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
//                             <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22c55e', animation: 'gpPulse 1.5s infinite' }} />
//                             <span style={{ fontSize: '8px', color: '#22c55e', letterSpacing: '2px' }}>SSL SECURED</span>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Countdown */}
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: timer.secs < 120 ? '#7f1d1d20' : '#0a1930', border: `1px solid ${timer.secs < 120 ? '#ef444440' : '#1e3a5f'}`, borderRadius: '10px', padding: '7px 13px' }}>
//                     <svg width="11" height="11" viewBox="0 0 11 11">
//                         <circle cx="5.5" cy="5.5" r="4.5" fill="none" stroke={timer.secs < 120 ? '#ef4444' : '#38bdf8'} strokeWidth="1" />
//                         <line x1="5.5" y1="5.5" x2="5.5" y2="2.5" stroke={timer.secs < 120 ? '#ef4444' : '#38bdf8'} strokeWidth="1" strokeLinecap="round" />
//                         <line x1="5.5" y1="5.5" x2="8" y2="5.5" stroke={timer.secs < 120 ? '#ef4444' : '#38bdf8'} strokeWidth="1" strokeLinecap="round" />
//                     </svg>
//                     <span style={{ fontSize: '16px', fontWeight: 700, color: timer.secs < 120 ? '#ef4444' : '#38bdf8', fontFamily: 'monospace', letterSpacing: '3px' }}>
//                         {timer.display}
//                     </span>
//                 </div>
//             </div>

//             {/* ── AMOUNT STRIP ── */}
//             <div style={{ background: 'linear-gradient(135deg,#0f172a,#1a2744)', border: '1px solid #1e3a5f', borderRadius: '14px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
//                 <div>
//                     <div style={S.label}>AMOUNT TO PAY</div>
//                     <div style={{ fontSize: '30px', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace', lineHeight: 1 }}>₹{fmt(txn.amount)}</div>
//                 </div>
//                 <div style={{ width: '1px', height: '36px', background: '#1e293b' }} />
//                 <div style={{ textAlign: 'right' }}>
//                     <div style={S.label}>YOU RECEIVE</div>
//                     <div style={{ fontSize: '20px', fontWeight: 700, color: '#D4A847', fontFamily: 'monospace' }}>
//                         {fmt(txn.coins)} <span style={{ fontSize: '13px', color: '#D4A84780' }}>COINS</span>
//                     </div>
//                 </div>
//             </div>

//             {/* ── TAB SWITCHER ── */}
//             <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', background: '#0a0f1a', borderRadius: '12px', padding: '4px' }}>
//                 {[{ id: 'qr', label: '📱  QR / UPI' }, { id: 'bank', label: '🏦  Bank Transfer' }].map(t => (
//                     <button key={t.id} onClick={() => setTab(t.id)} style={{
//                         flex: 1, padding: '10px', borderRadius: '9px', border: 'none', cursor: 'pointer',
//                         background: tab === t.id ? '#1e293b' : 'transparent',
//                         color: tab === t.id ? '#e2e8f0' : '#475569',
//                         fontSize: '11px', fontWeight: 700, letterSpacing: '1px',
//                         fontFamily: "'Space Mono',monospace",
//                         boxShadow: tab === t.id ? '0 2px 10px #00000060' : 'none',
//                         transition: 'all 0.2s',
//                     }}>{t.label}</button>
//                 ))}
//             </div>

//             {/* ══════════════════════════════════════════════════ */}
//             {/* TAB: QR + UPI APPS                                */}
//             {/* ══════════════════════════════════════════════════ */}
//             {tab === 'qr' && (
//                 <div>
//                     {/* QR Code */}
//                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '22px' }}>
//                         <div style={{ padding: '20px', background: '#ffffff', borderRadius: '18px', border: '1px solid #1e293b', boxShadow: '0 0 40px #38bdf812' }}>
//                             <QRCode
//                                 value={upiStr}
//                                 size={190}
//                                 fgColor="#020b18"
//                                 bgColor="#ffffff"
//                                 level="H"
//                             />
//                         </div>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
//                             <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', animation: 'gpPulse 1.5s infinite' }} />
//                             <span style={{ fontSize: '10px', color: '#22c55e', letterSpacing: '2px' }}>SCAN WITH ANY UPI APP</span>
//                         </div>
//                         <p style={{ fontSize: '11px', color: '#475569', marginTop: '5px', textAlign: 'center' }}>
//                             Pay exactly <strong style={{ color: '#e2e8f0' }}>₹{fmt(txn.amount)}</strong> — amount must match exactly
//                         </p>
//                     </div>

//                     {/* UPI ID row */}
//                     <div style={{ background: '#0a0f1a', border: '1px solid #1e293b', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px' }}>
//                         <div style={S.label}>OR COPY UPI ID</div>
//                         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginTop: '8px' }}>
//                             <span style={{ fontSize: '14px', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace', letterSpacing: '0.5px', wordBreak: 'break-all' }}>
//                                 {txn.upi_id}
//                             </span>
//                             <button onClick={() => copy(txn.upi_id, 'upi')} style={copyBtn(copied === 'upi')}>
//                                 {copied === 'upi' ? '✓ COPIED' : 'COPY'}
//                             </button>
//                         </div>
//                     </div>

//                     {/* ── UPI APP BUTTONS ── */}
//                     <div style={{ marginBottom: '22px' }}>
//                         <div style={S.label}>PAY DIRECTLY WITH APP</div>
//                         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginTop: '12px' }}>
//                             {UPI_APPS.map(app => {
//                                 const isHov = appHov === app.id
//                                 const isLaunched = justLaunched === app.id
//                                 return (
//                                     <button key={app.id}
//                                         onClick={() => openApp(app.id)}
//                                         onMouseEnter={() => setAppHov(app.id)}
//                                         onMouseLeave={() => setAppHov(null)}
//                                         style={{
//                                             display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px',
//                                             padding: '13px 6px',
//                                             background: isLaunched ? '#14532d20' : isHov ? '#1e293b' : '#0a0f1a',
//                                             border: `1px solid ${isLaunched ? '#22c55e40' : isHov ? '#2a4a7f' : '#1e293b'}`,
//                                             borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
//                                             transform: isHov ? 'translateY(-3px)' : 'translateY(0)',
//                                             boxShadow: isHov ? '0 8px 24px #00000070' : 'none',
//                                         }}>
//                                         {/* Icon */}
//                                         <div style={{
//                                             width: '44px', height: '44px', borderRadius: '12px',
//                                             background: app.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
//                                             boxShadow: isHov ? `0 4px 16px ${app.bg}60` : 'none',
//                                             transition: 'box-shadow 0.2s',
//                                         }}>
//                                             <span style={{ color: app.fg, fontSize: app.initials.length > 2 ? '18px' : '13px', fontWeight: 800, fontFamily: 'sans-serif' }}>
//                                                 {app.initials}
//                                             </span>
//                                         </div>
//                                         <span style={{ fontSize: '9px', color: isLaunched ? '#22c55e' : '#64748b', letterSpacing: '0.5px' }}>
//                                             {isLaunched ? '✓ Opening...' : app.label}
//                                         </span>
//                                     </button>
//                                 )
//                             })}
//                         </div>

//                         {/* Info box — app ke baad wapas aane pe auto detect */}
//                         <div style={{ marginTop: '12px', background: '#0d1f36', border: '1px solid #1e3a5f', borderRadius: '10px', padding: '12px 14px' }}>
//                             <p style={{ fontSize: '10px', color: '#38bdf880', lineHeight: 1.7, letterSpacing: '0.3px' }}>
//                                 <span style={{ color: '#38bdf8', fontWeight: 700 }}>ℹ Auto-detect ON</span> —
//                                 Pay mein karo, phir is tab pe wapas aao.
//                                 Payment automatic detect ho jayegi.
//                             </p>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* ══════════════════════════════════════════════════ */}
//             {/* TAB: BANK TRANSFER                                */}
//             {/* ══════════════════════════════════════════════════ */}
//             {tab === 'bank' && (
//                 <div style={{ marginBottom: '22px' }}>
//                     {[
//                         { l: 'Account Holder', v: txn.account_name, k: 'name' },
//                         { l: 'Account Number', v: txn.account_no, k: 'accno' },
//                         { l: 'IFSC Code', v: txn.ifsc_code, k: 'ifsc' },
//                         { l: 'Bank Name', v: txn.bank_name, k: 'bank' },
//                         { l: 'Branch', v: txn.branch, k: 'branch' },
//                     ].map(row => (
//                         <div key={row.k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 15px', background: '#0a0f1a', border: '1px solid #1e293b', borderRadius: '10px', marginBottom: '7px', gap: '10px' }}>
//                             <div>
//                                 <div style={S.label}>{row.l}</div>
//                                 <div style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', fontFamily: 'monospace', wordBreak: 'break-all', marginTop: '3px' }}>{row.v}</div>
//                             </div>
//                             <button onClick={() => copy(row.v, row.k)} style={copyBtn(copied === row.k)}>
//                                 {copied === row.k ? '✓' : 'COPY'}
//                             </button>
//                         </div>
//                     ))}
//                     <div style={{ background: '#D4A84710', border: '1px solid #D4A84730', borderRadius: '10px', padding: '12px 15px', marginTop: '6px' }}>
//                         <p style={{ fontSize: '11px', color: '#D4A847', lineHeight: 1.7 }}>
//                             ⚠ Transfer <strong>exactly ₹{fmt(txn.amount)}</strong>. Any other amount won't be auto-credited.
//                         </p>
//                     </div>
//                 </div>
//             )}

//             {/* ── CHECK NOW button ── */}
//             <button
//                 onClick={() => checkStatus(true)}
//                 disabled={checkingNow}
//                 style={{
//                     width: '100%', padding: '12px', marginBottom: '16px',
//                     background: checkingNow ? '#1e3a5f' : '#0d1f36',
//                     border: `1px solid ${checkingNow ? '#38bdf860' : '#1e3a5f'}`,
//                     borderRadius: '10px', cursor: checkingNow ? 'not-allowed' : 'pointer',
//                     color: checkingNow ? '#38bdf8' : '#475569',
//                     fontSize: '11px', fontWeight: 700, letterSpacing: '2px',
//                     fontFamily: "'Space Mono',monospace", transition: 'all 0.2s',
//                     display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
//                 }}
//                 onMouseEnter={e => { if (!checkingNow) { e.currentTarget.style.borderColor = '#38bdf840'; e.currentTarget.style.color = '#38bdf8' } }}
//                 onMouseLeave={e => { if (!checkingNow) { e.currentTarget.style.borderColor = '#1e3a5f'; e.currentTarget.style.color = '#475569' } }}
//             >
//                 {checkingNow
//                     ? <><span style={{ animation: 'gpSpin 1s linear infinite', display: 'inline-block', fontSize: '14px' }}>↻</span> CHECKING...</>
//                     : '✓  I HAVE PAID — CHECK NOW'
//                 }
//             </button>

//             {/* ── UTR manual verify ── */}
//             <div style={{ background: '#0a0f1a', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', marginBottom: '18px' }}>
//                 <div style={S.label}>ALREADY PAID? ENTER UTR / REF NUMBER</div>
//                 <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
//                     <input
//                         type="text"
//                         placeholder="12-digit UTR number"
//                         value={utrVal}
//                         onChange={e => setUtrVal(e.target.value)}
//                         onKeyDown={e => e.key === 'Enter' && verifyUtr()}
//                         style={{ flex: 1, padding: '10px 13px', background: '#060d1a', border: '1px solid #1e293b', borderRadius: '8px', color: '#e2e8f0', fontSize: '13px', fontFamily: 'monospace', outline: 'none', letterSpacing: '1px' }}
//                     />
//                     <button
//                         onClick={verifyUtr}
//                         disabled={verifying || !utrVal.trim()}
//                         style={{ padding: '10px 16px', flexShrink: 0, background: '#1e3a5f', border: '1px solid #1e5a8f', borderRadius: '8px', color: '#38bdf8', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Space Mono',monospace", letterSpacing: '1px', opacity: !utrVal.trim() ? 0.5 : 1, transition: 'all 0.2s' }}>
//                         {verifying ? '...' : 'VERIFY'}
//                     </button>
//                 </div>
//                 {verifyMsg.text && (
//                     <p style={{ fontSize: '10px', color: verifyMsg.ok ? '#22c55e' : '#f97316', marginTop: '8px' }}>
//                         {verifyMsg.ok ? '✓' : '⚠'} {verifyMsg.text}
//                     </p>
//                 )}
//             </div>

//             {/* ── Polling pulse ── */}
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '22px' }}>
//                 <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', animation: 'gpPulse 1.8s infinite' }} />
//                 <span style={{ fontSize: '9px', color: '#334155', letterSpacing: '3px' }}>
//                     AUTO-CHECKING PAYMENT EVERY 4 SECONDS
//                 </span>
//             </div>

//             {/* ── DEMO simulate ── */}
//             <div style={{ paddingTop: '16px', borderTop: '1px solid #0d1526', textAlign: 'center' }}>
//                 <p style={{ fontSize: '8px', color: '#1e293b', letterSpacing: '2px', marginBottom: '8px' }}>
//                     ─ DEVELOPMENT ONLY — REMOVE IN PRODUCTION ─
//                 </p>
//                 <button
//                     onClick={simulate}
//                     style={{ padding: '9px 22px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#334155', fontSize: '10px', cursor: 'pointer', fontFamily: "'Space Mono',monospace", letterSpacing: '1.5px', transition: 'all 0.2s' }}
//                     onMouseEnter={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#334155' }}
//                     onMouseLeave={e => { e.currentTarget.style.color = '#334155'; e.currentTarget.style.borderColor = '#1e293b' }}
//                 >
//                     SIMULATE PAYMENT
//                 </button>
//             </div>
//         </Shell>
//     )
// }

// // ─────────────────────────────────────────────────────────────────────────────
// //  LAYOUT SHELL
// // ─────────────────────────────────────────────────────────────────────────────
// function Shell({ children }) {
//     return (
//         <>
//             <style>{`
//                 @keyframes gpSpin  { from{transform:rotate(0deg)}  to{transform:rotate(360deg)} }
//                 @keyframes gpPulse { 0%,100%{opacity:1}            50%{opacity:0.35}             }
//                 @keyframes gpUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
//                 * { box-sizing: border-box; margin: 0; padding: 0; }
//                 body { background: #020b18; font-family: 'Space Mono', monospace; }
//                 input::placeholder { color: #334155; }
//                 ::-webkit-scrollbar { width: 5px; }
//                 ::-webkit-scrollbar-track  { background: #0d1526; }
//                 ::-webkit-scrollbar-thumb  { background: #1e3a5f; border-radius: 99px; }
//             `}</style>

//             <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse 80% 55% at 50% 15%,#0a1a30,#020b18)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px 14px 48px', fontFamily: "'Space Mono',monospace" }}>
//                 {/* BG grid */}
//                 <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(#38bdf808 1px,transparent 1px),linear-gradient(90deg,#38bdf808 1px,transparent 1px)', backgroundSize: '30px 30px', zIndex: 0 }} />

//                 {/* Card */}
//                 <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '460px', background: '#0d1526', borderRadius: '20px', border: '1px solid #1e293b', boxShadow: '0 40px 120px #00000090, 0 0 0 1px #1e3a5f50 inset', padding: '26px 24px 30px', marginTop: '16px' }}>
//                     {children}
//                 </div>
//             </div>
//         </>
//     )
// }

// function Center({ children }) {
//     return (
//         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '18px', minHeight: '400px', textAlign: 'center' }}>
//             {children}
//         </div>
//     )
// }

// // ─────────────────────────────────────────────────────────────────────────────
// //  STYLE HELPERS
// // ─────────────────────────────────────────────────────────────────────────────
// const S = {
//     label: { fontSize: '9px', letterSpacing: '3px', color: '#334155' },
//     muted: { fontSize: '11px', letterSpacing: '2px', color: '#475569' },
//     goldBtn: { padding: '13px 36px', borderRadius: '10px', border: '1px solid #F0C96A44', background: 'linear-gradient(135deg,#B8860B,#D4A847,#F0C96A,#D4A847,#B8860B)', color: '#150F00', fontSize: '11px', fontWeight: 700, fontFamily: "'Space Mono',monospace", letterSpacing: '3px', cursor: 'pointer' },
//     ghostBtn: { padding: '9px 22px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#94a3b8', fontSize: '10px', cursor: 'pointer', fontFamily: "'Space Mono',monospace", letterSpacing: '1.5px' },
// }

// function copyBtn(active) {
//     return {
//         flexShrink: 0, padding: '6px 12px',
//         background: active ? '#14532d20' : '#1e293b',
//         border: `1px solid ${active ? '#22c55e40' : '#334155'}`,
//         borderRadius: '7px', color: active ? '#22c55e' : '#64748b',
//         fontSize: '9px', fontWeight: 700, cursor: 'pointer',
//         fontFamily: "'Space Mono',monospace", letterSpacing: '1.5px', transition: 'all 0.2s',
//     }
// }


////////////////////////////////ANCHOR - 



// ╔══════════════════════════════════════════════════════╗
// ║  FILE: frontend/src/components/PayPage.jsx          ║
// ║  Payment page — complete flow                       ║
// ╚══════════════════════════════════════════════════════╝

import { useState, useEffect, useRef, useCallback } from 'react'
import { QRCode } from 'react-qr-code'

// ─── Config ───────────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_BACKEND_PAYMENT_URL
const RESULT_POLL_MS = 4000   // submitted ke baad har 4s poll karo

const fmt = (n) => Number(n).toLocaleString('en-IN')

// ─── UPI Deep Links ───────────────────────────────────────────────────────────
function buildDeepLink(appId, upiId, amount, name = 'GamePlay') {
    const base = `pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent('GamePlay Deposit')}`
    const schemes = {
        phonepe: `phonepe://pay?${base}`,
        gpay: `tez://upi/pay?${base}`,
        paytm: `paytmmp://pay?${base}`,
        bhim: `upi://pay?${base}`,
        amazonpay: `upi://pay?${base}`,
        whatsapp: `whatsapp://send?text=upi://pay?${base}`,
    }
    return schemes[appId] || `upi://pay?${base}`
}

const UPI_APPS = [
    { id: 'phonepe', label: 'PhonePe', bg: '#5f259f', fg: '#fff', initials: 'Pe' },
    { id: 'gpay', label: 'GPay', bg: '#fff', fg: '#4285F4', initials: 'G' },
    { id: 'paytm', label: 'Paytm', bg: '#00BAF2', fg: '#fff', initials: 'Pay' },
    { id: 'bhim', label: 'BHIM', bg: '#00529c', fg: '#fff', initials: '🇮🇳' },
    { id: 'amazonpay', label: 'Amazon Pay', bg: '#232F3E', fg: '#FF9900', initials: 'A' },
    { id: 'whatsapp', label: 'WhatsApp', bg: '#25D366', fg: '#fff', initials: 'WA' },
]

// ─── Hooks ────────────────────────────────────────────────────────────────────
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
    return { display: `${m}:${s}`, expired: secs === 0, secs }
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

    // ── Status flow ───────────────────────────────────────────────────────────
    // pending → proof_screen → submitted → success / failed / expired
    const [status, setStatus] = useState('pending')
    const [adminRemark, setAdminRemark] = useState('')

    const [tab, setTab] = useState('qr')
    const { copied, copy } = useCopy()
    const timer = useCountdown(txn?.expires_at)

    const [appHov, setAppHov] = useState(null)
    const [justLaunched, setJustLaunched] = useState(null)

    // ── Proof submission state ────────────────────────────────────────────────
    const [screenshot, setScreenshot] = useState(null)   // File object
    const [screenshotPreview, setScreenshotPreview] = useState(null)   // blob URL
    const [utrInput, setUtrInput] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitErr, setSubmitErr] = useState('')
    const fileInputRef = useRef(null)

    // ── Result polling ref ────────────────────────────────────────────────────
    const resultPollRef = useRef(null)

    // ── Fetch transaction on load ─────────────────────────────────────────────
    useEffect(() => {
        if (!txnId) { setFetchErr('No transaction ID in URL.'); setLoading(false); return }

        fetch(`${API}/api/txn/${txnId}`)
            .then(r => r.json())
            .then(data => {
                if (data.error) throw new Error(data.error)
                setTxn(data)
                // Page refresh pe sahi screen dikhao
                if (data.status === 'submitted') setStatus('submitted')
                else if (data.status === 'success') setStatus('success')
                else if (data.status === 'failed') { setStatus('failed'); setAdminRemark(data.admin_remark || '') }
                else setStatus('pending')
            })
            .catch(e => setFetchErr(e.message || 'Cannot connect to payment server.'))
            .finally(() => setLoading(false))
    }, [txnId])

    // ── Start result polling ONLY after submission ────────────────────────────
    const startResultPolling = useCallback(() => {
        if (resultPollRef.current) return  // pehle se chal raha hai

        resultPollRef.current = setInterval(async () => {
            try {
                const r = await fetch(`${API}/api/payment/result/${txnId}`)
                const data = await r.json()

                if (data.status === 'success') {
                    clearInterval(resultPollRef.current)
                    setStatus('success')
                    setTimeout(() => {
                        const ret = txn?.return_url || import.meta.env.VITE_FRONTEND_MAIN_URL
                        window.location.href = `${ret}/deposit/success?txnId=${txnId}&coins=${data.coins}&status=success`
                    }, 2200)
                } else if (data.status === 'failed') {
                    clearInterval(resultPollRef.current)
                    setAdminRemark(data.remark || '')
                    setStatus('failed')
                }
            } catch (err) {
                console.error('Result poll error:', err)
            }
        }, RESULT_POLL_MS)
    }, [txnId, txn])

    useEffect(() => {
        if (status === 'submitted') startResultPolling()
        return () => {
            if (resultPollRef.current) clearInterval(resultPollRef.current)
        }
    }, [status, startResultPolling])

    // ── Timer expiry ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (timer.expired && status === 'pending' && txn) setStatus('expired')
    }, [timer.expired, status, txn])

    // ── UPI App open ──────────────────────────────────────────────────────────
    const openApp = (appId) => {
        if (!txn) return
        setJustLaunched(appId)
        setTimeout(() => setJustLaunched(null), 4000)
        window.location.href = buildDeepLink(appId, txn.upi_id, txn.amount, txn.account_name)
    }

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handlePaidClick = () => setStatus('proof_screen')

    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setScreenshot(file)
        setScreenshotPreview(URL.createObjectURL(file))
        setSubmitErr('')
    }

    const removeScreenshot = () => {
        setScreenshot(null)
        setScreenshotPreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleSubmitProof = async () => {
        if (!screenshot && !utrInput.trim()) {
            setSubmitErr('Screenshot ya UTR number mein se ek dena zaroori hai.')
            return
        }
        setSubmitting(true)
        setSubmitErr('')
        try {
            const fd = new FormData()
            fd.append('txnId', txnId)
            if (utrInput.trim()) fd.append('utrNumber', utrInput.trim())
            if (screenshot) fd.append('screenshot', screenshot)

            const r = await fetch(`${API}/api/payment/submit-proof`, { method: 'POST', body: fd })
            const data = await r.json()

            if (data.success) {
                setStatus('submitted')
            } else {
                setSubmitErr(data.error || 'Submission failed. Try again.')
            }
        } catch {
            setSubmitErr('Server error. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const simulate = async () => {
        await fetch(`${API}/api/payment/simulate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ txnId }),
        })
        setStatus('success')
    }

    const upiStr = txn
        ? `upi://pay?pa=${encodeURIComponent(txn.upi_id)}&pn=${encodeURIComponent(txn.account_name)}&am=${txn.amount}&cu=INR&tn=${encodeURIComponent('GamePlay Deposit')}`
        : ''

    // ═════════════════════════════════════════════════════════════════════════
    //  SCREEN: Loading
    // ═════════════════════════════════════════════════════════════════════════
    if (loading) return (
        <Shell>
            <Center>
                <SpinIcon />
                <p style={S.muted}>LOADING PAYMENT...</p>
            </Center>
        </Shell>
    )

    // ═════════════════════════════════════════════════════════════════════════
    //  SCREEN: Error
    // ═════════════════════════════════════════════════════════════════════════
    if (fetchErr) return (
        <Shell>
            <Center>
                <ErrIcon />
                <p style={{ ...S.muted, color: '#ef4444' }}>{fetchErr}</p>
                <button onClick={() => window.history.back()} style={S.ghostBtn}>← GO BACK</button>
            </Center>
        </Shell>
    )

    // ═════════════════════════════════════════════════════════════════════════
    //  SCREEN: Success
    // ═════════════════════════════════════════════════════════════════════════
    if (status === 'success') return (
        <Shell>
            <Center>
                <div style={{ animation: 'gpPulse 1.5s ease-in-out infinite' }}>
                    <svg width="88" height="88" viewBox="0 0 88 88">
                        <circle cx="44" cy="44" r="40" fill="#22c55e12" stroke="#22c55e" strokeWidth="2" />
                        <path d="M26 44L37 56L62 32" stroke="#22c55e" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
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
    //  SCREEN: Failed (Admin ne reject kiya)
    // ═════════════════════════════════════════════════════════════════════════
    if (status === 'failed') return (
        <Shell>
            <Center>
                <svg width="72" height="72" viewBox="0 0 72 72">
                    <circle cx="36" cy="36" r="32" fill="#7f1d1d20" stroke="#ef4444" strokeWidth="1.5" />
                    <path d="M23 23L49 49M49 23L23 49" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <h2 style={{ fontSize: '18px', color: '#ef4444', letterSpacing: '2px' }}>PAYMENT REJECTED</h2>

                {adminRemark ? (
                    <div style={{ background: '#7f1d1d20', border: '1px solid #ef444430', borderRadius: '10px', padding: '14px 20px', maxWidth: '320px', width: '100%' }}>
                        <p style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '2px', marginBottom: '8px' }}>ADMIN REMARK</p>
                        <p style={{ fontSize: '13px', color: '#fca5a5', lineHeight: 1.7 }}>{adminRemark}</p>
                    </div>
                ) : (
                    <p style={{ ...S.muted, maxWidth: '280px', textAlign: 'center', lineHeight: 1.8 }}>
                        Payment verify nahi ho saki. Support se contact karo.
                    </p>
                )}

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button onClick={() => { setStatus('proof_screen'); setSubmitErr('') }} style={S.ghostBtn}>
                        RESUBMIT PROOF
                    </button>
                    <button
                        onClick={() => window.location.href = `${import.meta.env.VITE_FRONTEND_MAIN_URL}/deposit`}
                        style={S.goldBtn}>
                        NEW DEPOSIT
                    </button>
                </div>
            </Center>
        </Shell>
    )

    // ═════════════════════════════════════════════════════════════════════════
    //  SCREEN: Expired
    // ═════════════════════════════════════════════════════════════════════════
    if (status === 'expired') return (
        <Shell>
            <Center>
                <svg width="64" height="64" viewBox="0 0 64 64">
                    <polygon points="32,2 62,32 32,62 2,32" fill="#78350f20" stroke="#f97316" strokeWidth="1.5" />
                    <text x="32" y="38" textAnchor="middle" fontSize="22" fill="#f97316">⏱</text>
                </svg>
                <h2 style={{ fontSize: '18px', color: '#f97316', letterSpacing: '2px' }}>SESSION EXPIRED</h2>
                <p style={S.muted}>Payment window expire ho gaya. Naya deposit create karo.</p>
                <button
                    onClick={() => window.location.href = `${import.meta.env.VITE_FRONTEND_MAIN_URL}/deposit`}
                    style={S.goldBtn}>
                    CREATE NEW DEPOSIT
                </button>
            </Center>
        </Shell>
    )

    // ═════════════════════════════════════════════════════════════════════════
    //  SCREEN: Submitted (Admin verification ka wait)
    // ═════════════════════════════════════════════════════════════════════════
    if (status === 'submitted') return (
        <Shell>
            <Center>
                <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                    <svg width="80" height="80" viewBox="0 0 80 80" style={{ animation: 'gpSpin 3s linear infinite' }}>
                        <circle cx="40" cy="40" r="36" fill="none" stroke="#1e3a5f" strokeWidth="2" />
                        <path d="M40 4 A36 36 0 0 1 76 40" stroke="#38bdf8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="32" height="32" viewBox="0 0 32 32">
                            <path d="M8 16l5 5L24 10" stroke="#38bdf8" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
                <h2 style={{ fontSize: '18px', color: '#38bdf8', letterSpacing: '2px' }}>PROOF SUBMITTED</h2>
                <p style={{ ...S.muted, maxWidth: '280px', lineHeight: 1.9, textAlign: 'center' }}>
                    Admin aapka payment verify kar raha hai. Kuch minutes lagenge.
                </p>
                <div style={{ background: '#0a0f1a', border: '1px solid #1e293b', borderRadius: '12px', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', animation: 'gpPulse 1.8s infinite', flexShrink: 0 }} />
                    <span style={{ fontSize: '9px', color: '#334155', letterSpacing: '2px' }}>AUTO-DETECTING ADMIN VERIFICATION</span>
                </div>
                <p style={{ fontSize: '10px', color: '#334155' }}>
                    TXN: <span style={{ color: '#1e3a5f', fontFamily: 'monospace' }}>{txnId}</span>
                </p>
            </Center>
        </Shell>
    )

    // ═════════════════════════════════════════════════════════════════════════
    //  SCREEN: Proof Screen (User proof submit karta hai)
    // ═════════════════════════════════════════════════════════════════════════
    if (status === 'proof_screen') return (
        <Shell>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '18px', borderBottom: '1px solid #1e293b' }}>
                <button onClick={() => setStatus('pending')} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '20px', padding: '0 4px' }}>
                    ←
                </button>
                <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', letterSpacing: '1px' }}>Payment Verification</div>
                    <div style={{ fontSize: '10px', color: '#475569', letterSpacing: '1px', marginTop: '2px' }}>Admin review ke liye proof submit karo</div>
                </div>
            </div>

            {/* Amount reminder */}
            <div style={{ background: 'linear-gradient(135deg,#0f172a,#1a2744)', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '14px 18px', marginBottom: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={S.label}>AMOUNT PAID</div>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>₹{fmt(txn.amount)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={S.label}>COINS</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#D4A847', fontFamily: 'monospace' }}>{fmt(txn.coins)} ₵</div>
                </div>
            </div>

            {/* Screenshot upload */}
            <div style={{ marginBottom: '18px' }}>
                <div style={S.label}>
                    PAYMENT SCREENSHOT &nbsp;
                    <span style={{ color: '#334155' }}>(OPTIONAL)</span>
                </div>
                <div style={{ marginTop: '10px' }}>
                    {screenshotPreview ? (
                        <div style={{ position: 'relative' }}>
                            <img
                                src={screenshotPreview}
                                alt="Payment screenshot"
                                style={{ width: '100%', maxHeight: '220px', objectFit: 'contain', borderRadius: '10px', border: '1px solid #1e3a5f', background: '#060d1a' }}
                            />
                            <button
                                onClick={removeScreenshot}
                                style={{ position: 'absolute', top: '8px', right: '8px', background: '#7f1d1d90', border: '1px solid #ef444460', borderRadius: '6px', color: '#ef4444', width: '28px', height: '28px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                ✕
                            </button>
                        </div>
                    ) : (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{ border: '2px dashed #1e3a5f', borderRadius: '12px', padding: '32px 16px', textAlign: 'center', cursor: 'pointer', background: '#060d1a', transition: 'border-color 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = '#38bdf840'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = '#1e3a5f'}
                        >
                            <div style={{ fontSize: '28px', marginBottom: '10px' }}>📷</div>
                            <p style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 700, letterSpacing: '1px', marginBottom: '4px' }}>
                                TAP TO UPLOAD SCREENSHOT
                            </p>
                            <p style={{ fontSize: '10px', color: '#334155' }}>JPG, PNG — max 10MB</p>
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                </div>
            </div>

            {/* UTR Input */}
            <div style={{ marginBottom: '20px' }}>
                <div style={S.label}>
                    UTR / REFERENCE NUMBER &nbsp;
                    <span style={{ color: '#334155' }}>(OPTIONAL)</span>
                </div>
                <input
                    type="text"
                    placeholder="12-digit UTR number"
                    value={utrInput}
                    onChange={e => setUtrInput(e.target.value)}
                    style={{
                        width: '100%', marginTop: '10px', padding: '12px 14px',
                        background: '#060d1a', border: '1px solid #1e293b',
                        borderRadius: '10px', color: '#e2e8f0', fontSize: '14px',
                        fontFamily: 'monospace', outline: 'none', letterSpacing: '1px',
                        boxSizing: 'border-box',
                    }}
                    onFocus={e => e.target.style.borderColor = '#38bdf840'}
                    onBlur={e => e.target.style.borderColor = '#1e293b'}
                />
            </div>

            {/* Info note */}
            <div style={{ background: '#0d1f36', border: '1px solid #1e3a5f', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px' }}>
                <p style={{ fontSize: '10px', color: '#38bdf880', lineHeight: 1.8 }}>
                    <span style={{ color: '#38bdf8', fontWeight: 700 }}>ℹ Note:</span>
                    &nbsp;Dono provide karo — screenshot + UTR — toh verification fast hogi.
                    Ek bhi kaafi hai.
                </p>
            </div>

            {/* Error */}
            {submitErr && (
                <div style={{ background: '#7f1d1d20', border: '1px solid #ef444430', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
                    <p style={{ fontSize: '11px', color: '#f87171' }}>⚠ {submitErr}</p>
                </div>
            )}

            {/* Submit button */}
            <button
                onClick={handleSubmitProof}
                disabled={submitting || (!screenshot && !utrInput.trim())}
                style={{
                    width: '100%', padding: '14px',
                    background: submitting ? '#1e3a5f' : 'linear-gradient(135deg,#0f4c8a,#1a6abf)',
                    border: '1px solid #1e5a8f', borderRadius: '12px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    color: '#e2e8f0', fontSize: '12px', fontWeight: 700, letterSpacing: '2px',
                    fontFamily: "'Space Mono',monospace",
                    opacity: (!screenshot && !utrInput.trim()) ? 0.5 : 1,
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                }}
            >
                {submitting
                    ? <><span style={{ animation: 'gpSpin 1s linear infinite', display: 'inline-block' }}>↻</span> SUBMITTING...</>
                    : '📤  SUBMIT FOR VERIFICATION'
                }
            </button>
        </Shell>
    )

    // ═════════════════════════════════════════════════════════════════════════
    //  SCREEN: Main Payment UI (status === 'pending')
    // ═════════════════════════════════════════════════════════════════════════
    return (
        <Shell>
            {/* ── TOP BAR ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', paddingBottom: '18px', borderBottom: '1px solid #1e293b' }}>
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
                {/* Timer */}
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

            {/* ── AMOUNT ── */}
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

            {/* ── TAB: QR ── */}
            {tab === 'qr' && (
                <div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '22px' }}>
                        <div style={{ padding: '20px', background: '#ffffff', borderRadius: '18px', border: '1px solid #1e293b', boxShadow: '0 0 40px #38bdf812' }}>
                            <QRCode value={upiStr} size={190} fgColor="#020b18" bgColor="#ffffff" level="H" />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', animation: 'gpPulse 1.5s infinite' }} />
                            <span style={{ fontSize: '10px', color: '#22c55e', letterSpacing: '2px' }}>SCAN WITH ANY UPI APP</span>
                        </div>
                        <p style={{ fontSize: '11px', color: '#475569', marginTop: '5px', textAlign: 'center' }}>
                            Exactly <strong style={{ color: '#e2e8f0' }}>₹{fmt(txn.amount)}</strong> pay karo — amount match karna zaroori hai
                        </p>
                    </div>

                    {/* UPI ID */}
                    <div style={{ background: '#0a0f1a', border: '1px solid #1e293b', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px' }}>
                        <div style={S.label}>OR COPY UPI ID</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginTop: '8px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                {txn.upi_id}
                            </span>
                            <button onClick={() => copy(txn.upi_id, 'upi')} style={copyBtn(copied === 'upi')}>
                                {copied === 'upi' ? '✓ COPIED' : 'COPY'}
                            </button>
                        </div>
                    </div>

                    {/* UPI Apps */}
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
                                        }}>
                                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: app.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ color: app.fg, fontSize: app.initials.length > 2 ? '18px' : '13px', fontWeight: 800 }}>
                                                {app.initials}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '9px', color: isLaunched ? '#22c55e' : '#64748b' }}>
                                            {isLaunched ? '✓ Opening...' : app.label}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ── TAB: BANK ── */}
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
                            ⚠ Exactly <strong>₹{fmt(txn.amount)}</strong> transfer karo. Koi aur amount auto-credit nahi hoga.
                        </p>
                    </div>
                </div>
            )}

            {/* ── I HAVE PAID BUTTON ── */}
            <button
                onClick={handlePaidClick}
                style={{
                    width: '100%', padding: '14px', marginBottom: '16px',
                    background: 'linear-gradient(135deg,#14532d,#166534)',
                    border: '1px solid #22c55e40',
                    borderRadius: '12px', cursor: 'pointer',
                    color: '#22c55e', fontSize: '12px', fontWeight: 700, letterSpacing: '2px',
                    fontFamily: "'Space Mono',monospace",
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#166534,#15803d)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#14532d,#166534)' }}
            >
                ✅  MAINE PAY KAR DIYA — PROOF SUBMIT KARO
            </button>

            {/* ── DEV simulate ── */}
            <div style={{ paddingTop: '16px', borderTop: '1px solid #0d1526', textAlign: 'center' }}>
                <p style={{ fontSize: '8px', color: '#1e293b', letterSpacing: '2px', marginBottom: '8px' }}>
                    ─ DEVELOPMENT ONLY — REMOVE IN PRODUCTION ─
                </p>
                <button
                    onClick={simulate}
                    style={{ padding: '9px 22px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#334155', fontSize: '10px', cursor: 'pointer', fontFamily: "'Space Mono',monospace", letterSpacing: '1.5px' }}>
                    SIMULATE PAYMENT
                </button>
            </div>
        </Shell>
    )
}

// ─── Shell / Layout ───────────────────────────────────────────────────────────
function Shell({ children }) {
    return (
        <>
            <style>{`
                @keyframes gpSpin  { from{transform:rotate(0deg)}  to{transform:rotate(360deg)} }
                @keyframes gpPulse { 0%,100%{opacity:1}            50%{opacity:0.35}             }
                * { box-sizing:border-box; margin:0; padding:0; }
                body { background:#020b18; font-family:'Space Mono',monospace; }
                input::placeholder { color:#334155; }
                ::-webkit-scrollbar { width:5px; }
                ::-webkit-scrollbar-track { background:#0d1526; }
                ::-webkit-scrollbar-thumb { background:#1e3a5f; border-radius:99px; }
            `}</style>
            <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse 80% 55% at 50% 15%,#0a1a30,#020b18)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px 14px 48px', fontFamily: "'Space Mono',monospace" }}>
                <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(#38bdf808 1px,transparent 1px),linear-gradient(90deg,#38bdf808 1px,transparent 1px)', backgroundSize: '30px 30px', zIndex: 0 }} />
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

function SpinIcon() {
    return (
        <div style={{ animation: 'gpSpin 1.2s linear infinite' }}>
            <svg width="48" height="48" viewBox="0 0 48 48">
                <polygon points="24,2 46,24 24,46 2,24" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                <polygon points="24,12 36,24 24,36 12,24" fill="#1e3a5f" stroke="#38bdf8" strokeWidth="0.75" />
            </svg>
        </div>
    )
}

function ErrIcon() {
    return (
        <svg width="52" height="52" viewBox="0 0 52 52">
            <polygon points="26,2 50,26 26,50 2,26" fill="#7f1d1d20" stroke="#ef4444" strokeWidth="1.5" />
            <text x="26" y="32" textAnchor="middle" fontSize="20" fill="#ef4444">!</text>
        </svg>
    )
}

// ─── Style helpers ────────────────────────────────────────────────────────────
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







// /////////////////////////////////!SECTION

// import { useState, useEffect, useRef, useCallback } from 'react'
// import { QRCode } from 'react-qr-code'

// // ─────────────────────────────────────────────────────────────────────────────
// //  CONFIG
// // ─────────────────────────────────────────────────────────────────────────────
// const API = import.meta.env.VITE_BACKEND_PAYMENT_URL
// const RESULT_POLL_INTERVAL = 4000   // poll /result every 4s after proof submitted

// const fmt = (n) => Number(n).toLocaleString('en-IN')

// // ─────────────────────────────────────────────────────────────────────────────
// //  UPI DEEP LINKS
// // ─────────────────────────────────────────────────────────────────────────────
// function buildDeepLink(appId, upiId, amount, name = 'GamePlay') {
//     const note = 'GamePlay+Deposit'
//     const base = `pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${note}`
//     const schemes = {
//         phonepe: `phonepe://pay?${base}`,
//         gpay: `tez://upi/pay?${base}`,
//         paytm: `paytmmp://pay?${base}`,
//         bhim: `upi://pay?${base}`,
//         amazonpay: `upi://pay?${base}`,
//         whatsapp: `whatsapp://send?text=upi://pay?${base}`,
//     }
//     return schemes[appId] || `upi://pay?${base}`
// }

// const UPI_APPS = [
//     { id: 'phonepe', label: 'PhonePe', bg: '#5f259f', fg: '#fff', initials: 'Pe' },
//     { id: 'gpay', label: 'GPay', bg: '#fff', fg: '#4285F4', initials: 'G' },
//     { id: 'paytm', label: 'Paytm', bg: '#00BAF2', fg: '#fff', initials: 'Pay' },
//     { id: 'bhim', label: 'BHIM', bg: '#00529c', fg: '#fff', initials: '🇮🇳' },
//     { id: 'amazonpay', label: 'Amazon Pay', bg: '#232F3E', fg: '#FF9900', initials: 'A' },
//     { id: 'whatsapp', label: 'WhatsApp', bg: '#25D366', fg: '#fff', initials: 'WA' },
// ]

// // ─────────────────────────────────────────────────────────────────────────────
// //  HOOKS
// // ─────────────────────────────────────────────────────────────────────────────
// function useCountdown(expiresAt) {
//     const [secs, setSecs] = useState(900)
//     useEffect(() => {
//         if (!expiresAt) return
//         const tick = () => setSecs(Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000)))
//         tick()
//         const id = setInterval(tick, 1000)
//         return () => clearInterval(id)
//     }, [expiresAt])
//     const m = String(Math.floor(secs / 60)).padStart(2, '0')
//     const s = String(secs % 60).padStart(2, '0')
//     return { display: `${m}:${s}`, expired: secs === 0, secs, pct: Math.min(100, (secs / 900) * 100) }
// }

// function useCopy() {
//     const [k, setK] = useState(null)
//     const copy = (text, key) => {
//         try { navigator.clipboard.writeText(text) } catch {
//             const el = Object.assign(document.createElement('textarea'), { value: text })
//             document.body.appendChild(el); el.select(); document.execCommand('copy'); el.remove()
//         }
//         setK(key); setTimeout(() => setK(null), 2000)
//     }
//     return { copied: k, copy }
// }

// // ─────────────────────────────────────────────────────────────────────────────
// //  MAIN COMPONENT
// // ─────────────────────────────────────────────────────────────────────────────
// export default function PayPage({ txnId }) {
//     const [txn, setTxn] = useState(null)
//     const [loading, setLoading] = useState(true)
//     const [fetchErr, setFetchErr] = useState('')

//     // status flow:
//     //   pending → (user pays) → proof_screen → (user submits) → submitted → success / failed / expired
//     const [status, setStatus] = useState('pending')
//     const [adminRemark, setAdminRemark] = useState('')

//     const [tab, setTab] = useState('qr')
//     const { copied, copy } = useCopy()
//     const timer = useCountdown(txn?.expires_at)

//     // UPI app hover/launch state
//     const [appHov, setAppHov] = useState(null)
//     const [justLaunched, setJustLaunched] = useState(null)

//     // Proof submission state
//     const [screenshot, setScreenshot] = useState(null)     // File object
//     const [screenshotPreview, setScreenshotPreview] = useState(null)
//     const [utrInput, setUtrInput] = useState('')
//     const [submitting, setSubmitting] = useState(false)
//     const [submitErr, setSubmitErr] = useState('')
//     const fileInputRef = useRef(null)

//     // Result polling (only after submission)
//     const resultPollRef = useRef(null)

//     // ── Fetch transaction ────────────────────────────────────────────────────
//     useEffect(() => {
//         if (!txnId) { setFetchErr('No transaction ID in URL.'); setLoading(false); return }
//         fetch(`${API}/api/txn/${txnId}`)
//             .then(r => r.json())
//             .then(data => {
//                 if (data.error) throw new Error(data.error)
//                 setTxn(data)
//                 // If already submitted (user refreshed page), go to waiting screen
//                 if (data.status === 'submitted') setStatus('submitted')
//                 else if (data.status === 'success') setStatus('success')
//                 else if (data.status === 'failed') { setStatus('failed'); setAdminRemark(data.admin_remark || '') }
//                 else setStatus('pending')
//             })
//             .catch(e => setFetchErr(e.message || 'Cannot connect to payment server.'))
//             .finally(() => setLoading(false))
//     }, [txnId])

//     // ── Poll for result ONLY after proof submitted ────────────────────────────
//     const startResultPolling = useCallback(() => {
//         if (resultPollRef.current) return  // already polling
//         resultPollRef.current = setInterval(async () => {
//             try {
//                 const r = await fetch(`${API}/api/payment/result/${txnId}`)
//                 const data = await r.json()
//                 if (data.status === 'success') {
//                     clearInterval(resultPollRef.current)
//                     setStatus('success')
//                     setTimeout(() => {
//                         const ret = txn?.return_url || import.meta.env.VITE_FRONTEND_MAIN_URL
//                         window.location.href = `${ret}/deposit/success?txnId=${txnId}&coins=${data.coins}&status=success`
//                     }, 2200)
//                 } else if (data.status === 'failed') {
//                     clearInterval(resultPollRef.current)
//                     setAdminRemark(data.remark || '')
//                     setStatus('failed')
//                 }
//             } catch (err) {
//                 console.error('Result poll error:', err)
//             }
//         }, RESULT_POLL_INTERVAL)
//     }, [txnId, txn])

//     useEffect(() => {
//         if (status === 'submitted') startResultPolling()
//         return () => { if (resultPollRef.current) clearInterval(resultPollRef.current) }
//     }, [status, startResultPolling])

//     // ── Timer expiry ─────────────────────────────────────────────────────────
//     useEffect(() => {
//         if (timer.expired && status === 'pending' && txn) setStatus('expired')
//     }, [timer.expired, status, txn])

//     // ── UPI App open ─────────────────────────────────────────────────────────
//     const openApp = (appId) => {
//         if (!txn) return
//         setJustLaunched(appId)
//         setTimeout(() => setJustLaunched(null), 4000)
//         window.location.href = buildDeepLink(appId, txn.upi_id, txn.amount, txn.account_name)
//     }

//     // ── "I have paid" button → show proof screen ──────────────────────────────
//     const handlePaidClick = () => {
//         setStatus('proof_screen')
//     }

//     // ── Screenshot file select ────────────────────────────────────────────────
//     const handleFileChange = (e) => {
//         const file = e.target.files?.[0]
//         if (!file) return
//         setScreenshot(file)
//         setScreenshotPreview(URL.createObjectURL(file))
//         setSubmitErr('')
//     }

//     // ── Remove screenshot ─────────────────────────────────────────────────────
//     const removeScreenshot = () => {
//         setScreenshot(null)
//         setScreenshotPreview(null)
//         if (fileInputRef.current) fileInputRef.current.value = ''
//     }

//     // ── Submit proof ──────────────────────────────────────────────────────────
//     const handleSubmitProof = async () => {
//         if (!screenshot && !utrInput.trim()) {
//             setSubmitErr('Please provide payment screenshot or UTR number.')
//             return
//         }
//         setSubmitting(true)
//         setSubmitErr('')
//         try {
//             const formData = new FormData()
//             formData.append('txnId', txnId)
//             if (utrInput.trim()) formData.append('utrNumber', utrInput.trim())
//             if (screenshot) formData.append('screenshot', screenshot)

//             const r = await fetch(`${API}/api/payment/submit-proof`, {
//                 method: 'POST',
//                 body: formData,
//             })
//             const data = await r.json()

//             if (data.success) {
//                 setStatus('submitted')
//             } else {
//                 setSubmitErr(data.error || 'Submission failed. Try again.')
//             }
//         } catch (err) {
//             setSubmitErr('Server error. Please try again.')
//         } finally {
//             setSubmitting(false)
//         }
//     }

//     // ── Simulate (DEV only) ───────────────────────────────────────────────────
//     const simulate = async () => {
//         await fetch(`${API}/api/payment/simulate`, {
//             method: 'POST', headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ txnId }),
//         })
//         setStatus('success')
//     }

//     const upiStr = txn
//         ? `upi://pay?pa=${encodeURIComponent(txn.upi_id)}&pn=${encodeURIComponent(txn.account_name)}&am=${txn.amount}&cu=INR&tn=${encodeURIComponent("GamePlay Deposit")}`
//         : ''

//     // ═══════════════════════════════════════════════════════════════════════
//     //  SCREENS
//     // ═══════════════════════════════════════════════════════════════════════

//     if (loading) return (
//         <Shell>
//             <Center>
//                 <SpinIcon />
//                 <p style={S.muted}>LOADING PAYMENT...</p>
//             </Center>
//         </Shell>
//     )

//     if (fetchErr) return (
//         <Shell>
//             <Center>
//                 <ErrIcon />
//                 <p style={{ ...S.muted, color: '#ef4444' }}>{fetchErr}</p>
//                 <button onClick={() => window.history.back()} style={S.ghostBtn}>← GO BACK</button>
//             </Center>
//         </Shell>
//     )

//     if (status === 'success') return (
//         <Shell>
//             <Center>
//                 <div style={{ animation: 'gpPulse 1.5s ease-in-out infinite' }}>
//                     <svg width="88" height="88" viewBox="0 0 88 88">
//                         <circle cx="44" cy="44" r="40" fill="#22c55e12" stroke="#22c55e" strokeWidth="2" />
//                         <path d="M26 44L37 56L62 32" stroke="#22c55e" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
//                     </svg>
//                 </div>
//                 <h2 style={{ fontSize: '20px', color: '#22c55e', letterSpacing: '3px' }}>PAYMENT CONFIRMED</h2>
//                 <p style={S.muted}>Redirecting back to GamePlay...</p>
//                 <div style={{ fontSize: '2.6rem', fontWeight: 700, color: '#D4A847', fontFamily: 'monospace', letterSpacing: '2px' }}>
//                     +{fmt(txn?.coins || 0)} ₵
//                 </div>
//             </Center>
//         </Shell>
//     )

//     if (status === 'failed') return (
//         <Shell>
//             <Center>
//                 <svg width="72" height="72" viewBox="0 0 72 72">
//                     <circle cx="36" cy="36" r="32" fill="#7f1d1d20" stroke="#ef4444" strokeWidth="1.5" />
//                     <path d="M23 23L49 49M49 23L23 49" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
//                 </svg>
//                 <h2 style={{ fontSize: '18px', color: '#ef4444', letterSpacing: '2px' }}>PAYMENT REJECTED</h2>
//                 {adminRemark ? (
//                     <div style={{ background: '#7f1d1d20', border: '1px solid #ef444430', borderRadius: '10px', padding: '12px 18px', maxWidth: '320px' }}>
//                         <p style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '2px', marginBottom: '6px' }}>ADMIN REMARK</p>
//                         <p style={{ fontSize: '13px', color: '#fca5a5', lineHeight: 1.6 }}>{adminRemark}</p>
//                     </div>
//                 ) : (
//                     <p style={S.muted}>Payment could not be verified. Please contact support.</p>
//                 )}
//                 <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
//                     <button onClick={() => setStatus('proof_screen')} style={S.ghostBtn}>
//                         RESUBMIT PROOF
//                     </button>
//                     <button
//                         onClick={() => window.location.href = `${import.meta.env.VITE_FRONTEND_MAIN_URL}/deposit`}
//                         style={S.goldBtn}>
//                         NEW DEPOSIT
//                     </button>
//                 </div>
//             </Center>
//         </Shell>
//     )

//     if (status === 'expired') return (
//         <Shell>
//             <Center>
//                 <svg width="64" height="64" viewBox="0 0 64 64">
//                     <polygon points="32,2 62,32 32,62 2,32" fill="#78350f20" stroke="#f97316" strokeWidth="1.5" />
//                     <text x="32" y="38" textAnchor="middle" fontSize="22" fill="#f97316">⏱</text>
//                 </svg>
//                 <h2 style={{ fontSize: '18px', color: '#f97316', letterSpacing: '2px' }}>SESSION EXPIRED</h2>
//                 <p style={S.muted}>This payment window has expired. Please create a new deposit.</p>
//                 <button onClick={() => window.location.href = `${import.meta.env.VITE_FRONTEND_MAIN_URL}/deposit`} style={S.goldBtn}>
//                     CREATE NEW DEPOSIT
//                 </button>
//             </Center>
//         </Shell>
//     )

//     // ── SUBMITTED: Waiting for admin ─────────────────────────────────────────
//     if (status === 'submitted') return (
//         <Shell>
//             <Center>
//                 <div style={{ position: 'relative', width: '80px', height: '80px' }}>
//                     <svg width="80" height="80" viewBox="0 0 80 80" style={{ animation: 'gpSpin 3s linear infinite' }}>
//                         <circle cx="40" cy="40" r="36" fill="none" stroke="#1e3a5f" strokeWidth="2" />
//                         <path d="M40 4 A36 36 0 0 1 76 40" stroke="#38bdf8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
//                     </svg>
//                     <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                         <svg width="32" height="32" viewBox="0 0 32 32">
//                             <path d="M8 16l5 5L24 10" stroke="#38bdf8" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
//                         </svg>
//                     </div>
//                 </div>
//                 <h2 style={{ fontSize: '18px', color: '#38bdf8', letterSpacing: '2px' }}>PROOF SUBMITTED</h2>
//                 <p style={{ ...S.muted, maxWidth: '280px', lineHeight: 1.8, textAlign: 'center' }}>
//                     Admin is verifying your payment. This usually takes a few minutes.
//                 </p>
//                 <div style={{ background: '#0a0f1a', border: '1px solid #1e293b', borderRadius: '12px', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
//                     <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', animation: 'gpPulse 1.8s infinite', flexShrink: 0 }} />
//                     <span style={{ fontSize: '9px', color: '#334155', letterSpacing: '2px' }}>AUTO-DETECTING ADMIN VERIFICATION</span>
//                 </div>
//                 <p style={{ fontSize: '10px', color: '#334155', letterSpacing: '1px' }}>
//                     TXN: <span style={{ color: '#1e3a5f', fontFamily: 'monospace' }}>{txnId}</span>
//                 </p>
//             </Center>
//         </Shell>
//     )

//     // ── PROOF SCREEN: User submits screenshot / UTR ───────────────────────────
//     if (status === 'proof_screen') return (
//         <Shell>
//             {/* Header */}
//             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '18px', borderBottom: '1px solid #1e293b' }}>
//                 <button onClick={() => setStatus('pending')} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '18px', padding: '0' }}>←</button>
//                 <div>
//                     <div style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', letterSpacing: '1px' }}>Payment Verification</div>
//                     <div style={{ fontSize: '10px', color: '#475569', letterSpacing: '1px', marginTop: '2px' }}>Submit proof for admin review</div>
//                 </div>
//             </div>

//             {/* Amount reminder */}
//             <div style={{ background: 'linear-gradient(135deg,#0f172a,#1a2744)', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '14px 18px', marginBottom: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <div>
//                     <div style={S.label}>AMOUNT PAID</div>
//                     <div style={{ fontSize: '22px', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>₹{fmt(txn.amount)}</div>
//                 </div>
//                 <div style={{ textAlign: 'right' }}>
//                     <div style={S.label}>COINS</div>
//                     <div style={{ fontSize: '16px', fontWeight: 700, color: '#D4A847', fontFamily: 'monospace' }}>{fmt(txn.coins)} ₵</div>
//                 </div>
//             </div>

//             {/* ── Screenshot upload ── */}
//             <div style={{ marginBottom: '18px' }}>
//                 <div style={S.label}>PAYMENT SCREENSHOT <span style={{ color: '#334155' }}>(OPTIONAL)</span></div>
//                 <div style={{ marginTop: '10px' }}>
//                     {screenshotPreview ? (
//                         <div style={{ position: 'relative' }}>
//                             <img
//                                 src={screenshotPreview}
//                                 alt="Payment screenshot"
//                                 style={{ width: '100%', maxHeight: '220px', objectFit: 'contain', borderRadius: '10px', border: '1px solid #1e3a5f', background: '#060d1a' }}
//                             />
//                             <button
//                                 onClick={removeScreenshot}
//                                 style={{ position: 'absolute', top: '8px', right: '8px', background: '#7f1d1d90', border: '1px solid #ef444460', borderRadius: '6px', color: '#ef4444', width: '28px', height: '28px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                             >✕</button>
//                         </div>
//                     ) : (
//                         <div
//                             onClick={() => fileInputRef.current?.click()}
//                             style={{ border: '2px dashed #1e3a5f', borderRadius: '12px', padding: '32px 16px', textAlign: 'center', cursor: 'pointer', background: '#060d1a', transition: 'border-color 0.2s' }}
//                             onMouseEnter={e => e.currentTarget.style.borderColor = '#38bdf840'}
//                             onMouseLeave={e => e.currentTarget.style.borderColor = '#1e3a5f'}
//                         >
//                             <div style={{ fontSize: '28px', marginBottom: '10px' }}>📷</div>
//                             <p style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 700, letterSpacing: '1px', marginBottom: '4px' }}>TAP TO UPLOAD SCREENSHOT</p>
//                             <p style={{ fontSize: '10px', color: '#334155' }}>JPG, PNG up to 10MB</p>
//                         </div>
//                     )}
//                     <input
//                         ref={fileInputRef}
//                         type="file"
//                         accept="image/*"
//                         onChange={handleFileChange}
//                         style={{ display: 'none' }}
//                     />
//                 </div>
//             </div>

//             {/* ── UTR Input ── */}
//             <div style={{ marginBottom: '20px' }}>
//                 <div style={S.label}>UTR / REFERENCE NUMBER <span style={{ color: '#334155' }}>(OPTIONAL)</span></div>
//                 <input
//                     type="text"
//                     placeholder="Enter 12-digit UTR number"
//                     value={utrInput}
//                     onChange={e => setUtrInput(e.target.value)}
//                     style={{ width: '100%', marginTop: '10px', padding: '12px 14px', background: '#060d1a', border: '1px solid #1e293b', borderRadius: '10px', color: '#e2e8f0', fontSize: '14px', fontFamily: 'monospace', outline: 'none', letterSpacing: '1px', boxSizing: 'border-box' }}
//                     onFocus={e => e.target.style.borderColor = '#38bdf840'}
//                     onBlur={e => e.target.style.borderColor = '#1e293b'}
//                 />
//             </div>

//             {/* Required note */}
//             <div style={{ background: '#0d1f36', border: '1px solid #1e3a5f', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px' }}>
//                 <p style={{ fontSize: '10px', color: '#38bdf880', lineHeight: 1.8 }}>
//                     <span style={{ color: '#38bdf8', fontWeight: 700 }}>ℹ Note:</span> Provide at least one — screenshot OR UTR number.
//                     Both together speeds up verification.
//                 </p>
//             </div>

//             {/* Error */}
//             {submitErr && (
//                 <div style={{ background: '#7f1d1d20', border: '1px solid #ef444430', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
//                     <p style={{ fontSize: '11px', color: '#f87171' }}>⚠ {submitErr}</p>
//                 </div>
//             )}

//             {/* Submit button */}
//             <button
//                 onClick={handleSubmitProof}
//                 disabled={submitting || (!screenshot && !utrInput.trim())}
//                 style={{
//                     width: '100%', padding: '14px',
//                     background: submitting ? '#1e3a5f' : 'linear-gradient(135deg,#0f4c8a,#1a6abf)',
//                     border: '1px solid #1e5a8f',
//                     borderRadius: '12px', cursor: submitting ? 'not-allowed' : 'pointer',
//                     color: '#e2e8f0', fontSize: '12px', fontWeight: 700, letterSpacing: '2px',
//                     fontFamily: "'Space Mono',monospace",
//                     opacity: (!screenshot && !utrInput.trim()) ? 0.5 : 1,
//                     transition: 'all 0.2s',
//                     display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
//                 }}
//             >
//                 {submitting
//                     ? <><span style={{ animation: 'gpSpin 1s linear infinite', display: 'inline-block' }}>↻</span> SUBMITTING...</>
//                     : '📤  SUBMIT FOR VERIFICATION'
//                 }
//             </button>
//         </Shell>
//     )

//     // ═══════════════════════════════════════════════════════════════════════
//     //  MAIN PAYMENT UI (status === 'pending')
//     // ═══════════════════════════════════════════════════════════════════════
//     return (
//         <Shell>
//             {/* ── TOP BAR ── */}
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', paddingBottom: '18px', borderBottom: '1px solid #1e293b' }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                     <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#0d1526', border: '1px solid #1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                         <svg width="18" height="18" viewBox="0 0 18 18">
//                             <polygon points="9,1 17,9 9,17 1,9" fill="#1e3a5f" stroke="#38bdf8" strokeWidth="1" />
//                             <text x="9" y="12.5" textAnchor="middle" fontSize="6" fill="#38bdf8" fontFamily="monospace" fontWeight="700">GP</text>
//                         </svg>
//                     </div>
//                     <div>
//                         <div style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0', letterSpacing: '1px' }}>GamePlay Secure Pay</div>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
//                             <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22c55e', animation: 'gpPulse 1.5s infinite' }} />
//                             <span style={{ fontSize: '8px', color: '#22c55e', letterSpacing: '2px' }}>SSL SECURED</span>
//                         </div>
//                     </div>
//                 </div>
//                 {/* Countdown */}
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: timer.secs < 120 ? '#7f1d1d20' : '#0a1930', border: `1px solid ${timer.secs < 120 ? '#ef444440' : '#1e3a5f'}`, borderRadius: '10px', padding: '7px 13px' }}>
//                     <svg width="11" height="11" viewBox="0 0 11 11">
//                         <circle cx="5.5" cy="5.5" r="4.5" fill="none" stroke={timer.secs < 120 ? '#ef4444' : '#38bdf8'} strokeWidth="1" />
//                         <line x1="5.5" y1="5.5" x2="5.5" y2="2.5" stroke={timer.secs < 120 ? '#ef4444' : '#38bdf8'} strokeWidth="1" strokeLinecap="round" />
//                         <line x1="5.5" y1="5.5" x2="8" y2="5.5" stroke={timer.secs < 120 ? '#ef4444' : '#38bdf8'} strokeWidth="1" strokeLinecap="round" />
//                     </svg>
//                     <span style={{ fontSize: '16px', fontWeight: 700, color: timer.secs < 120 ? '#ef4444' : '#38bdf8', fontFamily: 'monospace', letterSpacing: '3px' }}>
//                         {timer.display}
//                     </span>
//                 </div>
//             </div>

//             {/* ── AMOUNT STRIP ── */}
//             <div style={{ background: 'linear-gradient(135deg,#0f172a,#1a2744)', border: '1px solid #1e3a5f', borderRadius: '14px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
//                 <div>
//                     <div style={S.label}>AMOUNT TO PAY</div>
//                     <div style={{ fontSize: '30px', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace', lineHeight: 1 }}>₹{fmt(txn.amount)}</div>
//                 </div>
//                 <div style={{ width: '1px', height: '36px', background: '#1e293b' }} />
//                 <div style={{ textAlign: 'right' }}>
//                     <div style={S.label}>YOU RECEIVE</div>
//                     <div style={{ fontSize: '20px', fontWeight: 700, color: '#D4A847', fontFamily: 'monospace' }}>
//                         {fmt(txn.coins)} <span style={{ fontSize: '13px', color: '#D4A84780' }}>COINS</span>
//                     </div>
//                 </div>
//             </div>

//             {/* ── TAB SWITCHER ── */}
//             <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', background: '#0a0f1a', borderRadius: '12px', padding: '4px' }}>
//                 {[{ id: 'qr', label: '📱  QR / UPI' }, { id: 'bank', label: '🏦  Bank Transfer' }].map(t => (
//                     <button key={t.id} onClick={() => setTab(t.id)} style={{
//                         flex: 1, padding: '10px', borderRadius: '9px', border: 'none', cursor: 'pointer',
//                         background: tab === t.id ? '#1e293b' : 'transparent',
//                         color: tab === t.id ? '#e2e8f0' : '#475569',
//                         fontSize: '11px', fontWeight: 700, letterSpacing: '1px',
//                         fontFamily: "'Space Mono',monospace",
//                         boxShadow: tab === t.id ? '0 2px 10px #00000060' : 'none',
//                         transition: 'all 0.2s',
//                     }}>{t.label}</button>
//                 ))}
//             </div>

//             {/* ══ TAB: QR ══ */}
//             {tab === 'qr' && (
//                 <div>
//                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '22px' }}>
//                         <div style={{ padding: '20px', background: '#ffffff', borderRadius: '18px', border: '1px solid #1e293b', boxShadow: '0 0 40px #38bdf812' }}>
//                             <QRCode value={upiStr} size={190} fgColor="#020b18" bgColor="#ffffff" level="H" />
//                         </div>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
//                             <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', animation: 'gpPulse 1.5s infinite' }} />
//                             <span style={{ fontSize: '10px', color: '#22c55e', letterSpacing: '2px' }}>SCAN WITH ANY UPI APP</span>
//                         </div>
//                         <p style={{ fontSize: '11px', color: '#475569', marginTop: '5px', textAlign: 'center' }}>
//                             Pay exactly <strong style={{ color: '#e2e8f0' }}>₹{fmt(txn.amount)}</strong> — amount must match exactly
//                         </p>
//                     </div>

//                     {/* UPI ID */}
//                     <div style={{ background: '#0a0f1a', border: '1px solid #1e293b', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px' }}>
//                         <div style={S.label}>OR COPY UPI ID</div>
//                         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginTop: '8px' }}>
//                             <span style={{ fontSize: '14px', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace', wordBreak: 'break-all' }}>
//                                 {txn.upi_id}
//                             </span>
//                             <button onClick={() => copy(txn.upi_id, 'upi')} style={copyBtn(copied === 'upi')}>
//                                 {copied === 'upi' ? '✓ COPIED' : 'COPY'}
//                             </button>
//                         </div>
//                     </div>

//                     {/* UPI App buttons */}
//                     <div style={{ marginBottom: '22px' }}>
//                         <div style={S.label}>PAY DIRECTLY WITH APP</div>
//                         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginTop: '12px' }}>
//                             {UPI_APPS.map(app => {
//                                 const isHov = appHov === app.id
//                                 const isLaunched = justLaunched === app.id
//                                 return (
//                                     <button key={app.id}
//                                         onClick={() => openApp(app.id)}
//                                         onMouseEnter={() => setAppHov(app.id)}
//                                         onMouseLeave={() => setAppHov(null)}
//                                         style={{
//                                             display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px',
//                                             padding: '13px 6px',
//                                             background: isLaunched ? '#14532d20' : isHov ? '#1e293b' : '#0a0f1a',
//                                             border: `1px solid ${isLaunched ? '#22c55e40' : isHov ? '#2a4a7f' : '#1e293b'}`,
//                                             borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
//                                             transform: isHov ? 'translateY(-3px)' : 'translateY(0)',
//                                         }}>
//                                         <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: app.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                                             <span style={{ color: app.fg, fontSize: app.initials.length > 2 ? '18px' : '13px', fontWeight: 800 }}>
//                                                 {app.initials}
//                                             </span>
//                                         </div>
//                                         <span style={{ fontSize: '9px', color: isLaunched ? '#22c55e' : '#64748b' }}>
//                                             {isLaunched ? '✓ Opening...' : app.label}
//                                         </span>
//                                     </button>
//                                 )
//                             })}
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* ══ TAB: BANK ══ */}
//             {tab === 'bank' && (
//                 <div style={{ marginBottom: '22px' }}>
//                     {[
//                         { l: 'Account Holder', v: txn.account_name, k: 'name' },
//                         { l: 'Account Number', v: txn.account_no, k: 'accno' },
//                         { l: 'IFSC Code', v: txn.ifsc_code, k: 'ifsc' },
//                         { l: 'Bank Name', v: txn.bank_name, k: 'bank' },
//                         { l: 'Branch', v: txn.branch, k: 'branch' },
//                     ].map(row => (
//                         <div key={row.k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 15px', background: '#0a0f1a', border: '1px solid #1e293b', borderRadius: '10px', marginBottom: '7px', gap: '10px' }}>
//                             <div>
//                                 <div style={S.label}>{row.l}</div>
//                                 <div style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', fontFamily: 'monospace', wordBreak: 'break-all', marginTop: '3px' }}>{row.v}</div>
//                             </div>
//                             <button onClick={() => copy(row.v, row.k)} style={copyBtn(copied === row.k)}>
//                                 {copied === row.k ? '✓' : 'COPY'}
//                             </button>
//                         </div>
//                     ))}
//                     <div style={{ background: '#D4A84710', border: '1px solid #D4A84730', borderRadius: '10px', padding: '12px 15px', marginTop: '6px' }}>
//                         <p style={{ fontSize: '11px', color: '#D4A847', lineHeight: 1.7 }}>
//                             ⚠ Transfer <strong>exactly ₹{fmt(txn.amount)}</strong>. Any other amount won't be auto-credited.
//                         </p>
//                     </div>
//                 </div>
//             )}

//             {/* ── I HAVE PAID button ── */}
//             <button
//                 onClick={handlePaidClick}
//                 style={{
//                     width: '100%', padding: '14px', marginBottom: '16px',
//                     background: 'linear-gradient(135deg,#14532d,#166534)',
//                     border: '1px solid #22c55e40',
//                     borderRadius: '12px', cursor: 'pointer',
//                     color: '#22c55e', fontSize: '12px', fontWeight: 700, letterSpacing: '2px',
//                     fontFamily: "'Space Mono',monospace",
//                     transition: 'all 0.2s',
//                     display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
//                 }}
//                 onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#166534,#15803d)' }}
//                 onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#14532d,#166534)' }}
//             >
//                 ✅  I HAVE PAID — SUBMIT PROOF
//             </button>

//             {/* ── DEV simulate ── */}
//             <div style={{ paddingTop: '16px', borderTop: '1px solid #0d1526', textAlign: 'center' }}>
//                 <p style={{ fontSize: '8px', color: '#1e293b', letterSpacing: '2px', marginBottom: '8px' }}>
//                     ─ DEVELOPMENT ONLY — REMOVE IN PRODUCTION ─
//                 </p>
//                 <button onClick={simulate}
//                     style={{ padding: '9px 22px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#334155', fontSize: '10px', cursor: 'pointer', fontFamily: "'Space Mono',monospace", letterSpacing: '1.5px' }}>
//                     SIMULATE PAYMENT
//                 </button>
//             </div>
//         </Shell>
//     )
// }

// // ─────────────────────────────────────────────────────────────────────────────
// //  LAYOUT
// // ─────────────────────────────────────────────────────────────────────────────
// function Shell({ children }) {
//     return (
//         <>
//             <style>{`
//                 @keyframes gpSpin  { from{transform:rotate(0deg)}  to{transform:rotate(360deg)} }
//                 @keyframes gpPulse { 0%,100%{opacity:1}            50%{opacity:0.35}             }
//                 * { box-sizing: border-box; margin: 0; padding: 0; }
//                 body { background: #020b18; font-family: 'Space Mono', monospace; }
//                 input::placeholder { color: #334155; }
//                 ::-webkit-scrollbar { width: 5px; }
//                 ::-webkit-scrollbar-track  { background: #0d1526; }
//                 ::-webkit-scrollbar-thumb  { background: #1e3a5f; border-radius: 99px; }
//             `}</style>
//             <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse 80% 55% at 50% 15%,#0a1a30,#020b18)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px 14px 48px', fontFamily: "'Space Mono',monospace" }}>
//                 <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(#38bdf808 1px,transparent 1px),linear-gradient(90deg,#38bdf808 1px,transparent 1px)', backgroundSize: '30px 30px', zIndex: 0 }} />
//                 <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '460px', background: '#0d1526', borderRadius: '20px', border: '1px solid #1e293b', boxShadow: '0 40px 120px #00000090, 0 0 0 1px #1e3a5f50 inset', padding: '26px 24px 30px', marginTop: '16px' }}>
//                     {children}
//                 </div>
//             </div>
//         </>
//     )
// }

// function Center({ children }) {
//     return (
//         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '18px', minHeight: '400px', textAlign: 'center' }}>
//             {children}
//         </div>
//     )
// }

// function SpinIcon() {
//     return (
//         <div style={{ animation: 'gpSpin 1.2s linear infinite' }}>
//             <svg width="48" height="48" viewBox="0 0 48 48">
//                 <polygon points="24,2 46,24 24,46 2,24" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
//                 <polygon points="24,12 36,24 24,36 12,24" fill="#1e3a5f" stroke="#38bdf8" strokeWidth="0.75" />
//             </svg>
//         </div>
//     )
// }

// function ErrIcon() {
//     return (
//         <svg width="52" height="52" viewBox="0 0 52 52">
//             <polygon points="26,2 50,26 26,50 2,26" fill="#7f1d1d20" stroke="#ef4444" strokeWidth="1.5" />
//             <text x="26" y="32" textAnchor="middle" fontSize="20" fill="#ef4444">!</text>
//         </svg>
//     )
// }

// // ─── Style helpers ────────────────────────────────────────────────────────────
// const S = {
//     label: { fontSize: '9px', letterSpacing: '3px', color: '#334155' },
//     muted: { fontSize: '11px', letterSpacing: '2px', color: '#475569' },
//     goldBtn: { padding: '13px 36px', borderRadius: '10px', border: '1px solid #F0C96A44', background: 'linear-gradient(135deg,#B8860B,#D4A847,#F0C96A,#D4A847,#B8860B)', color: '#150F00', fontSize: '11px', fontWeight: 700, fontFamily: "'Space Mono',monospace", letterSpacing: '3px', cursor: 'pointer' },
//     ghostBtn: { padding: '9px 22px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#94a3b8', fontSize: '10px', cursor: 'pointer', fontFamily: "'Space Mono',monospace", letterSpacing: '1.5px' },
// }

// function copyBtn(active) {
//     return {
//         flexShrink: 0, padding: '6px 12px',
//         background: active ? '#14532d20' : '#1e293b',
//         border: `1px solid ${active ? '#22c55e40' : '#334155'}`,
//         borderRadius: '7px', color: active ? '#22c55e' : '#64748b',
//         fontSize: '9px', fontWeight: 700, cursor: 'pointer',
//         fontFamily: "'Space Mono',monospace", letterSpacing: '1.5px', transition: 'all 0.2s',
//     }
// }