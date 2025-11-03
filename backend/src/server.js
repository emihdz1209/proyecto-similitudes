import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import comparisonRoutes from './routes/comparison.js';
import { errorHandler } from './middleware/errorHandler.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rutas
app.get('/', (req, res) => {
  res.json({
    message: 'API de Comparacion de Textos',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      upload: '/api/upload',
      preprocess: '/api/preprocess',
      compare: '/api/compare'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rutas de la API
app.use('/api', comparisonRoutes);

// Manejo de errores
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log('');
  console.log('[*] Servidor corriendo en http://localhost:' + PORT);
  console.log('[*] Ambiente: ' + process.env.NODE_ENV);
  console.log('[*] CORS habilitado para: ' + process.env.CORS_ORIGIN);
  console.log('');
});

export default app;
