import React, { useState, useEffect, useRef } from 'react';
import {
    Plus, Search, Edit2, Trash2, X, ClipboardCheck,
    Box, User, AlertTriangle, CheckSquare, Droplets,
    Banknote, FileText, Fuel, MapPin
} from 'lucide-react';
import { ref, get, child, push, set, remove } from 'firebase/database';
import { db } from '../config/firebase';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

/* ─── Click handler inside map ──────────────────────── */
function ClickMarker({ position, setPosition }) {
    useMapEvents({ click(e) { setPosition(e.latlng); } });
    return position ? <Marker position={position} /> : null;
}

/* ─── Mini-map wrapper: forces tile render after modal opens ─── */
function InspectionMap({ position, setPosition }) {
    const mapRef = useRef(null);

    useEffect(() => {
        // After mount delay, invalidate so tiles load
        const t = setTimeout(() => {
            if (mapRef.current) {
                mapRef.current.invalidateSize();
            }
        }, 200);
        return () => clearTimeout(t);
    }, []);

    const center = position ? [position.lat, position.lng] : [-8.0522, -34.9286];

    return (
        <MapContainer
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%', borderRadius: '12px' }}
            ref={mapRef}
        >
            <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <ClickMarker position={position} setPosition={setPosition} />
        </MapContainer>
    );
}

/* ─── CheckBox Card ──────────────────────────────────── */
function CheckCard({ icon: Icon, label, checked, onChange, colorClass }) {
    return (
        <label
            className={`
                relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 cursor-pointer
                select-none transition-all duration-200
                ${checked
                    ? `${colorClass} shadow-lg`
                    : 'bg-[#0D1526] border-[#1E2D4A] text-[#64748B] hover:border-[#2A3F60]'}
            `}
        >
            <div className={`p-2 rounded-xl ${checked ? 'bg-white/10' : 'bg-[#131D35]'}`}>
                <Icon size={22} />
            </div>
            <span className="text-xs font-bold tracking-wide uppercase text-center leading-tight">{label}</span>
            {checked && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                    <CheckSquare size={10} />
                </span>
            )}
            <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
        </label>
    );
}

/* ─── Form Input ─────────────────────────────────────── */
function FormField({ label, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest pl-1">
                {label}
            </label>
            {children}
        </div>
    );
}

const inputCls = `
    w-full bg-[#0D1526] border border-[#1E2D4A] rounded-xl px-4 py-2.5 text-sm text-white
    focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 focus:outline-none
    transition-all placeholder-[#334155]
`;

