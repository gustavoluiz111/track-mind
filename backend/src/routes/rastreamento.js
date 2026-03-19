const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const rastreamentoController = require('../controllers/rastreamento');

// Webhook não deve ter auth Bearer porque é aparelho enviando HTTP
// Idealmente seria uma key interna, mas deixaremos exposto para simulação simples.
router.post('/webhook', rastreamentoController.processarWebhook);

// Rotas protegidas p/ os paineis frontends
router.use(authMiddleware);

router.get('/mapa', rastreamentoController.mapaAoVivo);
router.get('/token/:token', rastreamentoController.posicaoPorToken);
router.get('/:id/historico', rastreamentoController.historicoRastreamento);

module.exports = router;
