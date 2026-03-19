import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Map, Box, ClipboardCheck,
    FileText, Users, LogOut, Radio, Cpu
} from 'lucide-react';

const NAV_GROUPS = [
    {
        label: 'Monitoramento',
        items: [
            { name: 'Dashboard',     path: '/dashboard',     icon: LayoutDashboard },
            { name: 'Rastreamento',  path: '/rastreamento',  icon: Map, badge: 'AO VIVO' },
            { name: 'Simulador GPS', path: '/simulador-gps', icon: Radio },
        ]
    },
    {
        label: 'Gestão',
        items: [
            { name: 'Equipamentos', path: '/itens',       icon: Box },
            { name: 'Checklists',   path: '/checklists',  icon: ClipboardCheck },
            { name: 'Contratos',    path: '/contratos',   icon: FileText },
            { name: 'Clientes',     path: '/clientes',    icon: Users },
        ]
    }
];

const Sidebar = () => {
    const navigate = useNavigate();

    return (
        <aside style={{
            width: 240,
            minWidth: 240,
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-base) 100%)',
            borderRight: '1px solid var(--border)',
            flexShrink: 0,
            overflowY: 'auto',
            zIndex: 20,
        }}>

            {/* Logo */}
            <div style={{
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                borderBottom: '1px solid var(--border)',
            }}>
                <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'linear-gradient(135deg, var(--accent) 0%, #4F46E5 100%)',
                    boxShadow: '0 4px 16px var(--accent-glow)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                    <Cpu size={17} color="white" />
                </div>
                <div style={{ lineHeight: 1.2 }}>
                    <span style={{ display: 'block', fontWeight: 700, color: 'var(--text-primary)', fontSize: 13, letterSpacing: '0.02em' }}>
                        GestãoEQP
                    </span>
                    <span style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        UPE Industrial
                    </span>
                </div>
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
                    onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
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
