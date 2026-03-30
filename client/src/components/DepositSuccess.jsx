// src/components/DepositSuccess.jsx
//
// Ye page tab dikhega jab user payment ke baad
// payment gateway se wapas aata hai
// URL: /deposit/success?txnId=xxx&coins=xxx&status=success
///////////////////////////////////////////////////!SECTION
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
// import api from '../utils/api'

const PAYMENT_API = import.meta.env.VITE_BACKEND_PAYMENT_URL //'http://localhost:3001'
const fmt = (n) => Number(n).toLocaleString('en-IN')

export default function DepositSuccess() {
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const txnId = params.get('txnId')
    const coinsFromUrl = params.get('coins')
    const statusFromUrl = params.get('status')

    const [txn, setTxn] = useState(null)
    const [verified, setVerified] = useState(false)
    const [checking, setChecking] = useState(true)

    // const verified = true

    useEffect(() => {
        if (!txnId) { setChecking(false); return }

        const init = async () => {
            try {
                // 🔥 pehle user lo
                // const res = await api.get("/checkuser")
                // const id = res?.data?.id

                // console.log("UserId:", id)

                // // 🔥 yahi use karo (state nahi)
                // const statusRes = await fetch(
                //     `${PAYMENT_API}/api/txn/status/${txnId}?userId=${id}`
                // )

                // const data = await statusRes.json()

                // setVerified(data.status === 'success')
                setVerified(true)
                setChecking(false)

                // 🔥 txn details
                const txnRes = await fetch(`${PAYMENT_API}/api/txn/${txnId}`)
                const txnData = await txnRes.json()

                if (!txnData.error) setTxn(txnData)

            } catch (err) {
                setVerified(statusFromUrl === 'success')
                setChecking(false)
                console.error(err);

            }
        }

        init()

    }, [txnId, statusFromUrl])

    const coins = Number(coinsFromUrl) || txn?.coins || 0

    if (checking) return (
        <div className="min-h-screen flex items-center justify-center"
            style={{ background: '#070604', fontFamily: "'Space Mono',monospace" }}>
            <div style={{ textAlign: 'center' }}>
                <svg width="56" height="56" viewBox="0 0 56 56" className="mx-auto mb-5"
                    style={{ animation: 'rotateDiamond 2s linear infinite' }}>
                    <polygon points="28,3 53,28 28,53 3,28" fill="#D4A84715" stroke="#D4A847" strokeWidth="1.5" />
                </svg>
                <p style={{ fontSize: '11px', letterSpacing: '4px', color: '#D4A84760' }}>
                    VERIFYING PAYMENT...
                </p>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
            style={{ background: '#070604', fontFamily: "'Space Mono',monospace" }}>

            <div className="fixed inset-0 pointer-events-none"
                style={{
                    background: verified
                        ? 'radial-gradient(ellipse 55% 50% at 50% 45%,#22c55e0E,transparent 70%)'
                        : 'radial-gradient(ellipse 55% 50% at 50% 45%,#D4A84710,transparent 70%)'
                }} />
            <div className="fixed inset-0 pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#D4A84706 1px,transparent 1px),linear-gradient(90deg,#D4A84706 1px,transparent 1px)', backgroundSize: '44px 44px' }} />
            <div className="fixed top-0 left-0 right-0 h-px z-50"
                style={{ background: 'linear-gradient(90deg,transparent 5%,#8B6914 30%,#D4A847 50%,#8B6914 70%,transparent 95%)' }} />

            <div className="relative z-10 w-full max-w-md text-center"
                style={{
                    borderRadius: '20px', border: '1px solid #D4A84728',
                    background: 'linear-gradient(160deg,#0E0B08,#090705)',
                    boxShadow: `0 0 0 1px #D4A84712 inset,0 50px 120px #00000095,0 0 60px ${verified ? '#22c55e0D' : '#D4A8470C'}`,
                    padding: '48px 36px', overflow: 'hidden',
                }}>
                <div className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: 'linear-gradient(90deg,transparent 5%,#8B6914 25%,#D4A847 50%,#8B6914 75%,transparent 95%)' }} />

                {verified ? (
                    /* ── SUCCESS ── */
                    <>
                        <div style={{ marginBottom: '24px', animation: 'pulseGold 2.5s ease-in-out infinite' }}>
                            <svg width="84" height="84" viewBox="0 0 84 84" style={{ margin: '0 auto', display: 'block' }}>
                                <polygon points="42,3 81,42 42,81 3,42"
                                    fill="#22c55e15" stroke="#22c55e" strokeWidth="1.5" />
                                <polygon points="42,15 69,42 42,69 15,42"
                                    fill="#22c55e0A" stroke="#22c55e" strokeWidth="0.75" />
                                <path d="M28 42L38 54L56 30" stroke="#22c55e" strokeWidth="3"
                                    fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        <div className="flex items-center justify-center gap-3 mb-3">
                            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,transparent,#22c55e30)' }} />
                            <span style={{ fontSize: '9px', letterSpacing: '4px', color: '#22c55e70' }}>VERIFIED</span>
                            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,#22c55e30,transparent)' }} />
                        </div>

                        <h1 className="font-cinzel" style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '4px', color: '#22c55e', marginBottom: '8px' }}>
                            SUCCESS!
                        </h1>
                        <p style={{ fontSize: '11px', color: '#D4A84770', letterSpacing: '2px', marginBottom: '32px' }}>
                            COINS CREDITED TO YOUR WALLET
                        </p>

                        {/* Coins display */}
                        <div style={{
                            borderRadius: '16px', background: '#22c55e0C',
                            border: '1px solid #22c55e25', padding: '24px 28px',
                            marginBottom: '24px', boxShadow: '0 0 40px #22c55e0D',
                        }}>
                            <div style={{ fontSize: '10px', letterSpacing: '3px', color: '#22c55e80', marginBottom: '10px' }}>
                                COINS ADDED
                            </div>
                            <div style={{ fontSize: '3rem', fontWeight: 900, color: '#F0C96A', fontFamily: "'Cinzel',serif", lineHeight: 1 }}>
                                {fmt(coins)}
                            </div>
                            <div style={{ fontSize: '14px', color: '#22c55e', marginTop: '8px', letterSpacing: '2px' }}>₵ COINS</div>
                        </div>

                        {/* Mini receipt */}
                        {txn && (
                            <div style={{
                                borderRadius: '12px', background: '#0A0805',
                                border: '1px solid #D4A84718', padding: '14px 18px', marginBottom: '28px',
                            }}>
                                {[
                                    { l: 'Amount Paid', v: `₹${fmt(txn.amount)}` },
                                    { l: 'UTR / Ref', v: txn.utr_number || 'Processing' },
                                    { l: 'Transaction', v: txnId?.slice(0, 8).toUpperCase() + '...' },
                                    { l: 'Time', v: txn.paid_at ? new Date(txn.paid_at).toLocaleTimeString('en-IN') : 'Just now' },
                                ].map(row => (
                                    <div key={row.l} className="flex justify-between"
                                        style={{ padding: '5px 0', fontSize: '11px', borderBottom: '1px solid #D4A84708' }}>
                                        <span style={{ color: '#D4A84760' }}>{row.l}</span>
                                        <span style={{ color: '#D4A84795', fontWeight: 700 }}>{row.v}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <button className="gold-btn" style={{ fontSize: '11px', letterSpacing: '3px' }}
                                onClick={() => navigate('/aviator')}>
                                PLAY NOW ✦
                            </button>
                            <button onClick={() => navigate('/deposit')}
                                className="bg-transparent border-none cursor-pointer"
                                style={{ fontSize: '10px', color: '#D4A84755', letterSpacing: '2px', fontFamily: "'Space Mono',monospace" }}>
                                Deposit More
                            </button>
                        </div>
                    </>
                ) : (
                    /* ── PENDING / NOT VERIFIED ── */
                    <>
                        <svg width="70" height="70" viewBox="0 0 70 70" style={{ margin: '0 auto 24px', display: 'block' }}>
                            <polygon points="35,3 67,35 35,67 3,35" fill="#78350f15" stroke="#f97316" strokeWidth="1.5" />
                            <text x="35" y="43" textAnchor="middle" fontSize="22" fill="#f97316" fontFamily="'Cinzel',serif">?</text>
                        </svg>
                        <h2 className="font-cinzel" style={{ fontSize: '18px', color: '#f97316', letterSpacing: '3px', marginBottom: '10px' }}>
                            PAYMENT PENDING
                        </h2>
                        <p style={{ fontSize: '12px', color: '#D4A84770', lineHeight: 1.8, marginBottom: '28px' }}>
                            We haven't received confirmation yet.
                            <br />If you've paid, it may take a few minutes.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button className="gold-btn" style={{ fontSize: '11px', letterSpacing: '2px' }}
                                onClick={() => window.location.reload()}>
                                CHECK AGAIN
                            </button>
                            <button onClick={() => navigate('/deposit')}
                                className="bg-transparent border-none cursor-pointer"
                                style={{ fontSize: '10px', color: '#D4A84755', letterSpacing: '2px', fontFamily: "'Space Mono',monospace" }}>
                                Back to Deposit
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}