const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken, permitirRoles } = require('../middlewares/authMiddleware');

router.post('/login', authController.login);
// Control de accesos estricto: Solo directores crean credenciales de nuevos abogados
router.post('/usuarios', verificarToken, permitirRoles('Socio'), authController.crearUsuario);

module.exports = router;