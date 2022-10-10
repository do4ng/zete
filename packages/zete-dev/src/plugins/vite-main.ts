import vite from 'vite';
import { zeteConfig } from '../config';
import { zeteErrorPlugin } from './vite-error';
import { zeteWatchPlugin } from './vite-watch';

export function sapianseVite(cfg: zeteConfig): vite.Plugin {
  return {
    name: 'sapianse',
    config(config) {
      config = {
        ...config,
        plugins: [...(config.plugins || []), zeteErrorPlugin(), zeteWatchPlugin(cfg || {})],
      };
      console.log(config);
      return config;
    },
  };
}
