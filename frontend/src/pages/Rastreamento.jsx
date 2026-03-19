import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Battery, Zap, AlertTriangle, Wifi } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { db } from '../config/firebase';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Reset leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
});

// Custom Node Icon using DivIcon for styling
const createCustomIcon = (status) => {
    const color = status === 'alerta' ? '#EF4444' : '#3B82F6';
    return L.divIcon({
        className: 'custom-map-marker',
        html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px ${color};"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
};

// Component to dynamically center map to all markers
const FitBounds = ({ markers }) => {
    const map = useMap();
    useEffect(() => {
        if (markers.length > 0) {
            const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
    }, [markers, map]);
    return null;
};

export default function Rastreamento() {
    const [equipamentos, setEquipamentos] = useState([]);
    const [selected, setSelected] = useState(null);
    const [wsStatus, setWsStatus] = useState('Desconectado');

    useEffect(() => {
        setWsStatus('Conectado');
        
        const recordsRef = ref(db, 'rastreamento');
        const unsubscribe = onValue(recordsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const formatted = Object.keys(data).map(key => {
                    const pos = data[key];
                    return {
                        id: key,
                        token: pos.device_id || `Unregistered-${key}`,
                        nome: pos.item_nome || 'Desconhecido',
                        lat: parseFloat(pos.lat),
                        lng: parseFloat(pos.lng),
                        bateria: pos.battery,
                        velocidade: pos.speed,
                        status: 'online',
                        ultimaAtt: new Date(pos.timestamp || Date.now()).toLocaleTimeString()
                    };
                });
                setEquipamentos(formatted);
            } else {
                setEquipamentos([]);
            }
        }, (error) => {
            console.error('Firebase snapshot error:', error);
            setWsStatus('Erro');
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] gap-6 animate-fade-in relative z-0">
            <div className="flex justify-between items-center sm:flex-row flex-col gap-4">
                <div>
                    <h2 className="text-2xl font-bold font-mono tracking-tight">Rastreamento Global</h2>
                    <p className="text-muted text-sm mt-1">Conectado a {equipamentos.length} hardwares em campo.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-surface border border-border px-3 py-1.5 rounded-full text-xs font-mono">
                        <span className={`w-2 h-2 rounded-full ${wsStatus === 'Conectado' ? 'bg-success animate-pulse' : 'bg-danger'}`}></span>
                        <span className="text-muted">WebSocket:</span>
                        <span className={wsStatus === 'Conectado' ? 'text-success font-bold' : 'text-danger font-bold'}>{wsStatus}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-surface border border-border rounded-xl shadow-glow overflow-hidden relative z-0 flex">
                {/* LEAFLET CONTAINER */}
                <div className="flex-1 h-full z-0">
                    <MapContainer center={[-8.0522, -34.9286]} zoom={12} className="h-full w-full custom-map-filter">
                        <TileLayer
                            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                        {equipamentos.map(eq => (
                            <Marker
                                key={eq.id}
                                position={[eq.lat, eq.lng]}
                                icon={createCustomIcon(eq.status)}
                                eventHandlers={{ click: () => setSelected(eq) }}
                            >
                                <Popup className="custom-popup border-none bg-transparent">
                                    <div className="bg-surface border border-border p-4 rounded-lg shadow-2xl min-w-[200px]">
                                        <h3 className="font-mono font-bold text-accent text-lg">{eq.token}</h3>
                                        <p className="text-muted text-xs mb-3">{eq.nome}</p>

                                        <div className="grid grid-cols-2 gap-2 text-sm text-primary">
                                            <div className="flex items-center gap-2"><Battery size={14} className="text-success" /> {eq.bateria}%</div>
                                            <div className="flex items-center gap-2"><Navigation size={14} className="text-accent" /> {eq.velocidade} km/h</div>
                                            <div className="flex items-center gap-2 col-span-2 text-xs text-muted mt-2 border-t border-border pt-2">
                                                <Zap size={12} /> {eq.ultimaAtt}
                                            </div>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                        {equipamentos.length > 0 && <FitBounds markers={equipamentos} />}
                    </MapContainer>
                </div>

                {/* FLOATING LIST / OVERLAY LIST (optional side panel inside) */}
                <div className="w-[320px] bg-bg-base/90 backdrop-blur border-l border-border hidden lg:flex flex-col z-[400] h-full absolute right-0 top-0">
                    <div className="p-4 border-b border-border flex justify-between items-center bg-surface/50">
                        <h3 className="font-mono text-sm tracking-widest text-muted">LISTA DE FROTA</h3>
                        <span className="text-xs font-bold bg-elevated px-2 py-1 rounded text-primary">{equipamentos.length} UNI</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                        {equipamentos.map(eq => (
                            <div
                                key={eq.id}
                                onClick={() => setSelected(eq)}
                                className={`p-4 rounded-xl border transition-all cursor-pointer ${selected?.id === eq.id ? 'border-accent bg-accent/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-border bg-surface hover:border-accent/50'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-mono font-bold text-white text-sm">{eq.token}</span>
                                    <span className="flex items-center gap-1 text-[10px] text-success bg-success/20 px-2 py-0.5 rounded-full"><Wifi size={10} /> ON</span>
                                </div>
                                <div className="grid grid-cols-2 gap-1 text-xs text-muted font-mono mt-3 pt-3 border-t border-border/50">
                                    <div>Vel: {eq.velocidade} km/h</div>
                                    <div>Bat: {eq.bateria}%</div>
                                    <div className="col-span-2 pt-1">Ping: {eq.ultimaAtt}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
