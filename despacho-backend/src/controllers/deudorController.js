const db = require('../config/db');

exports.crearDeudor = async (req, res) => {
    const { nombre, domicilio, telefono, estado_residencia_id } = req.body;
    try {
        const [result] = await db.query('INSERT INTO deudores (nombre, domicilio, telefono, estado_residencia_id) VALUES (?, ?, ?, ?)', [nombre, domicilio, telefono, estado_residencia_id]);
        res.status(201).json({ message: 'Deudor almacenado en el sistema.', deudorId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Error al dar de alta al deudor.' });
    }
};

exports.obtenerDeudores = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT d.*, e.nombre AS estado FROM deudores d JOIN estados_republica e ON d.estado_residencia_id = e.id');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al consultar deudores.' });
    }
};