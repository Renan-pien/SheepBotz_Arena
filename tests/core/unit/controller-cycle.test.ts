import { expect, it } from 'vitest';
import { createInitialState, loadWorld } from '../../../src/core';
import { createControllerRunner } from '../../../src/core/controller/runner';
import { worldText } from '../../helpers/world-builder';

it('limita logs por robô, preserva os aceitos e emite um único aviso', () => {
  const loaded = loadWorld(worldText());
  if (!loaded.ok) throw new Error(JSON.stringify(loaded.errors));
  const runner = createControllerRunner(loaded.world);
  const binding = runner.bindingsFor('r1');
  const writes = new Map([
    [
      'r1',
      {
        loop() {
          for (let i = 0; i < 1002; i++) binding.log!(i);
          binding.log!({
            toString() {
              throw new Error('O log excedente não deve ser convertido.');
            },
          });
        },
      },
    ],
  ]);
  const tick = runner.run(createInitialState(loaded.world), {}, writes);
  expect(tick.events.filter((event) => event.type === 'log')).toHaveLength(
    1000,
  );
  expect(tick.events[999]?.message).toBe('999');
  expect(
    tick.events.filter((event) => event.type === 'limite_de_logs'),
  ).toEqual([
    {
      type: 'limite_de_logs',
      robotId: 'r1',
      tick: 1,
      message: "Limite de 1 000 logs atingido para 'r1'.",
    },
  ]);
  expect(() => binding.log!('sem tick')).toThrow();
});
