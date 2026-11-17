import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

it('mantém o núcleo independente da plataforma, do relógio e da UI', () => {
  const root = fileURLToPath(new URL('../../../src/core/', import.meta.url));
  const files = readdirSync(root, { recursive: true, encoding: 'utf8' }).filter(
    (name) => name.endsWith('.ts'),
  );
  expect(files.length).toBeGreaterThan(0);
  for (const file of files) {
    const source = readFileSync(join(root, file), 'utf8');
    expect(source, file).not.toMatch(
      /\b(?:Date|window|document)\b|\bMath\s*\.\s*random\b/,
    );
    expect(source, file).not.toMatch(
      /(?:\b(?:from|import)\s*|\bimport\s*\(\s*)['"](?:node:|[^'"]*\/(?:ui|cli)(?:\/|['"]))/,
    );
  }
});
