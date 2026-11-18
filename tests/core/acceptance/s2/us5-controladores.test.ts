import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { duel, runControlled } from '../../../helpers/controlled';
import { prepared } from '../../../helpers/prepared';
import { robot, worldText } from '../../../helpers/world-builder';

function source(name: string) {
  return readFileSync(
    new URL(`../../../../examples/controllers/${name}.js`, import.meta.url),
    'utf8',
  );
}

it('S2-US5-AC2: carrega os cinco scripts pelos contratos públicos', () => {
  for (const name of ['parado', 'avanca', 'girador', 'cacador', 'desviador']) {
    expect(prepared(duel, { vermelho: source(name) }).getState().tick).toBe(0);
  }
});
it('S2-US5-AC3: Desviador completa 2 000 ticks no modo livre', () => {
  const world = readFileSync(
    new URL(
      '../../../../examples/worlds/sala-com-obstaculos.json',
      import.meta.url,
    ),
    'utf8',
  );
  const { state } = runControlled(
    world,
    { explorador: source('desviador') },
    2000,
  );
  expect(state).toMatchObject({
    tick: 2000,
    status: 'em_andamento',
    resultado: null,
  });
  expect(state.events.some((event) => event.type === 'erro_controlador')).toBe(
    false,
  );
});
it.each([
  ['parado', { v: 0, w: 0 }],
  ['avanca', { v: 1, w: 0 }],
  ['girador', { v: 0, w: 3 }],
  ['cacador', { v: 1, w: 0 }],
])('o exemplo %s emite o comando do Anexo D', (name, command) => {
  const { state } = runControlled(duel, { vermelho: source(name) }, 1);
  expect(state.robots[0]?.command).toEqual(command);
});
it('Caçador gira sem detecção e Desviador muda ao chegar perto', () => {
  const laser = { rays: 9, fov: Math.PI, maxRange: 1.5 };
  const near = { id: 'caixa', x: 0.45, y: 0, width: 0.2, height: 0.4 };
  function command(name: string, obstacles: object[]) {
    const result = runControlled(
      worldText({ robots: [robot({ laser })], obstacles }),
      {
        r1: source(name),
      },
      1,
    );
    expect(result.state.events).toEqual([]);
    return result.state.robots[0]?.command;
  }
  expect(command('cacador', [])).toEqual({ v: 0, w: 3 });
  expect(command('desviador', [])).toEqual({ v: 0.5, w: 0 });
  expect(command('desviador', [near])).toEqual({ v: 0, w: 2 });
});
