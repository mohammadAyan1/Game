// src/components/AdminDashboard.jsx
import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

// ══════════════════════════════════════════════
//  GLOBAL STYLES
// ══════════════════════════════════════════════
const ADMIN_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cinzel+Decorative:wght@400;700&family=IM+Fell+English&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #030201; }
  ::-webkit-scrollbar-thumb { background: #D4A84750; border-radius: 4px; }

  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  @keyframes crownPulse {
    0%,100% { text-shadow: 0 0 10px #F0C96A, 0 0 30px #D4A84760; }
    50%      { text-shadow: 0 0 20px #F0C96A, 0 0 60px #D4A847AA; }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes glowBorder {
    0%,100% { border-color: #D4A84730; }
    50%      { border-color: #D4A84780; }
  }
  @keyframes mobileMenuIn {
    from { opacity: 0; transform: translateY(-8px) scaleY(0.95); }
    to   { opacity: 1; transform: translateY(0) scaleY(1); }
  }

  .admin-nav-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 18px;
    border-radius: 8px;
    color: #D4A84790;
    text-decoration: none;
    font-family: 'Cinzel', serif;
    font-size: 11px;
    letter-spacing: 2px;
    font-weight: 600;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    white-space: nowrap;
    position: relative;
    overflow: hidden;
  }
  .admin-nav-link::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, #fff3, transparent);
    background-size: 600px 100%;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .admin-nav-link:hover {
    color: #E8C85A;
    background: #D4A84712;
    border-color: #D4A84730;
  }
  .admin-nav-link:hover::after {
    opacity: 1;
    animation: shimmer 0.8s linear;
  }
  .admin-nav-link.active {
    color: #F0C96A !important;
    background: linear-gradient(90deg, #D4A84720, #D4A84708) !important;
    border-color: #D4A84760 !important;
    box-shadow: 0 0 12px #D4A84720, inset 0 0 12px #D4A84708;
  }
  .admin-nav-link.active .nav-dot {
    background: #F0C96A;
    box-shadow: 0 0 8px #F0C96A;
  }

  .admin-content {
    animation: fadeIn 0.35s ease both;
  }

  .logout-btn {
    transition: all 0.2s ease;
  }
  .logout-btn:hover {
    background: #ef444420 !important;
    border-color: #ef444460 !important;
    color: #ef4444 !important;
  }

  .mobile-menu {
    animation: mobileMenuIn 0.2s ease both;
  }

  .header-brand {
    animation: crownPulse 3s ease-in-out infinite;
  }
`;

// ══════════════════════════════════════════════
//  NAV ITEMS — apne hisaab se add/remove karo
// ══════════════════════════════════════════════
const NAV_ITEMS = [
    { path: '', label: 'OVERVIEW', icon: '◈', end: true },
    { path: 'packages', label: 'PACKAGES', icon: '♦' },
    { path: 'withdrawals', label: 'WITHDRAWALS', icon: '💸' },
    { path: 'users', label: 'USERS', icon: '♟' },
    { path: 'bank', label: 'BANK DETAILS', icon: '🏦' },  // <-- New tab
    { path: 'settings', label: 'SETTINGS', icon: '⚙' },
];

// ══════════════════════════════════════════════
//  ORNATE DIVIDER
// ══════════════════════════════════════════════
const GoldLine = () => (
    <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #D4A84740, transparent)', margin: '6px 0' }} />
);

// ══════════════════════════════════════════════
//  MAIN LAYOUT
// ══════════════════════════════════════════════
export default function AdminDashboard() {
    const { user, logout } = useApp();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <>
            <style>{ADMIN_CSS}</style>

            <div style={{
                minHeight: '100vh',
                background: '#040302',
                fontFamily: 'IM Fell English, serif',
                backgroundImage: `
          radial-gradient(ellipse 60% 40% at 50% 0%, #1a0f0030 0%, transparent 70%),
          repeating-linear-gradient(0deg, transparent, transparent 39px, #D4A84704 40px),
          repeating-linear-gradient(90deg, transparent, transparent 39px, #D4A84704 40px)
        `,
            }}>

                {/* ══════════════════════════════════════
            HEADER
        ══════════════════════════════════════ */}
                <header style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    background: 'linear-gradient(180deg, #08060380 0%, #04030280 100%)',
                    backdropFilter: 'blur(16px)',
                    borderBottom: '1px solid #D4A84730',
                    animation: 'glowBorder 4s ease-in-out infinite',
                }}>

                    {/* Top gold accent line */}
                    <div style={{ height: 2, background: 'linear-gradient(90deg, transparent 0%, #D4A847 30%, #F0C96A 50%, #D4A847 70%, transparent 100%)' }} />

                    <div style={{
                        maxWidth: 1400,
                        margin: '0 auto',
                        padding: '0 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 32,
                        height: 64,
                    }}>

                        {/* Brand */}
                        <div onClick={() => navigate("/")} style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, cursor: "pointer" }}>
                            <span className="header-brand" style={{ fontSize: 24, lineHeight: 1 }}>♛</span>
                            <div>
                                <div style={{
                                    fontFamily: 'Cinzel Decorative, serif',
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: '#F0C96A',
                                    letterSpacing: 3,
                                    lineHeight: 1,
                                }}>ROYAL</div>
                                <div style={{
                                    fontFamily: 'Cinzel, serif',
                                    fontSize: 9,
                                    color: '#D4A84780',
                                    letterSpacing: 4,
                                    lineHeight: 1.4,
                                }}>ADMIN COURT</div>
                            </div>
                        </div>

                        {/* Separator */}
                        <div style={{ width: 1, height: 32, background: 'linear-gradient(180deg, transparent, #D4A84750, transparent)', flexShrink: 0 }} />

                        {/* ── DESKTOP NAV ── */}
                        <nav style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            flex: 1,
                            overflowX: 'auto',
                            // Hide scrollbar on desktop nav
                            msOverflowStyle: 'none',
                            scrollbarWidth: 'none',
                        }}>
                            {NAV_ITEMS.map(item => (
                                <NavLink
                                    key={item.path}
                                    to={`/admin-dashboard${item.path ? '/' + item.path : ''}`}
                                    end={item.end}
                                    className="admin-nav-link"
                                >
                                    <span className="nav-dot" style={{
                                        width: 5, height: 5, borderRadius: '50%',
                                        background: '#D4A84750',
                                        flexShrink: 0,
                                        transition: 'all 0.2s',
                                    }} />
                                    <span style={{ fontSize: 13 }}>{item.icon}</span>
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>

                        {/* Right side — user info + logout */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                            {/* User badge */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '6px 14px',
                                background: '#D4A84710',
                                border: '1px solid #D4A84730',
                                borderRadius: 8,
                            }}>
                                <span style={{ fontSize: 14 }}>👑</span>
                                <div>
                                    <div style={{ fontFamily: 'Cinzel,serif', fontSize: 10, color: '#F0C96A', letterSpacing: 1 }}>
                                        {user?.name || user?.username || 'Admin'}
                                    </div>
                                    <div style={{ fontFamily: 'Cinzel,serif', fontSize: 8, color: '#D4A84760', letterSpacing: 2 }}>ADMINISTRATOR</div>
                                </div>
                            </div>

                            {/* Logout */}
                            <button
                                className="logout-btn"
                                onClick={handleLogout}
                                style={{
                                    padding: '8px 14px',
                                    background: 'transparent',
                                    border: '1px solid #D4A84740',
                                    borderRadius: 8,
                                    color: '#D4A84780',
                                    fontFamily: 'Cinzel,serif',
                                    fontSize: 10,
                                    letterSpacing: 2,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                }}
                            >
                                ⬡ LOGOUT
                            </button>

                            {/* Mobile hamburger */}
                            <button
                                onClick={() => setMobileOpen(o => !o)}
                                style={{
                                    display: 'none', // shown via media query below
                                    background: 'transparent',
                                    border: '1px solid #D4A84740',
                                    borderRadius: 8,
                                    padding: '8px 10px',
                                    color: '#D4A847',
                                    cursor: 'pointer',
                                    fontSize: 16,
                                    '@media(max-width:768px)': { display: 'flex' },
                                }}
                            >
                                ☰
                            </button>
                        </div>
                    </div>

                    {/* ── MOBILE NAV DROPDOWN ── */}
                    {mobileOpen && (
                        <div className="mobile-menu" style={{
                            borderTop: '1px solid #D4A84720',
                            padding: '12px 20px 16px',
                            background: '#06040280',
                            backdropFilter: 'blur(20px)',
                        }}>
                            <GoldLine />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                                {NAV_ITEMS.map(item => (
                                    <NavLink
                                        key={item.path}
                                        to={`/admin-dashboard${item.path ? '/' + item.path : ''}`}
                                        end={item.end}
                                        className="admin-nav-link"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <span className="nav-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: '#D4A84750', flexShrink: 0 }} />
                                        <span style={{ fontSize: 13 }}>{item.icon}</span>
                                        {item.label}
                                    </NavLink>
                                ))}
                            </div>
                            <GoldLine />
                        </div>
                    )}
                </header>

                {/* ══════════════════════════════════════
            PAGE CONTENT — nested routes yahan render honge
        ══════════════════════════════════════ */}
                <main className="admin-content" style={{ padding: '32px 24px', maxWidth: 1400, margin: '0 auto' }}>
                    <Outlet />
                </main>

            </div>
        </>
    );
}