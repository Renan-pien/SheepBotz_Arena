import { readFileSync } from 'node:fs';
import { arch, cpus, platform } from 'node:os';
import { performance } from 'node:perf_hooks';
import {
  runHeadless,
  type ControllerEngine,
  type HeadlessInput,
} from '../src/core';
import { initializeControllerEngine } from '../src/runtime/controller-engine';

const ticks = 3000;

export function createS2BenchmarkInput(
  world: string,
  sources: { readonly parado: string; readonly girador: string },
  controllerEngine: ControllerEngine,
): HeadlessInput {
  return {
    world,
    controllers: { vermelho: sources.parado, azul: sources.girador },
    controllerEngine,
    ticks,
    history: false,
  };
}

if (import.meta.main) {
  const world = readFileSync(
    new URL('../examples/worlds/duelo-padrao.json', import.meta.url),
    'utf8',
  );
  const sources = {
    parado: readFileSync(
      new URL('../examples/controllers/parado.js', import.meta.url),
      'utf8',
    ),
    girador: readFileSync(
      new URL('../examples/controllers/girador.js', import.meta.url),
      'utf8',
    ),
  };
  const input = createS2BenchmarkInput(
    world,
    sources,
    initializeControllerEngine(),
  );
  const start = performance.now();
  const result = runHeadless(input);
  const elapsed = performance.now() - start;
  if (!result.ok) throw new Error(JSON.stringify(result.errors));

  const { state } = result;
  const expectedResult =
    state.status === 'finalizada' &&
    state.tick === ticks &&
    state.resultado?.tick === ticks &&
    state.resultado.motivo === 'tempo_esgotado' &&
    state.resultado.vencedor === null;

  console.log(
    `${state.tick} ticks · ${state.resultado?.motivo ?? state.status} · ${elapsed.toFixed(2)} ms`,
  );
  console.log(
    `Node ${process.version} · ${platform()} ${arch()} · ${cpus()[0]?.model ?? 'CPU não identificada'}`,
  );
  if (!expectedResult) {
    console.error(
      'O resultado do benchmark S2 diverge do cenário de referência.',
    );
    process.exitCode = 1;
  }
  if (elapsed >= 2000) {
    console.error('O benchmark S2 atingiu o limite de 2 000 ms.');
    process.exitCode = 1;
  }
}
