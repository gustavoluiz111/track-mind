const Joi = require('joi');
const path = require('path');
const itensModel = require('../models/itens');
const tokenService = require('../services/token');
const qrcodeService = require('../services/qrcode');

const listar = async (req, res, next) => {
    try {
        const { status, categoria, busca } = req.query;
        const itens = await itensModel.listarItens({ status, categoria, busca });
        res.json({ success: true, data: itens });
    } catch (err) {
        next(err);
    }
};

const buscarPorId = async (req, res, next) => {
    try {
        const { id } = req.params;
        const item = await itensModel.buscarItemPorId(id);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item não encontrado' });
        }
        res.json({ success: true, data: item });
    } catch (err) {
        next(err);
    }
};

const buscarPorToken = async (req, res, next) => {
    try {
        const { token } = req.params;
        const item = await itensModel.buscarItemPorToken(token);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item não encontrado' });
        }
        res.json({ success: true, data: item });
    } catch (err) {
        next(err);
    }
};

const criarSchema = Joi.object({
    nome: Joi.string().max(200).required(),
    categoria: Joi.string().max(100).required(),
    numero_serie: Joi.string().max(100).optional(),
    descricao: Joi.string().allow('').optional(),
    rastreador_id: Joi.string().max(100).optional(),
    valor_aquisicao: Joi.number().precision(2).optional(),
    data_aquisicao: Joi.date().iso().optional()
});

const criar = async (req, res, next) => {
    try {
        const { error, value } = criarSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const token = await tokenService.generateUniqueToken();
        const qrcode_url = await qrcodeService.generateQRCode(token);

        const novoItem = await itensModel.criarItem({
            ...value,
            token,
            qrcode_url,
            fotos: [] // fotos podem ser adicionadas depois via upload
        });

        res.status(201).json({
            success: true,
            message: 'Item criado com sucesso',
            data: novoItem
        });
    } catch (err) {
        next(err);
    }
};

const atualizarSchema = Joi.object({
    nome: Joi.string().max(200).optional(),
    categoria: Joi.string().max(100).optional(),
    numero_serie: Joi.string().max(100).optional(),
    descricao: Joi.string().allow('').optional(),
    rastreador_id: Joi.string().max(100).optional(),
    valor_aquisicao: Joi.number().precision(2).optional(),
    data_aquisicao: Joi.date().iso().optional()
});

const atualizar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { error, value } = atualizarSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const item = await itensModel.buscarItemPorId(id);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item não encontrado' });
        }

        const itemAtualizado = await itensModel.atualizarItem(id, value);
        res.json({ success: true, message: 'Item atualizado com sucesso', data: itemAtualizado });
    } catch (err) {
        next(err);
    }
};

const statusSchema = Joi.object({
    status: Joi.string().valid('disponivel', 'alugado', 'manutencao', 'inativo').required()
});

const alterarStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { error, value } = statusSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const item = await itensModel.buscarItemPorId(id);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item não encontrado' });
        }

        const itemAtualizado = await itensModel.alterarStatus(id, value.status);
        res.json({ success: true, message: 'Status do item atualizado', data: itemAtualizado });
    } catch (err) {
        next(err);
    }
};

const obterQRCode = async (req, res, next) => {
    try {
        const { id } = req.params;
        const item = await itensModel.buscarItemPorId(id);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item não encontrado' });
        }
        if (!item.qrcode_url) {
            return res.status(404).json({ success: false, message: 'QR Code não gerado para este item' });
        }

        const filename = path.basename(item.qrcode_url);
        const filepath = path.join(__dirname, '../../uploads/qrcodes', filename);

        res.sendFile(filepath);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    listar,
    buscarPorId,
    buscarPorToken,
    criar,
    atualizar,
    alterarStatus,
    obterQRCode
};
