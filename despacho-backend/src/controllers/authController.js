const db = require('../config/db');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { correo, password } = req.body;
    try {
        if (!correo || !password) return res.status(400).json({ message: 'Campos incompletos.' });

        const [rows] = await db.query('SELECT id, nombre, correo, password, rol FROM usuarios WHERE correo = ? AND activo = TRUE', [correo]);
        if (rows.length === 0 || password !== rows[0].password) {
            return res.status(401).json({ message: 'Credenciales inválidas o cuenta inactiva.' });
        }

        const token = jwt.sign({ id: rows[0].id, rol: rows[0].rol }, process.env.JWT_SECRET, { expiresIn: '8h' });
        res.json({ token, usuario: { id: rows[0].id, nombre: rows[0].nombre, rol: rows[0].rol } });
    } catch (error) {
        res.status(500).json({ message: 'Error interno en el servidor.' });
    }
};

// Control de Creación de Usuarios (Restringido solo a Socios Directores)
exports.crearUsuario = async (req, res) => {
    const { nombre, correo, password, rol } = req.body;
    try {
        await db.query('INSERT INTO usuarios (nombre, correo, password, rol) VALUES (?, ?, ?, ?)', [nombre, correo, password, rol]);
        res.status(201).json({ message: 'Nuevo personal del despacho registrado exitosamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar al usuario.' });
    }
};