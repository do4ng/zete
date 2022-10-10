import glob from 'fast-glob';
import { join, parse } from 'path';
import { zeteConfig } from './config';
import { __DEFAULT_PAGES_404, __DEFAULT_PAGES_TEMPLATE } from './constants/pages';

const extensions = ['ts', 'js', 'svelte'];
const excludedPages = ['__app.svelte', '__404.svelte'];

// \ => /
export const replacePath = (path: string) => path.replace(/\\/g, '/');
export const joinWithReplace = (...dir: string[]) => replacePath(join(...dir));

export function registsExtension(ext: string) {
  extensions.push(ext);
}

export function generateRoute(p: string): {
  route: string;
  props: string[];
} {
  const parsed = parse(p);
  /*
  app/page.svelte => /app/page
  app/api.ts => /app/api
  index.svelte => /
  */
  p = `${replacePath(parsed.dir)}/${parsed.name === 'index' ? '' : parsed.name}`;
  p = `${!p.startsWith('/') ? '/' : ''}${p}`;

  let props = [];

  props.push(...(p.match(/\[\.{3}.+\]/g) || []));
  props.push(...(p.match(/\[(.*?)\]/g) || []));

  const observed = [];

  props = props.map((prop: string) => {
    if (observed.includes(prop)) return null;
    observed.push(prop);

    if (/\[\.{3}.+\]/g.test(prop)) {
      return prop.slice(4, prop.length - 1);
    }
    return prop.slice(1, prop.length - 1);
  });

  props = props.filter((prop) => prop !== null);

  p = p.replace(/\[\.{3}.+\]/g, '*').replace(/\[(.*?)\]/g, ':$1');

  return {
    route: p,
    props,
  };
}

export function createRoutes(config: zeteConfig) {
  const files = glob.sync(`${'./**/*'}.{${extensions.join(',')}}`, {
    absolute: false,
    cwd: join(process.cwd(), config.pages || './pages'),
  });

  const items: {
    type: 'page' | 'endpoint';
    path: string;
    route: { route: string; props: string[] };
    404: string;
    template: string;
  }[] = [];

  files.forEach((file, index) => {
    files[index] = replacePath(file);
    const type = file.endsWith('.svelte') ? 'page' : 'endpoint';
    const path = file;

    items.push({
      type,
      path,
      route: generateRoute(path),
      404: __DEFAULT_PAGES_404,
      template: __DEFAULT_PAGES_TEMPLATE,
    });
  });

  // find nearest file
  const back = (path: string, target: string) => {
    if (replacePath(path).startsWith('../')) return null;
    if (files.includes(replacePath(join(path, target)))) return replacePath(join(path, target));
    return back(join(path, '..'), target);
  };

  const routes: typeof items = [];

  items.forEach((item) => {
    if (!excludedPages.includes(item.path)) {
      // find 404/template page

      item.template = back(item.path, '__app.svelte') || item.template;
      item['404'] = back(item.path, '__404.svelte') || item['404'];

      routes.push(item);
    }
  });

  return routes;
}
