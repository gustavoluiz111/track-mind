const { query } = require('../config/db');

const criarUsuario = async (dados) => {
    const { nome, cpf, telefone, cargo, idade, email, senha_hash, foto_url } = dados;
    const result = await query(
        `INSERT INTO usuarios (nome, cpf, telefone, cargo, idade, email, senha_hash, foto_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, nome, email, cargo, ativo`,
        [nome, cpf, telefone, cargo, idade, email, senha_hash, foto_url]
    );
    return result.rows[0];
};

const buscarUsuarioPorEmail = async (email) => {
    const result = await query(
        `SELECT * FROM usuarios WHERE email = $1`,
        [email]
    );
    return result.rows[0];
};

const buscarUsuarioPorCpf = async (cpf) => {
    const result = await query(
        `SELECT * FROM usuarios WHERE cpf = $1`,
        [cpf]
    );
    return result.rows[0];
};

const buscarUsuarioPorId = async (id) => {
    const result = await query(
        `SELECT id, nome, email, cpf, telefone, cargo, idade, foto_url, ativo, created_at FROM usuarios WHERE id = $1`,
        [id]
    );
    return result.rows[0];
};

module.exports = {
    criarUsuario,
    buscarUsuarioPorEmail,
    buscarUsuarioPorCpf,
    buscarUsuarioPorId
};
