import { readFileSync } from 'node:fs';

export const duel = readFileSync(
  new URL('../../examples/worlds/duelo-padrao.json', import.meta.url),
  'utf8',
);
