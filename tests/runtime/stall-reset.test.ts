import { expect, it } from 'vitest';
import { runHeadless } from '../../src/core';
import { initializeControllerEngine } from '../../src/runtime/controller-engine';
import { decodeRecording, encodeRecording } from '../../src/ui/arena/recording';
import { ArenaSession } from '../../src/ui/arena/session';

it('S3-US2-AC15: rodadas consecutivas restauram sensores, pose, closures e PRNG e aguardam um comando', () => {
  const session = new ArenaSession();
  session.editSource(
    'vermelho',
    'let n=0; function setup(){log(random())} function loop(){log(++n, random());if(getInfo().startReleased === false)return;setSpeed(0,1)}',
  );
  session.apply('vermelho');
  session.setStallSeconds(5);
  const initial = session.getSnapshot().snapshot;
  session.step();
  const first = session.getSnapshot().snapshot;
  for (let round = 1; round <= 2; round++) {
    for (let tick = 1; tick < 500; tick++) session.step();
    const view = session.getSnapshot();
    expect(view.snapshot).toEqual(initial);
    expect(view).toMatchObject({
      status: 'pausada',
      stallSeconds: 5,
      lastDraw: {
        round,
        result: { vencedor: null, tick: 500, motivo: 'falta_de_progresso' },
      },
    });
    const archive = view.lastDraw!.recording;
    expect(archive.states).toHaveLength(501);
    expect(
      archive.states.at(-1)!.events.filter((e) => e.type === 'fim_da_luta'),
    ).toHaveLength(1);
    expect(archive.controllers).toEqual(view.controllers);
    session.pulse(2000);
    session.back();
    expect(session.history()).toEqual([initial]);
    session.step();
    expect(session.getSnapshot().snapshot).toEqual(first);
  }
});

it('S3-US2-AC16: retroceder no giro dos Caçadores reproduz o empate no tick 758 e o reset pausado', () => {
  const session = new ArenaSession();
  session.selectExample('azul', 'cacador');
  session.apply('azul');
  const initial = session.getSnapshot().snapshot;
  for (let tick = 1; tick <= 757; tick++) session.step();
  const before = session.getSnapshot().snapshot;
  expect(before.stall?.pair?.sinceTick).toBe(258);
  session.back();
  session.step();
  expect(session.getSnapshot().snapshot).toEqual(before);
  session.step();
  session.pulse(10000);
  const view = session.getSnapshot();
  expect(view.status).toBe('pausada');
  expect(view.snapshot).toEqual(initial);
  expect(view.lastDraw?.result).toEqual({
    tick: 758,
    motivo: 'falta_de_progresso',
    vencedor: null,
  });
  const file = encodeRecording(view.lastDraw!.recording);
  session.openRecording(file);
  session.seek(757);
  expect(session.getSnapshot().snapshot).toEqual(before);
  session.step();
  expect(session.getSnapshot()).toMatchObject({
    mode: 'replay',
    status: 'finalizada',
    snapshot: { tick: 758 },
  });
});

it('S3-US5-AC13: replay v2 mantém o giro até o tempo normal e preserva a versão ao salvar', () => {
  const session = new ArenaSession();
  session.selectExample('azul', 'cacador');
  session.apply('azul');
  const { world, controllers, createdAt } = session.recording();
  const text = JSON.stringify({
    ...JSON.parse(world),
    match: { mode: 'sumo', maxTicks: 560 },
  });
  // Captura as poses físicas sem aplicar a regra nova e monta o formato v2 original.
  const legacy = runHeadless({
    world: text,
    controllers,
    controllerEngine: initializeControllerEngine(),
    ticks: 560,
    history: true,
  });
  if (!legacy.ok) throw Error(JSON.stringify(legacy.errors));
  const document = {
    format: 'sheepbotz-arena',
    version: 2,
    stallSeconds: 10,
    world: text,
    controllers,
    createdAt,
    events: legacy.state.events,
    states: legacy.history!.map(({ events, ...state }) => ({
      ...state,
      eventCount: events.length,
    })),
  };
  const decoded = decodeRecording(JSON.stringify(document));
  if (!decoded.ok) throw Error(decoded.error.message);
  expect(decoded.recording.states[508]!.stall?.pair).toBeUndefined();
  expect(decoded.recording.states[508]!.resultado).toBeNull();
  expect(decoded.recording.states.at(-1)?.resultado?.motivo).toBe(
    'tempo_esgotado',
  );
  expect(JSON.parse(encodeRecording(decoded.recording))).toEqual(document);
  expect(decodeRecording(JSON.stringify({ ...document, version: 3 })).ok).toBe(
    false,
  );
});
