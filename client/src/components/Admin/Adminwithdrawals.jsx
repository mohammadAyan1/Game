// // src/components/admin/AdminWithdrawals.jsx
// import React, { useState, useEffect } from 'react';
// import api from '../../utils/api';

// const statusColor = s => ({ success: '#22c55e', pending: '#facc15', failed: '#ef4444' }[s] || '#D4A847');
// const fmt = n => new Date(n).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });

// const OrnateCorner = ({ style }) => (
//     <svg width="22" height="22" viewBox="0 0 28 28" fill="none" style={style}>
//         <path d="M2 2 L2 14 M2 2 L14 2" stroke="#D4A84750" strokeWidth="1.5" strokeLinecap="round" />
//         <circle cx="2" cy="2" r="2" fill="#D4A84770" />
//     </svg>
// );

// export default function AdminWithdrawals() {
//     const [withdrawals, setWithdrawals] = useState([]);
//     const [filter, setFilter] = useState('all');

//     const fetchWithdrawals = async () => {
//         try {
//             const res = await api.get('/withdrawal/pending');
//             console.log(res?.data?.data);

//             setWithdrawals(res?.data?.data || []);
//         } catch (e) {
//             console.log(e);
//             // Mock data
//             // setWithdrawals([
//             //     { id: 1, user: 'Arjun K', coins: 500, upiId: 'arjun@upi', status: 'pending', createdAt: new Date() },
//             //     { id: 2, user: 'Priya S', coins: 250, upiId: 'priya@ybl', status: 'success', createdAt: new Date(Date.now() - 86400000) },
//             //     { id: 3, user: 'Rahul M', coins: 800, upiId: 'rahul@okicici', status: 'pending', createdAt: new Date(Date.now() - 3600000) },
//             //     { id: 4, user: 'Sneha R', coins: 150, upiId: 'sneha@paytm', status: 'failed', createdAt: new Date(Date.now() - 172800000) },
//             // ]);
//         }
//     };

//     useEffect(() => { fetchWithdrawals(); }, []);

//     const handleApprove = async (id) => {
//         try {
//             await api.put(`/withdrawal/${id}/approvereject`, { status: "success" });
//             fetchWithdrawals();
//         } catch (e) {
//             console.log(e);
//             // Mock update
//             // setWithdrawals(w => w.map(x => x.id === id ? { ...x, status: 'success' } : x));
//         }
//     };

//     const handleReject = async (id) => {
//         try {
//             await api.put(`/withdrawal/${id}/approvereject`, { status: "failed" });
//             fetchWithdrawals();
//         } catch (e) {
//             console.log(e);
//             // setWithdrawals(w => w.map(x => x.id === id ? { ...x, status: 'failed' } : x));
//         }
//     };

//     const filtered = filter === 'all' ? withdrawals : withdrawals.filter(w => w.status === filter);

//     return (
//         <div>
//             {/* Title */}
//             <div style={{ marginBottom: 24 }}>
//                 <h1 style={{ fontFamily: 'Cinzel Decorative,serif', fontSize: 18, color: '#F0C96A', letterSpacing: 4 }}>WITHDRAWAL REQUESTS</h1>
//                 <div style={{ height: 1, background: 'linear-gradient(90deg,#D4A84750,transparent)', marginTop: 10 }} />
//             </div>

//             {/* Filter tabs */}
//             <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
//                 {['all', 'pending', 'success', 'failed'].map(f => (
//                     <button key={f} onClick={() => setFilter(f)} style={{
//                         padding: '7px 16px', borderRadius: 8,
//                         background: filter === f ? '#D4A84720' : 'transparent',
//                         border: `1px solid ${filter === f ? '#D4A84760' : '#D4A84730'}`,
//                         color: filter === f ? '#F0C96A' : '#D4A84760',
//                         fontFamily: 'Cinzel,serif', fontSize: 10, letterSpacing: 2,
//                         cursor: 'pointer', textTransform: 'uppercase',
//                         transition: 'all 0.2s',
//                     }}>{f}</button>
//                 ))}
//                 <div style={{ marginLeft: 'auto', fontFamily: 'Cinzel,serif', fontSize: 11, color: '#D4A84760', alignSelf: 'center', letterSpacing: 2 }}>
//                     {filtered.length} RECORDS
//                 </div>
//             </div>

//             {/* Table */}
//             <div style={{
//                 background: 'linear-gradient(145deg,#0D0A06,#0A0805)',
//                 border: '1px solid #D4A84730', borderRadius: 14,
//                 overflow: 'hidden', position: 'relative',
//             }}>
//                 <OrnateCorner style={{ position: 'absolute', top: 6, left: 6 }} />
//                 <OrnateCorner style={{ position: 'absolute', top: 6, right: 6, transform: 'scaleX(-1)' }} />

