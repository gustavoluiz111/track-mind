const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const uploadConfig = require('../middlewares/upload');
const checklistsController = require('../controllers/checklists');

// Todas as rotas de checklist são protegidas
router.use(authMiddleware);

// Rotas Base
router.post('/', checklistsController.criar);
router.get('/:id', checklistsController.buscarPorId);

// Ações Específicas
router.post('/:id/fotos', uploadConfig.array('fotos', 10), checklistsController.uploadFotos);
router.post('/:id/assinar', checklistsController.assinar);
router.get('/:id/laudo', checklistsController.gerarLaudo);

// Rotas integradas aos itens e contratos
router.get('/itens/:id/historico', checklistsController.historicoItem);
router.get('/itens/:item_id/comparativo/:ctr_id', checklistsController.comparativo);

module.exports = router;
