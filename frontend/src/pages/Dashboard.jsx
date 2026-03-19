import React, { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip,
    ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import {
    Package, CheckCircle, AlertTriangle, Clock,
    MoreHorizontal, TrendingUp, Zap, ArrowUpRight, AlertCircle, Info
} from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { db } from '../config/firebase';

/* ─── Mock Data ─────────────────────────────── */
const mockKPIs = [
    {
        key: 'total',
        title: 'Equipamentos',
        value: 124,
        change: '+6',
        icon: Package,
        color: 'var(--accent)',
        glow: 'rgba(99,102,241,0.3)',
        bg: 'rgba(99,102,241,0.1)',
    },
    {
        key: 'disponiveis',
        title: 'Disponíveis',
        value: 45,
        change: '+3',
        icon: CheckCircle,
        color: 'var(--success)',
        glow: 'rgba(16,185,129,0.25)',
        bg: 'rgba(16,185,129,0.1)',
    },
    {
        key: 'manutencao',
        title: 'Em Manutenção',
        value: 12,
        change: '-2',
        icon: AlertTriangle,
        color: 'var(--warning)',
        glow: 'rgba(245,158,11,0.25)',
        bg: 'rgba(245,158,11,0.1)',
    },
    {
        key: 'vencendo',
        title: 'Contratos (7d)',
        value: 8,
        change: '+1',
        icon: Clock,
        color: 'var(--danger)',
        glow: 'rgba(239,68,68,0.3)',
        bg: 'rgba(239,68,68,0.1)',
    },
];

const mockReceita = [
    { name: 'Jan', value: 12000 }, { name: 'Fev', value: 19000 },
    { name: 'Mar', value: 15000 }, { name: 'Abr', value: 22000 },
    { name: 'Mai', value: 28000 }, { name: 'Jun', value: 26000 },
    { name: 'Jul', value: 34000 }, { name: 'Ago', value: 38000 },
    { name: 'Set', value: 32000 }, { name: 'Out', value: 45000 },
    { name: 'Nov', value: 41000 }, { name: 'Dez', value: 52000 },
];

const mockCategorias = [
    { name: 'Geradores',    value: 45 },
    { name: 'Compressores', value: 32 },
    { name: 'Torres Ilum.', value: 28 },
    { name: 'Empilhadeiras',value: 15 },
    { name: 'Soldas',       value: 12 },
];

const mockAlertas = [
    { id: 1, type: 'danger',  ico: AlertCircle, msg: 'Contrato CTR-001 vence amanhã',      time: '10 min atrás' },
    { id: 2, type: 'warning', ico: AlertTriangle,msg: 'Gerador G-400 — manutenção atrasada', time: '1h atrás'     },
    { id: 3, type: 'danger',  ico: Zap,          msg: 'Torre T-12 fora da geofence',         time: '2h atrás'     },
    { id: 4, type: 'info',    ico: Info,          msg: 'Checklist CHK-99 aguardando assinatura', time: '4h atrás'  },
];

const mockContratos = [
    { id: 'CTR-2026-001', eqp: 'EQP-2025-A3F1', valor: 1250,  status: 'ativo' },
    { id: 'CTR-2026-002', eqp: 'EQP-2025-A3F2', valor: 2500,  status: 'ativo' },
    { id: 'CTR-2026-003', eqp: 'EQP-2025-A3F3', valor: 3750,  status: 'vencendo' },
    { id: 'CTR-2026-004', eqp: 'EQP-2025-A3F4', valor: 5000,  status: 'ativo' },
];

/* ─── KPI Card ───────────────────────────────── */
const KpiCard = ({ kpi, delay }) => {
    const Icon = kpi.icon;
    return (
        <div
            className="card p-5 flex flex-col gap-3 animate-slide-up cursor-pointer hover:scale-[1.02] transition-transform"
            style={{ animationDelay: `${delay}ms`, boxShadow: `0 4px 24px rgba(0,0,0,0.35)` }}
        >
            <div className="flex items-start justify-between">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: kpi.bg, boxShadow: `0 0 14px ${kpi.glow}` }}
                >
                    <Icon size={20} style={{ color: kpi.color }} />
                </div>
                <span
                    className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                        background: kpi.change.startsWith('+')
                            ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                        color: kpi.change.startsWith('+') ? 'var(--success)' : 'var(--danger)',
                    }}
                >
                    <TrendingUp size={11} />
                    {kpi.change}
                </span>
            </div>

            <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{kpi.title}</p>
                <p
                    className="text-3xl font-bold font-mono mt-0.5 leading-none"
                    style={{ color: kpi.color, textShadow: `0 0 20px ${kpi.glow}` }}
                >
                    {kpi.value}
                </p>
            </div>
        </div>
    );
};

