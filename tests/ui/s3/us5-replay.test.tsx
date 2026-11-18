import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { ControllerEngine } from '../../../src/core';
import { App } from '../../../src/ui/App';
import { encodeRecording } from '../../../src/ui/arena/recording';
import { ArenaSession } from '../../../src/ui/arena/session';
import { testEngine } from './support';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function duel(engine: ControllerEngine = testEngine) {
  const session = new ArenaSession(engine);
  session.play();
  session.pulse(800);
  return session;
}
function button(name: string) {
  return screen.getByRole<HTMLButtonElement>('button', { name });
}

it('S3-US5-AC2: resultado abre a linha do tempo pausada no tick zero e bloqueia edição', () => {
  const session = duel();
  render(<App session={session} />);
  fireEvent.click(button('Ver replay'));
  expect(session.getSnapshot().mode).toBe('replay');
  expect(session.getSnapshot().snapshot.tick).toBe(0);
  expect(
    screen.getByRole<HTMLInputElement>('slider', { name: 'Linha do tempo' })
      .max,
  ).toBe('34');
  expect(screen.getByLabelText<HTMLSelectElement>('Mundo').disabled).toBe(true);
  expect(button('Aplicar vermelho').disabled).toBe(true);
  expect(
    screen
      .getByRole('textbox', { name: 'Código de vermelho' })
      .getAttribute('contenteditable'),
  ).toBe('false');
});

it('S3-US5-AC3: arrastar a linha do tempo seleciona o estado gravado para todos os painéis', () => {
  const session = duel();
  const expected = session.history()[20];
  render(<App session={session} />);
  fireEvent.click(button('Ver replay'));
  fireEvent.click(screen.getByRole('tab', { name: 'Inspeção' }));
  fireEvent.change(screen.getByRole('slider', { name: 'Linha do tempo' }), {
    target: { value: '20' },
  });
  expect(session.getSnapshot().snapshot).toBe(expected);
  expect(screen.getByRole('region', { name: 'Cena 3D' }).dataset.tick).toBe(
    '20',
  );
  expect(screen.getByRole('region', { name: 'Inspeção' }).dataset.tick).toBe(
    '20',
  );
});

it('S3-US5-AC4: Voltar, Avançar e Executar percorrem a gravação na velocidade escolhida', () => {
  const session = duel();
  session.enterReplay();
  session.seek(20);
  render(<App session={session} />);
  fireEvent.keyDown(document.body, { key: 'ArrowLeft' });
  expect(session.getSnapshot().snapshot.tick).toBe(19);
  fireEvent.click(button('Avançar 1 tick'));
  expect(session.getSnapshot().snapshot.tick).toBe(20);
  fireEvent.change(screen.getByLabelText('Velocidade'), {
    target: { value: '2' },
  });
  fireEvent.click(button('Executar'));
  act(() => session.pulse(30));
  expect(session.getSnapshot().snapshot.tick).toBe(23);
});

it('S3-US5-AC5: exporta mundo, controladores, estados e eventos por download', async () => {
  const session = duel();
  const createObjectURL = vi.fn<(blob: Blob) => string>(() => 'blob:gravação');
  vi.stubGlobal(
    'URL',
    Object.assign(class extends URL {}, {
      createObjectURL,
      revokeObjectURL: vi.fn(),
    }),
  );
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    expect(this.download).toMatch(
      /^sheepbotz-duelo-padrao-\d{4}-\d\d-\d\d-\d{4}\.json$/,
    );
  });
  render(<App session={session} />);
  fireEvent.click(button('Exportar gravação'));
  expect(await createObjectURL.mock.calls[0]![0].text()).toBe(
    encodeRecording(session.recording()),
  );
});

it('S3-US5-AC6: abre gravação parcial idêntica sem chamar o motor de controlador', async () => {
  const load = vi.fn(testEngine.load);
  const session = new ArenaSession({ load });
  session.step();
  const original = session.history();
  load.mockClear();
  render(<App session={session} />);
  fireEvent.change(screen.getByLabelText('Abrir gravação'), {
    target: {
      files: [new File([encodeRecording(session.recording())], 'parcial.json')],
    },
  });
  await waitFor(() => expect(session.getSnapshot().mode).toBe('replay'));
  expect(session.getSnapshot().snapshot.tick).toBe(0);
  expect(session.history()).toEqual(original);
  expect(load).not.toHaveBeenCalled();
});

it('S3-US5-AC7: gravação corrompida conserva o cursor e exibe o código', async () => {
  const session = duel();
  session.enterReplay();
  session.seek(14);
  const before = session.getSnapshot().snapshot;
  render(<App session={session} />);
  fireEvent.change(screen.getByLabelText('Abrir gravação'), {
    target: { files: [new File(['{'], 'quebrada.json')] },
  });
  await waitFor(() =>
    expect(screen.getByRole('alert').textContent).toContain(
      'GRAVACAO_INVALIDA',
    ),
  );
  expect(session.getSnapshot().snapshot).toBe(before);
});

it('S3-US5-AC9: sair prepara mundo e fontes no tick zero ou conserva replay na falha', () => {
  const session = duel({
    load(source, bindings) {
      if (source === 'invalido')
        return { ok: false, message: 'código inválido' };
      return testEngine.load(source, bindings);
    },
  });
  const recording = session.recording();
  session.enterReplay();
  session.seek(20);
  render(<App session={session} />);
  fireEvent.click(button('Sair do replay'));
  expect(session.getSnapshot().mode).toBe('live');
  expect(session.getSnapshot().snapshot.tick).toBe(0);
  expect(session.getSnapshot().controllers).toEqual(recording.controllers);
  act(() => {
    session.openRecording(
      encodeRecording({
        ...recording,
        controllers: { ...recording.controllers, azul: 'invalido' },
      }),
    );
    session.seek(9);
  });
  fireEvent.click(button('Sair do replay'));
  expect(session.getSnapshot().mode).toBe('replay');
  expect(session.getSnapshot().snapshot.tick).toBe(9);
  expect(screen.getByRole('alert').textContent).toContain(
    'CONTROLADOR_INVALIDO',
  );
});

it('S3-US5-AC11: respeita extremidades e para quando a reprodução completa', () => {
  const session = duel();
  session.enterReplay();
  session.back();
  expect(session.getSnapshot().snapshot.tick).toBe(0);
  session.seek(33);
  session.play();
  session.pulse(100);
  expect(session.getSnapshot().snapshot.tick).toBe(34);
  expect(session.getSnapshot().status).toBe('finalizada');
  session.step();
  expect(session.getSnapshot().snapshot.tick).toBe(34);
});
