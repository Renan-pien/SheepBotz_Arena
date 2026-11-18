import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { App } from '../../../src/ui/App';
import { ArenaSession } from '../../../src/ui/arena/session';
import { idleEngine, testEngine } from './support';

afterEach(cleanup);

function mount() {
  const session = new ArenaSession(testEngine);
  render(<App session={session} />);
  return session;
}
function button(name: string) {
  return screen.getByRole<HTMLButtonElement>('button', { name });
}

it('S3-US2-AC1: executar avança ticks fixos e atualiza contador e cena', () => {
  const session = mount();
  fireEvent.click(button('Executar'));
  act(() => session.pulse(60));
  expect(session.getSnapshot().snapshot.tick).toBe(3);
  expect(screen.getByRole('region', { name: 'Cena 3D' }).dataset.tick).toBe(
    '3',
  );
  expect(screen.getByText('0,06 s')).toBeTruthy();
});

it('S3-US2-AC2: pausar conserva o último snapshot', () => {
  const session = mount();
  fireEvent.click(button('Executar'));
  act(() => session.pulse(40));
  fireEvent.click(button('Pausar'));
  const previous = session.getSnapshot().snapshot;
  act(() => session.pulse(200));
  expect(session.getSnapshot().status).toBe('pausada');
  expect(session.getSnapshot().snapshot).toBe(previous);
});

it('S3-US2-AC3: botão avança de 10 para 11', () => {
  const session = mount();
  act(() => {
    session.play();
    session.pulse(200);
    session.pause();
  });
  fireEvent.click(button('Avançar 1 tick'));
  expect(session.getSnapshot().snapshot.tick).toBe(11);
});

it('S3-US2-AC4: reiniciar publica o tick zero e zera a gravação', () => {
  const session = mount();
  fireEvent.click(button('Avançar 1 tick'));
  fireEvent.click(button('Reiniciar'));
  expect(session.getSnapshot().status).toBe('pronta');
  expect(session.history().map((state) => state.tick)).toEqual([0]);
});

it('S3-US2-AC5: duas execuções padrão terminam com as mesmas poses e resultado', () => {
  const session = new ArenaSession(testEngine);
  session.play();
  session.pulse(800);
  const first = session.getSnapshot().snapshot;
  session.reset();
  session.play();
  session.pulse(800);
  expect(first.resultado).toEqual({
    vencedor: 'vermelho',
    motivo: 'saida_da_arena',
    tick: 34,
  });
  expect(session.getSnapshot().snapshot).toEqual(first);
});

it('S3-US2-AC6: velocidade muda somente o ritmo em tempo de parede', () => {
  const session = new ArenaSession(idleEngine);
  const speeds = [0.25, 0.5, 1, 2, 4] as const;
  for (const speed of speeds) {
    session.reset();
    session.setSpeed(speed);
    session.play();
    session.pulse(80);
    expect(session.getSnapshot().snapshot.tick).toBe(speed * 4);
    expect(session.getSnapshot().snapshot.time).toBe(speed * 0.08);
  }
});

it('S3-US2-AC7: indica atraso ao limitar trabalho mantendo ticks sequenciais', () => {
  const session = new ArenaSession(idleEngine);
  session.play();
  session.pulse(5000);
  expect(session.getSnapshot().behind).toBe(true);
  expect(session.history().map(({ tick }) => tick)).toEqual(
    Array.from({ length: 65 }, (_, i) => i),
  );
  session.pulse(20);
  expect(session.getSnapshot().snapshot.tick).toBe(65);
  expect(session.getSnapshot().behind).toBe(false);
});

it('S3-US2-AC8: fim da luta desabilita executar e avançar', () => {
  const session = mount();
  act(() => {
    session.play();
    session.pulse(800);
  });
  expect(button('Executar').disabled).toBe(true);
  expect(button('Avançar 1 tick').disabled).toBe(true);
  expect(button('Reiniciar').disabled).toBe(false);
});

it('S3-US2-AC9: teclas conduzem ticks e preservam o foco de edição', () => {
  const session = mount();
  fireEvent.keyDown(document.body, { key: ' ' });
  expect(session.getSnapshot().status).toBe('executando');
  fireEvent.keyDown(document.body, { key: ' ' });
  fireEvent.keyDown(document.body, { key: 'ArrowRight' });
  expect(session.getSnapshot().snapshot.tick).toBe(1);
  const input = document.createElement('textarea');
  document.body.append(input);
  try {
    fireEvent.keyDown(input, { key: 'r' });
    expect(session.getSnapshot().snapshot.tick).toBe(1);
  } finally {
    input.remove();
  }
  fireEvent.keyDown(document.body, { key: 'R' });
  expect(session.getSnapshot().snapshot.tick).toBe(0);
});

it('S3-US2-AC10: aba oculta pausa sem recuperar dívida na volta', () => {
  const session = mount();
  fireEvent.click(button('Executar'));
  act(() => session.pulse(80));
  const previous = session.getSnapshot().snapshot;
  Object.defineProperty(document, 'hidden', {
    value: true,
    configurable: true,
  });
  try {
    fireEvent(document, new Event('visibilitychange'));
  } finally {
    Reflect.deleteProperty(document, 'hidden');
  }
  act(() => session.pulse(240));
  expect(session.getSnapshot().status).toBe('pausada');
  expect(session.getSnapshot().snapshot).toBe(previous);
});
