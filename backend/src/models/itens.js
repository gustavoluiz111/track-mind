const { query } = require('../config/db');

const listarItens = async (filtros) => {
    let q = 'SELECT * FROM itens WHERE 1=1';
    const params = [];

    if (filtros.status) {
        params.push(filtros.status);
        q += ` AND status = $${params.length}`;
    }

    if (filtros.categoria) {
        params.push(filtros.categoria);
        q += ` AND categoria = $${params.length}`;
    }

    if (filtros.busca) {
        params.push(`%${filtros.busca}%`);
        q += ` AND (nome ILIKE $${params.length} OR token ILIKE $${params.length})`;
    }

    q += ' ORDER BY created_at DESC';

    const result = await query(q, params);
    return result.rows;
};

const buscarItemPorId = async (id) => {
    const result = await query('SELECT * FROM itens WHERE id = $1', [id]);
    return result.rows[0];
};

const buscarItemPorToken = async (token) => {
    const result = await query('SELECT * FROM itens WHERE token = $1', [token]);
    return result.rows[0];
};

const criarItem = async (dados) => {
    const { token, qrcode_url, nome, categoria, numero_serie, descricao, status, rastreador_id, valor_aquisicao, data_aquisicao, fotos } = dados;

    const result = await query(
        `INSERT INTO itens (token, qrcode_url, nome, categoria, numero_serie, descricao, status, rastreador_id, valor_aquisicao, data_aquisicao, fotos)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [token, qrcode_url, nome, categoria, numero_serie, descricao, status || 'disponivel', rastreador_id, valor_aquisicao, data_aquisicao, JSON.stringify(fotos || [])]
    );

    return result.rows[0];
};

const atualizarItem = async (id, dados) => {
    const { nome, categoria, numero_serie, descricao, rastreador_id, valor_aquisicao, data_aquisicao } = dados;

    const result = await query(
        `UPDATE itens 
     SET nome = COALESCE($1, nome),
         categoria = COALESCE($2, categoria),
         numero_serie = COALESCE($3, numero_serie),
         descricao = COALESCE($4, descricao),
         rastreador_id = COALESCE($5, rastreador_id),
         valor_aquisicao = COALESCE($6, valor_aquisicao),
         data_aquisicao = COALESCE($7, data_aquisicao),
         updated_at = NOW()
     WHERE id = $8 RETURNING *`,
        [nome, categoria, numero_serie, descricao, rastreador_id, valor_aquisicao, data_aquisicao, id]
    );

    return result.rows[0];
};

const alterarStatus = async (id, status) => {
    const result = await query(
        `UPDATE itens SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [status, id]
    );
    return result.rows[0];
};

module.exports = {
    listarItens,
    buscarItemPorId,
    buscarItemPorToken,
    criarItem,
    atualizarItem,
    alterarStatus
};
