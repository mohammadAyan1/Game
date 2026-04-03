import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react'

import { useNavigate } from 'react-router-dom'
import api from '../utils/api.js'

function InputField({ label, type = 'text', placeholder, icon: Icon, value, onChange, error, children }) {
    const [show, setShow] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword ? (show ? 'text' : 'password') : type

    return (
        <div className="flex flex-col gap-2">
            <label style={{ fontSize: '9px', letterSpacing: '3px', color: '#D4A84770', fontFamily: "'Space Mono',monospace" }}>
                {label}
            </label>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Icon size={14} color={error ? '#ef4444' : '#D4A84750'} />
                </div>
                <input
                    type={inputType}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="gold-input"
                    style={{
                        paddingLeft: '42px',
                        paddingRight: isPassword ? '44px' : '16px',
                        borderColor: error ? '#ef444440' : undefined,
                        boxShadow: error ? '0 0 0 3px #ef44441A' : undefined,
                    }}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShow(!show)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer"
                        style={{ color: '#D4A84750' }}
                    >
                        {show ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                )}
            </div>
            {children}
            {error && (
                <span style={{ fontSize: '10px', color: '#ef4444', letterSpacing: '1px' }}>{error}</span>
            )}
        </div>
    )
}

// ── Password strength indicator ───────────────────────────────────────────────
function PasswordStrength({ password }) {
    if (!password) return null
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++

    const labels = ['', 'WEAK', 'FAIR', 'STRONG', 'VERY STRONG']
    const colors = ['', '#ef4444', '#f97316', '#D4A847', '#22c55e']

    return (
        <div className="flex flex-col gap-1.5 mt-2">
            <div className="flex gap-1.5">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300" style={{
                        background: i <= strength ? colors[strength] : '#D4A84718',
                        boxShadow: i <= strength ? `0 0 6px ${colors[strength]}60` : 'none',
                    }} />
                ))}
            </div>
            <span style={{ fontSize: '9px', letterSpacing: '2px', color: colors[strength] }}>
                {labels[strength]}
            </span>
        </div>
    )
}

function OrnamentalLine() {
    return (
        <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,transparent,#D4A84330)' }} />
            <svg width="14" height="14" viewBox="0 0 14 14">
                <polygon points="7,1 13,7 7,13 1,7" fill="#D4A84720" stroke="#D4A847" strokeWidth="0.75" />
            </svg>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,#D4A84330,transparent)' }} />
        </div>
    )
}

