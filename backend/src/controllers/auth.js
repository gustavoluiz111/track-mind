const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const usuariosModel = require('../models/usuarios');

const gerarTokens = (usuario) => {
    const payload = { id: usuario.id, email: usuario.email, cargo: usuario.cargo };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    });

    return { accessToken, refreshToken };
};

const cadastroSchema = Joi.object({
    nome: Joi.string().max(200).required(),
    cpf: Joi.string().length(14).required(),
    telefone: Joi.string().max(20).optional(),
    cargo: Joi.string().valid('tecnico', 'gerente', 'administrador', 'outro').required(),
    idade: Joi.number().integer().min(18).optional(),
    email: Joi.string().email().max(200).required(),
    senha: Joi.string().min(8).required(),
    confirmacao_senha: Joi.string().valid(Joi.ref('senha')).required()
});

const cadastro = async (req, res, next) => {
    try {
        const { error, value } = cadastroSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { nome, cpf, telefone, cargo, idade, email, senha } = value;

        // Verifica se email ou CPF já existem
        const usuarioExistenteEmail = await usuariosModel.buscarUsuarioPorEmail(email);
        if (usuarioExistenteEmail) {
            return res.status(400).json({ success: false, message: 'Email já cadastrado' });
        }

        const usuarioExistenteCpf = await usuariosModel.buscarUsuarioPorCpf(cpf);
        if (usuarioExistenteCpf) {
            return res.status(400).json({ success: false, message: 'CPF já cadastrado' });
        }

        const salt = await bcrypt.genSalt(10);
        const senha_hash = await bcrypt.hash(senha, salt);

        const novoUsuario = await usuariosModel.criarUsuario({
            nome, cpf, telefone, cargo, idade, email, senha_hash, foto_url: null
        });

        const tokens = gerarTokens(novoUsuario);

        res.status(201).json({
            success: true,
            message: 'Usuário cadastrado com sucesso',
            data: {
                usuario: novoUsuario,
                tokens
            }
        });

    } catch (err) {
        next(err);
    }
};

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    senha: Joi.string().required()
});

const login = async (req, res, next) => {
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { email, senha } = value;

        const usuario = await usuariosModel.buscarUsuarioPorEmail(email);
        if (!usuario || !usuario.ativo) {
            return res.status(401).json({ success: false, message: 'Credenciais inválidas ou conta inativa' });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaValida) {
            return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
        }

        const tokens = gerarTokens(usuario);
        delete usuario.senha_hash;

        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            data: {
                usuario,
                tokens
            }
        });

    } catch (err) {
        next(err);
    }
};

const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ success: false, message: 'Refresh token é obrigatório' });
        }

        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

            const usuario = await usuariosModel.buscarUsuarioPorId(decoded.id);
            if (!usuario || !usuario.ativo) {
                return res.status(401).json({ success: false, message: 'Usuário não encontrado ou inativo' });
            }

            const tokens = gerarTokens(usuario);

            res.json({
                success: true,
                message: 'Token renovado com sucesso',
                data: { tokens }
            });
        } catch (err) {
            return res.status(401).json({ success: false, message: 'Refresh token inválido ou expirado' });
        }
    } catch (err) {
        next(err);
    }
};

const recuperarSenha = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email é obrigatório' });
        }

        const usuario = await usuariosModel.buscarUsuarioPorEmail(email);
        // Para segurança, retornar a mesma mensagem independente se o usuário existe ou não
        res.json({
            success: true,
            message: 'Se o email existir na base, um link de recuperação foi enviado.'
        });
    } catch (err) {
        next(err);
    }
};

const obterPerfil = async (req, res, next) => {
    try {
        const usuario = await usuariosModel.buscarUsuarioPorId(req.user.id);
        if (!usuario) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
        }
        res.json({ success: true, data: usuario });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    cadastro,
    login,
    refresh,
    recuperarSenha,
    obterPerfil
};
