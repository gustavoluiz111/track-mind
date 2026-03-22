import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Edit2, Trash2, X, FileText, Calendar, DollarSign, User, Activity
} from 'lucide-react';
import { ref, get, child, push, set, remove } from 'firebase/database';
import { db } from '../config/firebase';

const STATUS_FILTERS = [
    { key: 'todos', label: 'Todos' },
    { key: 'ativo', label: 'Ativos' },
    { key: 'vencido', label: 'Vencidos' },
    { key: 'cancelado', label: 'Cancelados' },
];

const STATUS_STYLE = {
    ativo: { label: 'Ativo', bg: 'rgba(16,185,129,0.12)', color: 'var(--success)', dot: 'var(--success)' },
    vencido: { label: 'Vencido', bg: 'rgba(239,68,68,0.12)', color: 'var(--danger)', dot: 'var(--danger)' },
    cancelado: { label: 'Cancelado', bg: 'rgba(107,114,128,0.12)', color: 'var(--text-muted)', dot: 'var(--text-muted)' },
};

export default function Contratos() {
    const [contratos, setContratos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('todos');
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    
    const [newItem, setNewItem] = useState({ cliente: '', valor: '', equipamentos: '', dataInicial: '', vencimento: '', status: 'ativo' });
    const [modalError, setModalError] = useState('');

    const fetchContratos = async () => {
        try {
            const snapshot = await get(child(ref(db), 'contratos'));
            if (snapshot.exists()) {
                const data = snapshot.val();
                const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                setContratos(list);
            } else {
                setContratos([]);
            }
        } catch (error) {
            console.error("Erro ao buscar contratos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContratos();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setModalError('');
        if (!newItem.cliente) return setModalError('O nome do cliente é obrigatório.');

        try {
            const { id, ...itemData } = newItem;
            if (id) {
                await set(ref(db, `contratos/${id}`), itemData);
            } else {
                const newRef = push(ref(db, 'contratos'));
                await set(newRef, itemData);
            }
            setShowModal(false);
            setNewItem({ cliente: '', valor: '', equipamentos: '', dataInicial: '', vencimento: '', status: 'ativo' });
            fetchContratos();
        } catch (error) {
            console.error("Erro ao salvar:", error);
            setModalError(error.message || "Erro ao salvar contrato.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Deseja realmente excluir este contrato?")) return;
        try {
            await remove(ref(db, `contratos/${id}`));
            fetchContratos();
        } catch (error) {
            console.error("Erro ao excluir contrato:", error);
            alert("Erro ao excluir: " + error.message);
        }
    };

    const openEditModal = (item) => {
        setNewItem({ ...item });
        setShowModal(true);
    };

    const openNewModal = () => {
        setNewItem({ cliente: '', valor: '', equipamentos: '', dataInicial: '', vencimento: '', status: 'ativo' });
        setShowModal(true);
    };

    const filtered = contratos.filter(item => {
        const matchStatus = statusFilter === 'todos' || item.status === statusFilter;
        const q = search.toLowerCase();
        const matchSearch = !q
            || item.cliente?.toLowerCase().includes(q)
            || item.equipamentos?.toLowerCase().includes(q);
        return matchStatus && matchSearch;
    });

    const counts = contratos.reduce((acc, i) => {
        acc[i.status] = (acc[i.status] || 0) + 1;
        return acc;
    }, {});

    const formatCurrency = (value) => {
        if (!value) return "R$ 0,00";
        const val = parseFloat(value);
        return isNaN(val) ? value : val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <>
            {showModal && (
                <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#0f111a] border border-[#2a2d3d] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in">
                        <div className="p-5 border-b border-[#2a2d3d] flex justify-between items-center bg-[#151823]">
                            <h3 className="font-bold text-lg text-white font-mono flex items-center gap-2">
                                {newItem.id ? <Edit2 size={18} className="text-accent" /> : <Plus size={18} className="text-accent" />}
                                {newItem.id ? 'Editar Contrato' : 'Novo Contrato'}
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
                                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Cliente (Empresa) *</label>
                                <input required type="text" placeholder="Busque ou digite o nome do cliente" className="w-full bg-[#1c1f2e] border border-[#2a2d3d] rounded-lg px-4 py-2.5 text-sm text-white focus:border-accent focus:outline-none transition-colors"
                                    value={newItem.cliente} onChange={e => setNewItem({...newItem, cliente: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Equipamentos Vinculados</label>
                                <input type="text" placeholder="Descreva os itens (Ex: 2x Gerador, 1x Torre)" className="w-full bg-[#1c1f2e] border border-[#2a2d3d] rounded-lg px-4 py-2.5 text-sm text-white focus:border-accent focus:outline-none transition-colors"
                                    value={newItem.equipamentos} onChange={e => setNewItem({...newItem, equipamentos: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Data de Início</label>
                                    <input type="date" className="w-full bg-[#1c1f2e] border border-[#2a2d3d] rounded-lg px-4 py-2.5 text-sm text-white focus:border-accent focus:outline-none transition-colors"
                                        value={newItem.dataInicial} onChange={e => setNewItem({...newItem, dataInicial: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Data de Vencimento</label>
                                    <input type="date" className="w-full bg-[#1c1f2e] border border-[#2a2d3d] rounded-lg px-4 py-2.5 text-sm text-white focus:border-accent focus:outline-none transition-colors"
                                        value={newItem.vencimento} onChange={e => setNewItem({...newItem, vencimento: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Valor do Contrato (R$)</label>
                                    <input type="number" step="0.01" placeholder="0.00" className="w-full bg-[#1c1f2e] border border-[#2a2d3d] rounded-lg px-4 py-2.5 text-sm text-white focus:border-accent focus:outline-none transition-colors font-mono"
                                        value={newItem.valor} onChange={e => setNewItem({...newItem, valor: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Status</label>
                                    <select className="w-full bg-[#1c1f2e] border border-[#2a2d3d] rounded-lg px-4 py-2.5 text-sm text-white focus:border-accent focus:outline-none transition-colors"
                                            value={newItem.status} onChange={e => setNewItem({...newItem, status: e.target.value})}>
                                        <option value="ativo">Ativo</option>
                                        <option value="vencido">Vencido</option>
                                        <option value="cancelado">Cancelado</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-[#2a2d3d] flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-lg text-sm font-bold text-gray-400 hover:text-white transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-premium">
                                    {newItem.id ? 'Salvar' : '+ Criar Contrato'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-5 animate-fade-in relative z-0">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-lg font-bold text-white">Contratos Ativos</h2>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {contratos.length} locações e serviços vigentes
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button className="btn-premium text-xs gap-1.5" onClick={openNewModal}>
                            <Plus size={16} /> Novo Contrato
                        </button>
                    </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                    {STATUS_FILTERS.map(f => {
                        const cnt = f.key === 'todos' ? contratos.length : (counts[f.key] || 0);
                        const sty = STATUS_STYLE[f.key];
                        const active = statusFilter === f.key;
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
                                {sty && <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? sty.dot : 'var(--text-subtle)' }} />}
                                {f.label}
                                <span className="tabular-nums font-mono" style={{ color: active ? 'inherit' : 'var(--text-subtle)' }}>{cnt}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="card flex flex-col overflow-hidden" style={{ minHeight: 300 }}>
                    <div className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                        <div className="relative flex items-center w-full sm:w-64">
                            <Search size={14} className="absolute left-3 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Buscar..."
                                className="input-base pl-9 pr-8 text-xs h-8 rounded-lg w-full"
                            />
                            {search && (
                                <button className="absolute right-2.5" onClick={() => setSearch('')}>
                                    <X size={12} style={{ color: 'var(--text-muted)' }} />
                                </button>
                            )}
                        </div>
                        <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                            {filtered.length} / {contratos.length} registros
                        </span>
                    </div>

                    <div className="overflow-x-auto overflow-y-auto flex-1">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
                                <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>Carregando contratos...</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <FileText size={40} style={{ color: 'var(--text-subtle)' }} />
                                <div className="text-center">
                                    <p className="font-semibold text-white">Nenhum contrato encontrado</p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                        {search ? 'Tente outro termo de busca.' : 'Você ainda não possui contratos ativos.'}
                                    </p>
                                </div>
                                {!search && (
                                    <button className="btn-premium text-sm mt-2" onClick={openNewModal}>
                                        <Plus size={16} /> Novo Contrato
                                    </button>
                                )}
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse text-sm min-w-[800px]">
                                <thead className="bg-[#0b0f19] border-y border-[#1E2D4A] text-xs font-mono text-gray-500 uppercase tracking-wider sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-6 py-3 font-normal">Cliente / Equip.</th>
                                        <th className="px-6 py-3 font-normal">Período</th>
                                        <th className="px-6 py-3 font-normal">Valor</th>
                                        <th className="px-6 py-3 font-normal">Status</th>
                                        <th className="px-6 py-3 font-normal text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((item) => {
                                        const s = STATUS_STYLE[item.status] || STATUS_STYLE.ativo;
                                        return (
                                            <tr key={item.id} className="transition-colors border-b border-[#1E2D4A]/50 last:border-b-0 hover:bg-[#131D35]">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-start flex-col">
                                                        <span className="font-medium text-white text-sm flex items-center gap-1.5"><User size={12} className="text-accent" /> {item.cliente}</span>
                                                        <span className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]" title={item.equipamentos}>
                                                            {item.equipamentos || 'Nenhum item discriminado'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1 text-[11px] text-gray-400">
                                                        <span><span className="text-gray-500 font-bold uppercase tracking-widest border border-transparent">Início:</span> {item.dataInicial || '-'}</span>
                                                        <span><span className="text-gray-500 font-bold uppercase tracking-widest border border-transparent">Venc.:</span> <span className={item.status === 'vencido' ? 'text-red-400 font-bold' : ''}>{item.vencimento || '-'}</span></span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-sm font-mono text-emerald-400 font-bold bg-emerald-500/10 w-fit px-2 py-1 rounded">
                                                        <DollarSign size={13} /> {formatCurrency(item.valor)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-full text-[11px] font-bold" style={{ background: s.bg, color: s.color }}>
                                                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                                                        {s.label || item.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-1.5">
                                                        <button className="p-2 rounded-lg transition-colors text-gray-400 hover:bg-[#1E2D4A] hover:text-white border border-transparent hover:border-[#2A3F60]" title="Editar" onClick={() => openEditModal(item)}>
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button className="p-2 rounded-lg transition-colors text-gray-400 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20" title="Excluir" onClick={() => handleDelete(item.id)}>
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
