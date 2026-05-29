const PDFDocument = require('pdfkit');
const db = require('../config/db');

// ============================================================================
// 1. GENERACIÓN DE PAGARÉ INDIVIDUAL (FORMATO VERDE FORMITEC)
// ============================================================================
exports.generarPdfPagare = async (req, res) => {
    const { id } = req.params; 

    try {
        const [rows] = await db.query(`
            SELECT p.*, d.nombre AS deudor_nombre, d.domicilio AS deudor_domicilio, d.telefono AS deudor_telefono
            FROM pagares p
            JOIN deudores d ON p.deudor_id = d.id
            WHERE p.id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Pagaré no encontrado.' });
        }

        const pagare = rows[0];

        const doc = new PDFDocument({
            size: 'LETTER',
            layout: 'landscape',
            margins: { top: 40, left: 40, right: 40, bottom: 40 }
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=Pagare-${pagare.numero_expediente}.pdf`);

        doc.pipe(res);

        // --- DISEÑO VECTORIAL VERDE FORMITEC ---
        doc.rect(40, 40, 712, 300).lineWidth(3).stroke('#276749');
        doc.rect(44, 44, 704, 292).lineWidth(1).stroke('#276749');

        // Encabezado
        doc.rect(44, 44, 100, 35).fill('#276749');
        doc.fillColor('white').font('Helvetica-Bold').fontSize(14).text('PAGARE', 55, 55);

        // Datos de control de serie
        doc.fillColor('#276749').fontSize(8).text('No.', 155, 48);
        doc.fillColor('black').font('Helvetica').fontSize(11).text(`${pagare.numero_pagare} DE ${pagare.total_pagares}`, 155, 60);

        doc.fillColor('#276749').font('Helvetica-Bold').fontSize(8).text('LUGAR DE EXPEDICIÓN', 260, 48);
        doc.fillColor('black').font('Helvetica').fontSize(10).text(pagare.lugar_suscripcion, 260, 60);

        const fechaSuscripcionFormato = new Date(pagare.fecha_suscripcion).toLocaleDateString('es-MX');
        doc.fillColor('#276749').font('Helvetica-Bold').fontSize(8).text('FECHA SUSCRIPCIÓN', 500, 48);
        doc.fillColor('black').font('Helvetica').fontSize(10).text(fechaSuscripcionFormato, 500, 60);

        doc.rect(610, 44, 138, 35).fill('#f0fff4').stroke('#276749');
        doc.fillColor('#276749').font('Helvetica-Bold').fontSize(8).text('BUENO POR:', 615, 48);
        doc.fillColor('black').fontSize(12).text(`$${pagare.monto_numerico}`, 615, 60);

        // Cuerpo legal
        doc.fillColor('black').font('Helvetica-Oblique').fontSize(11)
           .text('Debo(emos) y pagaré(mos) incondicionalmente sin pretexto este pagaré en el lugar y fechas citadas a la orden de:', 55, 100);

        doc.fillColor('#276749').font('Helvetica-Bold').fontSize(8).text('NOMBRE DEL BENEFICIARIO:', 55, 130);
        doc.fillColor('black').font('Helvetica').fontSize(11).text(pagare.nombre_beneficiario, 55, 142);

        const fechaVenceFormato = new Date(pagare.fecha_vencimiento).toLocaleDateString('es-MX');
        doc.fillColor('#276749').font('Helvetica-Bold').fontSize(8).text('FECHA DE VENCIMIENTO:', 450, 130);
        doc.fillColor('black').font('Helvetica').fontSize(11).text(fechaVenceFormato, 450, 142);

        doc.fillColor('#276749').font('Helvetica-Bold').fontSize(8).text('LA CANTIDAD DE (MONTO EN LETRA):', 55, 170);
        doc.fillColor('black').font('Helvetica-Bold').fontSize(10).text(pagare.monto_letra, 55, 182, { width: 350 });

        doc.fillColor('#276749').font('Helvetica-Bold').fontSize(8).text('LUGAR DE PAGO:', 450, 170);
        doc.fillColor('black').font('Helvetica').fontSize(11).text(pagare.lugar_pago, 450, 182, { width: 280 });

        // Paneles inferiores de firmas
        doc.rect(55, 230, 320, 90).stroke('#276749');
        doc.fillColor('#276749').font('Helvetica-Bold').fontSize(9).text(' DATOS DEL DEUDOR', 60, 235);
        doc.fillColor('black').font('Helvetica').fontSize(10).text(`Nombre: ${pagare.deudor_nombre}`, 65, 255);
        doc.fillColor('black').fontSize(9).text(`Domicilio: ${pagare.deudor_domicilio}`, 65, 275, { width: 300 });

        doc.rect(410, 230, 310, 90).stroke('#276749');
        doc.fillColor('#276749').font('Helvetica-Bold').fontSize(9).text(' AVAL Y FIRMA(S)', 415, 235);
        if (pagare.nombre_aval) {
            doc.fillColor('black').font('Helvetica').fontSize(9).text(`Aval: ${pagare.nombre_aval}`, 420, 255);
        }
        
        doc.moveTo(450, 300).lineTo(680, 300).lineWidth(1).stroke('#276749');
        doc.fillColor('#276749').fontSize(8).text('FIRMA DEL SUSCRIPTOR / DEUDOR', 490, 305);

        doc.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fatal al compilar el reporte PDF.' });
    }
};

