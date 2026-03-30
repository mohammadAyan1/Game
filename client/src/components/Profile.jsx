

// import React, { useState, useEffect } from 'react';
// import api from '../utils/api';

// // ══════════════════════════════════════════════
// //  GLOBAL STYLES  (injected once)
// // ══════════════════════════════════════════════
// const GLOBAL_CSS = `
//   @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cinzel+Decorative:wght@400;700&family=IM+Fell+English&display=swap');

//   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

//   ::-webkit-scrollbar { width: 6px; }
//   ::-webkit-scrollbar-track { background: #050403; }
//   ::-webkit-scrollbar-thumb { background: #D4A84760; border-radius: 3px; }

//   @keyframes shimmer {
//     0%   { background-position: -400px 0; }
//     100% { background-position:  400px 0; }
//   }
//   @keyframes pulse-gold {
//     0%, 100% { box-shadow: 0 0 12px #D4A84730; }
//     50%       { box-shadow: 0 0 28px #D4A84770; }
//   }
//   @keyframes float {
//     0%, 100% { transform: translateY(0px); }
//     50%       { transform: translateY(-6px); }
//   }
//   @keyframes fadeSlideIn {
//     from { opacity: 0; transform: translateY(18px); }
//     to   { opacity: 1; transform: translateY(0); }
//   }
//   @keyframes modalIn {
//     from { opacity: 0; transform: scale(0.88) translateY(20px); }
//     to   { opacity: 1; transform: scale(1)    translateY(0); }
//   }
//   @keyframes spin-slow {
//     from { transform: rotate(0deg); }
//     to   { transform: rotate(360deg); }
//   }
//   @keyframes crownGlow {
//     0%,100% { text-shadow: 0 0 8px #F0C96A, 0 0 20px #D4A84780; }
//     50%      { text-shadow: 0 0 20px #F0C96A, 0 0 50px #D4A847AA; }
//   }

//   .royal-card {
//     animation: fadeSlideIn 0.5s ease both;
//   }
//   .royal-card:nth-child(2) { animation-delay: 0.1s; }
//   .royal-card:nth-child(3) { animation-delay: 0.2s; }

//   .gold-btn {
//     position: relative;
//     overflow: hidden;
//     transition: transform 0.15s ease, box-shadow 0.15s ease;
//   }
//   .gold-btn::after {
//     content: '';
//     position: absolute;
//     inset: 0;
//     background: linear-gradient(90deg, transparent 0%, #fff4 40%, transparent 100%);
//     background-size: 400px 100%;
//     opacity: 0;
//     transition: opacity 0.2s;
//   }
//   .gold-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 24px #D4A84760; }
//   .gold-btn:hover::after { opacity: 1; animation: shimmer 0.7s linear; }
//   .gold-btn:active { transform: translateY(0); }

//   .tx-row { transition: background 0.2s; }
//   .tx-row:hover { background: #D4A84710 !important; }

//   .crown-float { animation: float 3s ease-in-out infinite, crownGlow 2.5s ease-in-out infinite; }

//   .ornament-spin { animation: spin-slow 20s linear infinite; }

//   .input-royal:focus {
//     outline: none;
//     border-color: #D4A847 !important;
//     box-shadow: 0 0 0 2px #D4A84730;
//   }

//   .action-btn {
//     transition: transform 0.15s ease, opacity 0.15s ease;
//   }
//   .action-btn:hover { transform: scale(1.25); opacity: 0.9; }
// `;

// // ══════════════════════════════════════════════
// //  HELPER
// // ══════════════════════════════════════════════
// const typeColor = t => ({ profit: '#22c55e', loss: '#ef4444', topup: '#60a5fa', withdrawal: '#f59e0b' }[t] || '#D4A847');
// const statusColor = s => ({ success: '#22c55e', pending: '#facc15', failed: '#ef4444' }[s] || '#D4A847');
// const fmt = n => new Date(n).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

// // ══════════════════════════════════════════════
// //  SUB-COMPONENTS
// // ══════════════════════════════════════════════
// const Divider = () => (
//     <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
//         <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,#D4A84740)' }} />
//         <span style={{ color: '#D4A84770', fontSize: 10, letterSpacing: 3 }}>✦ ✦ ✦</span>
//         <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,#D4A84740,transparent)' }} />
//     </div>
// );

// const OrnateCorner = ({ style }) => (
//     <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={style}>
//         <path d="M2 2 L2 14 M2 2 L14 2" stroke="#D4A84760" strokeWidth="1.5" strokeLinecap="round" />
//         <circle cx="2" cy="2" r="2" fill="#D4A847" />
//     </svg>
// );

