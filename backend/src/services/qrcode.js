const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const generateQRCode = async (token) => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/itens/${token}`;

    const uploadDir = path.join(__dirname, '../../uploads/qrcodes');

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, `${token}.png`);

    await QRCode.toFile(filePath, url, {
        color: {
            dark: '#000000',  // Pontos escuros
            light: '#ffffff' // Fundo branco
        },
        width: 300,
        margin: 2
    });

    return `/uploads/qrcodes/${token}.png`;
};

module.exports = {
    generateQRCode
};
