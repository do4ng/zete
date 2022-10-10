import { existsSync, mkdirSync, rmSync } from 'fs';

export function mkdirp(dir: string): void {
  if (!existsSync(dir)) mkdirSync(dir);
}

export function rimraf(dir: string): void {
  if (existsSync(dir)) rmSync(dir, { force: true, recursive: true });
}
