import { env } from './config/env';
import { app } from './app';
import { logger } from './utils/logger';

const port = env.PORT;

app.listen(port, () => {
  logger.info(`Servidor iniciado na porta ${port}`);
});
