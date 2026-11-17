import { readFileSync } from 'node:fs';
import { arch, cpus, platform } from 'node:os';
import { performance } from 'node:perf_hooks';
import { runHeadless, type HeadlessInput } from '../src/core';

const ticks = 3000;

export function createS1BenchmarkInput(world: string): HeadlessInput {
  const document = JSON.parse(world) as { match: { maxTicks: number } };
  return {
    world: JSON.stringify({
      ...document,
      match: { ...document.match, mode: 'free' },
    }),
    ticks,
    commands: { vermelho: { v: 1, w: 0 }, azul: { v: 0.4, w: 0.1 } },
  };
}

if (import.meta.main) {
  const world = readFileSync(
    new URL('../examples/worlds/duelo-padrao.json', import.meta.url),
    'utf8',
  );
  const input = createS1BenchmarkInput(world);
  const start = performance.now();
  const result = runHeadless(input);
  const elapsed = performance.now() - start;
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  if (result.state.tick !== ticks) {
    throw new Error(
      `Benchmark S1 devolveu ${result.state.tick} de ${ticks} ticks.`,
    );
  }

  console.log(
    `${result.state.tick} ticks · ${result.state.robots.length} robôs · ${elapsed.toFixed(2)} ms`,
  );
  console.log(
    `Node ${process.version} · ${platform()} ${arch()} · ${cpus()[0]?.model ?? 'CPU não identificada'}`,
  );
  if (elapsed >= 1000) process.exitCode = 1;
}
