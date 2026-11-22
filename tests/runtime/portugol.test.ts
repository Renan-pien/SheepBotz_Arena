import { loadWorld, prepareSimulation } from '../../src/core';
import { createHash } from 'node:crypto';
import { beforeAll, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { loadPyodide } from 'pyodide';
import {
  installMaker,
  type MakerRuntime,
} from '../../src/runtime/portugol/runtime';
import type { ControllerBindings } from '../../src/core/controller/runtime';

let engine: MakerRuntime;
const program = (body: string, declarations = '') => `algoritmo "Teste"
usar "maker"
${declarations}
funcao decidir()
${body}
fim_funcao
inicio
fim_algoritmo`;

function robot() {
  const outputs: unknown[][] = [];
  const api: ControllerBindings = {
    getInfo: () => ({ time: 5, startReleased: true }),
    readEdge: () => ({ front: true }),
    readLaser: () => [0.3, 0.2, 0.1],
    readOdometry: () => ({ x: 0.25 }),
    readBumper: () => false,
    setSpeed: (...v) => outputs.push(v),
    log: (...v) => outputs.push(v),
    random: () => 0.4,
  };
  return { outputs, api };
}
beforeAll(async () => {
  const py = await loadPyodide();
  engine = installMaker(
    py,
    await readFile('public/meupia/core-1.4.1.whl'),
    await readFile('public/meupia/plugin_iot.py'),
  );
}, 30000);

it('S2-US2-AC15: memória privada por carga, tempo, sorteio e sensores por tick', () => {
  const source = program(
    'n <- n + 1\nregistrar(n, tempo_simulado(), aleatorio(), ler_borda("frente"), ler_laser_central())',
    'var n: inteiro',
  );
  const a = robot(),
    b = robot();
  const first = engine.load(source, a.api),
    second = engine.load(source, b.api);
  if (!first.ok || !second.ok) throw Error(JSON.stringify([first, second]));
  first.value.setup?.();
  second.value.setup?.();
  first.value.loop();
  first.value.loop();
  second.value.loop();
  expect(a.outputs).toEqual([
    [1, 5, 0.4, true, 0.2],
    [2, 5, 0.4, true, 0.2],
  ]);
  expect(b.outputs).toEqual([[1, 5, 0.4, true, 0.2]]);
});
it('S2-US2-AC16: pino real do módulo Maker comanda a tração virtual', () => {
  const r = robot();
  const result = engine.load(
    program('iot_configurar_pino(2, "SAIDA")\niot_ligar(2)\niot_desligar(2)'),
    r.api,
  );
  if (!result.ok) throw Error(result.message);
  result.value.loop();
  expect(r.outputs).toEqual([
    [0.2, 0],
    [0, 0],
  ]);
});
it.each(['recurso_ausente()', 'iot_esperar(5)'])(
  'S2-US2-AC15: recusa na carga a operação indisponível %s',
  (expr) => {
    expect(engine.load(program(expr), robot().api).ok).toBe(false);
  },
);
it('S2-US2-AC15: rejeita outro plugin, callback ausente e assinatura inválida', () => {
  for (const source of [
    program('registrar(1)').replace('"maker"', '"grid"'),
    program('registrar(1)').replace('decidir()', 'auxiliar()'),
    program('registrar(1)').replace('decidir()', 'decidir(n)'),
  ])
    expect(engine.load(source, robot().api).ok).toBe(false);
});
it('S2-US2-AC15: orçamento por chamada encerra laço e preserva o outro controlador', () => {
  const bad = engine.load(
    program('enquanto verdadeiro faca\nregistrar(1)\nfim_enquanto'),
    robot().api,
  );
  const good = engine.load(program('definir_velocidade(0.1, 0)'), robot().api);
  if (!bad.ok || !good.ok) throw Error(JSON.stringify([bad, good]));
  expect(() => bad.value.loop()).toThrow(/limite/i);
  expect(() => good.value.loop()).not.toThrow();
});

it('S2-US2-AC15: acessos ambientais e nomes de capacidades são recusados antes da execução', () => {
  for (const body of [
    'abrir_arquivo("exemplo")',
    'relogio_real()',
    'obter_outro_robo()',
    'registrar(definir_velocidade)',
  ]) {
    const r = robot();
    expect(engine.load(program(body), r.api).ok).toBe(false);
    expect(r.outputs).toHaveLength(0);
  }
});
it('S2-US2-AC16: repete a inicialização e preserva odometria, laser e o tempo simulado', () => {
  const src = program(
    'registrar(ler_odometria()["x"], ler_laser()[0], ler_contato(), largada_liberada())',
  );
  const r = robot(),
    loaded = engine.load(src, r.api);
  if (!loaded.ok) throw Error(loaded.message);
  loaded.value.loop();
  expect(r.outputs).toEqual([[0.25, 0.3, false, true]]);
});

it('S2-US2-AC16: empacota o wheel e o arquivo oficial do Maker íntegros', async () => {
  for (const [name, hash] of Object.entries({
    'core-1.4.1.whl':
      '81c6b3793f95519484022ba79b8c35b0976d9d8cbe70a36357307c7f26b335fb',
    'plugin_iot.py':
      '684c5b0b723e87715081b7362f7e5be9d2b41f75b98a563d0eb3a3b51f38a23a',
  }))
    expect(
      createHash('sha256')
        .update(await readFile('public/meupia/' + name))
        .digest('hex'),
    ).toBe(hash);
});

it('S2-US2-AC15: inicio e preparar antecedem decidir e o reset recria variáveis e funções auxiliares', () => {
  const source = program(
    'para i de 1 ate 2 faca\nn <- dobro(n)\nfim_para\nregistrar(n)',
    'var\nn: inteiro\ni: inteiro\nfuncao dobro(x)\nretorne x * 2\nfim_funcao\nfuncao preparar()\nn <- n + 1\nfim_funcao',
  ).replace('inicio\nfim_algoritmo', 'inicio\nn <- 2\nfim_algoritmo');
  const r = robot();
  for (let i = 0; i < 2; i++) {
    const loaded = engine.load(source, r.api);
    if (!loaded.ok) throw Error(loaded.message);
    loaded.value.setup?.();
    loaded.value.loop();
    loaded.value.loop();
  }
  expect(r.outputs).toEqual([[12], [48], [12], [48]]);
});
it('S2-US2-AC16: recusa pino além da Arena e lado de borda inválido', () => {
  for (const expr of [
    'iot_ligar(8)',
    'iot_configurar_pino(2, "ENTRADA")',
    'registrar(ler_borda("outro"))',
  ]) {
    const r = robot();
    const loaded = engine.load(program(expr), r.api);
    if (!loaded.ok) throw Error(loaded.message);
    expect(() => loaded.value.loop()).toThrow();
    expect(r.outputs).toHaveLength(0);
  }
});
it('S2-US2-AC15: texto e tamanho do fonte respeitam os limites do perfil', () => {
  const source = program(
    'enquanto verdadeiro faca\ns <- s + s\nfim_enquanto',
    'var s: cadeia',
  ).replace('inicio\nfim_algoritmo', 'inicio\ns <- "a"\nfim_algoritmo');
  const r = robot();
  const loaded = engine.load(source, r.api);
  if (!loaded.ok) throw Error(loaded.message);
  loaded.value.setup?.();
  expect(() => loaded.value.loop()).toThrow(/texto/);
  expect(
    engine.load(program('registrar(1)') + ' '.repeat(32768), r.api).ok,
  ).toBe(false);
});

it('S2-US2-AC16: no duelo real a borda muda a velocidade e uma falha só desativa o outro robô', async () => {
  const duel = JSON.parse(
    await readFile('examples/worlds/duelo-padrao.json', 'utf8'),
  );
  duel.robots[0].x = 0.325;
  duel.robots[1].x = -0.2;
  const world = loadWorld(JSON.stringify(duel));
  if (!world.ok) throw Error(JSON.stringify(world.errors));
  const sources = {
    vermelho: await readFile('examples/controllers/borda.por', 'utf8'),
    azul: program('iot_ligar(8)'),
  };
  const result = prepareSimulation(world.world, {
    controllers: sources,
    controllerEngine: engine,
    sumoStartDelay: true,
  });
  if (!result.ok) throw Error(JSON.stringify(result.errors));
  const sim = result.simulation;
  sim.stepN(250);
  const first = sim.step(),
    next = sim.step();
  expect(first.robots[0]!.command.v).toBe(0.2);
  expect(next.robots[0]!.command.v).toBe(-0.25);
  expect(next.robots[1]!.situacao).toBe('desativado');
  expect(next.events.filter((e) => e.type === 'erro_controlador')).toHaveLength(
    1,
  );
  sim.reset();
  expect(sim.stepN(252)).toEqual(next);
});
