import React, { useState, useEffect, useRef } from 'react';
import { ref, set, get, child } from 'firebase/database';
import { db } from '../config/firebase';

export default function SimuladorGPS() {
    const [urlWebhook, setUrlWebhook] = useState('http://localhost:3000/api/v1/rastreamento/webhook');
    const [dispositivos, setDispositivos] = useState([]);
    
    // Lista de itens do Firebase para seleção
    const [itensDb, setItensDb] = useState([]);

    // Form add new
    const [selectedItemToken, setSelectedItemToken] = useState('');
    const [newLat, setNewLat] = useState(-8.0522);
    const [newLng, setNewLng] = useState(-34.9286);
    const [intervaloS, setIntervaloS] = useState(10);

    const [logs, setLogs] = useState([]);
    const timers = useRef({});

    useEffect(() => {
        const fetchItens = async () => {
            try {
                const snapshot = await get(child(ref(db), 'itens'));
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                    setItensDb(list);
                    if (list.length > 0) setSelectedItemToken(list[0].token);
                }
            } catch (error) {
                console.error("Erro ao buscar itens para simulador:", error);
            }
        };
        fetchItens();
    }, []);

    const addLog = (tipo, msg, details) => {
        setLogs(prev => [{ id: Date.now(), time: new Date().toLocaleTimeString(), tipo, msg, details }, ...prev].slice(0, 100));
    };

    const enviarPosicao = async (dev) => {
        const payload = {
            device_id: dev.token,
            lat: dev.lat,
            lng: dev.lng,
            battery: dev.bateria,
            speed: dev.velocidade,
            signal: '4G',
            timestamp: new Date().toISOString(),
            item_nome: dev.nome || `Dispositivo ${dev.token}`
        };

        try {
            await set(ref(db, `rastreamento/${dev.token}`), payload);
            addLog('success', `Enviado ${dev.token}`, `Status OK - Firebase RTDB`);
            setDispositivos(prev => prev.map(d => d.id === dev.id ? { ...d, envios: d.envios + 1 } : d));
        } catch (err) {
            addLog('error', `Falha ${dev.token}`, err.message);
        }
    };

    const driftPosition = (lat, lng) => {
        const latDrift = (Math.random() - 0.5) * 0.0005;
        const lngDrift = (Math.random() - 0.5) * 0.0005;
        return { nLat: parseFloat((lat + latDrift).toFixed(6)), nLng: parseFloat((lng + lngDrift).toFixed(6)) };
    };

    const fetchRoute = async (startLat, startLng) => {
        const destLat = startLat + (Math.random() - 0.5) * 0.04;
        const destLng = startLng + (Math.random() - 0.5) * 0.04;
        try {
            const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson`);
            const data = await res.json();
            if (data.routes && data.routes.length > 0) {
                return data.routes[0].geometry.coordinates; // array of [lng, lat]
            }
        } catch(e) {
            console.error("OSRM erro", e);
        }
        return null; // fallback
    };

    const toggleDevice = async (id) => {
        const targetDev = dispositivos.find(d => d.id === id);
        if (!targetDev) return;

        const novoStatus = !targetDev.ativo;

        if (novoStatus) {
            addLog('info', `Inicializando rota ${targetDev.token}...`, 'Bucando API OSRM');
            let routeCoords = targetDev.route;
            if (!routeCoords) {
                routeCoords = await fetchRoute(targetDev.lat, targetDev.lng);
            }

            setDispositivos(prev => prev.map(d => d.id === id ? { 
                ...d, 
                ativo: true, 
                route: routeCoords, 
                routeIndex: d.routeIndex || 0,
                forward: d.forward !== undefined ? d.forward : true 
            } : d));

            timers.current[id] = setInterval(() => {
                setDispositivos(current => {
                    const deviceAtualizado = current.find(x => x.id === id);
                    if (!deviceAtualizado || !deviceAtualizado.ativo) {
                        clearInterval(timers.current[id]);
                        return current;
                    }

                    let nLat = deviceAtualizado.lat;
                    let nLng = deviceAtualizado.lng;
                    let nIndex = deviceAtualizado.routeIndex;
                    let nForward = deviceAtualizado.forward;

                    if (deviceAtualizado.route && deviceAtualizado.route.length > 0) {
                        nIndex = nForward ? nIndex + 1 : nIndex - 1;
                        if (nIndex >= deviceAtualizado.route.length) {
                            nForward = false;
                            nIndex = deviceAtualizado.route.length - 2;
                        } else if (nIndex < 0) {
                            nForward = true;
                            nIndex = 1;
                        }
                        if (nIndex < 0) nIndex = 0;
                        const pt = deviceAtualizado.route[nIndex];
                        nLng = pt[0];
                        nLat = pt[1];
                    } else {
                        const drift = driftPosition(deviceAtualizado.lat, deviceAtualizado.lng);
                        nLat = drift.nLat; nLng = drift.nLng;
                    }

                    const bateriaNova = Math.max(1, deviceAtualizado.bateria - 1);
                    const atualizado = { ...deviceAtualizado, lat: nLat, lng: nLng, bateria: bateriaNova, routeIndex: nIndex, forward: nForward };

                    enviarPosicao(atualizado);
                    return current.map(x => x.id === id ? atualizado : x);
                });
            }, intervaloS * 1000);
            addLog('success', `Iniciado ${targetDev.token}`, routeCoords ? 'Rota Ativada' : 'Sem rota, usando drift');
        } else {
            clearInterval(timers.current[id]);
            setDispositivos(prev => prev.map(d => d.id === id ? { ...d, ativo: false } : d));
            addLog('warning', `Pausado ${targetDev.token}`, '');
        }
    };

    const addDevice = () => {
        if (!selectedItemToken) return alert('Selecione ou informe o token do dispositivo');
        
        // Verifica se já existe na lista
        if (dispositivos.find(d => d.token === selectedItemToken)) {
            return alert('Este dispositivo já está na fila de simulação.');
        }

        const itemDb = itensDb.find(i => i.token === selectedItemToken);
        
        const newDev = {
            id: Date.now().toString(),
            token: selectedItemToken,
            nome: itemDb ? itemDb.nome : `Dispositivo ${selectedItemToken}`,
            lat: newLat,
            lng: newLng,
            bateria: 100,
            velocidade: Math.floor(Math.random() * 60) + 10,
            envios: 0,
            ativo: false
        };
        setDispositivos(prev => [...prev, newDev]);
    };

    const removeDevice = (id) => {
        clearInterval(timers.current[id]);
        setDispositivos(prev => prev.filter(d => d.id !== id));
    };

    const gerarScriptExportacao = () => {
        const scriptStr = `
const fetch = require('node-fetch');

const URL = "${urlWebhook}";
const TIME = ${intervaloS * 1000};
let devices = ${JSON.stringify(dispositivos.map(d => ({ token: d.token, lat: d.lat, lng: d.lng, bateria: d.bateria, vel: d.velocidade })))};

setInterval(async () => {
  for(let i=0; i<devices.length; i++) {
    let dev = devices[i];
    dev.lat += (Math.random() - 0.5) * 0.0005;
    dev.lng += (Math.random() - 0.5) * 0.0005;
    if(dev.bateria > 1) dev.bateria--;

    const payload = { device_id: dev.token, lat: dev.lat, lng: dev.lng, battery: dev.bateria, speed: dev.vel, signal: '4G', timestamp: new Date().toISOString() };
    
    try {
      const res = await fetch(URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      console.log('[' + new Date().toISOString() + '] ' + dev.token + ' -> ' + res.status);
    } catch(e) {
      console.error('Erro ' + dev.token + ':', e.message);
    }
  }
}, TIME);

console.log('Simulador Multi-Dispositivos iniciado (' + devices.length + ' instâncias)...');
    `;

        const blob = new Blob([scriptStr], { type: 'text/javascript' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `simulador-multi.js`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Cleanup timers
    useEffect(() => {
        return () => {
            Object.values(timers.current).forEach(t => clearInterval(t));
        };
    }, []);

    return (
        <div className="flex flex-col h-full gap-4 md:gap-6 animate-fade-in relative z-0">
            <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                <h2 className="text-xl md:text-2xl font-bold font-mono text-accent text-shadow-glow">🛰 Simulador GPS</h2>
                <span className="px-3 py-1 bg-warning/20 text-warning text-[10px] font-bold rounded-full animate-pulse uppercase tracking-wider">
                    Modo Teste
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                {/* PAINEL ESQUERDO */}
                <div className="flex flex-col gap-4 md:gap-6">
                    {/* Add Device */}
                    <div className="bg-surface border border-border rounded-xl p-4 md:p-6 flex flex-col gap-4 box-shadow-glow">
                        <h3 className="font-mono text-accent text-sm">Configuração Global</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm text-muted mb-1">URL Webhook Base</label>
                                <input type="text" value={urlWebhook} onChange={e => setUrlWebhook(e.target.value)}
                                    className="w-full bg-elevated border border-border p-2 rounded focus:border-accent text-sm text-primary" />
                            </div>

                            <div>
                                <label className="block text-sm text-muted mb-1">Intervalo Global (s)</label>
                                <input type="range" min="3" max="120" value={intervaloS} onChange={e => setIntervaloS(parseInt(e.target.value))}
                                    className="w-full accent-accent" />
                                <div className="text-right text-xs text-muted">{intervaloS}s</div>
                            </div>

                            <div>
                                <label className="block text-sm text-muted mb-1">Equipamento a Simular</label>
                                <select 
                                    value={selectedItemToken} 
                                    onChange={e => setSelectedItemToken(e.target.value)}
                                    className="w-full bg-elevated border border-border p-2 rounded focus:border-accent font-mono text-sm uppercase text-primary"
                                >
                                    {itensDb.map(i => (
                                        <option key={i.id} value={i.token}>{i.token} - {i.nome}</option>
                                    ))}
                                    {itensDb.length === 0 && <option value="">Nenhum equipamento cadastrado</option>}
                                </select>
                            </div>
                        </div>

                        <button onClick={addDevice} className="w-full bg-accent/20 border border-accent text-accent py-2 rounded font-bold hover:bg-accent hover:text-white transition-all mt-2">
                            + Adicionar Dispositivo
                        </button>
                        <button onClick={gerarScriptExportacao} className="w-full bg-elevated border border-border text-primary py-2 rounded font-mono hover:border-accent transition-all text-sm">
                            [Exportar Script Node.js Multi-Instância]
                        </button>
                    </div>

                    {/* Device List */}
                    <div className="bg-surface border border-border rounded-xl flex-1 flex flex-col overflow-hidden min-h-[300px]">
                        <div className="p-4 border-b border-border bg-elevated">
                            <h3 className="font-mono text-muted">Dispositivos em Fila ({dispositivos.length})</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {dispositivos.length === 0 && <div className="text-muted text-center text-sm py-10">Nenhum dispositivo adicionado.</div>}
                            {dispositivos.map(d => (
                                <div key={d.id} className={`p-3 rounded border ${d.ativo ? 'bg-success/5 border-success/30' : 'bg-elevated border-border'}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-mono font-bold text-lg text-primary">{d.token}</span>
                                        <span className={`px-2 py-0.5 rounded text-xs ${d.ativo ? 'bg-success text-white' : 'bg-muted text-white'}`}>
                                            {d.ativo ? 'RODANDO' : 'PAUSADO'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-muted font-mono mb-3">
                                        <div>Lat: {d.lat}</div>
                                        <div>Lng: {d.lng}</div>
                                        <div>Bat: {d.bateria}%</div>
                                        <div>Envios: {d.envios}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => toggleDevice(d.id)} className={`flex-1 py-1 rounded border transition-colors ${d.ativo ? 'border-danger text-danger hover:bg-danger/10' : 'border-success text-success hover:bg-success/10'}`}>
                                            {d.ativo ? 'Pausar' : 'Iniciar'}
                                        </button>
                                        <button onClick={() => removeDevice(d.id)} className="px-3 py-1 rounded border border-border hover:bg-danger/20 hover:text-danger hover:border-danger/50 text-muted transition-colors">
                                            Remover
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div >

                {/* PAINEL DIREITO: LOGS */}
                < div className="bg-surface border border-border rounded-xl flex flex-col overflow-hidden" >
                    <div className="p-4 border-b border-border flex justify-between items-center bg-elevated">
                        <h3 className="font-mono text-muted">Network Log ({logs.length})</h3>
                        <button onClick={() => setLogs([])} className="text-xs px-2 py-1 rounded border border-border text-muted hover:text-white">LIMPAR</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
                        {logs.length === 0 && <div className="text-muted text-center mt-10">Aguardando eventos...</div>}

                        {logs.map(log => (
                            <div key={log.id} className="border-l-2 pl-3 py-1 border-b border-border/50 pb-2"
                                style={{ borderColor: log.tipo === 'success' ? 'var(--success)' : log.tipo === 'error' ? 'var(--danger)' : log.tipo === 'warning' ? 'var(--warning)' : 'var(--accent)' }}>
                                <div className="flex gap-2 text-muted mb-1">
                                    <span className="opacity-50">[{log.time}]</span>
                                    <span className={log.tipo === 'success' ? 'text-success' : log.tipo === 'error' ? 'text-danger' : 'text-accent'}>{log.msg}</span>
                                </div>
                                <div className="text-primary truncate opacity-80 pl-2">{log.details}</div>
                            </div>
                        ))}
                    </div>
                </div >
            </div >
        </div >
    );
}