// const Card = ({ children, style = {} }) => (
//     <div className="royal-card" style={{
//         background: 'linear-gradient(145deg, #0D0A06 0%, #0A0805 60%, #0D0A06 100%)',
//         border: '1px solid #D4A84730',
//         borderRadius: 16,
//         padding: 28,
//         marginBottom: 24,
//         position: 'relative',
//         ...style
//     }}>
//         <OrnateCorner style={{ position: 'absolute', top: 8, left: 8 }} />
//         <OrnateCorner style={{ position: 'absolute', top: 8, right: 8, transform: 'scaleX(-1)' }} />
//         <OrnateCorner style={{ position: 'absolute', bottom: 8, left: 8, transform: 'scaleY(-1)' }} />
//         <OrnateCorner style={{ position: 'absolute', bottom: 8, right: 8, transform: 'scale(-1)' }} />
//         {children}
//     </div>
// );

// const SectionTitle = ({ icon, children }) => (
//     <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
//         <span style={{ fontSize: 18 }}>{icon}</span>
//         <h2 style={{
//             fontFamily: 'Cinzel, serif',
//             fontSize: 15,
//             fontWeight: 700,
//             color: '#E8C85A',
//             letterSpacing: 3,
//             textTransform: 'uppercase',
//         }}>{children}</h2>
//         <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,#D4A84740,transparent)', marginLeft: 6 }} />
//     </div>
// );

// // ══════════════════════════════════════════════
// //  MAIN COMPONENT
// // ══════════════════════════════════════════════
// export default function Profile() {
//     const [transactions, setTransactions] = useState([]);
//     const [totalCoins, setTotalCoins] = useState(0);
//     const [amount, setAmount] = useState('');
//     const [upiId, setUpiId] = useState('');
//     const [message, setMessage] = useState('');
//     const [submitting, setSubmitting] = useState(false);
//     const [editTx, setEditTx] = useState(null);
//     const [editCoins, setEditCoins] = useState('');
//     const [editUpi, setEditUpi] = useState('');



//     const fetchData = async () => {
//         try {
//             const res = await api.get("/wallet/history");
//             setTransactions(res.data.transactions);
//             setTotalCoins(res.data.totalCoins);
//         } catch (error) {
//             console.error(error);
//         } finally {
//             // setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchData();
//     }, []);

//     const inputStyle = {
//         width: '100%', padding: '11px 14px', marginBottom: 12,
//         background: '#07060480', border: '1px solid #D4A84730', borderRadius: 8,
//         color: '#E8C85A', fontFamily: 'IM Fell English, serif', fontSize: 14,
//     };

//     // ── Withdraw ─────────────────────────────
//     const handleWithdraw = async (e) => {
//         e.preventDefault();
//         if (!amount || amount <= 0) return setMessage('⚠ Enter a valid coin amount.');
//         if (!upiId.trim()) return setMessage('⚠ UPI ID is required.');

//         try {
//             setSubmitting(true);

//             const res = await api.post("/wallet/withdrawal", { coins: amount, upiId })

//             console.log('====================================');
//             console.log(res);
//             console.log('====================================');

//             if (res?.data?.success) {
//                 setAmount(''); setUpiId('');
//                 fetchData()
//             }

//         } catch (error) {
//             console.log(error);
//             setSubmitting(false);
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     // ── Delete ───────────────────────────────
//     const handleDelete = async (id) => {


//         try {
//             const res = await api.delete(`/wallet/withdrawal/${id}`)

//             if (res?.data?.success) {
//                 fetchData()
//             }

//         } catch (error) {
//             console.log(error);
//         }
//     };

//     // ── Update ───────────────────────────────
//     const handleUpdate = async () => {

//         try {
//             const res = await api.put(`/wallet/withdrawal/${editTx?.id}`, { coins: editCoins, upiId: editUpi })

//             if (res?.data?.success) {
//                 setEditTx(null);
//                 fetchData()
//             }
//         } catch (error) {
//             console.log(error);

//         } finally {

//             setEditTx(null);
//         }
//     };

//     return (
//         <>
//             <style>{GLOBAL_CSS}</style>

//             <div style={{
//                 background: '#050403',
//                 minHeight: '100vh',
//                 padding: '32px 20px',
//                 fontFamily: 'IM Fell English, serif',
//                 color: '#D4A847',
//                 backgroundImage: `
//           radial-gradient(ellipse 80% 50% at 50% -10%, #2a1a0060 0%, transparent 70%),
//           repeating-linear-gradient(0deg, transparent, transparent 39px, #D4A84706 40px),
//           repeating-linear-gradient(90deg, transparent, transparent 39px, #D4A84706 40px)
//         `,
//             }}>
//                 <div style={{ maxWidth: 780, margin: '0 auto' }}>

//                     {/* ── HEADER ─────────────────────────────── */}
//                     <div style={{ textAlign: 'center', marginBottom: 36 }}>
//                         <div className="crown-float" style={{ fontSize: 42, marginBottom: 6 }}>♛</div>
//                         <h1 style={{
//                             fontFamily: 'Cinzel Decorative, serif',
//                             fontSize: 22,
//                             fontWeight: 700,
//                             color: '#F0C96A',
//                             letterSpacing: 6,
//                             textTransform: 'uppercase',
//                             lineHeight: 1.2,
//                         }}>Royal Vault</h1>
//                         <p style={{ color: '#D4A84760', fontSize: 11, letterSpacing: 4, marginTop: 6, fontFamily: 'Cinzel,serif' }}>
//                             YOUR KINGDOM · YOUR COINS
//                         </p>
//                     </div>

