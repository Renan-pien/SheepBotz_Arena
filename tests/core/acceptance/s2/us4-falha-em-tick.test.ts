import { expect, it } from 'vitest';
import { runControlled } from '../../../helpers/controlled';
import { expectClose } from '../../../helpers/tolerance';
import { worldText } from '../../../helpers/world-builder';

it('S2-US4-AC3: captura a exceção no tick 6 e preserva os logs anteriores', () => {
  const { state, history } = runControlled(
    worldText(),
    {
      r1: `function loop() {
      if (getInfo().tick < 5) { setSpeed(1, 0); return; }
      if (getInfo().tick === 5) {
        setSpeed(-1, 0); log('antes da falha'); throw Error('falha no loop');
      }
      log('loop após falha');
    }`,
    },
    10,
    { history: true },
  );
  expectClose(state.robots[0]!.pose.x, 0.5);
  expect(history?.[5]?.robots[0]?.situacao).toBe('ativo');
  expect(history?.[6]?.robots[0]).toMatchObject({
    situacao: 'desativado',
    command: { v: 0, w: 0 },
  });
  expect(state.events).toEqual([
    { type: 'log', tick: 6, robotId: 'r1', message: 'antes da falha' },
    {
      type: 'erro_controlador',
      tick: 6,
      robotId: 'r1',
      message: 'falha no loop',
    },
  ]);
});
it('S2-US4-AC4: velocidade inválida desativa e gera evento', () => {
  const { state } = runControlled(
    worldText(),
    {
      r1: 'function loop() { setSpeed("rápido", 0); }',
    },
    1,
  );
  expect(state.robots[0]?.situacao).toBe('desativado');
  expect(state.events[0]).toMatchObject({
    type: 'erro_controlador',
    tick: 1,
    robotId: 'r1',
    message: expect.stringContaining('dois números finitos'),
  });
});
it('S2-US4-AC5: falha de setup impede o primeiro loop e os seguintes', () => {
  const { state } = runControlled(
    worldText(),
    {
      r1: `function setup() { throw Error('falha no setup'); }
      function loop() { log('loop executado'); setSpeed(1, 0); }`,
    },
    3,
  );
  expect(state.robots[0]).toMatchObject({
    situacao: 'desativado',
    pose: { x: 0, y: 0 },
    command: { v: 0, w: 0 },
  });
  expect(state.events).toEqual([
    {
      type: 'erro_controlador',
      tick: 1,
      robotId: 'r1',
      message: 'falha no setup',
    },
  ]);
});
it('conserva a primeira falha quando o controlador captura setSpeed', () => {
  const { state } = runControlled(
    worldText(),
    {
      r1: `function loop() {
      setSpeed(1, 0);
      try { setSpeed(NaN, 0); } catch {}
      setSpeed(1, 0);
      throw Error('erro posterior');
    }`,
    },
    1,
  );
  expect(state.robots[0]).toMatchObject({
    situacao: 'desativado',
    pose: { x: 0, y: 0 },
  });
  expect(state.events).toEqual([
    {
      type: 'erro_controlador',
      tick: 1,
      robotId: 'r1',
      message: 'setSpeed exige dois números finitos.',
    },
  ]);
});
