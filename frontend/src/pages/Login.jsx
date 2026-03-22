import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, Shield } from 'lucide-react';

// SHA-256 of "admin"
const VALID_USER_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';
const VALID_PASS_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        await new Promise(r => setTimeout(r, 600));
        const userHash = await sha256(username.trim().toLowerCase());
        const passHash = await sha256(password);
        if (userHash === VALID_USER_HASH && passHash === VALID_PASS_HASH) {
            sessionStorage.setItem('upe_auth', '1');
            onLogin();
        } else {
            setLoading(false);
            setError('Usuário ou senha inválidos.');
            setShake(true);
            setTimeout(() => setShake(false), 600);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #2D0B5A 0%, #4A1080 30%, #6B1FA0 60%, #3D0870 100%)',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: "'Inter', sans-serif"
        }}>

            {/* Decorative abstract shapes */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                {/* Large circle top-right */}
                <div style={{
                    position: 'absolute', top: '-80px', right: '25%',
                    width: 180, height: 300, borderRadius: '50%',
                    border: '3px solid rgba(180,100,255,0.3)',
                    transform: 'rotate(-20deg)'
                }} />
                {/* Medium loop top-center */}
                <div style={{
                    position: 'absolute', top: '5%', right: '38%',
                    width: 120, height: 200, borderRadius: '50%',
                    border: '3px solid rgba(200,130,255,0.25)',
                    transform: 'rotate(15deg)'
                }} />
                {/* Bottom-left loop */}
                <div style={{
                    position: 'absolute', bottom: '-60px', left: '15%',
                    width: 200, height: 320, borderRadius: '50%',
                    border: '3px solid rgba(160,80,255,0.25)',
                    transform: 'rotate(10deg)'
                }} />
                {/* Bottom-right blob */}
                <div style={{
                    position: 'absolute', bottom: '0%', right: '5%',
                    width: 160, height: 260, borderRadius: '50%',
                    border: '3px solid rgba(180,100,255,0.2)',
                    transform: 'rotate(-30deg)'
                }} />
                {/* Center purple glow */}
                <div style={{
                    position: 'absolute', top: '30%', left: '35%',
                    width: 250, height: 250, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(160,60,255,0.15) 0%, transparent 70%)'
                }} />
                {/* Top-left logo area glow */}
                <div style={{
                    position: 'absolute', top: '-100px', left: '-100px',
                    width: 350, height: 350, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(100,30,200,0.4) 0%, transparent 70%)'
                }} />
            </div>

            {/* Main content: full-screen split */}
            <div style={{
                display: 'flex',
                width: '100%',
                maxWidth: 960,
                minHeight: 480,
                margin: '0 24px',
                borderRadius: 24,
                overflow: 'hidden',
                boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
                position: 'relative',
                zIndex: 1
            }}>

                {/* ── LEFT PANEL ── */}
                <div style={{
                    flex: 1,
                    padding: '44px 48px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: 'rgba(80,20,160,0.15)',
                    backdropFilter: 'blur(4px)'
                }}>
                    {/* Logo mark */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, width: 28, height: 28
                        }}>
                            {[0,1,2,3].map(i => (
                                <div key={i} style={{
                                    background: i === 0 || i === 3 ? 'white' : 'rgba(255,255,255,0.5)',
                                    borderRadius: 2
                                }} />
                            ))}
                        </div>
                    </div>

                    {/* Welcome text */}
                    <div>
                        <h1 style={{
                            fontSize: 52, fontWeight: 800, color: 'white', margin: '0 0 16px',
                            lineHeight: 1.1, letterSpacing: '-1px'
                        }}>
                            Bem-vindo!
                        </h1>
                        <div style={{ width: 36, height: 3, background: 'rgba(255,255,255,0.5)', marginBottom: 20, borderRadius: 2 }} />
                        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13.5, lineHeight: 1.7, maxWidth: 260, margin: '0 0 28px' }}>
                            Sistema integrado de gestão e rastreamento de equipamentos industriais.
                            Faça login para continuar.
                        </p>
                        <button style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: 'linear-gradient(135deg, #FF5F6D 0%, #FFC371 100%)',
                            border: 'none', borderRadius: 24, padding: '10px 22px',
                            color: 'white', fontWeight: 700, fontSize: 13,
                            cursor: 'pointer', boxShadow: '0 6px 20px rgba(255,100,80,0.4)'
                        }}>
                            Saiba mais
                        </button>
                    </div>

                    <div /> {/* spacer */}
                </div>

                {/* ── RIGHT PANEL — Sign In card ── */}
                <div style={{
                    width: 340,
                    padding: '44px 36px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(20px)',
                    borderLeft: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <h2 style={{
                        color: 'white', fontSize: 28, fontWeight: 800,
                        margin: '0 0 32px', textAlign: 'center', letterSpacing: '-0.5px'
                    }}>
                        Sign in
                    </h2>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Username */}
                        <div>
                            <label style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>
                                User Name
                            </label>
                            <input
                                type="text"
                                placeholder="admin"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                                style={{
                                    width: '100%', boxSizing: 'border-box',
                                    background: 'rgba(255,255,255,0.12)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: 24, padding: '11px 18px',
                                    color: 'white', fontSize: 14, outline: 'none',
                                    transition: 'border-color 0.2s',
                                    backdropFilter: 'blur(8px)'
                                }}
                                onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.5)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    style={{
                                        width: '100%', boxSizing: 'border-box',
                                        background: 'rgba(255,255,255,0.12)',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        borderRadius: 24, padding: '11px 44px 11px 18px',
                                        color: 'white', fontSize: 14, outline: 'none',
                                        transition: 'border-color 0.2s',
                                        backdropFilter: 'blur(8px)'
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.5)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: 14, top: '50%',
                                        transform: 'translateY(-50%)', background: 'none',
                                        border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
                                        display: 'flex', padding: 0
                                    }}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: 12, padding: '10px 14px', color: '#FCA5A5', fontSize: 13,
                                animation: shake ? 'shake 0.5s ease' : undefined
                            }}>
                                <AlertCircle size={14} /> {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                background: loading
                                    ? 'rgba(255,100,80,0.4)'
                                    : 'linear-gradient(135deg, #FF5F6D 0%, #FFC371 100%)',
                                border: 'none', borderRadius: 24, padding: '13px',
                                color: 'white', fontWeight: 700, fontSize: 15,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: loading ? 'none' : '0 8px 24px rgba(255,100,80,0.4)',
                                transition: 'all 0.2s',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                marginTop: 4
                            }}
                        >
                            {loading ? (
                                <>
                                    <span style={{
                                        width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                                        borderTopColor: 'white', borderRadius: '50%',
                                        animation: 'spin 0.7s linear infinite', display: 'inline-block'
                                    }} />
                                    Entrando...
                                </>
                            ) : 'Submit'}
                        </button>
                    </form>

                    {/* Social icons row */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 28 }}>
                        {['f', 'in', 'p'].map((icon, i) => (
                            <div key={i} style={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 700,
                                cursor: 'pointer', fontStyle: 'italic'
                            }}>
                                {icon}
                            </div>
                        ))}
                    </div>

                    <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 10, marginTop: 20, fontFamily: 'monospace' }}>
                        Protegido por SHA-256
                    </p>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
                input::placeholder { color: rgba(255,255,255,0.35); }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes shake {
                    0%,100% { transform: translateX(0); }
                    20% { transform: translateX(-8px); }
                    40% { transform: translateX(8px); }
                    60% { transform: translateX(-5px); }
                    80% { transform: translateX(5px); }
                }
            `}</style>
        </div>
    );
}
