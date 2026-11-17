import { expect, it, vi } from 'vitest';
import { initializeControllerEngine } from '../../src/runtime/controller-engine';

const engine = initializeControllerEngine();

it('carrega uma vez sem API e conserva variáveis entre chamadas', () => {
  const record = vi.fn();
  const source = `
    if (typeof log !== 'undefined') throw Error('API presente durante a carga');
    let count = 1;
    function setup() { log(count++); }
    function loop() { log(count++); }
  `;
  const first = engine.load(source, { log: record });
  expect(first.ok).toBe(true);
  if (!first.ok) throw new Error(first.message);
  first.value.setup?.();
  first.value.loop();
  first.value.loop();
  const second = engine.load(source, { log: record });
  if (!second.ok) throw new Error(second.message);
  second.value.setup?.();
  expect(record.mock.calls).toEqual([[1], [2], [3], [1]]);
  expect(initializeControllerEngine()).toBe(engine);
});

it('mantém intrínsecos síncronos e retira recursos de agendamento do script', () => {
  const record = vi.fn();
  const script = engine.load(
    `
    const profile = [
      typeof Promise, typeof Array.fromAsync, typeof queueMicrotask,
      typeof Compartment, typeof eval, typeof Function,
      typeof setTimeout, typeof WeakRef, typeof FinalizationRegistry,
      typeof SharedArrayBuffer, typeof Atomics, typeof WebAssembly,
      typeof process, typeof fetch
    ];
    function loop() { log(profile, [2, 3].map(x => x * 2)); }
  `,
    { log: record },
  );
  if (!script.ok) throw new Error(script.message);
  script.value.loop();
  expect(record).toHaveBeenCalledWith(Array(14).fill('undefined'), [4, 6]);
  for (const expression of ['Date.now()', 'Math.random()']) {
    expect(engine.load(`${expression}; function loop() {}`, {})).toMatchObject({
      ok: false,
    });
  }
});

it.each([
  ['function loop( {', /Unexpected token/],
  ['let value = 1;', /loop.*obrigatória/],
  ['async function loop() {}', /assíncrono/],
  ['function* loop() {}', /gerador/],
  ['const setup = function* () {}; function loop() {}', /gerador/],
  ['function loop() {}\nimport("robot.js")', /importação/],
  ['function loop() {}\nthrow new Error("falha original")', /falha original/],
])('rejeita %s com detalhe da fase de carga', (source, message) => {
  const loaded = engine.load(source, {});
  expect(loaded.ok).toBe(false);
  if (loaded.ok) throw new Error('Era esperada uma falha de carga.');
  expect(loaded.message).toMatch(message);
});
