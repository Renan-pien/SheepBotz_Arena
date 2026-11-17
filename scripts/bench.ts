import { readFileSync } from 'node:fs';
import { arch, cpus, platform } from 'node:os';
import { performance } from 'node:perf_hooks';
import { runHeadless } from '../src/core';

const ticks = 3000;
const world = readFileSync(
  new URL('../examples/worlds/duelo-padrao.json', import.meta.url),
  'utf8',
);
const start = performance.now();
const result = runHeadless({
  world,
  ticks,
  commands: { vermelho: { v: 1, w: 0 }, azul: { v: 0.4, w: 0.1 } },
});
const elapsed = performance.now() - start;
if (!result.ok) throw new Error(JSON.stringify(result.errors));

console.log(
  `${result.state.tick} ticks · ${result.state.robots.length} robôs · ${elapsed.toFixed(2)} ms`,
);
console.log(
  `Node ${process.version} · ${platform()} ${arch()} · ${cpus()[0]?.model ?? 'CPU não identificada'}`,
);
if (elapsed >= 1000) process.exitCode = 1;
