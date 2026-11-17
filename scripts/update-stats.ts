import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

interface Metric {
  readonly total: number;
  readonly covered: number;
  readonly skipped: number;
  readonly pct: number;
}

interface Coverage {
  readonly lines: Metric;
  readonly statements: Metric;
  readonly functions: Metric;
  readonly branches: Metric;
}

function metricsLine(tests: number, coverage: number): string {
  return `**${tests} testes · ${Math.floor(coverage)}% de cobertura**`;
}

export function rewriteReadme(
  readme: string,
  tests: number,
  coverage: number,
): string {
  const pattern = /^\*\*\d+ testes · \d+% de cobertura\*\*$/m;
  if (!pattern.test(readme)) {
    throw new Error(
      'A linha de testes e cobertura não foi encontrada no README.md.',
    );
  }
  return readme.replace(pattern, metricsLine(tests, coverage));
}

export function updateStats(root: string): void {
  const { numTotalTests } = JSON.parse(
    readFileSync(join(root, 'reports/test-results.json'), 'utf8'),
  ) as { numTotalTests: number };
  const coverage = JSON.parse(
    readFileSync(join(root, 'coverage/coverage-summary.json'), 'utf8'),
  ) as { total: Coverage } & Record<string, Coverage>;
  const { total, ...files } = coverage;
  const readmePath = join(root, 'README.md');
  const readme = rewriteReadme(
    readFileSync(readmePath, 'utf8'),
    numTotalTests,
    total.lines.pct,
  );
  // As chaves do relatório V8 incluem o caminho absoluto do checkout.
  const portable = Object.fromEntries(
    Object.keys(files)
      .sort()
      .map((file) => [
        (isAbsolute(file) ? relative(root, file) : file).split(sep).join('/'),
        files[file],
      ]),
  );
  const destination = join(root, 'docs/cobertura');
  mkdirSync(destination, { recursive: true });
  writeFileSync(
    join(destination, 'resumo.md'),
    [
      '# Cobertura de testes',
      '',
      metricsLine(numTotalTests, total.lines.pct),
      '',
      '| Métrica | Cobertos | Total | Percentual |',
      '|---|---:|---:|---:|',
      ...(
        [
          ['Linhas', total.lines],
          ['Instruções', total.statements],
          ['Funções', total.functions],
          ['Ramos', total.branches],
        ] as const
      ).map(
        ([label, metric]) =>
          `| ${label} | ${metric.covered} | ${metric.total} | ${metric.pct}% |`,
      ),
      '',
    ].join('\n'),
  );
  writeFileSync(
    join(destination, 'coverage-summary.json'),
    JSON.stringify({ total, ...portable }, null, 2) + '\n',
  );
  writeFileSync(readmePath, readme);
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  updateStats(process.cwd());
}
