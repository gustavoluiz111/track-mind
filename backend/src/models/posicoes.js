const { query } = require('../config/db');

const salvarPosicaoGps = async (dados) => {
    const { rastreador_id, item_id, latitude, longitude, bateria, velocidade, signal, timestamp } = dados;
    const result = await query(
        `INSERT INTO posicoes_gps (rastreador_id, item_id, latitude, longitude, bateria, velocidade, signal, timestamp)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [rastreador_id, item_id, latitude, longitude, bateria, velocidade, signal, timestamp || new Date()]
    );
    return result.rows[0];
};

const buscarUltimasPosicoesPorItemId = async (item_id, limit = 30) => {
    const result = await query(
        `SELECT * FROM posicoes_gps WHERE item_id = $1 ORDER BY timestamp DESC LIMIT $2`,
        [item_id, limit]
    );
    return result.rows;
};

const buscarPosicaoMaisRecenteGeral = async () => {
    // Query otimizada usando DISTINCT ON no Postgres para pegar a ultima de cada rastreador
    const result = await query(`
    SELECT DISTINCT ON (rastreador_id) * 
    FROM posicoes_gps 
    ORDER BY rastreador_id, timestamp DESC
  `);
    return result.rows;
};

const registrarAlerta = async (dados) => {
    const { tipo, descricao, item_id, contrato_id } = dados;
    const result = await query(
        `INSERT INTO alertas (tipo, descricao, item_id, contrato_id)
     VALUES ($1, $2, $3, $4) RETURNING *`,
        [tipo, descricao, item_id, contrato_id]
    );
    return result.rows[0];
};

module.exports = {
    salvarPosicaoGps,
    buscarUltimasPosicoesPorItemId,
    buscarPosicaoMaisRecenteGeral,
    registrarAlerta
};
