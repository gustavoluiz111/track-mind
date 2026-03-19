import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Filter, MoreVertical, Edit2,
    QrCode, Box, Wifi, WifiOff, X, Cpu, Clock, MapPin, Hash, ShieldCheck
} from 'lucide-react';
import { ref, get, child, push, set } from 'firebase/database';
import { db } from '../config/firebase';

const STATUS_FILTERS = [
    { key: 'todos',     label: 'Todos' },
    { key: 'disponivel',label: 'Disponível' },
    { key: 'locado',    label: 'Locado' },
    { key: 'manutencao',label: 'Manutenção' },
    { key: 'inativo',   label: 'Inativo' },
];

const STATUS_STYLE = {
    disponivel: { label: 'Disponível', bg: 'rgba(16,185,129,0.12)',  color: 'var(--success)', dot: 'var(--success)' },
    locado:     { label: 'Locado',     bg: 'rgba(99,102,241,0.12)',  color: 'var(--accent)',  dot: 'var(--accent)' },
    manutencao: { label: 'Manutenção', bg: 'rgba(245,158,11,0.12)',  color: 'var(--warning)', dot: 'var(--warning)' },
    inativo:    { label: 'Inativo',    bg: 'rgba(239,68,68,0.12)',   color: 'var(--danger)',  dot: 'var(--danger)' },
};

