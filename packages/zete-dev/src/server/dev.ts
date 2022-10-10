import vite from 'vite';
import 'colors';
import express from 'express';
import { zeteConfig } from '../config';
import { handleRequest } from './handle';
import { builder } from '../builder';

export async function dev(config: zeteConfig) {
  builder(config);

  const app = express();

  const server = await vite.createServer({
    server: {
      middlewareMode: true,
    },
    appType: 'custom',
  });

  app.use(server.middlewares);

  app.use('*', async (req, res, next) => {
    handleRequest(req, res, config, next, server);
  });

  app.listen(config.port || 3000);

  console.log(`${'[dev]'.gray} Server running on ${`http://localhost:${config.port || 3000}`.cyan.bold}`);
}
