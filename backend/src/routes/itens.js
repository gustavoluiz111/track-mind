const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const itensController = require('../controllers/itens');

// Todas as rotas de itens são protegidas
router.use(authMiddleware);

router.get('/', itensController.listar);
router.post('/', itensController.criar);

router.get('/token/:token', itensController.buscarPorToken);

router.get('/:id', itensController.buscarPorId);
router.put('/:id', itensController.atualizar);
router.patch('/:id/status', itensController.alterarStatus);
router.get('/:id/qrcode', itensController.obterQRCode);

// Serão implementadas em Módulos Futuros (Checklist / GPS):
// router.get('/:id/checklists', ...);
// router.get('/:id/posicao', ...);

module.exports = router;