// ── Register Component ────────────────────────────────────────────────────────
export default function Register() {
    const [form, setForm] = useState({
        username: '', email: '', phone: '', password: '', confirm: '', agree: false,
    })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)


    const navigate = useNavigate()

    const update = (field) => (e) =>
        setForm(f => ({ ...f, [field]: field === 'agree' ? e.target.checked : e.target.value }))

    const validate = () => {
        const e = {}
        if (!form.username || form.username.length < 3)
            e.username = 'Minimum 3 characters'
        if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
            e.email = 'Valid email required'
        if (form.phone && !/^\d{10}$/.test(form.phone.replace(/\s/g, '')))
            e.phone = 'Enter valid 10-digit number'
        if (!form.password || form.password.length < 6)
            e.password = 'Minimum 6 characters'
        if (form.password !== form.confirm)
            e.confirm = 'Passwords do not match'
        if (!form.agree)
            e.agree = 'You must accept the terms'
        return e
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length) { setErrors(errs); return }

        console.log('====================================');
        console.log(form);
        console.log('====================================');


        const res = await api.post("/auth/register", form)

        if (!res?.data?.success) return
        console.log('====================================');
        console.log(res);
        console.log('====================================');

        setErrors({})
        setLoading(true)
        setTimeout(() => { setLoading(false); setSubmitted(true) }, 1800)
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center p-6 py-12 relative overflow-hidden"
            style={{ background: '#070604', fontFamily: "'Space Mono',monospace" }}
        >
            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 55% 60% at 50% 50%,#D4A84712 0%,transparent 70%)' }} />
            <div className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(#D4A84706 1px,transparent 1px),linear-gradient(90deg,#D4A84706 1px,transparent 1px)',
                    backgroundSize: '44px 44px',
                }} />

            {/* Rotating diamond bg */}
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none opacity-[0.035]"
                style={{ animation: 'rotateDiamond 35s linear infinite reverse' }}>
                <svg width="800" height="800" viewBox="0 0 800 800">
                    <polygon points="400,10 790,400 400,790 10,400" fill="none" stroke="#D4A847" strokeWidth="1" />
                    <polygon points="400,90 710,400 400,710 90,400" fill="none" stroke="#D4A847" strokeWidth="0.5" />
                    <polygon points="400,170 630,400 400,630 170,400" fill="none" stroke="#D4A847" strokeWidth="0.35" />
                </svg>
            </div>

            {/* Top shimmer */}
            <div className="fixed top-0 left-0 right-0 h-px z-50 pointer-events-none"
                style={{ background: 'linear-gradient(90deg,transparent 5%,#8B6914 30%,#D4A847 50%,#8B6914 70%,transparent 95%)' }} />

            {/* ── Card ── */}
            <div
                className="relative z-10 w-full max-w-md float-up"
                style={{
                    borderRadius: '20px',
                    border: '1px solid #D4A84728',
                    background: 'linear-gradient(160deg,#0E0B08 0%,#090705 100%)',
                    boxShadow: '0 0 0 1px #D4A84712 inset, 0 50px 120px #00000095, 0 0 60px #D4A8470D',
                    overflow: 'hidden',
                }}
            >
                {/* Top accent */}
                <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                    style={{ background: 'linear-gradient(90deg,transparent 5%,#8B6914 25%,#D4A847 50%,#8B6914 75%,transparent 95%)' }} />

                {/* Corner ornaments */}
                {[{ top: '14px', left: '14px' }, { top: '14px', right: '14px' }].map((pos, i) => (
                    <svg key={i} width="18" height="18" viewBox="0 0 18 18"
                        className="absolute pointer-events-none" style={{ ...pos, opacity: 0.45 }}>
                        <path d="M1 9L9 1L17 9" fill="none" stroke="#D4A847" strokeWidth="0.8" />
                        <path d="M4 9L9 4L14 9" fill="none" stroke="#D4A847" strokeWidth="0.5" opacity="0.5" />
                    </svg>
                ))}

                <div className="px-10 py-10">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-8 float-up float-up-1">
                        <svg width="52" height="52" viewBox="0 0 52 52" className="mb-5"
                            style={{ animation: 'pulseGold 3s ease-in-out infinite' }}>
                            <polygon points="26,2 50,26 26,50 2,26"
                                fill="none" stroke="#D4A847" strokeWidth="1.5" />
                            <polygon points="26,10 42,26 26,42 10,26"
                                fill="#D4A84718" stroke="#D4A847" strokeWidth="0.75" />
                            <text x="26" y="31" textAnchor="middle"
                                fontSize="13" fontWeight="700" fill="#D4A847"
                                fontFamily="'Cinzel',serif">GP</text>
                        </svg>
                        <h1 className="font-cinzel shimmer-text"
                            style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '5px' }}>
                            CREATE ACCOUNT
                        </h1>
                        <p style={{ fontSize: '10px', color: '#D4A84760', letterSpacing: '3px', marginTop: '6px' }}>
                            JOIN THE ELITE CIRCLE
                        </p>
                    </div>

                    {/* ── Bonus badge ── */}
                    <div
                        className="flex items-center gap-3 rounded-xl px-4 py-3 mb-6 float-up float-up-1"
                        style={{
                            background: '#D4A84710',
                            border: '1px solid #D4A84728',
                            animation: 'pulseGold 3s ease-in-out infinite',
                        }}
                    >
                        <span style={{ fontSize: '18px' }}>✦</span>
                        <div>
                            <div className="font-cinzel" style={{ fontSize: '12px', color: '#F0C96A', letterSpacing: '2px' }}>
                                ₹500 WELCOME BONUS
                            </div>
                            <div style={{ fontSize: '9px', color: '#D4A84770', letterSpacing: '1.5px', marginTop: '2px' }}>
                                Credited on first deposit
                            </div>
                        </div>
                    </div>

                    {/* Success state */}
                    {submitted ? (
                        <div className="text-center py-8 float-up">
                            <div className="text-4xl mb-4">✦</div>
                            <h3 className="font-cinzel mb-2" style={{ fontSize: '16px', color: '#D4A847', letterSpacing: '3px' }}>
                                ACCOUNT CREATED!
                            </h3>
                            <p style={{ fontSize: '11px', color: '#D4A84770', letterSpacing: '1px' }}>
                                Welcome to GamePlay Premium.
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="gold-btn mt-8"
                                style={{ fontSize: '10px', letterSpacing: '3px' }}
                            >
                                SIGN IN NOW
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                            {/* Username */}
                            <div className="float-up float-up-2">
                                <InputField label="USERNAME" placeholder="your_handle" icon={User}
                                    value={form.username} onChange={update('username')} error={errors.username} />
                            </div>

                            {/* Email */}
                            <div className="float-up float-up-2">
                                <InputField label="EMAIL ADDRESS" type="email" placeholder="you@example.com" icon={Mail}
                                    value={form.email} onChange={update('email')} error={errors.email} />
                            </div>

                            {/* Phone (optional) */}
                            <div className="float-up float-up-3">
                                <InputField label="PHONE NUMBER (OPTIONAL)" type="tel" placeholder="9876543210" icon={Phone}
                                    value={form.phone} onChange={update('phone')} error={errors.phone} />
                            </div>

                            {/* Password */}
                            <div className="float-up float-up-3">
                                <InputField label="PASSWORD" type="password" placeholder="••••••••" icon={Lock}
                                    value={form.password} onChange={update('password')} error={errors.password}>
                                    <PasswordStrength password={form.password} />
                                </InputField>
                            </div>

                            {/* Confirm Password */}
                            <div className="float-up float-up-4">
                                <InputField label="CONFIRM PASSWORD" type="password" placeholder="••••••••" icon={Lock}
                                    value={form.confirm} onChange={update('confirm')} error={errors.confirm} />
                            </div>

                            {/* Terms checkbox */}
                            <div className="flex items-start gap-3 float-up float-up-4">
                                <button
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, agree: !f.agree }))}
                                    className="flex-shrink-0 mt-0.5 flex items-center justify-center rounded transition-all duration-200"
                                    style={{
                                        width: '18px',
                                        height: '18px',
                                        background: form.agree ? '#D4A84725' : 'transparent',
                                        border: `1px solid ${errors.agree ? '#ef444450' : '#D4A84740'}`,
                                    }}
                                >
                                    {form.agree && (
                                        <svg width="10" height="10" viewBox="0 0 10 10">
                                            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#D4A847" strokeWidth="1.5" fill="none"
                                                strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </button>
                                <div>
                                    <p style={{ fontSize: '10px', color: '#D4A84770', lineHeight: 1.6, letterSpacing: '0.5px' }}>
                                        I agree to the{' '}
                                        <button type="button" className="bg-transparent border-none cursor-pointer"
                                            style={{ color: '#D4A847', fontFamily: "'Space Mono',monospace", fontSize: '10px', fontWeight: 700 }}>
                                            Terms of Service
                                        </button>
                                        {' '}and{' '}
                                        <button type="button" className="bg-transparent border-none cursor-pointer"
                                            style={{ color: '#D4A847', fontFamily: "'Space Mono',monospace", fontSize: '10px', fontWeight: 700 }}>
                                            Privacy Policy
                                        </button>
                                    </p>
                                    {errors.agree && (
                                        <span style={{ fontSize: '10px', color: '#ef4444', letterSpacing: '1px' }}>
                                            {errors.agree}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <OrnamentalLine />

                            {/* Submit */}
                            <div className="float-up float-up-5">
                                <button
                                    type="submit"
                                    className="gold-btn"
                                    disabled={loading}
                                    style={{ opacity: loading ? 0.7 : 1 }}
                                >
                                    {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                                </button>
                            </div>

                            {/* Login link */}
                            <p className="text-center float-up float-up-5"
                                style={{ fontSize: '11px', color: '#D4A84760', letterSpacing: '1px' }}>
                                Already a member?{' '}
                                <button type="button"
                                    onClick={() => navigate('/login')}
                                    className="bg-transparent border-none cursor-pointer font-bold"
                                    style={{ color: '#D4A847', fontFamily: "'Space Mono',monospace", fontSize: '11px' }}>
                                    Sign in
                                </button>
                            </p>

                            {/* Back home */}
                            <button type="button"
                                onClick={() => navigate('/')}
                                className="bg-transparent border-none cursor-pointer text-center"
                                style={{ fontSize: '10px', color: '#D4A84745', letterSpacing: '2px', fontFamily: "'Space Mono',monospace", marginTop: '-4px' }}>
                                ← Back to home
                            </button>
                        </form>
                    )}
                </div>

                {/* Bottom accent */}
                <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
                    style={{ background: 'linear-gradient(90deg,transparent 5%,#8B691440 30%,#D4A84725 50%,#8B691440 70%,transparent 95%)' }} />
            </div>
        </div>
    )
}