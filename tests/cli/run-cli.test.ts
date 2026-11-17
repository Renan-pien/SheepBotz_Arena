import { expect, it } from 'vitest';
import { runCli } from '../../src/cli/run-cli';
import { robot, worldText } from '../helpers/world-builder';

const source = worldText({
  robots: [robot({ id: 'a', x: -1 }), robot({ id: 'b', x: 1 })],
});
const base = ['--world', 'exemplo.json', '--ticks', '2'];

function invoke(args: string[], text?: string) {
  const printed: string[] = [];
  const diagnostics: string[] = [];
  const code = runCli(args, {
    readFile(path) {
      if (path !== 'exemplo.json') throw new Error('Arquivo indisponível.');
      return text ?? source;
    },
    stdout: (text) => printed.push(text),
    stderr: (text) => diagnostics.push(text),
  });
  return { code, stdout: printed.join(''), stderr: diagnostics.join('') };
}

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