//                 <div style={{ overflowX: 'auto' }}>
//                     <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//                         <thead>
//                             <tr style={{ borderBottom: '1px solid #D4A84730' }}>
//                                 {['User', 'UPI ID', 'Coins', 'Date', 'Status', 'Actions'].map(h => (
//                                     <th key={h} style={{
//                                         padding: '14px 18px', textAlign: 'left',
//                                         fontFamily: 'Cinzel,serif', fontSize: 10, letterSpacing: 2,
//                                         color: '#D4A84780', fontWeight: 600,
//                                     }}>{h}</th>
//                                 ))}
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {filtered.length === 0 ? (
//                                 <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#D4A84750', fontFamily: 'Cinzel,serif', fontSize: 12, letterSpacing: 2 }}>NO RECORDS FOUND</td></tr>
//                             ) : filtered.map((w, i) => (
//                                 <tr key={w.id} style={{ borderBottom: '1px solid #D4A84715', background: i % 2 === 0 ? 'transparent' : '#D4A8470A', transition: 'background 0.2s' }}>
//                                     <td style={{ padding: '13px 18px', fontFamily: 'Cinzel,serif', fontSize: 12, color: '#E8C85A' }}>{w.user}</td>
//                                     <td style={{ padding: '13px 18px', fontSize: 13, color: '#D4A84790', fontFamily: 'IM Fell English,serif' }}>{w.upiId}</td>
//                                     <td style={{ padding: '13px 18px', fontFamily: 'Cinzel,serif', fontWeight: 700, fontSize: 15, color: '#F0C96A' }}>🪙 {w.coins}</td>
//                                     <td style={{ padding: '13px 18px', fontSize: 12, color: '#D4A84770', whiteSpace: 'nowrap' }}>{fmt(w.createdAt)}</td>
//                                     <td style={{ padding: '13px 18px' }}>
//                                         <span style={{
//                                             padding: '4px 12px', borderRadius: 20, fontSize: 10, fontFamily: 'Cinzel,serif', letterSpacing: 1,
//                                             background: statusColor(w.status) + '18',
//                                             border: `1px solid ${statusColor(w.status)}40`,
//                                             color: statusColor(w.status),
//                                         }}>{w.status}</span>
//                                     </td>
//                                     <td style={{ padding: '13px 18px' }}>
//                                         {w.status === 'pending' && (
//                                             <div style={{ display: 'flex', gap: 8 }}>
//                                                 <button onClick={() => handleApprove(w.id)} style={{
//                                                     padding: '6px 14px', borderRadius: 7, border: '1px solid #22c55e50',
//                                                     background: '#22c55e15', color: '#22c55e', cursor: 'pointer',
//                                                     fontFamily: 'Cinzel,serif', fontSize: 10, letterSpacing: 1,
//                                                     transition: 'all 0.2s',
//                                                 }}>✓ APPROVE</button>
//                                                 <button onClick={() => handleReject(w.id)} style={{
//                                                     padding: '6px 14px', borderRadius: 7, border: '1px solid #ef444450',
//                                                     background: '#ef444415', color: '#ef4444', cursor: 'pointer',
//                                                     fontFamily: 'Cinzel,serif', fontSize: 10, letterSpacing: 1,
//                                                     transition: 'all 0.2s',
//                                                 }}>✕ REJECT</button>
//                                             </div>
//                                         )}
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>
//     );
// }


// src/components/admin/AdminWithdrawals.jsx

import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const statusColor = s => ({ success: '#22c55e', pending: '#facc15', failed: '#ef4444' }[s] || '#D4A847');
const fmt = n => new Date(n).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });

const OrnateCorner = ({ style }) => (
    <svg width="22" height="22" viewBox="0 0 28 28" fill="none" style={style}>
        <path d="M2 2 L2 14 M2 2 L14 2" stroke="#D4A84750" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="2" cy="2" r="2" fill="#D4A84770" />
    </svg>
);

