import { IncomingMessage, ServerResponse } from 'http';
import vite from 'vite';

export function zeteErrorPlugin(): vite.Plugin {
  return {
    name: 'zete:error',
    configureServer(server) {
      console.log(server);
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: Function) => {
        console.log('errorhandle');
        next();
      });
    },
  };
}
