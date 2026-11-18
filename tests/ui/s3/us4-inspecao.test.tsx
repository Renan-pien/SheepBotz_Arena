import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import type { SimEvent } from '../../../src/core';
import { App } from '../../../src/ui/App';
import { ArenaSession } from '../../../src/ui/arena/session';
import { Events } from '../../../src/ui/panels/Events';
import { resultLabel } from '../../../src/ui/panels/Inspection';
import { testEngine } from './support';

afterEach(cleanup);
function mount() {
  const session = new ArenaSession(testEngine);
  render(<App session={session} />);
  return session;
}
function inspect() {
  fireEvent.click(screen.getByRole('tab', { name: 'Inspeção' }));
  return screen.getByRole('region', { name: 'Inspeção' });
}

it('S3-US4-AC1: mostra pose, odometria, comando, bumper e cinco raios no tick zero', () => {
  mount();
  const panel = inspect();
  const robot = within(panel).getByRole('article', {
    name: 'Inspeção de vermelho',
  });
  const table = within(robot).getByRole('table');
  expect(robot.textContent).toContain('ativo');
  expect(robot.textContent).toContain('−0,200 m');
  expect(robot.textContent).toContain('θ 0,0°');
  expect(robot.textContent).toContain('0,00 m/s');
  expect(robot.textContent).toContain('inativo');
  expect(within(table).getAllByRole('row')).toHaveLength(6);
  expect(table.textContent).toContain('0,350 m');
  for (const degrees of ['−30,0°', '−15,0°', '0,0°', '15,0°', '30,0°']) {
    expect(table.textContent).toContain(degrees);
  }
});

it('S3-US4-AC2: cena, painel e contador observam o mesmo tick', () => {
  const session = mount();
  const panel = inspect();
  act(() => {
    session.play();
    session.pulse(160);
    session.pause();
  });
  expect(panel.dataset.tick).toBe('8');
  expect(screen.getByRole('region', { name: 'Cena 3D' }).dataset.tick).toBe(
    '8',
  );
  expect(screen.getByTestId('current-tick').textContent).toBe('Tick 8');
});

it('S3-US4-AC3: informa diferença entre posição resolvida e odometria', () => {
  const session = mount();
  inspect();
  act(() => {
    session.play();
    session.pulse(800);
  });
  const blue = within(
    screen.getByRole('article', { name: 'Inspeção de azul' }),
  );
  expect(blue.getByText('Diferença').nextElementSibling?.textContent).toBe(
    '0,190 m',
  );
  expect(blue.getByText('Pose real').nextElementSibling?.textContent).toContain(
    '0,390 m',
  );
  expect(blue.getByText('Odometria').nextElementSibling?.textContent).toContain(
    '0,200 m',
  );
});

it('S3-US4-AC4: filtra eventos e exibe os 500 mais recentes na ordem original', () => {
  const { snapshot, world } = new ArenaSession(testEngine).getSnapshot();
  const events: SimEvent[] = Array.from({ length: 501 }, (_, i) => ({
    type: 'log',
    tick: i + 1,
    robotId: 'vermelho',
    message: 'Log ' + i,
  }));
  events.push({
    type: 'erro_controlador',
    robotId: 'azul',
    tick: 502,
    message: 'Falhou',
  });
  events.push({
    type: 'fim_da_luta',
    robotId: null,
    tick: 503,
    message: 'Fechou',
  });
  render(<Events world={world} snapshot={{ ...snapshot, events }} />);
  expect(screen.getByText('3 eventos ocultos')).toBeTruthy();
  expect(screen.queryByText('Log 0')).toBeNull();
  expect(screen.getByText('Partida', { selector: 'strong' })).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Tipo de evento'), {
    target: { value: 'erro_controlador' },
  });
  expect(screen.getByText('Falhou')).toBeTruthy();
  expect(screen.queryByText('Fechou')).toBeNull();
  fireEvent.change(screen.getByLabelText('Robô do evento'), {
    target: { value: 'vermelho' },
  });
  expect(
    screen.getByText('Nenhum evento para os filtros selecionados.'),
  ).toBeTruthy();
});

it('S3-US4-AC5: anuncia a vitória do Duelo e identifica as ações', () => {
  const session = mount();
  act(() => {
    session.play();
    session.pulse(800);
  });
  expect(
    screen.getByText('Vitória de vermelho — saída da arena · tick 34 · 0,68 s'),
  ).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Reiniciar luta' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Ver replay' })).toBeTruthy();
});

it('S3-US4-AC6: traduz empate por tempo e por saídas simultâneas', () => {
  const { snapshot } = new ArenaSession(testEngine).getSnapshot();
  const final = {
    ...snapshot,
    tick: 2,
    time: 0.04,
    status: 'finalizada' as const,
  };
  expect(
    resultLabel({
      ...final,
      resultado: { vencedor: null, motivo: 'tempo_esgotado', tick: 2 },
    }),
  ).toBe('Empate — tempo esgotado · tick 2 · 0,04 s');
  expect(
    resultLabel({
      ...final,
      resultado: { vencedor: null, motivo: 'ambos_sairam', tick: 2 },
    }),
  ).toContain('Empate — os dois saíram da arena');
});
