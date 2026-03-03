import express from 'express';
import type { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from '../config/db.js';

dotenv.config();
const app: Application = express();

// Conectar a la base de datos
connectDB();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static('uploads'));

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

// Importar rutas dinámicamente para evitar errores de carga
import('./routes/authRoutes.js').then((authModule) => {
  app.use('/api/auth', authModule.default);
  console.log('✅ Rutas de autenticación cargadas');
}).catch((error) => {
  console.error('❌ Error cargando rutas de autenticación:', error);
});

import('./routes/noticiaRoutes.js').then((noticiaModule) => {
  app.use('/api/noticias', noticiaModule.default);
  console.log('✅ Rutas de noticias cargadas');
}).catch((error) => {
  console.error('❌ Error cargando rutas de noticias:', error);
});

import('./routes/uploadRoutes.js').then((uploadModule) => {
  app.use('/api/upload', uploadModule.default);
  console.log('✅ Rutas de upload cargadas');
}).catch((error) => {
  console.error('❌ Error cargando rutas de upload:', error);
});

import('./routes/userRoutes.js').then((userModule) => {
  app.use('/api/users', userModule.default);
  console.log('✅ Rutas de usuarios cargadas');
}).catch((error) => {
  console.error('❌ Error cargando rutas de usuarios:', error);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});