// ============================================================================
// 2. GENERACIÓN DE REPORTE DE AUDITORÍA GLOBAL (REPORTE VERTICAL SOCIO)
// ============================================================================
exports.generarReporteAuditoriaPdf = async (req, res) => {
    try {
        // CORRECCIÓN: Se cambia p.usuario_id por p.usuario_creador_id para hacer match con las tablas
        const [rows] = await db.query(`
            SELECT p.numero_expediente, d.nombre AS deudor, p.monto_numerico, p.fecha_vencimiento, u.nombre AS abogado
            FROM pagares p
            JOIN deudores d ON p.deudor_id = d.id
            JOIN usuarios u ON p.usuario_creador_id = u.id
            ORDER BY p.numero_expediente DESC
        `);

        const doc = new PDFDocument({ 
            size: 'LETTER', 
            layout: 'portrait', 
            margins: { top: 50, left: 50, right: 50, bottom: 50 } 
        });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=Reporte-Auditoria-Global.pdf');
        doc.pipe(res);

        // Encabezado Administrativo
        doc.fillColor('#1a365d').font('Helvetica-Bold').fontSize(18).text('DESPACHO JURÍDICO S.C.', { align: 'center' });
        doc.fillColor('#4a5568').font('Helvetica').fontSize(12).text('Reporte Global de Auditoría Interna - Emisión de Pagarés', { align: 'center' });
        doc.moveDown(2);

        // Estructura de la Tabla Ejecutiva
        doc.fillColor('black').font('Helvetica-Bold').fontSize(10);
        doc.text('Expediente', 50, 120);
        doc.text('Abogado / Emisor', 150, 120);
        doc.text('Deudor', 300, 120);
        doc.text('Monto', 450, 120);
        doc.text('Vence', 520, 120);
        doc.moveTo(50, 135).lineTo(560, 135).stroke('#cbd5e0');

        doc.font('Helvetica').fontSize(9);
        let y = 145;

        rows.forEach(p => {
            if (y > 700) { doc.addPage(); y = 50; } // Control de paginación
            
            doc.text(p.numero_expediente, 50, y);
            doc.text(p.abogado.substring(0, 23), 150, y);
            doc.text(p.deudor.substring(0, 23), 300, y);
            doc.text(`$${p.monto_numerico}`, 450, y);
            doc.text(new Date(p.fecha_vencimiento).toLocaleDateString('es-MX'), 520, y);
            y += 20;
        });

        doc.end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al compilar el reporte ejecutivo.' });
    }
};