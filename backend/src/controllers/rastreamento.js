const { redisClient } = require('../config/redis');
const posicoesModel = require('../models/posicoes');
const itensModel = require('../models/itens');
const { query } = require('../config/db');
const geofenceService = require('../services/geofence');
const wsServer = require('../websocket/server');

const processarWebhook = async (req, res, next) => {
    try {
        const payload = req.body;
        const deviceId = payload.device_id;
        const lat = parseFloat(payload.lat);
        const lng = parseFloat(payload.lng);
        const ts = req.body.timestamp || new Date().toISOString();

        // 1. Procurar item atrelado ao rastreador
        const resItem = await query('SELECT * FROM itens WHERE rastreador_id = $1', [deviceId]);
        const item = resItem.rows[0];

        // Montando objeto final (agregando dados do item)
        const positionData = {
            ...payload,
            item_id: item ? item.id : null,
            item_token: item ? item.token : null,
            item_nome: item ? item.nome : null,
            timestamp: ts
        };

        // 2. Salvar no Redis EX 3600 (1 hora cache rápido)
        const cacheKey = `pos:${deviceId}`;
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(positionData));

        // 3. Salvar no PostgreSQL
        await posicoesModel.salvarPosicaoGps({
            rastreador_id: deviceId,
            item_id: item ? item.id : null,
            latitude: lat,
            longitude: lng,
            bateria: payload.battery || 0,
            velocidade: payload.speed || 0,
            signal: payload.signal || 'N/A',
            timestamp: ts
        });

        // 4. Verificação de Geofencing
        let alertGenerated = null;
        if (item && item.id) {
            // Procurar Contrato Ativo
            const resContrato = await query(
                `SELECT id, geofence, status FROM contratos WHERE item_id = $1 AND status = 'ativo' LIMIT 1`,
                [item.id]
            );
            const contrato = resContrato.rows[0];

            if (contrato && contrato.geofence) {
                // Verifica se a coordenada está dentro da zona definida do contrato
                const inside = geofenceService.isInsideGeofence(lat, lng, contrato.geofence);

                if (!inside) {
                    // Gerar Alerta!
                    alertGenerated = await posicoesModel.registrarAlerta({
                        tipo: 'fora_de_zona',
                        descricao: `Equipamento ${item.token} saiu da geofence configurada.`,
                        item_id: item.id,
                        contrato_id: contrato.id
                    });

                    wsServer.broadcastAlert(alertGenerated);
                }
            }
        }

        // 5. Enviar via WebSocket para o painel em tempo real
        wsServer.broadcastPosition(positionData);

        res.json({ success: true, message: 'Posição processada', alert: alertGenerated });
    } catch (err) {
        next(err);
    }
};

const mapaAoVivo = async (req, res, next) => {
    try {
        // Para simplificar, vamos varrer todas as chaves 'pos:*' no Redis para estado rápido 
        // ou trazer do banco a última posição se cache tiver morrido.
        // Metodologia Híbrida/Backup: Pegamos a last position do PG de todos em campo.
        const ultimasDoBanco = await posicoesModel.buscarPosicaoMaisRecenteGeral();

        // Anexar dados do Item
        const posicoesEnriquecidas = await Promise.all(ultimasDoBanco.map(async (pos) => {
            let item = null;
            if (pos.item_id) {
                item = await itensModel.buscarItemPorId(pos.item_id);
            }
            return {
                ...pos,
                item_token: item ? item.token : null,
                item_nome: item ? item.nome : null,
                item_status: item ? item.status : null
            };
        }));

        res.json({ success: true, data: posicoesEnriquecidas });
    } catch (err) {
        next(err);
    }
};

const posicaoPorToken = async (req, res, next) => {
    try {
        const { token } = req.params;
        const item = await itensModel.buscarItemPorToken(token);

        if (!item) {
            return res.status(404).json({ success: false, message: 'Item não encontrado' });
        }

        if (!item.rastreador_id) {
            return res.status(404).json({ success: false, message: 'Item sem rastreador atrelado' });
        }

        // Tentar Redis primeiro
        const cachedStr = await redisClient.get(`pos:${item.rastreador_id}`);
        if (cachedStr) {
            return res.json({ success: true, source: 'cache', data: JSON.parse(cachedStr) });
        }

        // Fallback DB
        const historico = await posicoesModel.buscarUltimasPosicoesPorItemId(item.id, 1);
        if (historico.length === 0) {
            return res.json({ success: true, data: null, message: 'Nenhuma posição registrada' });
        }

        res.json({ success: true, source: 'db', data: historico[0] });

    } catch (err) {
        next(err);
    }
};

const historicoRastreamento = async (req, res, next) => {
    try {
        const { id } = req.params; // ID do rastreador ou item
        const historico = await posicoesModel.buscarUltimasPosicoesPorItemId(id, 200); // Ex: ultimas posicoes
        res.json({ success: true, data: historico });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    processarWebhook,
    mapaAoVivo,
    posicaoPorToken,
    historicoRastreamento
};
