import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Bell, Search, X, LayoutDashboard, Map, Radio, Box,
    ClipboardCheck, FileText, Users, LogOut, Menu
} from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { db } from '../config/firebase';

const PAGE_META = {
    // ... existing PAGE_META remains same
};

const Header = ({ onLogout, onMenuClick }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchFocused, setSearchFocused] = useState(false);
    const [searchValue,   setSearchValue]   = useState('');
    const searchRef = useRef(null);

    // Dicionário global para busca
    const [globalData, setGlobalData] = useState({ itens: [], clientes: [] });

    useEffect(() => {
        const itensRef = ref(db, 'itens');
        const clientesRef = ref(db, 'clientes');

        const unsubItens = onValue(itensRef, (snap) => {
            const data = snap.val();
            if (data) setGlobalData(prev => ({ ...prev, itens: Object.keys(data).map(k => ({ id: k, ...data[k] })) }));
            else setGlobalData(prev => ({ ...prev, itens: [] }));
        });

        const unsubClientes = onValue(clientesRef, (snap) => {
            const data = snap.val();
            if (data) setGlobalData(prev => ({ ...prev, clientes: Object.keys(data).map(k => ({ id: k, ...data[k] })) }));
            else setGlobalData(prev => ({ ...prev, clientes: [] }));
        });

        return () => {
            unsubItens();
            unsubClientes();
        };
    }, []);

    const meta     = PAGE_META[location.pathname] || { title: 'Sistema', subtitle: '', icon: Box };
    const PageIcon = meta.icon;

    // Lógica de fechamento ao clicar fora
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSearchFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [searchRef]);

    const getSearchResults = () => {
        if (!searchValue.trim()) return [];
        const q = searchValue.toLowerCase();
        
        const resItens = globalData.itens
            .filter(i => i.nome?.toLowerCase().includes(q) || i.token?.toLowerCase().includes(q) || i.categoria?.toLowerCase().includes(q))
            .map(i => ({ type: 'item', title: i.nome, subtitle: i.token, path: '/itens' }));

        const resClientes = globalData.clientes
            .filter(c => c.nome?.toLowerCase().includes(q) || c.documento?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q))
            .map(c => ({ type: 'cliente', title: c.nome, subtitle: c.documento || c.email, path: '/clientes' }));

        return [...resItens.slice(0, 5), ...resClientes.slice(0, 5)];
    };

    const searchResults = getSearchResults();

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
            zIndex: 50,
        }}>

            {/* Left: Menu & breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Mobile Menu Button */}
                <button
                    onClick={onMenuClick}
                    style={{
                        width: 34, height: 34, borderRadius: 8,
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                        display: 'none', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-primary)', cursor: 'pointer'
                    }}
                    className="mobile-only-flex"
                >
                    <Menu size={18} />
                </button>

                <div className="header-title-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
            </div>

            {/* Right: actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

                {/* Search */}
                <div ref={searchRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
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
                        placeholder="Buscar..."
                        style={{
                            height: 34,
                            width: searchFocused ? 260 : 120,
                            paddingLeft: 32,
                            paddingRight: searchValue ? 28 : 12,
                            fontSize: 12,
                            background: 'var(--bg-elevated)',
                            border: `1px solid ${searchFocused ? 'var(--accent)' : 'var(--border)'}`,
                            borderRadius: 10,
                            color: 'var(--text-primary)',
                            outline: 'none',
                            transition: 'all 0.25s ease',
                            boxShadow: searchFocused ? '0 0 0 3px var(--accent-glow)' : 'none',
                        }}
                    />
                    {searchValue && (
                        <button
                            onClick={() => { setSearchValue(''); searchFocused && document.querySelector('input[type="text"]').focus(); }}
                            style={{
                                position: 'absolute', right: 8, background: 'none',
                                border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0,
                            }}
                        >
                            <X size={12} />
                        </button>
                    )}

                    {/* Search Dropdown */}
                    {searchFocused && searchValue && (
                        <div style={{
                            position: 'absolute', top: 45, right: 0, width: 300,
                            background: '#0f111a', border: '1px solid var(--border)',
                            borderRadius: 12, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                            display: 'flex', flexDirection: 'column',
                        }}>
                            {searchResults.length === 0 ? (
                                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                                    Nenhum resultado encontrado.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ padding: '8px 12px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', fontSize: 10, fontWeight: 'bold', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Resultados da Busca
                                    </div>
                                    {searchResults.map((res, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => {
                                                navigate(res.path);
                                                setSearchFocused(false);
                                                setSearchValue('');
                                            }}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                                                background: 'none', border: 'none', borderBottom: '1px solid var(--border)',
                                                cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#1a1d2d'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                        >
                                            <div style={{ width: 30, height: 30, borderRadius: 8, background: res.type === 'item' ? 'rgba(99,102,241,0.1)' : 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: res.type === 'item' ? 'var(--accent)' : 'var(--success)', flexShrink: 0 }}>
                                                {res.type === 'item' ? <Box size={14} /> : <Users size={14} />}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{res.title}</p>
                                                <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: res.type === 'item' ? 'monospace' : 'inherit' }}>{res.subtitle || 'Sem descrição'}</p>
                                            </div>
                                            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle)' }}>
                                                {res.type}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="desktop-only" style={{ width: 1, height: 20, background: 'var(--border)' }} />

                {/* Bell */}
                <button
                    className="desktop-only"
                    style={{
                        position: 'relative', width: 32, height: 32, borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)',
                    }}
                    title="3 alertas ativos"
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
                    <div className="desktop-only" style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Admin</p>
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>Administrador</p>
                    </div>
                    <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, color: 'white',
                    }}>
                        AD
                    </div>
                </button>

                {/* Logout */}
                {onLogout && (
                    <button
                        onClick={onLogout}
                        title="Sair do sistema"
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                            color: 'var(--danger)', fontSize: 12, fontWeight: 600,
                            transition: 'all 0.2s'
                        }}
                    >
                        <LogOut size={14} /> <span className="desktop-only">Sair</span>
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;
