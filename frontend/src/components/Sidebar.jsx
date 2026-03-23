import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Map, Box, ClipboardCheck,
    FileText, Users, LogOut, Radio, Cpu, X
} from 'lucide-react';
import trackMindLogo from '../assets/trackmind-logo.png';

const NAV_GROUPS = [
    {
        label: 'Monitoramento',
        items: [
            { name: 'Dashboard',       path: '/dashboard',     icon: LayoutDashboard },
            { name: 'Rastreamento',    path: '/rastreamento',  icon: Map, badge: 'AO VIVO' },
            { name: 'Simulador GPS',   path: '/simulador-gps', icon: Radio },
        ],
    },
    {
        label: 'Gestão',
        items: [
            { name: 'Equipamentos', path: '/itens',       icon: Box },
            { name: 'Checklists',   path: '/checklists',  icon: ClipboardCheck },
            { name: 'Contratos',    path: '/contratos',   icon: FileText },
            { name: 'Clientes',     path: '/clientes',    icon: Users },
        ],
    },
];

const Sidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    return (
        <aside className={`app-sidebar ${isOpen ? 'is-open' : ''}`}>
            {/* Logo & Close */}
            <div style={{
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img
                        src={trackMindLogo}
                        alt="TrackMind"
                        style={{ height: 38, width: 'auto', objectFit: 'contain' }}
                    />
                </div>

                {/* Close button for mobile */}
                <button
                    onClick={onClose}
                    style={{
                        padding: 8, background: 'none', border: 'none',
                        color: 'var(--text-muted)', cursor: 'pointer',
                    }}
                    className="mobile-only-flex"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                {NAV_GROUPS.map(group => (
                    <div key={group.label}>
                        <p style={{
                            padding: '0 10px',
                            marginBottom: 6,
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            fontFamily: 'monospace',
                            color: 'var(--text-subtle)',
                        }}>
                            {group.label}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {group.items.map(item => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={onClose}
                                    style={({ isActive }) => ({
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        padding: '9px 10px',
                                        borderRadius: 10,
                                        textDecoration: 'none',
                                        fontSize: 13,
                                        fontWeight: isActive ? 600 : 500,
                                        color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                                        background: isActive
                                            ? 'linear-gradient(90deg, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0.04) 100%)'
                                            : 'transparent',
                                        boxShadow: isActive ? 'inset 3px 0 0 var(--accent)' : 'none',
                                        transition: 'all 0.15s ease',
                                    })}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <item.icon size={16} color={isActive ? 'var(--accent)' : 'var(--text-muted)'} />
                                            <span style={{ flex: 1 }}>{item.name}</span>
                                            {item.badge && (
                                                <span style={{
                                                    fontSize: 9, fontWeight: 700,
                                                    padding: '2px 6px', borderRadius: 999,
                                                    background: 'rgba(16,185,129,0.15)',
                                                    color: 'var(--success)',
                                                    border: '1px solid rgba(16,185,129,0.25)',
                                                    animation: 'pulse 2s infinite',
                                                }}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* User */}
            <div style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 10,
                    background: 'var(--bg-elevated)',
                    marginBottom: 4,
                }}>
                    <div style={{
                        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                        background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, color: 'white',
                    }}>
                        AS
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Admin Sup</p>
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>admin@system.io</p>
                    </div>
                </div>
                <button
                    onClick={() => { sessionStorage.removeItem('upe_auth'); navigate('/login'); window.location.reload(); }}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 12px', borderRadius: 10, width: '100%',
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 13, color: 'var(--text-muted)', textAlign: 'left',
                        transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
                >
                    <LogOut size={15} />
                    <span>Sair do Sistema</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
