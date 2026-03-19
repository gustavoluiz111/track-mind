const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let destPath = 'uploads/';

        // Simplificar a alocação dependendo do fieldname ou rota
        if (file.fieldname === 'fotos') {
            destPath += 'fotos/';
        } else if (file.fieldname === 'assinaturas') {
            destPath += 'assinaturas/';
        } else if (file.fieldname === 'laudos') {
            destPath += 'laudos/';
        } else if (file.fieldname === 'avatar') {
            destPath += 'avatar/';
        } else {
            destPath += 'misc/';
        }

        cb(null, path.join(__dirname, '../../', destPath));
    },
    filename: (req, file, cb) => {
        const hash = crypto.randomBytes(16).toString('hex');
        const ext = path.extname(file.originalname);
        cb(null, `${hash}-${Date.now()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de arquivo não suportado. Apenas JPEG, PNG e WEBP são permitidos.'), false);
    }
};

const uploadConfig = multer({
    storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
    },
    fileFilter
});

module.exports = uploadConfig;
