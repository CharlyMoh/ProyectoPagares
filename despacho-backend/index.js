const express = require('express');
const cors = require('cors');
const db = require('./src/config/db');

const authRoutes = require('./src/routes/authRoutes');
const deudorRoutes = require('./src/routes/deudorRoutes');
const pagareRoutes = require('./src/routes/pagareRoutes');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Inyección de enrutadores modulares de la arquitectura
app.use('/api/auth', authRoutes);
app.use('/api/deudores', deudorRoutes);
app.use('/api/pagares', pagareRoutes);

async function inicializarEcosistema() {
    try {
        await db.query('SELECT 1');
        console.log('Infraestructura MySQL acoplada perfectamente a Node.js.');
        app.listen(PORT, () => {
            console.log(`Servidor de desarrollo corriendo de forma óptima en el puerto: ${PORT}`);
        });
    } catch (error) {
        console.error('Error en el arranque de la API:', error.message);
        process.exit(1);
    }
}

inicializarEcosistema();