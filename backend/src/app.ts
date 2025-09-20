import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { env } from './config/env';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', routes);

// Servir arquivos estáticos do frontend em produção
if (env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));
  
  // Catch-all handler: enviar de volta o arquivo index.html para rotas do React
  app.use((req, res, next) => {
    // Se não é uma rota da API, serve o index.html
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendPath, 'index.html'));
    } else {
      next();
    }
  });
} else {
  app.use((req, res) => {
    res.status(404).json({ message: `Rota nao encontrada: ${req.method} ${req.originalUrl}` });
  });
}

app.use(errorHandler);

export { app };
