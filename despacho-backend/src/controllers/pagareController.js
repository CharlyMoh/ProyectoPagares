const db = require('../config/db');

exports.crearSeriePagares = async (req, res) => {
    const { 
        numero_expediente, deudor_id, total_pagares, monto_total, monto_letra,
        nombre_beneficiario, fecha_vencimiento_inicial, lugar_pago, 
        fecha_suscripcion, lugar_suscripcion, estado_suscripcion_id, nombre_aval, domicilio_aval 
    } = req.body;

    // CORRECCIÓN 1: Unificado a req.user para emparejar con el authMiddleware
    const usuario_creador_id = req.user.id; 

    try {
        // Cálculo del monto equitativo por cada pagaré individual
        const montoIndividual = (monto_total / total_pagares).toFixed(2);
        
        // Iniciamos bucle transaccional directo para la serie consecutiva
        for (let i = 1; i <= total_pagares; i++) {
            
            // Lógica empresarial: Cada pagaré expira con un intervalo de meses consecutivo
            let fechaVencimiento = new Date(fecha_vencimiento_inicial);
            fechaVencimiento.setMonth(fechaVencimiento.getMonth() + (i - 1));

            await db.query(`
                INSERT INTO pagares (
                    numero_expediente, deudor_id, numero_pagare, total_pagares,
                    monto_numerico, monto_letra, nombre_beneficiario, fecha_vencimiento,
                    lugar_pago, fecha_suscripcion, lugar_suscripcion, estado_suscripcion_id,
                    nombre_aval, domicilio_aval, usuario_creador_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    numero_expediente, deudor_id, i, total_pagares,
                    montoIndividual, `${monto_letra} (Serie ${i}/${total_pagares})`, 
                    nombre_beneficiario, fechaVencimiento, lugar_pago, 
                    fecha_suscripcion, lugar_suscripcion, estado_suscripcion_id, 
                    nombre_aval, domicilio_aval, usuario_creador_id
                ]
            );
        }

        res.status(201).json({ message: `Serie exitosa de ${total_pagares} pagarés creados y serializados.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error crítico en el lote de pagarés.' });
    }
};

exports.obtenerHistorialPagares = async (req, res) => {
    // Extraemos el id y el rol que el middleware de autenticación inyecta de forma segura
    const { id: usuarioId, rol } = req.user; 

    try {
        // CORRECCIÓN 2: Cambiados los JOINs y WHEREs para usar 'usuario_creador_id' en lugar de 'usuario_id'
        let query = `
            SELECT p.*, d.nombre AS deudor_nombre, u.nombre AS abogado_nombre
            FROM pagares p
            JOIN deudores d ON p.deudor_id = d.id
            JOIN usuarios u ON p.usuario_creador_id = u.id
        `;
        let params = [];

        // Si es un abogado común (Junior/Senior), solo ve sus propios pagarés creados
        if (rol !== 'Administrador' && rol !== 'Socio') {
            query += ` WHERE p.usuario_creador_id = ?`;
            params.push(usuarioId);
        }

        query += ` ORDER BY p.fecha_suscripcion DESC, p.id DESC`;

        const [rows] = await db.query(query, params);
        res.json(rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el historial de auditoría.' });
    }
};