import compiler from 'svelte/types/compiler/interfaces';
import { compile } from 'svelte/compiler';

export interface zeteConfig {
  pages?: string;
  out?: string;
  port?: number;
  headers?: { [key: string]: string };
}

export interface SvelteSSR {
  html: string;
  css: {
    code: string;
    map: string;
  };
  head: string;
}

export function preloadSveltePage(file: string, props?: object, options?: object): SvelteSSR;
export function renderSveltePage(source: string, options: compiler.CompileOptions): ReturnType<typeof compile>;
export function builder(config: zeteConfig, init?: boolean);
export function dev(config: zeteConfig): Promise<void>;
