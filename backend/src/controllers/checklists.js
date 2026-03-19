const Joi = require('joi');
const fs = require('fs');
const path = require('path');
const checklistsModel = require('../models/checklists');
const itensModel = require('../models/itens');
const pdfService = require('../services/pdf');

const criarSchema = Joi.object({
    item_token: Joi.string().required(),
    contrato_id: Joi.string().uuid().allow(null, '').optional(),
    tipo: Joi.string().valid('pre_entrega', 'pos_devolucao', 'manutencao_avulsa').required(),
    respostas: Joi.object().required(),
    observacoes: Joi.string().allow('').optional()
});

const criar = async (req, res, next) => {
    try {
        const { error, value } = criarSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        // Achar o item por token pra pegar o ID
        const item = await itensModel.buscarItemPorToken(value.item_token);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item (token) não encontrado' });
        }

        const { contrato_id, tipo, respostas, observacoes } = value;
        const usuario_id = req.user.id;

        const checklist = await checklistsModel.criarChecklist({
            item_id: item.id,
            contrato_id: contrato_id || null,
            tipo,
            usuario_id,
            respostas,
            fotos: [],
            observacoes
        });

        res.status(201).json({
            success: true,
            message: 'Checklist salvo com sucesso',
            data: checklist
        });
    } catch (err) {
        next(err);
    }
};

const buscarPorId = async (req, res, next) => {
    try {
        const { id } = req.params;
        const checklist = await checklistsModel.buscarChecklistPorId(id);
        if (!checklist) {
            return res.status(404).json({ success: false, message: 'Checklist não encontrado' });
        }
        res.json({ success: true, data: checklist });
    } catch (err) {
        next(err);
    }
};

const uploadFotos = async (req, res, next) => {
    try {
        const { id } = req.params;
        const checklist = await checklistsModel.buscarChecklistPorId(id);
        if (!checklist) {
            return res.status(404).json({ success: false, message: 'Checklist não encontrado' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'Nenhuma foto enviada' });
        }

        const fotosAtuais = checklist.fotos || [];
        const novasFotosUrls = req.files.map(file => `/uploads/fotos/${file.filename}`);

        const fotosAtualizadas = [...fotosAtuais, ...novasFotosUrls];
        await checklistsModel.adicionarFotos(id, fotosAtualizadas);

        res.json({ success: true, message: 'Fotos enviadas com sucesso', data: { fotos: fotosAtualizadas } });
    } catch (err) {
        next(err);
    }
};

const assinarSchema = Joi.object({
    assinaturaBase64: Joi.string().required() // Data URI base64 de um PNG
});

const assinar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { error, value } = assinarSchema.validate(req.body);
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }); }

        const checklist = await checklistsModel.buscarChecklistPorId(id);
        if (!checklist) { return res.status(404).json({ success: false, message: 'Checklist não encontrado' }); }

        // Salvar Base64 como PNG localmente
        const matches = value.assinaturaBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return res.status(400).json({ success: false, message: 'Formato base64 inválido' });
        }

        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `assinatura-${id}-${Date.now()}.png`;
        const filepath = path.join(__dirname, '../../uploads/assinaturas', filename);
        const saveUrl = `/uploads/assinaturas/${filename}`;

        const fsPromises = fs.promises;
        await fsPromises.writeFile(filepath, buffer);

        await checklistsModel.atualizarAssinatura(id, saveUrl);

        res.json({ success: true, message: 'Assinatura salva com sucesso', data: { assinatura_url: saveUrl } });
    } catch (err) {
        next(err);
    }
};

const gerarLaudo = async (req, res, next) => {
    try {
        const { id } = req.params;
        let checklist = await checklistsModel.buscarChecklistPorId(id);
        if (!checklist) { return res.status(404).json({ success: false, message: 'Checklist não encontrado' }); }

        if (!checklist.laudo_pdf_url) {
            // Laudo não existe ainda, vamos gerar:
            const pdfUrl = await pdfService.generateLaudoPDF(checklist);
            checklist = await checklistsModel.atualizarLaudoPdf(id, pdfUrl);
        }

        res.json({ success: true, message: 'Laudo gerado / obtido com sucesso', data: { laudo_pdf_url: checklist.laudo_pdf_url } });
    } catch (err) {
        next(err);
    }
};

const historicoItem = async (req, res, next) => {
    try {
        const { id } = req.params; // ID do Item
        const checklists = await checklistsModel.buscarChecklistsPorItem(id);
        res.json({ success: true, data: checklists });
    } catch (err) {
        next(err);
    }
};

const comparativo = async (req, res, next) => {
    try {
        const { item_id, ctr_id } = req.params;
        const checklists = await checklistsModel.buscarPorContratoItem(ctr_id, item_id);

        // Identificar pre e pos
        const preEntrega = checklists.find(c => c.tipo === 'pre_entrega');
        const posDevolucao = checklists.find(c => c.tipo === 'pos_devolucao');

        res.json({
            success: true,
            data: {
                pre_entrega: preEntrega || null,
                pos_devolucao: posDevolucao || null
            }
        });

    } catch (err) {
        next(err);
    }
};

module.exports = {
    criar,
    buscarPorId,
    uploadFotos,
    assinar,
    gerarLaudo,
    historicoItem,
    comparativo
};