//                     {/* ── WALLET BALANCE ──────────────────────── */}
//                     <Card>
//                         <SectionTitle icon="⚜">Wallet Balance</SectionTitle>

//                         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '16px 0' }}>
//                             {/* Big coin display */}
//                             <div style={{ textAlign: 'center' }}>
//                                 <div style={{
//                                     display: 'inline-flex', alignItems: 'center', gap: 14,
//                                     background: 'linear-gradient(135deg,#1a1200 0%,#0a0600 100%)',
//                                     border: '1px solid #D4A84750',
//                                     borderRadius: 16, padding: '18px 36px',
//                                     animation: 'pulse-gold 3s ease-in-out infinite',
//                                     position: 'relative', overflow: 'hidden',
//                                 }}>
//                                     <div style={{
//                                         position: 'absolute', inset: 0,
//                                         background: 'radial-gradient(ellipse at 30% 30%, #D4A84715, transparent)',
//                                     }} />
//                                     <span style={{ fontSize: 34, filter: 'drop-shadow(0 0 8px #D4A847)' }}>🪙</span>
//                                     <div>
//                                         <div style={{
//                                             fontFamily: 'Cinzel, serif',
//                                             fontSize: 44,
//                                             fontWeight: 900,
//                                             color: '#F0C96A',
//                                             letterSpacing: 2,
//                                             lineHeight: 1,
//                                             textShadow: '0 0 20px #D4A84780',
//                                         }}>{totalCoins.toLocaleString('en-IN')}</div>
//                                         <div style={{ color: '#D4A84770', fontSize: 11, letterSpacing: 3, fontFamily: 'Cinzel,serif' }}>COINS</div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         <Divider />

//                         {/* Quick stats */}
//                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
//                             {[
//                                 { label: 'Total Won', val: '+ 330', color: '#22c55e', icon: '📈' },
//                                 { label: 'Total Lost', val: '- 100', color: '#ef4444', icon: '📉' },
//                                 { label: 'Withdrawn', val: '200', color: '#f59e0b', icon: '🏦' },
//                             ].map(s => (
//                                 <div key={s.label} style={{
//                                     background: '#07050280', border: '1px solid #D4A84720',
//                                     borderRadius: 10, padding: '12px 10px', textAlign: 'center',
//                                 }}>
//                                     <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
//                                     <div style={{ color: s.color, fontFamily: 'Cinzel,serif', fontSize: 15, fontWeight: 700 }}>{s.val}</div>
//                                     <div style={{ color: '#D4A84760', fontSize: 10, letterSpacing: 2, marginTop: 3 }}>{s.label}</div>
//                                 </div>
//                             ))}
//                         </div>
//                     </Card>

//                     {/* ── WITHDRAW ───────────────────────────── */}
//                     <Card>
//                         <SectionTitle icon="💸">Request Withdrawal</SectionTitle>

//                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
//                             <div>
//                                 <label style={{ display: 'block', fontSize: 11, letterSpacing: 2, color: '#D4A84790', marginBottom: 6, fontFamily: 'Cinzel,serif' }}>COINS AMOUNT</label>
//                                 <input
//                                     className="input-royal"
//                                     type="number"
//                                     placeholder="e.g. 500"
//                                     value={amount}
//                                     onChange={e => setAmount(e.target.value)}
//                                     style={inputStyle}
//                                 />
//                             </div>
//                             <div>
//                                 <label style={{ display: 'block', fontSize: 11, letterSpacing: 2, color: '#D4A84790', marginBottom: 6, fontFamily: 'Cinzel,serif' }}>UPI ID</label>
//                                 <input
//                                     className="input-royal"
//                                     type="text"
//                                     placeholder="name@bank"
//                                     value={upiId}
//                                     onChange={e => setUpiId(e.target.value)}
//                                     style={inputStyle}
//                                 />
//                             </div>
//                         </div>

//                         <button
//                             className="gold-btn"
//                             onClick={handleWithdraw}
//                             disabled={submitting}
//                             style={{
//                                 width: '100%', padding: '13px',
//                                 background: 'linear-gradient(90deg, #C8941F 0%, #F0C96A 50%, #C8941F 100%)',
//                                 color: '#0A0602', border: 'none', borderRadius: 9,
//                                 fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 13, letterSpacing: 3,
//                                 cursor: submitting ? 'not-allowed' : 'pointer',
//                                 opacity: submitting ? 0.7 : 1,
//                             }}
//                         >
//                             {submitting ? '⏳  Processing...' : '♛  WITHDRAW COINS'}
//                         </button>

