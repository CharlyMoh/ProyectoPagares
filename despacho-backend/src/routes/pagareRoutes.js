const express = require('express');
const router = express.Router();
const pagareController = require('../controllers/pagareController');
const pdfController = require('../controllers/pdfController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.post('/generar-serie', verificarToken, pagareController.crearSeriePagares);
router.get('/historial', verificarToken, pagareController.obtenerHistorialPagares);
router.get('/imprimir/:id', verificarToken, pdfController.generarPdfPagare);
router.get('/reporte-auditoria', verificarToken, pdfController.generarReporteAuditoriaPdf);

module.exports = router;