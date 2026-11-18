import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { App } from '../../../src/ui/App';
import { ArenaSession } from '../../../src/ui/arena/session';
import { testEngine } from './support';

afterEach(cleanup);

it('S3-US6-AC1: apresentação recolhe painéis e exibe placar, tempo e desfecho', () => {
  const session = new ArenaSession(testEngine);
  render(<App session={session} />);
  fireEvent.click(screen.getByRole('button', { name: 'Modo apresentação' }));
  expect(screen.queryByRole('complementary')).toBeNull();
  expect(screen.getByRole('region', { name: 'Cena 3D' })).toBeTruthy();
  const score = within(screen.getByRole('region', { name: 'Placar' }));
  expect(score.getByText('vermelho')).toBeTruthy();
  expect(score.getByText('azul')).toBeTruthy();
  expect(score.getByText('0,00 s')).toBeTruthy();
  act(() => {
    session.play();
    session.pulse(800);
  });
  expect(score.getByText(/Vitória de vermelho/)).toBeTruthy();
});

it('S3-US6-AC2: P e Esc controlam o modo sem alterar o snapshot', () => {
  const session = new ArenaSession(testEngine);
  render(<App session={session} />);
  const state = session.getSnapshot().snapshot;
  fireEvent.keyDown(document.body, { key: 'P' });
  expect(screen.getByRole('region', { name: 'Placar' })).toBeTruthy();
  fireEvent.keyDown(document.body, { key: 'Escape' });
  expect(screen.queryByRole('region', { name: 'Placar' })).toBeNull();
  fireEvent.keyDown(document.body, { key: 'p' });
  fireEvent.keyDown(document.body, { key: 'p' });
  expect(screen.getByRole('complementary')).toBeTruthy();
  expect(session.getSnapshot().snapshot).toBe(state);
});

it('S3-US6-AC3: painel recolhível e controles com rótulo são acessíveis por foco', () => {
  const session = new ArenaSession(testEngine);
  render(<App session={session} />);
  const button = screen.getByRole('button', { name: 'Recolher painel' });
  button.focus();
  expect(document.activeElement).toBe(button);
  expect(button.getAttribute('aria-expanded')).toBe('true');
  fireEvent.click(button);
  expect(button.getAttribute('aria-expanded')).toBe('false');
  expect(screen.queryByRole('complementary')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Expandir painel' }));
  expect(screen.getByRole('complementary')).toBeTruthy();
  expect(session.getSnapshot().snapshot.tick).toBe(0);
});
