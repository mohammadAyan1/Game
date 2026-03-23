import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useApp } from '../context/AppContext'
// ── Decorative elements ───────────────────────────────────────────────────────
function OrnamentalLine() {
    return (
        <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,transparent,#D4A84730)' }} />
            <svg width="16" height="16" viewBox="0 0 16 16">
                <polygon points="8,1 15,8 8,15 1,8" fill="#D4A84720" stroke="#D4A847" strokeWidth="0.75" />
            </svg>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,#D4A84730,transparent)' }} />
        </div>
    )
}

function InputField({ label, type, placeholder, icon: Icon, value, onChange, error }) {
    const [show, setShow] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword ? (show ? 'text' : 'password') : type

    return (
        <div className="flex flex-col gap-2">
            <label style={{ fontSize: '9px', letterSpacing: '3px', color: '#D4A84770', fontFamily: "'Space Mono',monospace" }}>
                {label}
            </label>
            <div className="relative">
                {/* Left icon */}
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

                {/* Show/hide toggle */}
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
            {error && (
                <span style={{ fontSize: '10px', color: '#ef4444', letterSpacing: '1px' }}>
                    {error}
                </span>
            )}
        </div>
    )
}

// ── Login Component ───────────────────────────────────────────────────────────
export default function Login() {

    const { fetchCoins, fetchUser } = useApp()

    const navigate = useNavigate()

    const [form, setForm] = useState({ email: '', password: '' })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

    const validate = () => {
        const e = {}
        if (!form.email) e.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address'
        if (!form.password) e.password = 'Password is required'
        else if (form.password.length < 6) e.password = 'Minimum 6 characters'
        return e
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length) { setErrors(errs); return }

        const res = await api.post("/user", form)

        if (!res.data.success) return

        setErrors({})
        setLoading(true)
        fetchCoins()
        fetchUser()
        setTimeout(() => {
            setLoading(false)
            setSubmitted(true)
        }, 1500)
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
            style={{ background: '#070604', fontFamily: "'Space Mono',monospace" }}
        >
            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 55% 55% at 50% 45%,#D4A84712 0%,transparent 70%)' }} />
            <div className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(#D4A84706 1px,transparent 1px),linear-gradient(90deg,#D4A84706 1px,transparent 1px)',
                    backgroundSize: '44px 44px',
                }} />

            {/* Slow rotating diamond bg */}
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]"
                style={{ animation: 'rotateDiamond 30s linear infinite' }}>
                <svg width="700" height="700" viewBox="0 0 700 700">
                    <polygon points="350,10 690,350 350,690 10,350" fill="none" stroke="#D4A847" strokeWidth="1" />
                    <polygon points="350,80 620,350 350,620 80,350" fill="none" stroke="#D4A847" strokeWidth="0.6" />
                    <polygon points="350,150 550,350 350,550 150,350" fill="none" stroke="#D4A847" strokeWidth="0.4" />
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
                {/* Card top shimmer */}
                <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                    style={{ background: 'linear-gradient(90deg,transparent 5%,#8B6914 25%,#D4A847 50%,#8B6914 75%,transparent 95%)' }} />

                {/* Corner ornaments */}
                {[{ top: '14px', left: '14px' }, { top: '14px', right: '14px' }].map((pos, i) => (
                    <svg key={i} width="18" height="18" viewBox="0 0 18 18" className="absolute pointer-events-none"
                        style={{ ...pos, opacity: 0.45 }}>
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
                            style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '6px' }}>
                            WELCOME BACK
                        </h1>
                        <p style={{ fontSize: '10px', color: '#D4A84760', letterSpacing: '3px', marginTop: '6px' }}>
                            SIGN IN TO YOUR ACCOUNT
                        </p>
                    </div>

                    {/* Success state */}
                    {submitted ? (
                        <div className="text-center py-8 float-up">
                            <div className="text-4xl mb-4">✦</div>
                            <h3 className="font-cinzel mb-2" style={{ fontSize: '16px', color: '#D4A847', letterSpacing: '3px' }}>
                                LOGIN SUCCESSFUL
                            </h3>
                            <p style={{ fontSize: '11px', color: '#D4A84770', letterSpacing: '1px' }}>
                                Redirecting to your dashboard...
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="gold-btn mt-8"
                                style={{ fontSize: '10px', letterSpacing: '3px' }}
                            >
                                GO TO HOME
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            <div className="float-up float-up-2">
                                <InputField
                                    label="EMAIL ADDRESS"
                                    type="email"
                                    placeholder="you@example.com"
                                    icon={Mail}
                                    value={form.email}
                                    onChange={update('email')}
                                    error={errors.email}
                                />
                            </div>

                            <div className="float-up float-up-3">
                                <InputField
                                    label="PASSWORD"
                                    type="password"
                                    placeholder="••••••••"
                                    icon={Lock}
                                    value={form.password}
                                    onChange={update('password')}
                                    error={errors.password}
                                />
                            </div>

                            {/* Forgot password */}
                            <div className="flex justify-end float-up float-up-3">
                                <button type="button" className="bg-transparent border-none cursor-pointer"
                                    style={{ fontSize: '10px', color: '#D4A84770', letterSpacing: '1px', fontFamily: "'Space Mono',monospace" }}>
                                    Forgot password?
                                </button>
                            </div>

                            <OrnamentalLine />

                            {/* Submit */}
                            <div className="float-up float-up-4">
                                <button
                                    type="submit"
                                    className="gold-btn"
                                    disabled={loading}
                                    style={{ opacity: loading ? 0.7 : 1 }}
                                >
                                    {loading ? 'SIGNING IN...' : 'SIGN IN'}
                                </button>
                            </div>

                            {/* Register link */}
                            <p className="text-center float-up float-up-5"
                                style={{ fontSize: '11px', color: '#D4A84760', letterSpacing: '1px' }}>
                                New to GamePlay?{' '}
                                <button type="button"
                                    onClick={() => navigate('/register')}
                                    className="bg-transparent border-none cursor-pointer font-bold"
                                    style={{ color: '#D4A847', fontFamily: "'Space Mono',monospace", fontSize: '11px' }}>
                                    Create account
                                </button>
                            </p>

                            {/* Back home */}
                            <button type="button"
                                onClick={() => navigate('/')}
                                className="bg-transparent border-none cursor-pointer text-center"
                                style={{ fontSize: '10px', color: '#D4A84745', letterSpacing: '2px', fontFamily: "'Space Mono',monospace", marginTop: '-4px' }}
                            >
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