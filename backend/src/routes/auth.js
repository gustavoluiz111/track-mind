const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const authMiddleware = require('../middlewares/auth');

router.post('/cadastro', authController.cadastro);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/recuperar-senha', authController.recuperarSenha);

// Rota protegida exemplo (perfil)
router.get('/perfil', authMiddleware, authController.obterPerfil);

module.exports = router;