export default function AdminWithdrawals() {
    const [withdrawals, setWithdrawals] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(false);

    const fetchWithdrawals = async (status = 'all') => {
        setLoading(true);
        try {
            // If status is 'all', we don't send the param (or send 'all' and backend handles)
            const url = status === 'all' ? '/withdrawal' : `/withdrawal?status=${status}`;
            const res = await api.get(url);
            setWithdrawals(res?.data?.data || []);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdrawals(filter);
    }, [filter]); // fetch when filter changes

    const handleApprove = async (id) => {
        try {
            await api.put(`/withdrawal/${id}/approvereject`, { status: "success" });
            fetchWithdrawals(filter); // refresh current filter after action
        } catch (e) {
            console.log(e);
        }
    };

    const handleReject = async (id) => {
        try {
            await api.put(`/withdrawal/${id}/approvereject`, { status: "failed" });
            fetchWithdrawals(filter);
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontFamily: 'Cinzel Decorative,serif', fontSize: 18, color: '#F0C96A', letterSpacing: 4 }}>WITHDRAWAL REQUESTS</h1>
                <div style={{ height: 1, background: 'linear-gradient(90deg,#D4A84750,transparent)', marginTop: 10 }} />
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {['all', 'pending', 'success', 'failed'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                        padding: '7px 16px', borderRadius: 8,
                        background: filter === f ? '#D4A84720' : 'transparent',
                        border: `1px solid ${filter === f ? '#D4A84760' : '#D4A84730'}`,
                        color: filter === f ? '#F0C96A' : '#D4A84760',
                        fontFamily: 'Cinzel,serif', fontSize: 10, letterSpacing: 2,
                        cursor: 'pointer', textTransform: 'uppercase',
                        transition: 'all 0.2s',
                    }}>{f}</button>
                ))}
                <div style={{ marginLeft: 'auto', fontFamily: 'Cinzel,serif', fontSize: 11, color: '#D4A84760', alignSelf: 'center', letterSpacing: 2 }}>
                    {loading ? 'LOADING...' : `${withdrawals.length} RECORDS`}
                </div>
            </div>

            {/* Table */}
            <div style={{
                background: 'linear-gradient(145deg,#0D0A06,#0A0805)',
                border: '1px solid #D4A84730', borderRadius: 14,
                overflow: 'hidden', position: 'relative',
            }}>
                <OrnateCorner style={{ position: 'absolute', top: 6, left: 6 }} />
                <OrnateCorner style={{ position: 'absolute', top: 6, right: 6, transform: 'scaleX(-1)' }} />

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #D4A84730' }}>
                                {['User', 'UPI ID', 'Coins', 'Date', 'Status', 'Actions'].map(h => (
                                    <th key={h} style={{
                                        padding: '14px 18px', textAlign: 'left',
                                        fontFamily: 'Cinzel,serif', fontSize: 10, letterSpacing: 2,
                                        color: '#D4A84780', fontWeight: 600,
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {withdrawals.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#D4A84750', fontFamily: 'Cinzel,serif', fontSize: 12, letterSpacing: 2 }}>NO RECORDS FOUND</td></tr>
                            ) : (
                                withdrawals.map((w, i) => (
                                    <tr key={w.id} style={{ borderBottom: '1px solid #D4A84715', background: i % 2 === 0 ? 'transparent' : '#D4A8470A' }}>
                                        <td style={{ padding: '13px 18px', fontFamily: 'Cinzel,serif', fontSize: 12, color: '#E8C85A' }}>{w.user}</td>
                                        <td style={{ padding: '13px 18px', fontSize: 13, color: '#D4A84790', fontFamily: 'IM Fell English,serif' }}>{w.upiId}</td>
                                        <td style={{ padding: '13px 18px', fontFamily: 'Cinzel,serif', fontWeight: 700, fontSize: 15, color: '#F0C96A' }}>🪙 {w.coins}</td>
                                        <td style={{ padding: '13px 18px', fontSize: 12, color: '#D4A84770', whiteSpace: 'nowrap' }}>{fmt(w.createdAt)}</td>
                                        <td style={{ padding: '13px 18px' }}>
                                            <span style={{
                                                padding: '4px 12px', borderRadius: 20, fontSize: 10, fontFamily: 'Cinzel,serif', letterSpacing: 1,
                                                background: statusColor(w.status) + '18',
                                                border: `1px solid ${statusColor(w.status)}40`,
                                                color: statusColor(w.status),
                                            }}>{w.status}</span>
                                        </td>
                                        <td style={{ padding: '13px 18px' }}>
                                            {w.status === 'pending' && (
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <button onClick={() => handleApprove(w.id)} style={{
                                                        padding: '6px 14px', borderRadius: 7, border: '1px solid #22c55e50',
                                                        background: '#22c55e15', color: '#22c55e', cursor: 'pointer',
                                                        fontFamily: 'Cinzel,serif', fontSize: 10, letterSpacing: 1,
                                                        transition: 'all 0.2s',
                                                    }}>✓ APPROVE</button>
                                                    <button onClick={() => handleReject(w.id)} style={{
                                                        padding: '6px 14px', borderRadius: 7, border: '1px solid #ef444450',
                                                        background: '#ef444415', color: '#ef4444', cursor: 'pointer',
                                                        fontFamily: 'Cinzel,serif', fontSize: 10, letterSpacing: 1,
                                                        transition: 'all 0.2s',
                                                    }}>✕ REJECT</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}