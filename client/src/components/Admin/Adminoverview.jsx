// src/components/admin/AdminOverview.jsx
import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const card = {
    background: 'linear-gradient(145deg, #0D0A06, #0A0805)',
    border: '1px solid #D4A84730',
    borderRadius: 14,
    padding: '24px 28px',
    position: 'relative',
    overflow: 'hidden',
};

const OrnateCorner = ({ style }) => (
    <svg width="22" height="22" viewBox="0 0 28 28" fill="none" style={style}>
        <path d="M2 2 L2 14 M2 2 L14 2" stroke="#D4A84750" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="2" cy="2" r="2" fill="#D4A84770" />
    </svg>
);

const StatCard = ({ icon, label, value, color, sub }) => (
    <div style={{ ...card }}>
        <OrnateCorner style={{ position: 'absolute', top: 6, left: 6 }} />
        <OrnateCorner style={{ position: 'absolute', top: 6, right: 6, transform: 'scaleX(-1)' }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
                <div style={{ fontFamily: 'Cinzel,serif', fontSize: 10, letterSpacing: 3, color: '#D4A84780', marginBottom: 10 }}>{label}</div>
                <div style={{ fontFamily: 'Cinzel,serif', fontSize: 30, fontWeight: 900, color: color || '#F0C96A', textShadow: `0 0 20px ${color || '#D4A847'}60` }}>{value}</div>
                {sub && <div style={{ fontSize: 12, color: '#D4A84760', marginTop: 6 }}>{sub}</div>}
            </div>
            <div style={{ fontSize: 32, opacity: 0.8 }}>{icon}</div>
        </div>
    </div>
);

export default function AdminOverview() {
    const [stats, setStats] = useState({ totalUsers: 0, totalCoins: 0, totalPendingWithdrawalAmount: 0, totalRevenue: 0 });

    // Replace with your real API
    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get('/stats');
                console.log(res);

                setStats(res?.data?.data);

                // Mock data — apni API se replace karo
                // setStats({ totalUsers: 142, totalCoins: 84500, pendingWithdrawals: 7, totalRevenue: 24800 });
            } catch (e) { console.log(e); }
        };
        fetch();
    }, []);

    return (
        <div>
            {/* Page title */}
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: 'Cinzel Decorative,serif', fontSize: 18, color: '#F0C96A', letterSpacing: 4 }}>COMMAND OVERVIEW</h1>
                <div style={{ height: 1, background: 'linear-gradient(90deg,#D4A84750,transparent)', marginTop: 10 }} />
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
                <StatCard icon="👥" label="TOTAL USERS" value={stats.totalUsers} color="#60a5fa" sub="Registered players" />
                <StatCard icon="🪙" label="COINS IN CIRCULATION" value={stats.totalCoins.toLocaleString('en-IN')} color="#F0C96A" sub="Active balance" />
                <StatCard icon="⏳" label="PENDING WITHDRAWALS" value={stats.totalPendingWithdrawalAmount} color="#facc15" sub="Awaiting approval" />
                <StatCard icon="💰" label="TOTAL REVENUE" value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`} color="#22c55e" sub="All time deposits" />
            </div>

            {/* Quick links */}
            <div style={{ ...card }}>
                <OrnateCorner style={{ position: 'absolute', top: 6, left: 6 }} />
                <OrnateCorner style={{ position: 'absolute', top: 6, right: 6, transform: 'scaleX(-1)' }} />
                <div style={{ fontFamily: 'Cinzel,serif', fontSize: 11, letterSpacing: 3, color: '#D4A84780', marginBottom: 16 }}>QUICK ACTIONS</div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {[
                        { label: 'Manage Packages', icon: '♦', path: '/admin-dashboard/packages' },
                        { label: 'Review Withdrawals', icon: '💸', path: '/admin-dashboard/withdrawals' },
                        { label: 'View Users', icon: '♟', path: '/admin-dashboard/users' },
                    ].map(q => (
                        <a key={q.path} href={q.path} style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '10px 18px', borderRadius: 8,
                            background: '#D4A84712', border: '1px solid #D4A84730',
                            color: '#E8C85A', textDecoration: 'none',
                            fontFamily: 'Cinzel,serif', fontSize: 11, letterSpacing: 2,
                            transition: 'all 0.2s',
                        }}>
                            {q.icon} {q.label}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}