const { WebSocketServer } = require('ws');

let wss;

const initWebSocketServer = (server) => {
    wss = new WebSocketServer({ server, path: '/ws' });

    wss.on('connection', (ws) => {
        console.log('Novo cliente conectado no WebSocket');

        ws.on('message', (message) => {
            // Por padrão a API é read-only no WS (recebe envios passivos)
            console.log('Mensagem recebida do cliente:', message.toString());
        });

        ws.on('close', () => {
            console.log('Cliente WS desconectado');
        });
    });

    return wss;
};

// Envia atualização de GPS para todos os clientes conectados
const broadcastPosition = (positionData) => {
    if (!wss) return;

    const payload = JSON.stringify({
        type: 'position_update',
        data: positionData
    });

    wss.clients.forEach((client) => {
        if (client.readyState === 1 /* WebSocket.OPEN */) {
            client.send(payload);
        }
    });
};

// Envia alerta para todos os clientes conectados
const broadcastAlert = (alertData) => {
    if (!wss) return;

    const payload = JSON.stringify({
        type: 'new_alert',
        data: alertData
    });

    wss.clients.forEach((client) => {
        if (client.readyState === 1) {
            client.send(payload);
        }
    });
};

module.exports = {
    initWebSocketServer,
    broadcastPosition,
    broadcastAlert
};
