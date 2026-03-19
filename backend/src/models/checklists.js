const { query } = require('../config/db');

const criarChecklist = async (dados) => {
    const { item_id, contrato_id, tipo, usuario_id, respostas, fotos, observacoes } = dados;

    const result = await query(
        `INSERT INTO checklists (item_id, contrato_id, tipo, usuario_id, respostas, fotos, observacoes)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [item_id, contrato_id, tipo, usuario_id, JSON.stringify(respostas || {}), JSON.stringify(fotos || []), observacoes]
    );
    return result.rows[0];
};

const buscarChecklistPorId = async (id) => {
    const result = await query(`
    SELECT c.*, 
           i.nome as item_nome, i.token as item_token, i.categoria as item_categoria, i.numero_serie as item_serie,
           u.nome as usuario_nome
    FROM checklists c
    JOIN itens i ON c.item_id = i.id
    JOIN usuarios u ON c.usuario_id = u.id
    WHERE c.id = $1
  `, [id]);
    return result.rows[0];
};

const buscarChecklistsPorItem = async (item_id) => {
    const result = await query(
        `SELECT c.*, u.nome as usuario_nome 
     FROM checklists c 
     JOIN usuarios u ON c.usuario_id = u.id
     WHERE c.item_id = $1 
     ORDER BY c.criado_em DESC`,
        [item_id]
    );
    return result.rows;
};

const buscarPorContratoItem = async (contrato_id, item_id) => {
    const result = await query(
        `SELECT c.*, u.nome as usuario_nome 
     FROM checklists c 
     JOIN usuarios u ON c.usuario_id = u.id
     WHERE c.contrato_id = $1 AND c.item_id = $2
     ORDER BY c.criado_em ASC`,
        [contrato_id, item_id]
    );
    return result.rows;
};

const atualizarAssinatura = async (id, assinatura_url) => {
    const result = await query(
        `UPDATE checklists SET assinatura_url = $1 WHERE id = $2 RETURNING *`,
        [assinatura_url, id]
    );
    return result.rows[0];
};

const atualizarLaudoPdf = async (id, laudo_pdf_url) => {
    const result = await query(
        `UPDATE checklists SET laudo_pdf_url = $1 WHERE id = $2 RETURNING *`,
        [laudo_pdf_url, id]
    );
    return result.rows[0];
};

const adicionarFotos = async (id, fotos) => {
    const result = await query(
        `UPDATE checklists SET fotos = $1 WHERE id = $2 RETURNING *`,
        [JSON.stringify(fotos), id]
    );
    return result.rows[0];
};

module.exports = {
    criarChecklist,
    buscarChecklistPorId,
    buscarChecklistsPorItem,
    buscarPorContratoItem,
    atualizarAssinatura,
    atualizarLaudoPdf,
    adicionarFotos
};
