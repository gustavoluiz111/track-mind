const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Gera um Laudo Técnico (PDF) de Checklist
 * @param {Object} checklistData Dados completos do checklist (checklist, item, usuario)
 * @returns {String} URL pública (caminho relativo) do pdf gerado
 */
const generateLaudoPDF = async (checklistData) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const hash = crypto.randomBytes(8).toString('hex');
            const filename = `laudo-${checklistData.item_token}-${hash}.pdf`;
            const _outPath = path.join(__dirname, '../../uploads/laudos', filename);

            const writeStream = fs.createWriteStream(_outPath);
            doc.pipe(writeStream);

            // --- Cabeçalho ---
            doc.fontSize(20).font('Helvetica-Bold').text('LAUDO TÉCNICO DE EQUIPAMENTO', { align: 'center' });
            doc.moveDown(1);

            // --- Dados do Equipamento ---
            doc.fontSize(14).font('Helvetica-Bold').text('Dados do Equipamento', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12).font('Helvetica')
                .text(`Equipamento: ${checklistData.item_nome}`)
                .text(`Token/Série: ${checklistData.item_token} / ${checklistData.item_serie || 'N/A'}`)
                .text(`Categoria: ${checklistData.item_categoria}`);
            doc.moveDown(1);

            // --- Dados do Checklist ---
            doc.fontSize(14).font('Helvetica-Bold').text('Detalhes da Inspeção', { underline: true });
            doc.moveDown(0.5);
            const dataFormatada = new Date(checklistData.criado_em).toLocaleString('pt-BR');
            doc.fontSize(12).font('Helvetica')
                .text(`Tipo do Relatório: ${checklistData.tipo.replace('_', ' ').toUpperCase()}`)
                .text(`Data/Hora: ${dataFormatada}`)
                .text(`Técnico Responsável: ${checklistData.usuario_nome}`);
            doc.moveDown(1);

            // --- Repostas (Grid de Inspeção) ---
            doc.fontSize(14).font('Helvetica-Bold').text('Condições Avaliadas', { underline: true });
            doc.moveDown(0.5);

            if (checklistData.respostas) {
                for (const [key, value] of Object.entries(checklistData.respostas)) {
                    const formattedKey = key.replace(/_/g, ' ').toUpperCase();
                    doc.fontSize(11).font('Helvetica-Bold').text(`${formattedKey}: `, { continued: true })
                        .font('Helvetica').text(`${String(value).toUpperCase()}`);
                    doc.moveDown(0.2);
                }
            } else {
                doc.fontSize(11).text('Nenhuma condição registrada.');
            }
            doc.moveDown(1);

            // --- Observações Finais ---
            if (checklistData.observacoes) {
                doc.fontSize(14).font('Helvetica-Bold').text('Observações Adicionais', { underline: true });
                doc.moveDown(0.5);
                doc.fontSize(12).font('Helvetica').text(checklistData.observacoes);
                doc.moveDown(1);
            }

            // --- Fotos (Apenas links ou referências para evitar PDF gigante por agora) ---
            if (checklistData.fotos && checklistData.fotos.length > 0) {
                doc.fontSize(14).font('Helvetica-Bold').text('Evidências Fotográficas', { underline: true });
                doc.moveDown(0.5);
                doc.fontSize(11).font('Helvetica').text(`Este laudo possui ${checklistData.fotos.length} fotos anexadas digitalmente no sistema.`);
                doc.moveDown(2);
            }

            // --- Assinaturas ---
            const yAssinatura = doc.y + 50;
            doc.moveTo(50, yAssinatura).lineTo(250, yAssinatura).stroke();
            doc.moveTo(350, yAssinatura).lineTo(550, yAssinatura).stroke();

            doc.fontSize(10).font('Helvetica')
                .text(checklistData.usuario_nome, 50, yAssinatura + 10, { width: 200, align: 'center' })
                .text('Técnico Responsável', 50, yAssinatura + 25, { width: 200, align: 'center' });

            doc.text('Cliente / Recebedor', 350, yAssinatura + 25, { width: 200, align: 'center' });

            // Embedar a assinatura PNG se existir
            if (checklistData.assinatura_url) {
                const assPath = path.join(__dirname, '../../', checklistData.assinatura_url);
                if (fs.existsSync(assPath)) {
                    doc.image(assPath, 350, yAssinatura - 50, { width: 150 });
                }
            }

            // Finalizar
            doc.end();

            writeStream.on('finish', () => {
                resolve(`/uploads/laudos/${filename}`);
            });

            writeStream.on('error', (err) => {
                reject(err);
            });

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    generateLaudoPDF
};
