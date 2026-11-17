import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { createS1BenchmarkInput } from '../../scripts/bench';
import { createS2BenchmarkInput } from '../../scripts/bench-s2';
import { loadWorld, runHeadless } from '../../src/core';
import { initializeControllerEngine } from '../../src/runtime/controller-engine';
import { duel } from '../helpers/controlled';

function readController(name: string): string {
  return readFileSync(
    new URL(`../../examples/controllers/${name}.js`, import.meta.url),
    'utf8',
  );
}

it('S2-SC-003: Parado e Girador completam o Duelo sem histórico', () => {
  const parado = readController('parado');
  const girador = readController('girador');
  const engine = initializeControllerEngine();
  const input = createS2BenchmarkInput(duel, { parado, girador }, engine);
  expect(input).toEqual({
    world: duel,
    ticks: 3000,
    history: false,
    controllers: { vermelho: parado, azul: girador },
    controllerEngine: engine,
  });
  const result = runHeadless(input);
  expect(result).toMatchObject({
    ok: true,
    state: {
      tick: 3000,
      status: 'finalizada',
      resultado: { vencedor: null, motivo: 'tempo_esgotado', tick: 3000 },
      robots: [{ pose: { x: -0.2, y: 0 } }, { pose: { x: 0.2, y: 0 } }],
    },
  });
  expect(result).not.toHaveProperty('history');
});

it('o benchmark S1 preserva o mundo e os comandos durante 3 000 ticks livres', () => {
  const input = createS1BenchmarkInput(duel);
  const parsed = loadWorld(duel);
  const parsedBenchmark = loadWorld(input.world);
  if (!parsed.ok || !parsedBenchmark.ok) throw new Error('Mundo inválido');
  expect(parsedBenchmark.world).toEqual({
    ...parsed.world,
    match: { ...parsed.world.match, mode: 'free' },
  });
  expect(input.commands).toEqual({
    vermelho: { v: 1, w: 0 },
    azul: { v: 0.4, w: 0.1 },
  });
  expect(runHeadless(input)).toMatchObject({
    ok: true,
    state: { tick: 3000, status: 'em_andamento', resultado: null },
  });
});
