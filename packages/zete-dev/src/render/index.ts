import { relative } from 'path';
import 'svelte/register';
import type svelte from 'svelte/types/compiler/interfaces';
import { compile } from 'svelte/compiler';

export interface SvelteSSR {
  html: string;
  css: {
    code: string;
    map: string;
  };
  head: string;
}

export function preloadSveltePage(file: string, props?: object, opts?: object): SvelteSSR {
  const SveltePage = require(relative(__dirname, file)).default;
  return SveltePage.render(props || {}, opts || {});
}

export function renderSveltePage(source: string, options: svelte.CompileOptions): ReturnType<typeof compile> {
  return compile(source, options);
}
