import app from './app';
import { config } from './config';
import { connectDatabase } from './config/database';

const startServer = async () => {
  await connectDatabase();

  app.listen(config.port, () => {
    console.log(`🚀 EMPLOYEE360 Backend running on port ${config.port} in ${config.nodeEnv} mode`);
    console.log(`👉 API Health: http://localhost:${config.port}/api/health`);
  });
};

startServer();
