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

            {/* Main content: responsive container */}
            <div className="flex flex-col md:flex-row w-full max-w-[960px] min-h-[480px] m-6 rounded-[24px] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.5)] relative z-[1] border border-white/5">

                {/* ── LEFT PANEL ── */}
                <div className="flex-1 p-8 md:p-12 flex flex-col justify-between bg-white/[0.03] backdrop-blur-[4px]">
                    {/* Logo mark */}
                    <div className="flex items-center gap-2">
                        <div className="grid grid-cols-2 gap-[3px] w-7 h-7">
                            {[0,1,2,3].map(i => (
                                <div key={i} className={`rounded-[2px] ${i === 0 || i === 3 ? 'bg-white' : 'bg-white/50'}`} />
                            ))}
                        </div>
                    </div>

                    {/* Welcome text */}
                    <div className="py-8 md:py-0">
                        <h1 className="text-4xl md:text-[52px] font-[800] text-white m-0 mb-4 leading-[1.1] tracking-[-1px]">
                            Bem-vindo!
                        </h1>
                        <div className="w-9 h-[3px] bg-white/50 mb-5 rounded-[2px]" />
                        <p className="text-white/55 text-[13.5px] leading-[1.7] max-w-[260px] m-0 mb-7">
                            Sistema integrado de gestão e rastreamento de equipamentos industriais.
                            Faça login para continuar.
                        </p>
                        <button className="inline-flex items-center gap-1.5 bg-gradient-to-br from-[#FF5F6D] to-[#FFC371] border-none rounded-[24px] px-6 py-2.5 text-white font-[700] text-[13px] cursor-pointer shadow-[0_6px_20px_rgba(255,100,80,0.4)] hover:scale-105 transition-transform">
                            Saiba mais
                        </button>
                    </div>

                    <div className="hidden md:block" /> {/* spacer */}
                </div>

                {/* ── RIGHT PANEL — Sign In card ── */}
                <div className="w-full md:w-[360px] p-8 md:p-11 flex flex-col justify-center bg-white/[0.08] backdrop-blur-[20px] border-t md:border-t-0 md:border-l border-white/10">
                    <h2 className="text-white text-[28px] font-[800] m-0 mb-8 text-center tracking-[-0.5px]">
                        Sign in
                    </h2>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {/* Username */}
                        <div>
                            <label className="text-white/85 text-[13px] font-[600] block mb-2">
                                User Name
                            </label>
                            <input
                                type="text"
                                placeholder="admin"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                                className="w-full bg-white/[0.12] border border-white/15 rounded-[24px] px-[18px] py-[11px] text-white text-sm outline-none focus:border-white/50 backdrop-blur-[8px] transition-all"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-white/85 text-[13px] font-[600] block mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-white/[0.12] border border-white/15 rounded-[24px] pl-[18px] pr-[44px] py-[11px] text-white text-sm outline-none focus:border-white/50 backdrop-blur-[8px] transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-[14px] top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-white/50 flex p-0"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className={`flex items-center gap-2 bg-red-500/15 border border-red-500/30 rounded-xl px-3.5 py-2.5 text-[#FCA5A5] text-[13px] ${shake ? 'animate-shake' : ''}`}>
                                <AlertCircle size={14} /> {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-[13px] text-white font-[700] text-[15px] rounded-[24px] flex items-center justify-center gap-2 mt-1 shadow-[0_8px_24px_rgba(255,100,80,0.4)] transition-all ${loading ? 'bg-white/20 cursor-not-allowed' : 'bg-gradient-to-r from-[#FF5F6D] to-[#FFC371] hover:scale-[1.02] cursor-pointer'}`}
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                    input::placeholder { color: rgba(255,255,255,0.35); }
                    @keyframes shake {
                        0%,100% { transform: translateX(0); }
                        20% { transform: translateX(-8px); }
                        40% { transform: translateX(8px); }
                        60% { transform: translateX(-5px); }
                        80% { transform: translateX(5px); }
                    }
                    .animate-shake { animation: shake 0.5s ease; }
                `}</style>
        </div>
    );
}
