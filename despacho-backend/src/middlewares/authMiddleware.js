const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.verificarToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ message: 'Acceso denegado: Token ausente.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Inyecta id y rol en la petición
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token de acceso inválido o expirado.' });
    }
};

exports.permitirRoles = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
            return res.status(403).json({ message: 'Permisos insuficientes para esta acción jerárquica.' });
        }
        next();
    };
};