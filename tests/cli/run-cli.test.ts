import { expect, it } from 'vitest';
import { runCli } from '../../src/cli/run-cli';
import { duel } from '../helpers/duel';
import { robot, worldText } from '../helpers/world-builder';

const source = worldText({
  robots: [robot({ id: 'a', x: -1 }), robot({ id: 'b', x: 1 })],
});
const base = ['--world', 'exemplo.json', '--ticks', '2'];

function invoke(
  args: string[],
  text?: string,
  scripts: Record<string, string> = {},
) {
  const printed: string[] = [];
  const diagnostics: string[] = [];
  const code = runCli(args, {
    readFile(path) {
      if (Object.hasOwn(scripts, path)) return scripts[path]!;
      if (path !== 'exemplo.json') throw new Error('Arquivo indisponível.');
      return text ?? source;
    },
    stdout: (text) => printed.push(text),
    stderr: (text) => diagnostics.push(text),
  });
  return { code, stdout: printed.join(''), stderr: diagnostics.join('') };
}

it('usa a última opção de controlador e mantém o texto UTF-8', () => {
  const run = invoke(
    [
      ...base,
      '--controller',
      'a=nem-leia.js',
      '--controller',
      'a=ação=robô.js',
      '--history',
    ],
    undefined,
    { 'ação=robô.js': 'function loop() { log("ação"); setSpeed(.5,0); }' },
  );
  expect(run.code).toBe(0);
  expect(run.stderr).toBe('');
  expect(JSON.parse(run.stdout)).toMatchObject({
    ok: true,
    state: {
      tick: 2,
      events: [
        { type: 'log', tick: 1, robotId: 'a', message: 'ação' },
        { type: 'log', tick: 2, robotId: 'a', message: 'ação' },
      ],
    },
  });
});

it('devolve os erros de controlador no JSON e código 1', () => {
  const run = invoke(
    [
      ...base,
      '--command',
      'a=0,0',
      '--controller',
      'a=script.js',
      '--controller',
      'b=script.js',
    ],
    undefined,
    { 'script.js': 'function loop( {' },
  );
  expect(run.code).toBe(1);
  expect(run.stderr).toBe('');
  expect(JSON.parse(run.stdout)).toMatchObject({
    ok: false,
    errors: [
      { code: 'ENTRADA_CONFLITANTE', path: 'controllers.a' },
      { code: 'CONTROLADOR_INVALIDO', path: 'controllers.b' },
    ],
  });
});

it.each(['a=', '=script.js', 'a=  ', 'sem-separador'])(
  'rejeita opção de controlador incompleta: %s',
  (flag) => {
    const run = invoke([...base, '--controller', flag]);
    expect(run.code).toBe(2);
    expect(run.stdout).toBe('');
    expect(run.stderr).toContain('Uso:');
  },
);

it('devolve somente diagnóstico de E/S se não puder ler o controlador', () => {
  const run = invoke([...base, '--controller', 'a=ausente.js']);
  expect(run.code).toBe(2);
  expect(run.stdout).toBe('');
  expect(run.stderr).toContain('ausente.js');
  expect(run.stderr).toContain('controlador');
});

it('serializa um único evento global e trunca o histórico no fim do duelo', () => {
  const run = invoke(
    [
      '--world',
      'exemplo.json',
      '--ticks',
      '40',
      '--controller',
      'vermelho=avanca.js',
      '--history',
    ],
    duel,
    { 'avanca.js': 'function loop() {setSpeed(1,0);}' },
  );
  expect(run.code).toBe(0);
  const output = JSON.parse(run.stdout);
  expect(output.state).toMatchObject({
    tick: 34,
    status: 'finalizada',
    events: [{ type: 'fim_da_luta', robotId: null, tick: 34 }],
  });
  expect(output.history).toHaveLength(35);
  expect(output.history[34]).toEqual(output.state);
});

