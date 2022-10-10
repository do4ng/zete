import bundle from '@zete/bundler';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as compiler from 'svelte/compiler';
import { mkdirp, rimraf } from '../../utils/fs';
import { generateHash } from '../../utils/hash';
import { zeteConfig } from '../config';
import { createRoutes, replacePath } from '../createRoutes';
import insertWorker from '../server/worker';

export function builder(config: zeteConfig, init?: boolean) {
  const routes = createRoutes(config);
  const base = join(process.cwd(), config.out || '.zete');

  // remove directory (init)
  if (init) rimraf(base);

  // create directory
  mkdirp(base);
  mkdirp(join(base, 'pages'));
  mkdirp(join(base, 'endpoint'));

  writeFileSync(join(base, 'routes.json'), JSON.stringify(routes));

  const routesFile = [];
  let hashs = {};

  if (existsSync(join(base, 'hash.json'))) {
    hashs = JSON.parse(readFileSync(join(base, 'hash.json')).toString());
  }

  routes.forEach((route) => {
    let hash = generateHash();

    if (hashs[replacePath(route.path)]) hash = hashs[replacePath(route.path)];

    hashs[replacePath(route.path)] = hash;

    if (route.type === 'page') {
      const svelteCompiled = compiler.compile(
        readFileSync(join(process.cwd(), config.pages || 'pages', route.path)).toString(),
        {
          generate: 'dom',
          hydratable: true,
        }
      );

      writeFileSync(join(base, 'pages', `${hash}.js`), insertWorker(svelteCompiled.js.code));

      routesFile.push(
        `'${route.path.replace(/'/g, "\\'")}': {data: ${JSON.stringify(route)}, app: () => import('./${replacePath(
          join('pages', `${hash}.js`)
        )}')}`
      );
    } else {
      const outfile = join(process.cwd(), config.out || '.zete', 'endpoint', `${hashs[route.path]}.js`);

      bundle({
        entryPoints: [join(process.cwd(), config.pages || 'pages', route.path)],
        outfile,
        bundle: true,
        minify: true,
        platform: 'node',
      });
    }
  });

  writeFileSync(join(base, 'hash.json'), JSON.stringify(hashs));

  writeFileSync(join(base, 'routes.js'), `module.exports = {${routesFile.join(',\n\t')}}`);
}
