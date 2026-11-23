import { expect, it } from 'vitest';
import { loadWorld } from '../../../../src/core';

const exit = { x: 0.5, y: 0, width: 0.25, height: 0.25 };
const robot = { id: 'explorador', x: -0.5, y: 0 };
const base = {
  map: { width: 2, height: 2 },
  match: { mode: 'maze', exit },
  robots: [robot],
};

it('S1-US1-AC12: preserva a saída retangular de um labirinto', () => {
  const parsed = loadWorld(JSON.stringify(base));
  expect(parsed.ok && parsed.world.match.exit).toEqual(exit);
});

it.each([
  [{ match: { mode: 'maze' } }, 'match.exit'],
  [{ match: { mode: 'free', exit } }, 'match.exit'],
  [{ robots: [robot, { ...robot, id: 'outro', x: 0 }] }, 'robots'],
  [{ robots: [{ ...robot, x: 0.375 }] }, 'robots[0]'],
  [{ match: { mode: 'maze', exit: { ...exit, x: 1 } } }, 'match.exit'],
  [{ obstacles: [{ ...exit, id: 'parede' }] }, 'match.exit'],
  [
    { match: { mode: 'maze', exit: { ...exit, height: 0 } } },
    'match.exit.height',
  ],
])('S1-US1-AC12: rejeita %j no caminho %s', (change, path) => {
  const parsed = loadWorld(JSON.stringify({ ...base, ...change }));
  expect(!parsed.ok && parsed.errors.some((error) => error.path === path)).toBe(
    true,
  );
});
