// src/components/admin/AdminSettings.jsx
import React, { useState } from 'react';

const card = {
    background: 'linear-gradient(145deg,#0D0A06,#0A0805)',
    border: '1px solid #D4A84730', borderRadius: 14, padding: 28,
    marginBottom: 20, position: 'relative',
};

const inputStyle = {
    width: '100%', padding: '10px 14px', marginBottom: 12,
    background: '#07060480', border: '1px solid #D4A84730', borderRadius: 8,
    color: '#E8C85A', fontFamily: 'IM Fell English,serif', fontSize: 14,
    outline: 'none',
};

const OrnateCorner = ({ style }) => (
    <svg width="22" height="22" viewBox="0 0 28 28" fill="none" style={style}>
        <path d="M2 2 L2 14 M2 2 L14 2" stroke="#D4A84750" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="2" cy="2" r="2" fill="#D4A84770" />
    </svg>
);

const SectionTitle = ({ children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <div style={{ fontFamily: 'Cinzel,serif', fontSize: 11, letterSpacing: 3, color: '#D4A84780' }}>{children}</div>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,#D4A84740,transparent)' }} />
    </div>
);

export default function AdminSettings() {
    const [minWithdraw, setMinWithdraw] = useState('100');
    const [maxWithdraw, setMaxWithdraw] = useState('10000');
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontFamily: 'Cinzel Decorative,serif', fontSize: 18, color: '#F0C96A', letterSpacing: 4 }}>SYSTEM SETTINGS</h1>
                <div style={{ height: 1, background: 'linear-gradient(90deg,#D4A84750,transparent)', marginTop: 10 }} />
            </div>

            {/* Withdrawal limits */}
            <div style={card}>
                <OrnateCorner style={{ position: 'absolute', top: 6, left: 6 }} />
                <OrnateCorner style={{ position: 'absolute', top: 6, right: 6, transform: 'scaleX(-1)' }} />
                <SectionTitle>WITHDRAWAL LIMITS</SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, color: '#D4A84790', marginBottom: 6, fontFamily: 'Cinzel,serif' }}>MIN COINS</label>
                        <input type="number" value={minWithdraw} onChange={e => setMinWithdraw(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, color: '#D4A84790', marginBottom: 6, fontFamily: 'Cinzel,serif' }}>MAX COINS</label>
                        <input type="number" value={maxWithdraw} onChange={e => setMaxWithdraw(e.target.value)} style={inputStyle} />
                    </div>
                </div>
                <button style={{
                    padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(90deg,#C8941F,#F0C96A,#C8941F)',
                    color: '#0A0602', fontFamily: 'Cinzel,serif', fontWeight: 700, fontSize: 11, letterSpacing: 2,
                }}>♛ SAVE LIMITS</button>
            </div>

            {/* Maintenance */}
            <div style={card}>
                <OrnateCorner style={{ position: 'absolute', top: 6, left: 6 }} />
                <OrnateCorner style={{ position: 'absolute', top: 6, right: 6, transform: 'scaleX(-1)' }} />
                <SectionTitle>MAINTENANCE MODE</SectionTitle>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                        width: 52, height: 28, borderRadius: 14, cursor: 'pointer',
                        background: maintenanceMode ? '#ef4444' : '#D4A84730',
                        border: `1px solid ${maintenanceMode ? '#ef444460' : '#D4A84750'}`,
                        position: 'relative', transition: 'all 0.3s',
                    }} onClick={() => setMaintenanceMode(v => !v)}>
                        <div style={{
                            width: 20, height: 20, borderRadius: '50%',
                            background: '#F0C96A',
                            position: 'absolute', top: 3,
                            left: maintenanceMode ? 28 : 4,
                            transition: 'left 0.3s',
                            boxShadow: '0 0 8px #D4A84780',
                        }} />
                    </div>
                    <div>
                        <div style={{ fontFamily: 'Cinzel,serif', fontSize: 12, color: maintenanceMode ? '#ef4444' : '#22c55e', letterSpacing: 2 }}>
                            {maintenanceMode ? '⚠ MAINTENANCE ON' : '✓ SITE LIVE'}
                        </div>
                        <div style={{ fontSize: 12, color: '#D4A84760', marginTop: 3 }}>
                            {maintenanceMode ? 'Users cannot access the site' : 'All systems operational'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}