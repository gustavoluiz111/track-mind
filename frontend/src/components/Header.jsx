import React, { useState } from 'react';
import { Bell, Search, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Map, Radio, Box,
    ClipboardCheck, FileText, Users
} from 'lucide-react';

const PAGE_META = {
    '/dashboard':       { title: 'Dashboard',       icon: LayoutDashboard, subtitle: 'Visão geral do sistema' },
    '/rastreamento':    { title: 'Rastreamento',    icon: Map,             subtitle: 'Monitoramento em tempo real' },
    '/simulador-gps':   { title: 'Simulador GPS',   icon: Radio,           subtitle: 'Teste de telemetria' },
    '/itens':           { title: 'Equipamentos',    icon: Box,             subtitle: 'Inventário e status operativo' },
    '/checklists':      { title: 'Checklists',      icon: ClipboardCheck,  subtitle: 'Inspeções e laudos' },
    '/contratos':       { title: 'Contratos',       icon: FileText,        subtitle: 'Gestão de contratos ativos' },
    '/clientes':        { title: 'Clientes',        icon: Users,           subtitle: 'Cadastro de clientes' },
};

const Header = () => {
    const location = useLocation();
    const [searchFocused, setSearchFocused] = useState(false);
    const [searchValue,   setSearchValue]   = useState('');

    const meta     = PAGE_META[location.pathname] || { title: 'Sistema', subtitle: '', icon: Box };
    const PageIcon = meta.icon;

    return (
        <header style={{
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            flexShrink: 0,
            background: 'rgba(7, 11, 20, 0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--border)',
            zIndex: 10,
        }}>

            {/* Left: breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <PageIcon size={15} color="var(--accent)" />
                </div>
                <div style={{ lineHeight: 1.3 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{meta.title}</p>
                    {meta.subtitle && (
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{meta.subtitle}</p>
                    )}
                </div>
            </div>

            {/* Right: actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

                {/* Search */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={14} style={{
                        position: 'absolute', left: 10, zIndex: 1, pointerEvents: 'none',
                        color: searchFocused ? 'var(--accent)' : 'var(--text-muted)',
                        transition: 'color 0.2s',
                    }} />
                    <input
                        type="text"
                        value={searchValue}
                        onChange={e => setSearchValue(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        placeholder="Buscar token, contrato..."
                        style={{
                            height: 34,
                            width: searchFocused ? 240 : 190,
                            paddingLeft: 32,
                            paddingRight: searchValue ? 28 : 12,
                            fontSize: 12,
                            background: 'var(--bg-elevated)',
                            border: `1px solid ${searchFocused ? 'var(--accent)' : 'var(--border)'}`,
                            borderRadius: 10,
                            color: 'var(--text-primary)',
                            outline: 'none',
                            transition: 'width 0.25s ease, border-color 0.2s',
                            boxShadow: searchFocused ? '0 0 0 3px var(--accent-glow)' : 'none',
                        }}
                    />
                    {searchValue && (
                        <button
                            onClick={() => setSearchValue('')}
                            style={{
                                position: 'absolute', right: 8, background: 'none',
                                border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0,
                            }}
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>

                {/* Divider */}
                <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

                {/* Bell */}
                <button
                    style={{
                        position: 'relative', width: 32, height: 32, borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)',
                    }}
                    title="3 alertas ativos"
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                    <Bell size={16} />
                    <span style={{
                        position: 'absolute', top: 6, right: 6, width: 7, height: 7,
                        borderRadius: '50%', background: 'var(--danger)',
                        border: '1.5px solid var(--bg-base)',
                    }} />
                </button>

                {/* Avatar */}
                <button
                    style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    }}
                >
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Admin Sup</p>
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>admin@system.io</p>
                    </div>
                    <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, color: 'white',
                    }}>
                        AS
                    </div>
                </button>
            </div>
        </header>
    );
};

export default Header;
