// server.js
const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const usersRoutes = require('./routes/userRoutes');
const providersRoutes = require('./routes/providerRoutes')
const appointmentsRoutes = require('./routes/appointmentsRoute')


const app = express();

// Middlewares globales
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:8000', // Vite dev server
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Rutas
app.use('/api/users', usersRoutes);
app.use('/api/providers', providersRoutes);
app.use('/api/appointments', appointmentsRoutes);

// Endpoints de prueba
app.get('/', (req, res) => {
    res.send('Ruta raíz del Backend');
});

app.get('/test', (req, res) => {
    res.send('Ruta TEST');
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500).send(err.stack);
});

// Exportamos la app para que la use index.js
module.exports = app;