it('imprime um resultado headless compacto em stdout', () => {
  const run = invoke(base);
  expect(run.code).toBe(0);
  expect(run.stderr).toBe('');
  expect(run.stdout.trim().split('\n')).toHaveLength(1);
  expect(JSON.parse(run.stdout)).toMatchObject({
    ok: true,
    state: { tick: 2, time: 0.2 },
  });
});

it('aceita comandos repetidos, histórico e impressão indentada', () => {
  const run = invoke([
    ...base,
    '--command',
    'a=0.1,0',
    '--command',
    'a=0.5,0',
    '--command',
    'b=-0.25,0',
    '--history',
    '--pretty',
  ]);
  expect(run.code).toBe(0);
  expect(run.stderr).toBe('');
  expect(run.stdout).toContain('\n  "ok": true');
  const result = JSON.parse(run.stdout);
  expect(result.history).toHaveLength(3);
  expect(result.history[2]).toEqual(result.state);
  expect(
    result.state.robots.map(
      (robot: { command: { v: number } }) => robot.command.v,
    ),
  ).toEqual([0.5, -0.25]);
});

it('retorna 1 e escreve os erros de mundo em stdout', () => {
  const run = invoke(base, '{}');
  expect(run.code).toBe(1);
  expect(run.stderr).toBe('');
  expect(JSON.parse(run.stdout)).toMatchObject({
    ok: false,
    errors: expect.arrayContaining([
      { code: 'CAMPO_OBRIGATORIO', path: 'map', message: expect.any(String) },
    ]),
  });
});

it.each([
  ['ausente=1,0', 'ROBO_INEXISTENTE', 'commands.ausente'],
  ['a=texto,0', 'COMANDO_INVALIDO', 'commands.a'],
])('retorna 1 e imprime o erro de comando %s', (command, code, path) => {
  const run = invoke([...base, '--command', command]);
  expect(run.code).toBe(1);
  expect(run.stderr).toBe('');
  expect(JSON.parse(run.stdout)).toMatchObject({
    ok: false,
    errors: [{ code, path }],
  });
});

it.each(
  [
    [],
    ['--world', 'exemplo.json'],
    ['--ticks', '0'],
    ['--world', 'exemplo.json', '--ticks', '1.5'],
    ['--world', 'exemplo.json', '--ticks', '9'.repeat(400)],
    [...base, '--opcao-errada'],
    [...base, '--command', 'a=1'],
    [...base, '--command', 'a= ,0'],
    ['--world', 'ausente.json', '--ticks', '0'],
  ].map((args) => ({ args })),
)('retorna 2 e explica o erro de uso ou leitura em stderr (%#)', ({ args }) => {
  const run = invoke(args);
  expect(run.code).toBe(2);
  expect(run.stdout).toBe('');
  expect(run.stderr).toMatch(/Uso:|Não foi possível ler/);
});

it('S2-US3-AC13: CLI ativa impasse por opção e rejeita prazo inválido', () => {
  const args = [
    '--world',
    'exemplo.json',
    '--ticks',
    '3000',
    '--stall-seconds',
  ];
  expect(
    JSON.parse(invoke([...args, '5'], duel).stdout).state.resultado,
  ).toEqual({ motivo: 'falta_de_progresso', vencedor: null, tick: 250 });
  expect(invoke([...args, '7'], duel).code).toBe(2);
});

it('S2-US3-AC16: comando constante queima somente com a largada de sumô habilitada', () => {
  const args = [...base, '--command', 'azul=0,-1'];
  expect(JSON.parse(invoke(args, duel).stdout).state.resultado).toBeNull();
  const run = invoke([...args, '--sumo-start-delay'], duel);
  expect(run.code).toBe(0);
  expect(JSON.parse(run.stdout).state.resultado).toEqual({
    tick: 1,
    motivo: 'queima_da_largada',
    vencedor: 'vermelho',
    pontos: { vermelho: 1, azul: 0 },
  });
  expect(
    JSON.parse(
      invoke([...base, '--sumo-start-delay', '--command', 'a=0.1,0']).stdout,
    ).state.sumoStartDelay,
  ).toBeUndefined();
});