//                         {message && (
//                             <p style={{
//                                 marginTop: 12, padding: '10px 14px',
//                                 background: message.includes('✅') ? '#22c55e15' : '#ef444415',
//                                 border: `1px solid ${message.includes('✅') ? '#22c55e40' : '#ef444440'}`,
//                                 borderRadius: 8, color: message.includes('✅') ? '#22c55e' : '#ef4444',
//                                 fontSize: 13,
//                             }}>{message}</p>
//                         )}
//                     </Card>

//                     {/* ── TRANSACTIONS ───────────────────────── */}
//                     <Card>
//                         <SectionTitle icon="📜">Transaction Ledger</SectionTitle>

//                         <div style={{ overflowX: 'auto' }}>
//                             <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//                                 <thead>
//                                     <tr style={{ borderBottom: '1px solid #D4A84730' }}>
//                                         {['Date', 'Type', 'Description', 'Coins', 'Status', 'Action'].map(h => (
//                                             <th key={h} style={{
//                                                 padding: '10px 12px', textAlign: 'left',
//                                                 fontFamily: 'Cinzel,serif', fontSize: 10, letterSpacing: 2,
//                                                 color: '#D4A84790', fontWeight: 600,
//                                             }}>{h}</th>
//                                         ))}
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {transactions.map((tx, i) => (
//                                         <tr key={tx.id} className="tx-row" style={{
//                                             borderBottom: '1px solid #D4A84715',
//                                             background: i % 2 === 0 ? 'transparent' : '#D4A8470A',
//                                         }}>
//                                             <td style={{ padding: '11px 12px', fontSize: 12, color: '#D4A84780', whiteSpace: 'nowrap' }}>{fmt(tx.createdAt)}</td>

//                                             <td style={{ padding: '11px 12px' }}>
//                                                 <span style={{
//                                                     padding: '3px 10px', borderRadius: 20,
//                                                     background: typeColor(tx.type) + '18',
//                                                     border: `1px solid ${typeColor(tx.type)}40`,
//                                                     color: typeColor(tx.type),
//                                                     fontSize: 11, fontFamily: 'Cinzel,serif', letterSpacing: 1,
//                                                 }}>{tx.type}</span>
//                                             </td>

//                                             <td style={{ padding: '11px 12px', fontSize: 13, color: '#D4A847CC' }}>{tx.description}</td>

//                                             <td style={{
//                                                 padding: '11px 12px', fontFamily: 'Cinzel,serif', fontWeight: 700,
//                                                 color: tx.coins < 0 ? '#ef4444' : '#22c55e', fontSize: 14
//                                             }}>
//                                                 {tx.coins > 0 ? '+' : ''}{tx.coins}
//                                             </td>

//                                             <td style={{ padding: '11px 12px' }}>
//                                                 <span style={{
//                                                     display: 'inline-flex', alignItems: 'center', gap: 5,
//                                                     padding: '3px 10px', borderRadius: 20,
//                                                     background: statusColor(tx.status) + '18',
//                                                     border: `1px solid ${statusColor(tx.status)}40`,
//                                                     color: statusColor(tx.status),
//                                                     fontSize: 11, fontFamily: 'Cinzel,serif', letterSpacing: 1,
//                                                 }}>
//                                                     {tx.status === 'pending' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#facc15', display: 'inline-block', animation: 'pulse-gold 1.5s infinite' }} />}
//                                                     {tx.status}
//                                                 </span>
//                                             </td>

//                                             <td style={{ padding: '11px 12px' }}>
//                                                 {tx.type === 'withdrawal' && tx.status === 'pending' && (
//                                                     <div style={{ display: 'flex', gap: 8 }}>
//                                                         <button className="action-btn" onClick={() => { setEditTx(tx); setEditCoins(tx.coins); setEditUpi(tx.upiId); }}
//                                                             style={{ background: '#3b82f615', border: '1px solid #3b82f640', borderRadius: 7, padding: '5px 10px', color: '#3b82f6', cursor: 'pointer', fontSize: 14 }}>✏</button>
//                                                         <button className="action-btn" onClick={() => handleDelete(tx.id)}
//                                                             style={{ background: '#ef444415', border: '1px solid #ef444440', borderRadius: 7, padding: '5px 10px', color: '#ef4444', cursor: 'pointer', fontSize: 14 }}>🗑</button>
//                                                     </div>
//                                                 )}
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </Card>

//                 </div>
//             </div>

//             {/* ── EDIT MODAL ─────────────────────────── */}
//             {editTx && (
//                 <div style={{
//                     position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
//                     display: 'flex', justifyContent: 'center', alignItems: 'center',
//                     zIndex: 999, backdropFilter: 'blur(6px)',
//                 }}
//                     onClick={e => e.target === e.currentTarget && setEditTx(null)}
//                 >
//                     <div style={{
//                         background: 'linear-gradient(145deg,#0D0A06,#060402)',
//                         border: '1px solid #D4A84740',
//                         borderRadius: 18, padding: 32,
//                         width: '92%', maxWidth: 400,
//                         animation: 'modalIn 0.25s ease',
//                         position: 'relative',
//                     }}>
//                         <OrnateCorner style={{ position: 'absolute', top: 8, left: 8 }} />
//                         <OrnateCorner style={{ position: 'absolute', top: 8, right: 8, transform: 'scaleX(-1)' }} />
//                         <OrnateCorner style={{ position: 'absolute', bottom: 8, left: 8, transform: 'scaleY(-1)' }} />
//                         <OrnateCorner style={{ position: 'absolute', bottom: 8, right: 8, transform: 'scale(-1)' }} />

//                         <div style={{ textAlign: 'center', marginBottom: 20 }}>
//                             <div style={{ fontSize: 28, marginBottom: 6 }}>✏</div>
//                             <h3 style={{ fontFamily: 'Cinzel,serif', color: '#F0C96A', letterSpacing: 3, fontSize: 14 }}>EDIT WITHDRAWAL</h3>
//                         </div>

//                         <Divider />

//                         <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, color: '#D4A84790', marginBottom: 6, fontFamily: 'Cinzel,serif' }}>COINS</label>
//                         <input className="input-royal" type="number" value={editCoins} onChange={e => setEditCoins(e.target.value)} style={inputStyle} />

//                         <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, color: '#D4A84790', marginBottom: 6, fontFamily: 'Cinzel,serif' }}>UPI ID</label>
//                         <input className="input-royal" type="text" value={editUpi} onChange={e => setEditUpi(e.target.value)} style={inputStyle} />

//                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
//                             <button className="gold-btn" onClick={handleUpdate} style={{
//                                 padding: '12px', borderRadius: 9, border: 'none', cursor: 'pointer',
//                                 background: 'linear-gradient(90deg,#C8941F,#F0C96A,#C8941F)',
//                                 color: '#0A0602', fontFamily: 'Cinzel,serif', fontWeight: 700, fontSize: 12, letterSpacing: 2,
//                             }}>SAVE</button>

//                             <button className="gold-btn" onClick={() => setEditTx(null)} style={{
//                                 padding: '12px', borderRadius: 9, cursor: 'pointer',
//                                 background: 'transparent', border: '1px solid #D4A84740',
//                                 color: '#D4A84790', fontFamily: 'Cinzel,serif', fontSize: 12, letterSpacing: 2,
//                             }}>CANCEL</button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// }



import React, { useState, useEffect, useMemo } from 'react';
import api from '../utils/api';

// ══════════════════════════════════════════════
//  GLOBAL STYLES
// ══════════════════════════════════════════════
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cinzel+Decorative:wght@400;700&family=IM+Fell+English&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #050403; }
  ::-webkit-scrollbar-thumb { background: #D4A84760; border-radius: 3px; }

  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
  @keyframes pulse-gold {
    0%, 100% { box-shadow: 0 0 12px #D4A84730; }
    50%       { box-shadow: 0 0 28px #D4A84770; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-6px); }
  }
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.88) translateY(20px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes crownGlow {
    0%,100% { text-shadow: 0 0 8px #F0C96A, 0 0 20px #D4A84780; }
    50%      { text-shadow: 0 0 20px #F0C96A, 0 0 50px #D4A847AA; }
  }
  @keyframes dotPulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.3; }
  }

  .royal-card { animation: fadeSlideIn 0.5s ease both; }
  .royal-card:nth-child(2) { animation-delay: 0.1s; }
  .royal-card:nth-child(3) { animation-delay: 0.2s; }

  .gold-btn {
    position: relative;
    overflow: hidden;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .gold-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent 0%, #fff4 40%, transparent 100%);
    background-size: 400px 100%;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .gold-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 24px #D4A84760; }
  .gold-btn:hover::after { opacity: 1; animation: shimmer 0.7s linear; }
  .gold-btn:active { transform: translateY(0); }

  .tx-row { transition: background 0.2s; }
  .tx-row:hover { background: #D4A84710 !important; }

  .crown-float { animation: float 3s ease-in-out infinite, crownGlow 2.5s ease-in-out infinite; }

  .input-royal:focus {
    outline: none;
    border-color: #D4A847 !important;
    box-shadow: 0 0 0 2px #D4A84730;
  }

  .action-btn { transition: transform 0.15s ease, opacity 0.15s ease; }
  .action-btn:hover { transform: scale(1.25); opacity: 0.9; }
`;

const typeColor = t => ({ profit: '#22c55e', loss: '#ef4444', topup: '#60a5fa', withdrawal: '#f59e0b' }[t] || '#D4A847');
const statusColor = s => ({ success: '#22c55e', pending: '#facc15', failed: '#ef4444' }[s] || '#D4A847');
const fmt = n => new Date(n).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const Divider = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,#D4A84740)' }} />
        <span style={{ color: '#D4A84770', fontSize: 10, letterSpacing: 3 }}>✦ ✦ ✦</span>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,#D4A84740,transparent)' }} />
    </div>
);

const OrnateCorner = ({ style }) => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={style}>
        <path d="M2 2 L2 14 M2 2 L14 2" stroke="#D4A84760" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="2" cy="2" r="2" fill="#D4A847" />
    </svg>
);

const Card = ({ children, style = {} }) => (
    <div className="royal-card" style={{
        background: 'linear-gradient(145deg, #0D0A06 0%, #0A0805 60%, #0D0A06 100%)',
        border: '1px solid #D4A84730', borderRadius: 16, padding: 28, marginBottom: 24,
        position: 'relative', ...style,
    }}>
        <OrnateCorner style={{ position: 'absolute', top: 8, left: 8 }} />
        <OrnateCorner style={{ position: 'absolute', top: 8, right: 8, transform: 'scaleX(-1)' }} />
        <OrnateCorner style={{ position: 'absolute', bottom: 8, left: 8, transform: 'scaleY(-1)' }} />
        <OrnateCorner style={{ position: 'absolute', bottom: 8, right: 8, transform: 'scale(-1)' }} />
        {children}
    </div>
);

const SectionTitle = ({ icon, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 15, fontWeight: 700, color: '#E8C85A', letterSpacing: 3, textTransform: 'uppercase' }}>{children}</h2>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,#D4A84740,transparent)', marginLeft: 6 }} />
    </div>
);

export default function Profile() {
    const [transactions, setTransactions] = useState([]);
    const [totalCoins, setTotalCoins] = useState(0);
    const [amount, setAmount] = useState('');
    const [upiId, setUpiId] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [editTx, setEditTx] = useState(null);
    const [editCoins, setEditCoins] = useState('');
    const [editUpi, setEditUpi] = useState('');

    // ✅ REAL STATS — live transactions se automatically calculate
    const stats = useMemo(() => {
        const totalProfit = transactions
            .filter(tx => tx.type === 'profit')
            .reduce((sum, tx) => sum + Number(tx.coins), 0);

        const totalLoss = transactions
            .filter(tx => tx.type === 'loss')
            .reduce((sum, tx) => sum + Math.abs(Number(tx.coins)), 0);

        // ✅ Sirf SUCCESS wali withdrawals count hongi
        const totalWithdrawn = transactions
            .filter(tx => tx.type === 'withdrawal' && tx.status === 'success')
            .reduce((sum, tx) => sum + Number(tx.coins), 0);

        return { totalProfit, totalLoss, totalWithdrawn };
    }, [transactions]);

    const inputStyle = {
        width: '100%', padding: '11px 14px', marginBottom: 12,
        background: '#07060480', border: '1px solid #D4A84730', borderRadius: 8,
        color: '#E8C85A', fontFamily: 'IM Fell English, serif', fontSize: 14,
    };

    const fetchData = async () => {
        try {
            const res = await api.get("/wallet/history");
            setTransactions(res.data.transactions);
            setTotalCoins(res.data.totalCoins);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleWithdraw = async (e) => {
        e.preventDefault();
        if (!amount || amount <= 0) return setMessage('⚠ Enter a valid coin amount.');
        if (!upiId.trim()) return setMessage('⚠ UPI ID is required.');
        try {
            setSubmitting(true);
            const res = await api.post("/wallet/withdrawal", { coins: amount, upiId });
            if (res?.data?.success) {
                setMessage('✅ Withdrawal request submitted!');
                setAmount(''); setUpiId('');
                fetchData();
            }
        } catch (error) {
            setMessage('⚠ ' + (error?.response?.data?.message || 'Something went wrong'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this withdrawal?")) return;
        try {
            const res = await api.delete(`/wallet/withdrawal/${id}`);
            if (res?.data?.success) fetchData();
        } catch (error) { console.log(error); }
    };

    const handleUpdate = async () => {
        try {
            const res = await api.put(`/wallet/withdrawal/${editTx?.id}`, { coins: editCoins, upiId: editUpi });
            if (res?.data?.success) { setEditTx(null); fetchData(); }
        } catch (error) { console.log(error); }
        finally { setEditTx(null); }
    };

    return (
        <>
            <style>{GLOBAL_CSS}</style>
            <div style={{
                background: '#050403', minHeight: '100vh', padding: '32px 20px',
                fontFamily: 'IM Fell English, serif', color: '#D4A847',
                backgroundImage: `
                    radial-gradient(ellipse 80% 50% at 50% -10%, #2a1a0060 0%, transparent 70%),
                    repeating-linear-gradient(0deg, transparent, transparent 39px, #D4A84706 40px),
                    repeating-linear-gradient(90deg, transparent, transparent 39px, #D4A84706 40px)
                `,
            }}>
                <div style={{ maxWidth: 780, margin: '0 auto' }}>

                    {/* HEADER */}
                    <div style={{ textAlign: 'center', marginBottom: 36 }}>
                        <div className="crown-float" style={{ fontSize: 42, marginBottom: 6 }}>♛</div>
                        <h1 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: 22, fontWeight: 700, color: '#F0C96A', letterSpacing: 6, textTransform: 'uppercase', lineHeight: 1.2 }}>Royal Vault</h1>
                        <p style={{ color: '#D4A84760', fontSize: 11, letterSpacing: 4, marginTop: 6, fontFamily: 'Cinzel,serif' }}>YOUR KINGDOM · YOUR COINS</p>
                    </div>

                    {/* BALANCE */}
                    <Card>
                        <SectionTitle icon="⚜">Wallet Balance</SectionTitle>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 0' }}>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 14,
                                background: 'linear-gradient(135deg,#1a1200 0%,#0a0600 100%)',
                                border: '1px solid #D4A84750', borderRadius: 16, padding: '18px 36px',
                                animation: 'pulse-gold 3s ease-in-out infinite',
                                position: 'relative', overflow: 'hidden',
                            }}>
                                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 30%, #D4A84715, transparent)' }} />
                                <span style={{ fontSize: 34, filter: 'drop-shadow(0 0 8px #D4A847)' }}>🪙</span>
                                <div>
                                    <div style={{ fontFamily: 'Cinzel, serif', fontSize: 44, fontWeight: 900, color: '#F0C96A', letterSpacing: 2, lineHeight: 1, textShadow: '0 0 20px #D4A84780' }}>
                                        {totalCoins.toLocaleString('en-IN')}
                                    </div>
                                    <div style={{ color: '#D4A84770', fontSize: 11, letterSpacing: 3, fontFamily: 'Cinzel,serif' }}>COINS</div>
                                </div>
                            </div>
                        </div>
                        <Divider />
                        {/* ✅ REAL DATA stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                            {[
                                { label: 'Total Won', val: `+ ${stats.totalProfit.toLocaleString('en-IN')}`, color: '#22c55e', icon: '📈' },
                                { label: 'Total Lost', val: `- ${stats.totalLoss.toLocaleString('en-IN')}`, color: '#ef4444', icon: '📉' },
                                { label: 'Withdrawn', val: stats.totalWithdrawn.toLocaleString('en-IN'), color: '#f59e0b', icon: '🏦' },
                            ].map(s => (
                                <div key={s.label} style={{ background: '#07050280', border: '1px solid #D4A84720', borderRadius: 10, padding: '12px 10px', textAlign: 'center' }}>
                                    <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                                    <div style={{ color: s.color, fontFamily: 'Cinzel,serif', fontSize: 15, fontWeight: 700 }}>{s.val}</div>
                                    <div style={{ color: '#D4A84760', fontSize: 10, letterSpacing: 2, marginTop: 3 }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* WITHDRAW */}
                    <Card>
                        <SectionTitle icon="💸">Request Withdrawal</SectionTitle>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, letterSpacing: 2, color: '#D4A84790', marginBottom: 6, fontFamily: 'Cinzel,serif' }}>COINS AMOUNT</label>
                                <input className="input-royal" type="number" placeholder="e.g. 500" value={amount} onChange={e => setAmount(e.target.value)} style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, letterSpacing: 2, color: '#D4A84790', marginBottom: 6, fontFamily: 'Cinzel,serif' }}>UPI ID</label>
                                <input className="input-royal" type="text" placeholder="name@bank" value={upiId} onChange={e => setUpiId(e.target.value)} style={inputStyle} />
                            </div>
                        </div>
                        <button className="gold-btn" onClick={handleWithdraw} disabled={submitting} style={{
                            width: '100%', padding: '13px',
                            background: 'linear-gradient(90deg, #C8941F 0%, #F0C96A 50%, #C8941F 100%)',
                            color: '#0A0602', border: 'none', borderRadius: 9,
                            fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 13, letterSpacing: 3,
                            cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1,
                        }}>
                            {submitting ? '⏳  Processing...' : '♛  WITHDRAW COINS'}
                        </button>
                        {message && (
                            <p style={{
                                marginTop: 12, padding: '10px 14px',
                                background: message.includes('✅') ? '#22c55e15' : '#ef444415',
                                border: `1px solid ${message.includes('✅') ? '#22c55e40' : '#ef444440'}`,
                                borderRadius: 8, color: message.includes('✅') ? '#22c55e' : '#ef4444', fontSize: 13,
                            }}>{message}</p>
                        )}
                    </Card>

                    {/* TRANSACTIONS */}
                    <Card>
                        <SectionTitle icon="📜">Transaction Ledger</SectionTitle>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #D4A84730' }}>
                                        {['Date', 'Type', 'Description', 'Coins', 'Status', 'Action'].map(h => (
                                            <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontFamily: 'Cinzel,serif', fontSize: 10, letterSpacing: 2, color: '#D4A84790', fontWeight: 600 }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.length === 0 ? (
                                        <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#D4A84750', fontFamily: 'Cinzel,serif', fontSize: 12, letterSpacing: 2 }}>NO TRANSACTIONS YET</td></tr>
                                    ) : transactions.map((tx, i) => (
                                        <tr key={tx.id} className="tx-row" style={{ borderBottom: '1px solid #D4A84715', background: i % 2 === 0 ? 'transparent' : '#D4A8470A' }}>
                                            <td style={{ padding: '11px 12px', fontSize: 12, color: '#D4A84780', whiteSpace: 'nowrap' }}>{fmt(tx.createdAt)}</td>
                                            <td style={{ padding: '11px 12px' }}>
                                                <span style={{ padding: '3px 10px', borderRadius: 20, background: typeColor(tx.type) + '18', border: `1px solid ${typeColor(tx.type)}40`, color: typeColor(tx.type), fontSize: 11, fontFamily: 'Cinzel,serif', letterSpacing: 1 }}>{tx.type}</span>
                                            </td>
                                            <td style={{ padding: '11px 12px', fontSize: 13, color: '#D4A847CC' }}>{tx.description}</td>
                                            <td style={{ padding: '11px 12px', fontFamily: 'Cinzel,serif', fontWeight: 700, color: tx.coins < 0 ? '#ef4444' : '#22c55e', fontSize: 14 }}>
                                                {tx.coins > 0 ? '+' : ''}{tx.coins}
                                            </td>
                                            <td style={{ padding: '11px 12px' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: statusColor(tx.status) + '18', border: `1px solid ${statusColor(tx.status)}40`, color: statusColor(tx.status), fontSize: 11, fontFamily: 'Cinzel,serif', letterSpacing: 1 }}>
                                                    {tx.status === 'pending' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#facc15', display: 'inline-block', animation: 'dotPulse 1.5s ease-in-out infinite' }} />}
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '11px 12px' }}>
                                                {tx.type === 'withdrawal' && tx.status === 'pending' && (
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        <button className="action-btn" onClick={() => { setEditTx(tx); setEditCoins(tx.coins); setEditUpi(tx.upiId); }} style={{ background: '#3b82f615', border: '1px solid #3b82f640', borderRadius: 7, padding: '5px 10px', color: '#3b82f6', cursor: 'pointer', fontSize: 14 }}>✏</button>
                                                        <button className="action-btn" onClick={() => handleDelete(tx.id)} style={{ background: '#ef444415', border: '1px solid #ef444440', borderRadius: 7, padding: '5px 10px', color: '#ef4444', cursor: 'pointer', fontSize: 14 }}>🗑</button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>

            {/* EDIT MODAL */}
            {editTx && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999, backdropFilter: 'blur(6px)' }}
                    onClick={e => e.target === e.currentTarget && setEditTx(null)}>
                    <div style={{ background: 'linear-gradient(145deg,#0D0A06,#060402)', border: '1px solid #D4A84740', borderRadius: 18, padding: 32, width: '92%', maxWidth: 400, animation: 'modalIn 0.25s ease', position: 'relative' }}>
                        <OrnateCorner style={{ position: 'absolute', top: 8, left: 8 }} />
                        <OrnateCorner style={{ position: 'absolute', top: 8, right: 8, transform: 'scaleX(-1)' }} />
                        <OrnateCorner style={{ position: 'absolute', bottom: 8, left: 8, transform: 'scaleY(-1)' }} />
                        <OrnateCorner style={{ position: 'absolute', bottom: 8, right: 8, transform: 'scale(-1)' }} />
                        <div style={{ textAlign: 'center', marginBottom: 20 }}>
                            <div style={{ fontSize: 28, marginBottom: 6 }}>✏</div>
                            <h3 style={{ fontFamily: 'Cinzel,serif', color: '#F0C96A', letterSpacing: 3, fontSize: 14 }}>EDIT WITHDRAWAL</h3>
                        </div>
                        <Divider />
                        <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, color: '#D4A84790', marginBottom: 6, fontFamily: 'Cinzel,serif' }}>COINS</label>
                        <input className="input-royal" type="number" value={editCoins} onChange={e => setEditCoins(e.target.value)} style={inputStyle} />
                        <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, color: '#D4A84790', marginBottom: 6, fontFamily: 'Cinzel,serif' }}>UPI ID</label>
                        <input className="input-royal" type="text" value={editUpi} onChange={e => setEditUpi(e.target.value)} style={inputStyle} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
                            <button className="gold-btn" onClick={handleUpdate} style={{ padding: '12px', borderRadius: 9, border: 'none', cursor: 'pointer', background: 'linear-gradient(90deg,#C8941F,#F0C96A,#C8941F)', color: '#0A0602', fontFamily: 'Cinzel,serif', fontWeight: 700, fontSize: 12, letterSpacing: 2 }}>SAVE</button>
                            <button className="gold-btn" onClick={() => setEditTx(null)} style={{ padding: '12px', borderRadius: 9, cursor: 'pointer', background: 'transparent', border: '1px solid #D4A84740', color: '#D4A84790', fontFamily: 'Cinzel,serif', fontSize: 12, letterSpacing: 2 }}>CANCEL</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}