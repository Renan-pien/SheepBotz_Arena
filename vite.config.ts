import { defineConfig } from 'vite';

import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const source = dirname(require.resolve('pyodide/package.json'));
const destination = new URL('./public/meupia/pyodide/', import.meta.url);
mkdirSync(destination, { recursive: true });
for (const name of [
  'pyodide.js',
  'pyodide.asm.js',
  'pyodide.asm.wasm',
  'python_stdlib.zip',
  'pyodide-lock.json',
]) {
  copyFileSync(join(source, name), new URL(name, destination));
}
export default defineConfig({});
