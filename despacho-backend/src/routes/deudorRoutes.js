const express = require('express');
const router = express.Router();
const deudorController = require('../controllers/deudorController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.post('/', verificarToken, deudorController.crearDeudor);
router.get('/', verificarToken, deudorController.obtenerDeudores);

module.exports = router;