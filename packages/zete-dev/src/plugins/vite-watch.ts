import vite from 'vite';
import { builder } from '../builder';
import { zeteConfig } from '../config';

export function zeteWatchPlugin(cfg: zeteConfig): vite.Plugin {
  return {
    name: 'sapianse:watch',
    configureServer(server) {
      server.watcher.on('add', () => {
        builder(cfg, false);
      });

      server.watcher.on('unlink', () => {
        builder(cfg, false);
      });

      server.watcher.on('edit', () => {
        builder(cfg, false);
        server.ws.send({
          type: 'custom',
          event: 'updated',
        });
      });
    },
  };
}
