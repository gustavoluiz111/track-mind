import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Edit2, Trash2, X, Users, Mail, Phone,
    Building2, Activity, Contact
} from 'lucide-react';
import { ref, get, child, push, set, remove } from 'firebase/database';
import { db } from '../config/firebase';

const STATUS_FILTERS = [
    { key: 'todos', label: 'Todos' },
    { key: 'ativo', label: 'Ativo' },
    { key: 'inativo', label: 'Inativo' },
];

const STATUS_STYLE = {
    ativo: { label: 'Ativo', bg: 'rgba(16,185,129,0.12)', color: 'var(--success)', dot: 'var(--success)' },
    inativo: { label: 'Inativo', bg: 'rgba(239,68,68,0.12)', color: 'var(--danger)', dot: 'var(--danger)' },
};

export default function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('todos');
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newClient, setNewClient] = useState({ nome: '', email: '', telefone: '', documento: '', status: 'ativo' });
    const [modalError, setModalError] = useState('');

    const fetchClientes = async () => {
        try {
            const snapshot = await get(child(ref(db), 'clientes'));
            if (snapshot.exists()) {
                const data = snapshot.val();
                const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                setClientes(list);
            } else {
                setClientes([]);
            }
        } catch (error) {
            console.error("Erro ao buscar clientes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClientes();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setModalError('');
        if (!newClient.nome) return setModalError('O nome é obrigatório.');

        try {
            const { id, ...clientData } = newClient;
            if (id) {
                // Modo Edição
                await set(ref(db, `clientes/${id}`), clientData);
            } else {
                // Modo Novo
                const newRef = push(ref(db, 'clientes'));
                await set(newRef, clientData);
            }
            setShowModal(false);
            setNewClient({ nome: '', email: '', telefone: '', documento: '', status: 'ativo' });
            fetchClientes();
        } catch (error) {
            console.error("Erro ao salvar:", error);
            setModalError(error.message || "Erro ao salvar cliente.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Deseja realmente excluir este cliente?")) return;
        try {
            await remove(ref(db, `clientes/${id}`));
            fetchClientes();
        } catch (error) {
            console.error("Erro ao excluir cliente:", error);
            alert("Erro ao excluir: " + error.message);
        }
    };

    const openEditModal = (client) => {
        setNewClient({ ...client });
        setShowModal(true);
    };

    const openNewModal = () => {
        setNewClient({ nome: '', email: '', telefone: '', documento: '', status: 'ativo' });
        setShowModal(true);
    };

    const filtered = clientes.filter(item => {
        const matchStatus = statusFilter === 'todos' || item.status === statusFilter;
        const q = search.toLowerCase();
        const matchSearch = !q
            || item.nome?.toLowerCase().includes(q)
            || item.email?.toLowerCase().includes(q)
            || item.documento?.toLowerCase().includes(q)
            || item.telefone?.toLowerCase().includes(q);
        return matchStatus && matchSearch;
    });

    const counts = clientes.reduce((acc, i) => {
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
                                {newClient.id ? <Edit2 size={18} className="text-accent" /> : <Plus size={18} className="text-accent" />}
                                {newClient.id ? 'Editar Cliente' : 'Cadastrar Cliente'}
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
                                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Nome Completo / Razão Social *</label>
                                <input required type="text" placeholder="Ex: João da Silva" className="w-full bg-[#1c1f2e] border border-[#2a2d3d] rounded-lg px-4 py-2.5 text-sm text-white focus:border-accent focus:outline-none transition-colors"
                                    value={newClient.nome} onChange={e => setNewClient({...newClient, nome: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Email</label>
                                <input type="email" placeholder="Ex: joao@email.com" className="w-full bg-[#1c1f2e] border border-[#2a2d3d] rounded-lg px-4 py-2.5 text-sm text-white focus:border-accent focus:outline-none transition-colors"
                                    value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Telefone</label>
                                    <input type="text" placeholder="Ex: (81) 9999-9999" className="w-full bg-[#1c1f2e] border border-[#2a2d3d] rounded-lg px-4 py-2.5 text-sm text-white focus:border-accent focus:outline-none transition-colors"
                                        value={newClient.telefone} onChange={e => setNewClient({...newClient, telefone: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">CPF / CNPJ</label>
                                    <input type="text" placeholder="Apenas números..." className="w-full bg-[#1c1f2e] border border-[#2a2d3d] rounded-lg px-4 py-2.5 text-sm text-white focus:border-accent focus:outline-none transition-colors font-mono"
                                        value={newClient.documento} onChange={e => setNewClient({...newClient, documento: e.target.value})} />
                                </div>
                            </div>
                            {newClient.id && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Status Cliente</label>
                                    <select className="w-full bg-[#1c1f2e] border border-[#2a2d3d] rounded-lg px-4 py-2.5 text-sm text-white focus:border-accent focus:outline-none transition-colors"
                                            value={newClient.status} onChange={e => setNewClient({...newClient, status: e.target.value})}>
                                        <option value="ativo">Ativo</option>
                                        <option value="inativo">Inativo</option>
                                    </select>
                                </div>
                            )}
                            <div className="mt-4 pt-4 border-t border-[#2a2d3d] flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-lg text-sm font-bold text-gray-400 hover:text-white transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-premium">
                                    {newClient.id ? 'Salvar Alterações' : '+ Adicionar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-5 animate-fade-in relative z-0">

                {/* ── Top bar ── */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-lg font-bold text-white">Clientes</h2>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {clientes.length} clientes na base de dados
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button className="btn-premium text-xs gap-1.5" onClick={openNewModal}>
                            <Plus size={16} /> Novo Cliente
                        </button>
                    </div>
                </div>

                {/* ── Status Chips ── */}
                <div className="flex gap-2 flex-wrap">
                    {STATUS_FILTERS.map(f => {
                        const cnt   = f.key === 'todos' ? clientes.length : (counts[f.key] || 0);
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
                                    className="tabular-nums font-mono"
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
                            {filtered.length} / {clientes.length} registros
                        </span>
                    </div>

                    {/* Table List */}
                    <div className="overflow-x-auto overflow-y-auto flex-1">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                                     style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
                                <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>Carregando clientes...</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Users size={40} style={{ color: 'var(--text-subtle)' }} />
                                <div className="text-center">
                                    <p className="font-semibold text-white">Nenhum cliente encontrado</p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                        {search ? 'Tente outro termo de busca.' : 'Cadastre o primeiro cliente.'}
                                    </p>
                                </div>
                                {!search && (
                                    <button className="btn-premium text-sm mt-2" onClick={openNewModal}>
                                        <Plus size={16} /> Novo Cliente
                                    </button>
                                )}
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse text-sm min-w-[700px]">
                                <thead className="bg-[#0b0f19] border-y border-[#1E2D4A] text-xs font-mono text-gray-500 uppercase tracking-wider sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-6 py-3 font-normal">Identificação</th>
                                        <th className="px-6 py-3 font-normal">Contato</th>
                                        <th className="px-6 py-3 font-normal">Status</th>
                                        <th className="px-6 py-3 font-normal text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((item, idx) => {
                                        const s = STATUS_STYLE[item.status] || STATUS_STYLE.ativo;
                                        return (
                                            <tr
                                                key={item.id}
                                                className="transition-colors border-b border-[#1E2D4A]/50 last:border-b-0 hover:bg-[#131D35]"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-start flex-col">
                                                        <span className="font-medium text-white text-sm">{item.nome}</span>
                                                        <span className="font-mono text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                            <Contact size={11} /> {item.documento || 'Sem Documento'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1 text-xs text-gray-400">
                                                        <span className="flex items-center gap-1.5"><Mail size={12} className="text-gray-500" /> {item.email || '-'}</span>
                                                        <span className="flex items-center gap-1.5"><Phone size={12} className="text-gray-500" /> {item.telefone || '-'}</span>
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
                                                        <button className="p-2 rounded-lg transition-colors text-gray-400 hover:bg-[#1E2D4A] hover:text-white border border-transparent hover:border-[#2A3F60]" title="Editar Cliente" onClick={() => openEditModal(item)}>
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