export default function Itens() {
    const [itens,           setItens]           = useState([]);
    const [loading,         setLoading]         = useState(true);
    const [statusFilter,    setStatusFilter]    = useState('todos');
    const [search,          setSearch]          = useState('');
    const [showModal,       setShowModal]       = useState(false);
    const [qrModalItem,     setQrModalItem]     = useState(null);
    const [newItem,         setNewItem]         = useState({ token: '', nome: '', categoria: '', rastreador_id: '', status: 'disponivel' });
    const [modalError,      setModalError]      = useState('');

    const fetchItens = async () => {
        try {
            const snapshot = await get(child(ref(db), 'itens'));
            if (snapshot.exists()) {
                const data = snapshot.val();
                const itensList = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                setItens(itensList);
            } else {
                setItens([]);
            }
        } catch (error) {
            console.error("Erro ao buscar itens:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItens();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setModalError('');
        if (!newItem.token || !newItem.nome) return setModalError('Token e Nome são obrigatórios.');

        try {
            const { id, ...itemData } = newItem;
            if (id) {
                // Modo Edição
                await set(ref(db, `itens/${id}`), itemData);
            } else {
                // Modo Novo
                const newRef = push(ref(db, 'itens'));
                await set(newRef, itemData);
            }
            setShowModal(false);
            setNewItem({ token: '', nome: '', categoria: '', rastreador_id: '', status: 'disponivel' });
            fetchItens(); // Refresh list to get real IDs and synced data
        } catch (error) {
            console.error("Erro ao salvar:", error);
            setModalError(error.message || "Erro ao salvar equipamento.");
        }
    };

    const openEditModal = (item) => {
        setNewItem({ ...item });
        setShowModal(true);
    };

    const openNewModal = () => {
        setNewItem({ token: '', nome: '', categoria: '', rastreador_id: '', status: 'disponivel' });
        setShowModal(true);
    };

    const filtered = itens.filter(item => {
        const matchStatus = statusFilter === 'todos' || item.status === statusFilter;
        const q = search.toLowerCase();
        const matchSearch = !q
            || item.token?.toLowerCase().includes(q)
            || item.nome?.toLowerCase().includes(q)
            || item.categoria?.toLowerCase().includes(q);
        return matchStatus && matchSearch;
    });

    const groupedItens = filtered.reduce((acc, item) => {
        const cat = item.categoria || 'Sem Categoria';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    const counts = itens.reduce((acc, i) => {
        acc[i.status] = (acc[i.status] || 0) + 1;
        return acc;
    }, {});

    return (
        <>
            {/* Modal de Cadastro / Edição */}
            {showModal && (
                <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#0f111a] border border-[#2a2d3d] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
                        <div className="p-5 border-b border-[#2a2d3d] flex justify-between items-center bg-[#151823]">
                            <h3 className="font-bold text-lg text-white font-mono flex items-center gap-2">
                                {newItem.id ? <Edit2 size={18} className="text-accent" /> : <Plus size={18} className="text-accent" />}
                                {newItem.id ? 'Editar Equipamento' : 'Cadastrar Equipamento'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAdd} className="p-6 flex flex-col gap-4">
                            {modalError && (
                                <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg font-mono">
                                    {modalError}
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Token / PATRIMÔNIO *</label>
                                <input required type="text" placeholder="Ex: EQP-2026-X1" className="w-full bg-[#1c1f2e] border border-[#2a2d3d] rounded-lg px-4 py-2.5 text-sm text-white focus:border-accent focus:outline-none transition-colors font-mono uppercase"
                                    value={newItem.token} onChange={e => setNewItem({...newItem, token: e.target.value.toUpperCase()})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Nome *</label>
                                <input required type="text" placeholder="Ex: Gerador Silenciado 45 kVA" className="w-full bg-[#1c1f2e] border border-[#2a2d3d] rounded-lg px-4 py-2.5 text-sm text-white focus:border-accent focus:outline-none transition-colors"
                                    value={newItem.nome} onChange={e => setNewItem({...newItem, nome: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Categoria</label>
                                    <input type="text" placeholder="Ex: Geradores" className="w-full bg-[#1c1f2e] border border-[#2a2d3d] rounded-lg px-4 py-2.5 text-sm text-white focus:border-accent focus:outline-none transition-colors"
                                        value={newItem.categoria} onChange={e => setNewItem({...newItem, categoria: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">GPS ID (Opcional)</label>
                                    <input type="text" placeholder="Ex: GPS-001" className="w-full bg-[#1c1f2e] border border-[#2a2d3d] rounded-lg px-4 py-2.5 text-sm text-white focus:border-accent focus:outline-none transition-colors font-mono"
                                        value={newItem.rastreador_id} onChange={e => setNewItem({...newItem, rastreador_id: e.target.value})} />
                                </div>
                            </div>
                            {newItem.id && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Status Máquina</label>
                                    <select className="w-full bg-[#1c1f2e] border border-[#2a2d3d] rounded-lg px-4 py-2.5 text-sm text-white focus:border-accent focus:outline-none transition-colors"
                                            value={newItem.status} onChange={e => setNewItem({...newItem, status: e.target.value})}>
                                        <option value="disponivel">Disponível</option>
                                        <option value="locado">Locado</option>
                                        <option value="manutencao">Em Manutenção</option>
                                        <option value="inativo">Inativo</option>
                                    </select>
                                </div>
                            )}
                            <div className="mt-4 pt-4 border-t border-[#2a2d3d] flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-lg text-sm font-bold text-gray-400 hover:text-white transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-premium">
                                    {newItem.id ? 'Salvar Alterações' : '+ Adicionar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal QR Code / Digital Registry Card */}
            {qrModalItem && (
                <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={() => setQrModalItem(null)}>
                    <div className="bg-[#0B0F19] border border-[#1E2D4A] rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.2)] animate-scale-in flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
                        
                        {/* Lado Esquerdo: QR Code */}
                        <div className="bg-gradient-to-b from-[#131D35] to-[#0A101D] p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#1E2D4A] w-full md:w-2/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent opacity-20 blur-[50px] rounded-full mix-blend-screen pointer-events-none"></div>
                            
                            <div className="bg-white p-3 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] mb-6 z-10 transition-transform hover:scale-105">
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrModalItem.token)}`} 
                                    alt={`QR Code ${qrModalItem.token}`} 
                                    className="w-[180px] h-[180px]"
                                />
                            </div>
                            <div className="text-center z-10">
                                <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-1">SCAN OFICIAL</p>
                                <p className="text-[10px] text-gray-400 px-4">Utilize a câmera do supervisor para acessar o manual ou dar baixa em manutenções.</p>
                            </div>
                        </div>

                        {/* Lado Direito: Registro Digital */}
                        <div className="p-8 w-full md:w-3/5 flex flex-col relative">
                            <button onClick={() => setQrModalItem(null)} className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors bg-[#131D35] p-1.5 rounded-lg border border-[#1E2D4A]">
                                <X size={18} />
                            </button>

                            <div className="mb-6 pr-8">
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldCheck size={18} className="text-accent" />
                                    <span className="text-[10px] font-bold text-accent uppercase tracking-widest border border-accent/30 bg-accent/10 py-1 px-2 rounded-full">
                                        Registro Verificado
                                    </span>
                                </div>
                                <h3 className="font-bold text-2xl text-white font-mono leading-tight">{qrModalItem.nome}</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-5 flex-1 content-start">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                        <Hash size={12} /> Patrimônio
                                    </span>
                                    <span className="text-sm text-white font-mono bg-[#131D35] px-3 py-1.5 rounded-lg border border-[#1E2D4A]">{qrModalItem.token}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                        <Box size={12} /> Categoria
                                    </span>
                                    <span className="text-sm text-white bg-[#131D35] px-3 py-1.5 rounded-lg border border-[#1E2D4A]">{qrModalItem.categoria || 'Não def.'}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                        <Clock size={12} /> Status Operativo
                                    </span>
                                    {(() => {
                                        const s = STATUS_STYLE[qrModalItem.status] || STATUS_STYLE.disponivel;
                                        return (
                                            <div className="flex items-center gap-2 text-sm bg-[#131D35] px-3 py-1.5 rounded-lg border border-[#1E2D4A]">
                                                <span className="w-2 h-2 rounded-full" style={{ background: s.dot, boxShadow: `0 0 8px ${s.dot}` }} />
                                                <span style={{ color: s.color, fontWeight: 'bold' }}>{s.label || qrModalItem.status}</span>
                                            </div>
                                        )
                                    })()}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                        <MapPin size={12} /> Rastreamento
                                    </span>
                                    {qrModalItem.rastreador_id ? (
                                        <div className="flex items-center gap-1.5 text-sm bg-[#131D35] px-3 py-1.5 rounded-lg border border-[#1E2D4A] text-success">
                                            <Wifi size={14} className="animate-pulse" /> {qrModalItem.rastreador_id}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-sm bg-[#131D35] px-3 py-1.5 rounded-lg border border-[#1E2D4A] text-gray-500">
                                            <WifiOff size={14} /> Sem GPS
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 pt-5 border-t border-[#1E2D4A] flex justify-between items-center">
                                <div className="flex items-center gap-2 overflow-hidden opacity-50">
                                    <Cpu size={14} className="text-gray-400" />
                                    <span className="font-mono text-[9px] text-gray-400 truncate">ID: {qrModalItem.id} // SYS_SYNC_OK</span>
                                </div>
                                <button className="btn-secondary text-xs px-4 py-2 hover:text-white" onClick={() => window.print()}>
                                    Imprimir Cartão
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
            
            <div className="flex flex-col gap-5 animate-fade-in relative z-0">

                {/* ── Top bar ── */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-lg font-bold text-white">Equipamentos</h2>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {itens.length} itens no inventário
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button className="btn-secondary text-xs gap-1.5 cursor-not-allowed opacity-50">
                            <Filter size={14} /> Filtros
                        </button>
                        <button className="btn-premium text-xs gap-1.5" onClick={openNewModal}>
                            <Plus size={16} /> Novo Equipamento
                        </button>
                    </div>
                </div>

                {/* ── Status Chips ── */}
                <div className="flex gap-2 flex-wrap">
                    {STATUS_FILTERS.map(f => {
                        const cnt   = f.key === 'todos' ? itens.length : (counts[f.key] || 0);
                        const sty   = STATUS_STYLE[f.key];
                        const active= statusFilter === f.key;
                        return (
                            <button
                                key={f.key}
                                onClick={() => setStatusFilter(f.key)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                                style={active ? {
                                    background: sty ? sty.bg : 'rgba(99,102,241,0.15)',
                                    color:      sty ? sty.color : 'var(--accent)',
                                    border: `1px solid ${sty ? sty.color : 'var(--accent)'}`,
                                    boxShadow: sty ? `0 0 10px ${sty.bg}` : '0 0 10px var(--accent-glow)',
                                } : {
                                    background: 'var(--bg-elevated)',
                                    color: 'var(--text-muted)',
                                    border: '1px solid var(--border)',
                                }}
                            >
                                {sty && (
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? sty.dot : 'var(--text-subtle)' }} />
                                )}
                                {f.label}
                                <span
                                    className="tabular-nums"
                                    style={{ color: active ? 'inherit' : 'var(--text-subtle)' }}
                                >
                                    {cnt}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* ── Table card ── */}
                <div className="card flex flex-col overflow-hidden" style={{ minHeight: 300 }}>
                    {/* Table Toolbar */}
                    <div className="px-4 py-3 flex items-center justify-between gap-3" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                        <div className="relative flex items-center w-64">
                            <Search size={14} className="absolute left-3 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Token, nome, categoria..."
                                className="input-base pl-9 pr-8 text-xs h-8 rounded-lg"
                            />
                            {search && (
                                <button className="absolute right-2.5" onClick={() => setSearch('')}>
                                    <X size={12} style={{ color: 'var(--text-muted)' }} />
                                </button>
                            )}
                        </div>
                        <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                            {filtered.length} / {itens.length} registros
                        </span>
                    </div>

                    {/* Table Grouped List */}
                    <div className="overflow-auto flex-1">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                                     style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
                                <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>Carregando inventário...</p>
                            </div>
                        ) : Object.keys(groupedItens).length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Box size={40} style={{ color: 'var(--text-subtle)' }} />
                                <div className="text-center">
                                    <p className="font-semibold text-white">Nenhum equipamento encontrado</p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                        {search ? 'Tente outro termo de busca.' : 'Cadastre o primeiro equipamento.'}
                                    </p>
                                </div>
                                {!search && (
                                    <button className="btn-premium text-sm mt-2" onClick={openNewModal}>
                                        <Plus size={16} /> Novo Equipamento
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col pb-4">
                                {Object.keys(groupedItens).sort().map(categoria => (
                                    <div key={categoria} className="mb-4">
                                        {/* Category Header */}
                                        <div className="px-6 py-2.5 bg-[#0b0f19] border-y border-[#1E2D4A] flex items-center gap-3 sticky top-0 z-10 shadow-sm">
                                            <div className="text-xs font-bold text-accent tracking-widest uppercase font-mono">{categoria}</div>
                                            <div className="text-[10px] text-gray-500 font-mono bg-[#1c1f2e] px-2 py-0.5 rounded-md border border-[#2a2d3d]">{groupedItens[categoria].length} itens</div>
                                        </div>

                                        <table className="w-full text-left border-collapse text-sm">
                                            <thead className="sr-only">
                                                <tr>
                                                    <th>Token</th><th>Equipamento</th><th>Status</th><th>Rastreador</th><th>Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {groupedItens[categoria].map((item, idx) => {
                                                    const s = STATUS_STYLE[item.status] || STATUS_STYLE.disponivel;
                                                    return (
                                                        <tr
                                                            key={item.id}
                                                            className="transition-colors border-b border-[#1E2D4A]/50 last:border-b-0 hover:bg-[#131D35]"
                                                        >
                                                            <td className="px-6 py-4 w-[15%]">
                                                                <span className="font-mono text-xs font-bold px-2.5 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                                    {item.token}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 w-[35%]">
                                                                <p className="font-medium text-white text-sm leading-tight">{item.nome}</p>
                                                            </td>
                                                            <td className="px-6 py-4 w-[20%]">
                                                                <span className="flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-full text-[11px] font-bold" style={{ background: s.bg, color: s.color }}>
                                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                                                                    {s.label || item.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 w-[15%]">
                                                                {item.rastreador_id ? (
                                                                    <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                                                                        <Wifi size={13} className="opacity-80" />
                                                                        {item.rastreador_id}
                                                                    </span>
                                                                ) : (
                                                                    <span className="flex items-center gap-1.5 text-xs text-gray-600">
                                                                        <WifiOff size={13} />
                                                                        Sem GPS
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 w-[15%] text-right">
                                                                <div className="flex justify-end gap-1.5">
                                                                    <button className="p-2 rounded-lg transition-colors text-gray-400 hover:bg-indigo-500/10 hover:text-indigo-400" title="Registro Oficial QR Code" onClick={() => setQrModalItem(item)}>
                                                                        <QrCode size={16} />
                                                                    </button>
                                                                    <button className="p-2 rounded-lg transition-colors text-gray-400 hover:bg-[#1E2D4A] hover:text-white border border-transparent hover:border-[#2A3F60]" title="Editar Equipamento" onClick={() => openEditModal(item)}>
                                                                        <Edit2 size={16} />
                                                                    </button>
                                                                    <button className="p-2 rounded-lg transition-colors text-gray-400 hover:bg-[#1E2D4A] hover:text-white border border-transparent hover:border-[#2A3F60]" title="Mais opções">
                                                                        <MoreVertical size={16} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