/* ─── Tooltip Customizado ────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div className="card px-4 py-3 min-w-[130px]" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <p className="font-mono font-bold text-lg" style={{ color: 'var(--accent)' }}>
                    R$ {payload[0].value.toLocaleString('pt-BR')}
                </p>
            </div>
        );
    }
    return null;
};

/* ─── Alert colors ───────────────────────────── */
const alertStyle = {
    danger:  { color: 'var(--danger)',  bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)' },
    warning: { color: 'var(--warning)', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)' },
    info:    { color: 'var(--info)',    bg: 'rgba(59,130,246,0.08)',   border: 'rgba(59,130,246,0.2)' },
};

const statusStyle = {
    ativo:    { label: 'Ativo',    bg: 'rgba(16,185,129,0.12)',  color: 'var(--success)' },
    vencendo: { label: 'Vencendo', bg: 'rgba(239,68,68,0.12)',   color: 'var(--danger)' },
};

export default function Dashboard() {
    const [kpis, setKpis]      = useState(mockKPIs);
    const [receita]            = useState(mockReceita);
    const [categorias, setCategorias] = useState(mockCategorias);
    const [alertas]            = useState(mockAlertas);
    const [contratos]          = useState(mockContratos);

    useEffect(() => {
        const itensRef = ref(db, 'itens');
        const unsubscribe = onValue(itensRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const itensList = Object.keys(data).map(key => data[key]);
                
                // Calculate KPIs
                const total = itensList.length;
                const disponiveis = itensList.filter(i => i.status === 'disponivel').length;
                const manutencao = itensList.filter(i => i.status === 'manutencao').length;
                
                setKpis(prev => prev.map(k => {
                    if (k.key === 'total') return { ...k, value: total };
                    if (k.key === 'disponiveis') return { ...k, value: disponiveis };
                    if (k.key === 'manutencao') return { ...k, value: manutencao };
                    return k;
                }));

                // Calculate Categories
                const catCounts = {};
                itensList.forEach(item => {
                    const cat = item.categoria || 'Sem Categoria';
                    catCounts[cat] = (catCounts[cat] || 0) + 1;
                });
                
                const catsArray = Object.keys(catCounts).map(name => ({
                    name,
                    value: catCounts[name]
                })).sort((a, b) => b.value - a.value).slice(0, 5);
                
                if (catsArray.length > 0) {
                    setCategorias(catsArray);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* ── KPI Row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {kpis.map((kpi, i) => (
                    <KpiCard key={kpi.key} kpi={kpi} delay={i * 60} />
                ))}
            </div>

            {/* ── Charts Row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>

                {/* Área: Evolução Mensal */}
                <div className="card p-6 animate-slide-up" style={{ animationDelay: '250ms', minHeight: 320, display: 'flex', flexDirection: 'column' }}>
                    <div className="flex justify-between items-center mb-5">
                        <div>
                            <p className="text-xs font-bold tracking-widest uppercase font-mono" style={{ color: 'var(--text-muted)' }}>Receita Mensal</p>
                            <p className="text-xl font-bold text-white mt-0.5">R$ 52.000</p>
                        </div>
                        <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
                            style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--success)' }}>
                            <ArrowUpRight size={12} /> +26,8%
                        </span>
                    </div>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%" minHeight={220}>
                            <AreaChart data={receita} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="var(--accent)" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="name"
                                    stroke="transparent"
                                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                                    dy={8}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="transparent"
                                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={v => `${v/1000}k`}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border-bright)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="var(--accent)"
                                    strokeWidth={2.5}
                                    fill="url(#areaGrad)"
                                    dot={false}
                                    activeDot={{ r: 5, fill: 'var(--accent)', stroke: 'var(--bg-base)', strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Alertas */}
                <div className="card flex flex-col animate-slide-up overflow-hidden" style={{ animationDelay: '310ms', minHeight: 320 }}>
                    <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                        <p className="text-xs font-bold tracking-widest uppercase font-mono" style={{ color: 'var(--text-muted)' }}>Alertas do Sistema</p>
                        <p className="text-white font-semibold mt-0.5">{alertas.length} ativos</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                        {alertas.map(a => {
                            const s   = alertStyle[a.type] || alertStyle.info;
                            const Ico = a.ico;
                            return (
                                <div
                                    key={a.id}
                                    className="flex gap-3 p-3 rounded-xl"
                                    style={{ background: s.bg, border: `1px solid ${s.border}` }}
                                >
                                    <Ico size={16} style={{ color: s.color, flexShrink: 0, marginTop: 1 }} />
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-white leading-snug">{a.msg}</p>
                                        <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{a.time}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ borderTop: '1px solid var(--border)' }}>
                        <button
                            className="w-full py-3 text-xs font-semibold text-center transition-colors"
                            style={{ color: 'var(--accent)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            Ver todos os alertas →
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Lower Row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>

                {/* Bar: Categorias */}
                <div className="card p-6 animate-slide-up flex flex-col" style={{ animationDelay: '370ms', minHeight: 280 }}>
                    <p className="text-xs font-bold tracking-widest uppercase font-mono mb-4" style={{ color: 'var(--text-muted)' }}>
                        Distribuição por Categoria
                    </p>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                            <BarChart data={categorias} layout="vertical" margin={{ top: 0, right: 24, left: 50, bottom: 0 }}>
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={70}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                    contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 12 }}
                                />
                                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={14}>
                                    {categorias.map((_, i) => (
                                        <Cell
                                            key={`c-${i}`}
                                            fill={i === 0 ? 'var(--accent)' : 'var(--bg-elevated)'}
                                            stroke={i === 0 ? 'var(--accent)' : 'var(--border)'}
                                            strokeWidth={1}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Table: Últimos Contratos */}
                <div className="card flex flex-col animate-slide-up overflow-hidden" style={{ animationDelay: '430ms' }}>
                    <div className="px-5 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border)' }}>
                        <p className="text-xs font-bold tracking-widest uppercase font-mono" style={{ color: 'var(--text-muted)' }}>
                            Últimos Contratos
                        </p>
                        <button className="btn-primary text-xs py-1.5 px-3">+ Novo</button>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                                    {['Contrato', 'Equipamento', 'Valor', 'Status'].map(h => (
                                        <th key={h} className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider"
                                            style={{ color: 'var(--text-muted)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {contratos.map((c, i) => {
                                    const s = statusStyle[c.status] || statusStyle.ativo;
                                    return (
                                        <tr
                                            key={c.id}
                                            className="transition-colors cursor-pointer"
                                            style={{ borderBottom: '1px solid var(--border)' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-xs font-bold px-2 py-1 rounded-md"
                                                    style={{ background: 'var(--bg-elevated)', color: 'var(--accent)', border: '1px solid var(--border)' }}>
                                                    {c.id}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{c.eqp}</td>
                                            <td className="px-4 py-3 text-xs font-mono font-bold text-white">
                                                R$ {c.valor.toLocaleString('pt-BR')},00
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="badge text-[9px] px-2 py-0.5 rounded-full"
                                                    style={{ background: s.bg, color: s.color }}>
                                                    {s.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
