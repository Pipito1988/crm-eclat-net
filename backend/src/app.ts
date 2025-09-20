import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
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
  const indexPath = path.join(frontendPath, 'index.html');
  
  // Verificar se o frontend foi compilado
  if (fs.existsSync(indexPath)) {
    console.log('✅ Frontend encontrado, servindo ficheiros estáticos');
    app.use(express.static(frontendPath));
    
    // Catch-all handler: enviar de volta o arquivo index.html para rotas do React
    app.use((req, res, next) => {
      // Se não é uma rota da API, serve o index.html
      if (!req.path.startsWith('/api')) {
        res.sendFile(indexPath);
      } else {
        next();
      }
    });
  } else {
    console.log('❌ Frontend não encontrado em:', frontendPath);
    console.log('🔧 Servindo apenas API. Aceda via /api/...');
    
    // Página temporária enquanto o frontend não está disponível
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        res.send(`
          <html>
            <head><title>CRM Eclat Net - API Only</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1>🚀 CRM Eclat Net API</h1>
              <p>O frontend ainda está a ser compilado.</p>
              <p>API disponível em: <a href="/api">/api</a></p>
              <p>Aguarde alguns minutos e recarregue a página.</p>
            </body>
          </html>
        `);
      }
    });
  }
} else {
  app.use((req, res) => {
    res.status(404).json({ message: `Rota nao encontrada: ${req.method} ${req.originalUrl}` });
  });
}

app.use(errorHandler);

export { app };
