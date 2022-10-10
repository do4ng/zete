import esbuild from 'esbuild';

export default function bundle(config: esbuild.BuildOptions): Promise<string[]>;