/* ─── Row badges ─────────────────────────────────────── */
function Badge({ children, colorClass }) {
    return (
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${colorClass}`}>
            {children}
        </span>
    );
}

/* ═══════════════════════════════════════════════════════ */
export default function Checklists() {
    const [checklists, setChecklists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [equipamentosOptions, setEquipamentosOptions] = useState([]);
    const [clientesOptions, setClientesOptions] = useState([]);
    const [modalError, setModalError] = useState('');

    const emptyForm = () => ({
        equipamento: '', cliente: '', data: new Date().toISOString().split('T')[0],
        limpo: false, abastecido: false, pago: false,
        comAvaria: false, qualAvaria: '', obs: '',
        location: { lat: -8.0522, lng: -34.9286 }
    });

    const [form, setForm] = useState(emptyForm());

    const fetchData = async () => {
        setLoading(true);
        try {
            const snapChecks = await get(child(ref(db), 'checklists'));
            setChecklists(snapChecks.exists()
                ? Object.keys(snapChecks.val()).map(k => ({ id: k, ...snapChecks.val()[k] })).reverse()
                : []);
            const snapEq = await get(child(ref(db), 'itens'));
            if (snapEq.exists()) setEquipamentosOptions(Object.values(snapEq.val()));
            const snapCl = await get(child(ref(db), 'clientes'));
            if (snapCl.exists()) setClientesOptions(Object.values(snapCl.val()));
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setModalError('');
        if (!form.equipamento) return setModalError('Informe o equipamento.');
        try {
            const { id, ...data } = form;
            if (!data.comAvaria) data.qualAvaria = '';
            if (id) await set(ref(db, `checklists/${id}`), data);
            else await set(push(ref(db, 'checklists')), data);
            setShowModal(false);
            fetchData();
        } catch (err) {
            setModalError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Excluir esta inspeção?')) return;
        await remove(ref(db, `checklists/${id}`));
        fetchData();
    };

    const openEdit = (item) => { setForm({ ...item }); setShowModal(true); };
    const openNew  = () => { setForm(emptyForm()); setShowModal(true); };

    const filtered = checklists.filter(i => {
        const q = search.toLowerCase();
        return !q || i.equipamento?.toLowerCase().includes(q) || i.cliente?.toLowerCase().includes(q);
    });

    return (
        <>
            {/* ─── MODAL ──────────────────────────────────────────── */}
            {showModal && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
                    <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl"
                        style={{
                            background: 'linear-gradient(145deg, #0D1526 0%, #080E1C 100%)',
                            border: '1px solid rgba(99,102,241,0.25)',
                            boxShadow: '0 0 60px rgba(99,102,241,0.12), 0 25px 50px rgba(0,0,0,0.7)'
                        }}>

                        {/* Glow top bar */}
                        <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-3xl"
                            style={{ background: 'linear-gradient(90deg, transparent, #6366F1, #22D3EE, transparent)' }} />

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1E2D4A]/60 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-[#6366F1]/15 border border-[#6366F1]/30">
                                    <ClipboardCheck size={20} className="text-[#6366F1]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base tracking-tight">
                                        {form.id ? 'Editar Inspeção' : 'Nova Inspeção / Checklist'}
                                    </h3>
                                    <p className="text-xs text-[#64748B] mt-0.5">Preencha todas as informações do recebimento</p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)}
                                className="p-2 rounded-xl bg-[#131D35] border border-[#1E2D4A] text-[#64748B] hover:text-white hover:border-[#2A3F60] transition-all">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
                            {modalError && (
                                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-xl">
                                    <AlertTriangle size={16} className="shrink-0" /> {modalError}
                                </div>
                            )}

                            {/* Fields row 1 */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField label="Equipamento *">
                                    <input list="eq-list" required placeholder="Token ou nome do equipamento"
                                        className={inputCls} value={form.equipamento}
                                        onChange={e => setForm({ ...form, equipamento: e.target.value })} />
                                    <datalist id="eq-list">
                                        {equipamentosOptions.map((e, i) => (
                                            <option key={i} value={`${e.token} - ${e.nome}`} />
                                        ))}
                                    </datalist>
                                </FormField>
                                <FormField label="Cliente / Destino">
                                    <input list="cl-list" placeholder="Empresa ou pessoa"
                                        className={inputCls} value={form.cliente}
                                        onChange={e => setForm({ ...form, cliente: e.target.value })} />
                                    <datalist id="cl-list">
                                        {clientesOptions.map((c, i) => (
                                            <option key={i} value={c.nome} />
                                        ))}
                                    </datalist>
                                </FormField>
                            </div>

                            <FormField label="Data da Inspeção">
                                <input type="date" className={`${inputCls} font-mono w-48`} value={form.data}
                                    onChange={e => setForm({ ...form, data: e.target.value })} />
                            </FormField>

                            {/* Checklist cards */}
                            <div>
                                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-3 pl-1">
                                    Checklist de Condição
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <CheckCard icon={Banknote} label="Pago" checked={form.pago}
                                        colorClass="bg-emerald-500/10 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/15"
                                        onChange={e => setForm({ ...form, pago: e.target.checked })} />
                                    <CheckCard icon={Droplets} label="Limpo" checked={form.limpo}
                                        colorClass="bg-blue-500/10 border-blue-500/50 text-blue-400 hover:bg-blue-500/15"
                                        onChange={e => setForm({ ...form, limpo: e.target.checked })} />
                                    <CheckCard icon={Fuel} label="Abastecido" checked={form.abastecido}
                                        colorClass="bg-purple-500/10 border-purple-500/50 text-purple-400 hover:bg-purple-500/15"
                                        onChange={e => setForm({ ...form, abastecido: e.target.checked })} />
                                    <CheckCard icon={AlertTriangle} label="Com Avaria" checked={form.comAvaria}
                                        colorClass="bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/15"
                                        onChange={e => setForm({ ...form, comAvaria: e.target.checked })} />
                                </div>
                            </div>

                            {/* Conditional damage field */}
                            {form.comAvaria && (
                                <div className="animate-fade-in rounded-2xl border border-red-500/25 bg-red-500/5 p-4">
                                    <FormField label="⚠ Descreva a Avaria">
                                        <input type="text" required placeholder="Ex: Risco na porta traseira direita, farol trincado..."
                                            className={`${inputCls} border-red-500/30 focus:border-red-500`}
                                            value={form.qualAvaria}
                                            onChange={e => setForm({ ...form, qualAvaria: e.target.value })} />
                                    </FormField>
                                </div>
                            )}

                            {/* Map */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <MapPin size={14} className="text-[#6366F1]" />
                                    <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">
                                        Local da Entrega — Clique no mapa para marcar o ponto
                                    </p>
                                </div>
                                <div className="rounded-2xl overflow-hidden border border-[#1E2D4A]"
                                    style={{ height: 220, position: 'relative' }}>
                                    <InspectionMap
                                        position={form.location}
                                        setPosition={(ll) => setForm(f => ({ ...f, location: { lat: ll.lat, lng: ll.lng } }))}
                                    />
                                </div>
                                {form.location && (
                                    <p className="text-[10px] text-[#64748B] font-mono mt-1 pl-1">
                                        📍 {form.location.lat.toFixed(5)}, {form.location.lng.toFixed(5)}
                                    </p>
                                )}
                            </div>

                            {/* Observations */}
                            <FormField label="Observações (Opcional)">
                                <textarea rows="2" placeholder="Notas adicionais sobre a inspeção..."
                                    className={`${inputCls} resize-none`} value={form.obs}
                                    onChange={e => setForm({ ...form, obs: e.target.value })} />
                            </FormField>
                        </form>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-[#1E2D4A]/60 flex justify-end gap-3 shrink-0 bg-[#080E1C]">
                            <button type="button" onClick={() => setShowModal(false)}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#64748B] hover:text-white hover:bg-[#131D35] transition-all">
                                Cancelar
                            </button>
                            <button onClick={handleSave}
                                className="btn-premium px-6 py-2.5 text-sm">
                                {form.id ? 'Salvar Inspeção' : '+ Registrar Inspeção'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── PAGE ───────────────────────────────────────────── */}
            <div className="flex flex-col gap-5 animate-fade-in relative z-0">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                            <ClipboardCheck size={22} className="text-[#6366F1]" />
                            Controle de Entregas e Devoluções
                        </h2>
                        <p className="text-xs mt-1 text-[#64748B]">
                            {checklists.length} inspeções registradas
                        </p>
                    </div>
                    <button className="btn-premium text-xs gap-2" onClick={openNew}>
                        <Plus size={15} /> Nova Inspeção
                    </button>
                </div>

                {/* Table card */}
                <div className="card flex flex-col overflow-hidden" style={{ minHeight: 300 }}>
                    {/* Toolbar */}
                    <div className="px-4 py-3 flex items-center justify-between gap-3 bg-[#0D1526] border-b border-[#1E2D4A] flex-wrap">
                        <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Buscar..."
                                className="input-base pl-9 h-9 text-xs w-full" />
                            {search && (
                                <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setSearch('')}>
                                    <X size={12} className="text-[#64748B]" />
                                </button>
                            )}
                        </div>
                        <span className="text-[11px] font-mono text-[#64748B]">
                            {filtered.length} / {checklists.length}
                        </span>
                    </div>

                    {/* Content */}
                    <div className="overflow-x-auto overflow-y-auto flex-1">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <div className="w-8 h-8 rounded-full border-2 animate-spin"
                                    style={{ borderColor: '#6366F1', borderTopColor: 'transparent' }} />
                                <p className="text-xs font-mono text-[#64748B]">Carregando...</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="p-5 rounded-2xl bg-[#131D35] border border-[#1E2D4A]">
                                    <ClipboardCheck size={36} className="text-[#334155]" />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-white">Nenhuma inspeção</p>
                                    <p className="text-xs mt-1 text-[#64748B]">
                                        {search ? 'Tente outro termo.' : 'Registre seu primeiro checklist de entrega.'}
                                    </p>
                                </div>
                                {!search && (
                                    <button className="btn-premium text-sm" onClick={openNew}>
                                        <Plus size={15} /> Primeira Inspeção
                                    </button>
                                )}
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse text-sm min-w-[800px]">
                                <thead className="sticky top-0 z-10 text-[11px] font-mono uppercase tracking-wider text-[#64748B]"
                                    style={{ background: '#070B14', borderBottom: '1px solid #1E2D4A' }}>
                                    <tr>
                                        <th className="px-6 py-3 font-normal w-[120px]">Data</th>
                                        <th className="px-6 py-3 font-normal">Equip. / Cliente</th>
                                        <th className="px-6 py-3 font-normal w-[180px]">Checklist</th>
                                        <th className="px-6 py-3 font-normal w-[200px]">Condição</th>
                                        <th className="px-6 py-3 font-normal text-right w-[160px]">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(item => (
                                        <tr key={item.id}
                                            className="border-b border-[#1E2D4A]/40 last:border-0 hover:bg-[#131D35]/60 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs text-white bg-[#131D35] border border-[#1E2D4A] px-2.5 py-1 rounded-lg">
                                                    {item.data?.split('-').reverse().join('/') || '—'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-white text-sm flex items-center gap-1.5">
                                                    <Box size={13} className="text-[#6366F1]" /> {item.equipamento}
                                                </p>
                                                <p className="text-[11px] text-[#64748B] mt-0.5 flex items-center gap-1">
                                                    <User size={11} /> {item.cliente || 'S/ cliente'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-1.5 flex-wrap">
                                                    {item.pago       && <Badge colorClass="bg-emerald-500/15 text-emerald-400">Pago</Badge>}
                                                    {item.limpo      && <Badge colorClass="bg-blue-500/15 text-blue-400">Limpo</Badge>}
                                                    {item.abastecido && <Badge colorClass="bg-purple-500/15 text-purple-400">Cheio</Badge>}
                                                    {!item.pago && !item.limpo && !item.abastecido &&
                                                        <span className="text-[#334155] text-xs italic">—</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.comAvaria ? (
                                                    <div>
                                                        <span className="flex items-center gap-1.5 text-red-400 text-xs font-bold">
                                                            <AlertTriangle size={12}/> Com Avaria
                                                        </span>
                                                        <p className="text-[10px] text-[#64748B] mt-0.5 max-w-[180px] truncate"
                                                            title={item.qualAvaria}>{item.qualAvaria}</p>
                                                    </div>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                                                        <CheckSquare size={12}/> OK / Sem Avarias
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-1.5">
                                                    {item.obs && (
                                                        <button className="p-2 rounded-xl text-[#6366F1] bg-[#6366F1]/10 border border-[#6366F1]/20 hover:bg-[#6366F1]/20 transition-all"
                                                            title={item.obs}>
                                                            <FileText size={15} />
                                                        </button>
                                                    )}
                                                    {item.location && (
                                                        <button className="p-2 rounded-xl text-[#22D3EE] bg-[#22D3EE]/10 border border-[#22D3EE]/20 hover:bg-[#22D3EE]/20 transition-all"
                                                            title={`📍 ${item.location.lat?.toFixed(4)}, ${item.location.lng?.toFixed(4)}`}>
                                                            <MapPin size={15} />
                                                        </button>
                                                    )}
                                                    <button className="p-2 rounded-xl text-[#64748B] bg-[#131D35] border border-[#1E2D4A] hover:text-white hover:border-[#2A3F60] transition-all"
                                                        onClick={() => openEdit(item)}>
                                                        <Edit2 size={15} />
                                                    </button>
                                                    <button className="p-2 rounded-xl text-[#64748B] bg-[#131D35] border border-[#1E2D4A] hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all"
                                                        onClick={() => handleDelete(item.id)}>
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
