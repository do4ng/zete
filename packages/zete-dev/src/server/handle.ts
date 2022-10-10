import { existsSync, readFileSync } from 'fs';
import { join, parse, relative } from 'path';
import { ViteDevServer } from 'vite';
import mime from 'mime-types';
import bundle from '@zete/bundler';
import { pathToRegexp } from 'path-to-regexp';
import { NextFunction, Request, Response } from 'express';
import { zeteConfig } from '../config';
import { createRoutes, joinWithReplace } from '../createRoutes';
import { preloadSveltePage } from '../render';

type Routes = ReturnType<typeof createRoutes>;
interface RoutesType {
  page: Routes[number];
  score: number;
}

export const changeExt = (str: string, from: string, to: string) => {
  from = `.${from}`;
  const parsed = parse(str);
  let { ext } = parsed;
  if (ext === from) ext = to;
  return joinWithReplace(parsed.dir, `${parsed.name}.${ext}`);
};

export async function handleRequest(
  req: Request,
  res: Response,
  config: zeteConfig,
  next: NextFunction,
  server?: ViteDevServer
) {
  const url = req.originalUrl;
  const items: Routes[number][] = JSON.parse(
    readFileSync(join(process.cwd(), config.out || '.zete', 'routes.json')).toString()
  );
  const hash = JSON.parse(readFileSync(join(process.cwd(), config.out || '.zete', 'hash.json')).toString());
  const units = {
    1: [],
    0: [],
    '-1': [],
    '-2': [],
  };

  let routes: RoutesType[] = [];

  items.forEach((route) => {
    routes.push({ score: 0, page: route });
  });

  // static > index > params > all
  // app/index.svelte > [params].svelte
  // foo/bar.svelte > foo/bar/index.svelte
  // docs/[params].svelte > [...params].svelte

  routes = routes.map((route) => {
    if (route.page.route.route.endsWith('*')) route.score -= 2;
    else if (route.page.route.props.length !== 0) route.score -= 1;
    else if (parse(route.page.path).name !== 'index') route.score += 1;

    units[route.score].push(route);

    return route;
  });

  // find matched page
  const isMatch = (targets: RoutesType[]): { match: string; props?: object } => {
    let rv = null;

    targets.forEach((target) => {
      const { route } = target.page.route;

      // static
      if (route === url) rv = { match: route };
      if (`${route}/` === url) rv = { match: route };
      if (`/${route}/` === url) rv = { match: route };
      if (`/${route}` === url) rv = { match: route };
      if (route === `${url}/`) rv = { match: route };
      if (route === `/${url}/`) rv = { match: route };
      if (route === `/${url}`) rv = { match: route };
      if (`${route}/index.html` === url) rv = { match: route };
      if (`${route}index.html` === url) rv = { match: route };

      // params
      const regexp = pathToRegexp(route);

      if (regexp.test(url)) {
        const execed = regexp.exec(url);
        const props = {};

        target.page.route.props.forEach((prop, index) => {
          props[prop] = execed[index + 1];
        });

        rv = { match: route, props };
      }
      if (rv) return false;
    });

    return rv;
  };

  let matched: {
    match: string;
    props?: object;
  } = null;

  Object.keys(units).forEach((unit) => {
    if (matched) return;

    const temp = isMatch(units[unit]);
    if (temp) {
      matched = temp;
    }
  });

  const result = routes.filter((route) => route.page.route.route === matched?.match)[0];

  // response

  // svelte rendering code (page rendering)
  if (url.startsWith('/.zete')) {
    await bundle({
      entryPoints: [join(process.cwd(), config.out || '.zete', '..', url)],
      outfile: join(process.cwd(), config.out || '.zete', '..', url),
      bundle: true,
      platform: 'neutral',
      allowOverwrite: true,
      keepNames: true,
    });

    res.writeHead(200, {
      'Content-Type': 'text/javascript',
    });

    const file = readFileSync(join(process.cwd(), config.out || '.zete', '..', url)).toString();

    return res.end(file);
  }

  // response
  if (result) {
    if (result.page.type === 'page') {
      // page
      const file = join(process.cwd(), config.pages || 'pages', result.page.path);
      const preload = preloadSveltePage(file, matched.props || {});
      const mimeType = mime.lookup(changeExt(file, 'svelte', 'html')) || 'text/plain';

      const responseFile = `${preload.html}`;

      let template = readFileSync(join(__dirname, '../assets/template.html')).toString();

      if (existsSync(join(process.cwd(), './pages/__root.html'))) {
        template = readFileSync(join(process.cwd(), './pages/__root.html')).toString();
      }

      if (server) {
        template = await server.transformIndexHtml(url, template);

        template = template.replace(
          '<!--body-->',
          `${responseFile}
  `
        );

        const pageData = {
          props: matched.props || {},
          page: hash[result.page.path],
        };

        // insert rendering code

        template = template.replace(
          '<!--head-->',
          `<style>${preload.css.code}</style>
  <script id="__sapianse_data" type="application/json">${JSON.stringify(pageData)}</script>
  <script type="module" src="/.zete/pages/${hash[result.page.path]}.js"></script>`
        );

        res.writeHead(200, {
          ...(config.headers || {}),
          'Content-Type': mimeType,
        });

        return res.end(template);
      }
    } else if (result.page.type === 'endpoint') {
      // endpoint

      const outfile = join(process.cwd(), config.out || '.zete', 'endpoint', `${hash[result.page.path]}.js`);
      const endpoint = require(relative(__dirname, outfile));

      res.writeHead(200, {
        ...(config.headers || {}),
        'Content-Type': 'text/plain',
      });

      if (endpoint.post && req.method.toLowerCase() === 'post') return await endpoint.post({ req, res, next });
      if (endpoint.get && req.method.toLowerCase() === 'get') return await endpoint.get({ req, res, next });
      if (endpoint.all) return await endpoint.all({ req, res, next });
    }
  }

  next();
}
