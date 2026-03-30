// src/components/admin/AdminUsers.jsx
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const OrnateCorner = ({ style }) => (
    <svg width="22" height="22" viewBox="0 0 28 28" fill="none" style={style}>
        <path d="M2 2 L2 14 M2 2 L14 2" stroke="#D4A84750" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="2" cy="2" r="2" fill="#D4A84770" />
    </svg>
);

const txTypeConfig = {
    topup: { label: 'Top-Up', color: '#4ade80', bg: '#4ade8015', icon: '⬆️' },
    withdrawal: { label: 'Withdrawal', color: '#f87171', bg: '#f8717115', icon: '⬇️' },
    profit: { label: 'Profit', color: '#F0C96A', bg: '#F0C96A15', icon: '📈' },
    loss: { label: 'Loss', color: '#fb923c', bg: '#fb923c15', icon: '📉' },
};

const statusConfig = {
    success: { color: '#4ade80', label: 'Success' },
    pending: { color: '#facc15', label: 'Pending' },
    failed: { color: '#f87171', label: 'Failed' },
};

const fmt = d => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
const fmtFull = d => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState(null); // user id

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/user/getAllUser');
                setUsers(res?.data?.data || []);
            } catch (e) {
                console.error(e);
            }
        };
        load();
    }, []);

    const filtered = users.filter(u =>
        u.Username?.toLowerCase().includes(search.toLowerCase()) ||
        u.Phone?.includes(search)
    );

    const toggleExpand = id => setExpanded(prev => (prev === id ? null : id));

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontFamily: 'Cinzel Decorative,serif', fontSize: 18, color: '#F0C96A', letterSpacing: 4 }}>
                    USER REGISTRY
                </h1>
                <div style={{ height: 1, background: 'linear-gradient(90deg,#D4A84750,transparent)', marginTop: 10 }} />
            </div>

            {/* Search */}
            <div style={{ marginBottom: 20 }}>
                <input
                    type="text"
                    placeholder="Search by name or phone..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        width: '100%', maxWidth: 380,
                        padding: '10px 16px',
                        background: '#07060480', border: '1px solid #D4A84730', borderRadius: 8,
                        color: '#E8C85A', fontFamily: 'IM Fell English,serif', fontSize: 14,
                        outline: 'none',
                    }}
                />
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
                                {['', 'Name', 'Phone', 'Total Coins', 'Profit', 'Loss', 'Withdrawn', 'Role'].map(h => (
                                    <th key={h} style={{
                                        padding: '14px 18px', textAlign: 'left',
                                        fontFamily: 'Cinzel,serif', fontSize: 10,
                                        letterSpacing: 2, color: '#D4A84780', fontWeight: 600,
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((u, i) => (
                                <React.Fragment key={u.id}>
                                    {/* User Row */}
                                    <tr
                                        onClick={() => toggleExpand(u.id)}
                                        style={{
                                            borderBottom: expanded === u.id ? 'none' : '1px solid #D4A84715',
                                            background: i % 2 === 0 ? 'transparent' : '#D4A8470A',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#D4A84715'}
                                        onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : '#D4A8470A'}
                                    >
                                        {/* Expand toggle */}
                                        <td style={{ padding: '13px 12px 13px 18px', color: '#D4A84780', fontSize: 12 }}>
                                            {expanded === u.id ? '▾' : '▸'}
                                        </td>

                                        {/* Name */}
                                        <td style={{ padding: '13px 18px', fontFamily: 'Cinzel,serif', fontSize: 12, color: '#E8C85A', whiteSpace: 'nowrap' }}>
                                            <span style={{ marginRight: 8 }}>{u.Role === 'Admin' ? '👑' : '♟'}</span>
                                            {u.Username}
                                        </td>

                                        {/* Phone */}
                                        <td style={{ padding: '13px 18px', fontFamily: 'Cinzel,serif', fontSize: 12, color: '#D4A84790' }}>
                                            {u.Phone}
                                        </td>

                                        {/* Total Coins */}
                                        <td style={{ padding: '13px 18px', fontFamily: 'Cinzel,serif', fontWeight: 700, color: '#F0C96A', whiteSpace: 'nowrap' }}>
                                            🪙 {Number(u.totalCoins).toLocaleString('en-IN')}
                                        </td>

                                        {/* Profit */}
                                        <td style={{ padding: '13px 18px', fontFamily: 'Cinzel,serif', fontSize: 12, color: '#4ade80', whiteSpace: 'nowrap' }}>
                                            +{Number(u.totalProfit).toLocaleString('en-IN')}
                                        </td>

                                        {/* Loss */}
                                        <td style={{ padding: '13px 18px', fontFamily: 'Cinzel,serif', fontSize: 12, color: '#f87171', whiteSpace: 'nowrap' }}>
                                            -{Number(u.totalLoss).toLocaleString('en-IN')}
                                        </td>

                                        {/* Withdrawn */}
                                        <td style={{ padding: '13px 18px', fontFamily: 'Cinzel,serif', fontSize: 12, color: '#fb923c', whiteSpace: 'nowrap' }}>
                                            {Number(u.totalWithdrawal).toLocaleString('en-IN')}
                                        </td>

                                        {/* Role */}
                                        <td style={{ padding: '13px 18px' }}>
                                            <span style={{
                                                padding: '3px 10px', borderRadius: 20,
                                                background: u.Role === 'Admin' ? '#D4A84720' : '#60a5fa15',
                                                border: `1px solid ${u.Role === 'Admin' ? '#D4A84750' : '#60a5fa40'}`,
                                                color: u.Role === 'Admin' ? '#F0C96A' : '#60a5fa',
                                                fontSize: 10, fontFamily: 'Cinzel,serif', letterSpacing: 1,
                                            }}>{u.Role}</span>
                                        </td>
                                    </tr>

                                    {/* Transactions Expand Panel */}
                                    {expanded === u.id && (
                                        <tr>
                                            <td colSpan={8} style={{ padding: 0, borderBottom: '1px solid #D4A84730' }}>
                                                <div style={{
                                                    background: '#07060480',
                                                    borderTop: '1px solid #D4A84720',
                                                    padding: '16px 24px 20px',
                                                }}>
                                                    <p style={{
                                                        fontFamily: 'Cinzel,serif', fontSize: 10,
                                                        letterSpacing: 3, color: '#D4A84780',
                                                        marginBottom: 14,
                                                    }}>
                                                        TRANSACTION HISTORY — {u.transactions?.length || 0} records
                                                    </p>

                                                    {(!u.transactions || u.transactions.length === 0) ? (
                                                        <p style={{ color: '#D4A84760', fontFamily: 'IM Fell English,serif', fontSize: 13 }}>No transactions found.</p>
                                                    ) : (
                                                        <div style={{ overflowX: 'auto' }}>
                                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                                <thead>
                                                                    <tr style={{ borderBottom: '1px solid #D4A84720' }}>
                                                                        {['Type', 'Coins', 'Amount', 'Game', 'UPI / Bank', 'Status', 'Date'].map(h => (
                                                                            <th key={h} style={{
                                                                                padding: '8px 14px', textAlign: 'left',
                                                                                fontFamily: 'Cinzel,serif', fontSize: 9,
                                                                                letterSpacing: 2, color: '#D4A84760', fontWeight: 600,
                                                                            }}>{h}</th>
                                                                        ))}
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {u.transactions.map(tx => {
                                                                        const tc = txTypeConfig[tx.type] || { label: tx.type, color: '#aaa', bg: '#aaa15', icon: '•' };
                                                                        const sc = statusConfig[tx.status] || { color: '#aaa', label: tx.status };
                                                                        return (
                                                                            <tr key={tx.id} style={{ borderBottom: '1px solid #D4A84710' }}>
                                                                                {/* Type */}
                                                                                <td style={{ padding: '9px 14px', whiteSpace: 'nowrap' }}>
                                                                                    <span style={{
                                                                                        padding: '3px 9px', borderRadius: 20,
                                                                                        background: tc.bg,
                                                                                        border: `1px solid ${tc.color}40`,
                                                                                        color: tc.color,
                                                                                        fontSize: 10, fontFamily: 'Cinzel,serif', letterSpacing: 1,
                                                                                    }}>
                                                                                        {tc.icon} {tc.label}
                                                                                    </span>
                                                                                </td>

                                                                                {/* Coins */}
                                                                                <td style={{ padding: '9px 14px', fontFamily: 'Cinzel,serif', fontSize: 12, color: '#F0C96A', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                                                                    🪙 {tx.coins?.toLocaleString('en-IN') ?? '—'}
                                                                                </td>

                                                                                {/* Amount */}
                                                                                <td style={{ padding: '9px 14px', fontFamily: 'Cinzel,serif', fontSize: 12, color: '#D4A84790', whiteSpace: 'nowrap' }}>
                                                                                    {tx.amount != null ? `₹${tx.amount}` : '—'}
                                                                                </td>

                                                                                {/* Game */}
                                                                                <td style={{ padding: '9px 14px', fontSize: 12, color: '#D4A84790', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                                                                                    {tx.game ?? '—'}
                                                                                </td>

                                                                                {/* UPI / Bank */}
                                                                                <td style={{ padding: '9px 14px', fontSize: 11, color: '#D4A84770', whiteSpace: 'nowrap' }}>
                                                                                    {tx.upi_id ?? (tx.bank_id ? `Bank #${tx.bank_id}` : '—')}
                                                                                </td>

                                                                                {/* Status */}
                                                                                <td style={{ padding: '9px 14px', whiteSpace: 'nowrap' }}>
                                                                                    <span style={{
                                                                                        display: 'inline-block',
                                                                                        width: 7, height: 7, borderRadius: '50%',
                                                                                        background: sc.color,
                                                                                        marginRight: 6,
                                                                                        boxShadow: `0 0 6px ${sc.color}`,
                                                                                    }} />
                                                                                    <span style={{ fontSize: 11, color: sc.color, fontFamily: 'Cinzel,serif' }}>{sc.label}</span>
                                                                                </td>

                                                                                {/* Date */}
                                                                                <td style={{ padding: '9px 14px', fontSize: 11, color: '#D4A84770', whiteSpace: 'nowrap' }}>
                                                                                    {fmtFull(tx.created_at)}
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}

                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={8} style={{ padding: '28px', textAlign: 'center', color: '#D4A84750', fontFamily: 'IM Fell English,serif', fontSize: 14 }}>
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}