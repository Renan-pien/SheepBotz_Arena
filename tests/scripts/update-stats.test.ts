import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { rewriteReadme, updateStats } from '../../scripts/update-stats';

it('substitui a linha de métricas e arredonda a cobertura de linhas para baixo', () => {
  const input =
    '# SheepBotz Arena\n\n**0 testes · 0% de cobertura**\n\nIntrodução.\n';
  expect(rewriteReadme(input, 142, 87.99)).toBe(
    '# SheepBotz Arena\n\n**142 testes · 87% de cobertura**\n\nIntrodução.\n',
  );
  expect(() => rewriteReadme('# Sem métricas', 12, 98)).toThrow(/README/);
});

it('gera relatórios portáveis e reflete as métricas reais no README', () => {
  const root = mkdtempSync(join(tmpdir(), 'sheepbotz-stats-'));
  try {
    mkdirSync(join(root, 'reports'));
    mkdirSync(join(root, 'coverage'));
    const metric = { total: 5, covered: 4, skipped: 0, pct: 80 };
    const coverage = {
      lines: metric,
      statements: metric,
      functions: metric,
      branches: metric,
    };
    writeFileSync(
      join(root, 'reports/test-results.json'),
      JSON.stringify({ numTotalTests: 3 }),
    );
    writeFileSync(
      join(root, 'coverage/coverage-summary.json'),
      JSON.stringify({
        total: coverage,
        [join(root, 'src/example.ts')]: coverage,
        'src/other.ts': coverage,
      }),
    );
    writeFileSync(
      join(root, 'README.md'),
      '# Simulador\n\n**0 testes · 0% de cobertura**\n',
    );

    updateStats(root);
    expect(readFileSync(join(root, 'README.md'), 'utf8')).toContain(
      '**3 testes · 80% de cobertura**',
    );
    expect(
      readFileSync(join(root, 'docs/cobertura/resumo.md'), 'utf8'),
    ).toContain('| Linhas | 4 | 5 | 80% |');
    expect(
      JSON.parse(
        readFileSync(
          join(root, 'docs/cobertura/coverage-summary.json'),
          'utf8',
        ),
      ),
    ).toEqual({
      total: coverage,
      'src/example.ts': coverage,
      'src/other.ts': coverage,
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
