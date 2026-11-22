import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { App } from '../../../src/ui/App';
import { ArenaSession } from '../../../src/ui/arena/session';
import {
  decodeRecording,
  encodeRecording,
} from '../../../src/ui/arena/recording';
import { makerExample } from '../../../src/ui/arena/languages';
import { idleEngine } from './support';
import type { ControllerEngine } from '../../../src/core';
afterEach(cleanup);

it('S3-US3-AC14: linguagens, arquivos, rascunhos e troca pausada por robô', async () => {
  const session = new ArenaSession(idleEngine, async () => idleEngine);
  render(<App session={session} />);
  const original = session.getSnapshot().drafts.vermelho!.source;
  fireEvent.change(screen.getByLabelText('Linguagem de vermelho'), {
    target: { value: 'portugol' },
  });
  expect(session.getSnapshot().drafts.azul!.language).toBe('javascript');
  const file = new File(['algoritmo "Meu robô"'], 'autoral.por');
  fireEvent.change(screen.getByLabelText('Abrir código de vermelho'), {
    target: { files: [file] },
  });
  await screen.findByText('algoritmo "Meu robô"');
  fireEvent.change(screen.getByLabelText('Linguagem de vermelho'), {
    target: { value: 'javascript' },
  });
  expect(session.getSnapshot().drafts.vermelho!.source).toBe(original);
  fireEvent.change(screen.getByLabelText('Linguagem de vermelho'), {
    target: { value: 'portugol' },
  });
  expect(session.getSnapshot().drafts.vermelho!.source).toBe(
    'algoritmo "Meu robô"',
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'Restaurar exemplo de vermelho' }),
  );
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar vermelho' }));
  });
  expect(session.getSnapshot()).toMatchObject({
    languages: { vermelho: 'portugol', azul: 'javascript' },
    status: 'pausada',
    snapshot: { tick: 0 },
  });
});
it('S3-US3-AC14: aplicação pendente descarta edição antiga e falha de carga admite nova tentativa', async () => {
  let finish!: (value: ControllerEngine) => void;
  const load = vi
    .fn<() => Promise<ControllerEngine>>()
    .mockRejectedValueOnce(new Error('carga indisponível'))
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
  const s = new ArenaSession(idleEngine, load);
  s.chooseLanguage('vermelho', 'portugol');
  s.step();
  const before = s.getSnapshot().snapshot;
  await s.apply('vermelho');
  expect(s.getSnapshot().errors[0]!.message).toMatch(/indisponível/);
  expect(s.getSnapshot().snapshot).toBe(before);
  const pending = s.apply('vermelho');
  s.editSource('vermelho', 'versão nova');
  finish(idleEngine);
  await pending;
  expect(s.getSnapshot().snapshot).toBe(before);
  expect(s.getSnapshot().loading).toBeNull();
  expect(s.getSnapshot().languages.vermelho).toBe('javascript');
});
it.each(['sumo', 'maze'] as const)(
  'S3-US3-AC14: grava e lê a linguagem em %s sem compilar no replay',
  async (mode) => {
    const s = new ArenaSession(idleEngine, async () => idleEngine);
    if (mode === 'maze') s.chooseWorld('facil');
    const id = mode === 'maze' ? 'explorador' : 'azul';
    s.chooseLanguage(id, 'portugol');
    await s.apply(id);
    if (mode === 'maze') {
      s.editSource(id, 'rascunho');
      s.chooseDifficulty('dificil');
      expect(s.getSnapshot().drafts[id]!.source).toBe('rascunho');
    }
    s.step();
    const end = s.getSnapshot().snapshot;
    s.back();
    s.step();
    expect(s.getSnapshot().snapshot).toEqual(end);
    const text = encodeRecording(s.recording());
    const get = vi.fn(async () => idleEngine);
    const replay = new ArenaSession(idleEngine, get);
    replay.openRecording(text);
    replay.step();
    expect(get).not.toHaveBeenCalled();
    expect(replay.getSnapshot().snapshot).toEqual(end);
    expect(replay.getSnapshot().drafts[id]).toMatchObject({
      language: 'portugol',
      source: makerExample(mode).source,
    });
    await replay.exitReplay();
    expect(get).toHaveBeenCalledOnce();
    expect(replay.getSnapshot().snapshot.tick).toBe(0);
    const raw = JSON.parse(text);
    expect(raw.version).toBe(7);
    delete raw.languages[id];
    expect(decodeRecording(JSON.stringify(raw)).ok).toBe(false);
    raw.languages[id] = 'outra';
    expect(decodeRecording(JSON.stringify(raw)).ok).toBe(false);
  },
);
it('S3-US3-AC15: ajuda contextual abre, fecha com Escape e devolve o foco sem mexer no editor', () => {
  const s = new ArenaSession(idleEngine);
  render(<App session={s} />);
  const button = screen.getByRole('button', {
    name: 'Tutorial de comandos de vermelho',
  });
  fireEvent.click(button);
  const dlg = screen.getByRole('dialog', { name: 'Tutorial de comandos' });
  expect(within(dlg).getByText('readEdge()')).toBeTruthy();
  fireEvent.keyDown(within(dlg).getByRole('button'), { key: 'Escape' });
  expect(document.activeElement).toBe(button);
  act(() => {
    s.chooseWorld('facil');
    s.chooseLanguage('explorador', 'portugol');
  });
  const before = s.getSnapshot().drafts;
  fireEvent.click(
    screen.getByRole('button', { name: 'Tutorial de comandos de explorador' }),
  );
  const maze = screen.getByRole('dialog');
  expect(
    within(maze).getByText('Portugol · meuPiá Maker · Labirinto'),
  ).toBeTruthy();
  expect(
    within(maze).getByText(/ler_laser_central/, { selector: 'dt code' }),
  ).toBeTruthy();
  expect(within(maze).queryByText('ler_borda("frente")')).toBeNull();
  fireEvent.click(within(maze).getByRole('button', { name: 'Fechar' }));
  expect(s.getSnapshot().drafts).toBe(before);
});

it('S3-US3-AC14: salva o fonte Portugol como .por mesmo antes de aplicar', async () => {
  const s = new ArenaSession(idleEngine);
  s.chooseLanguage('vermelho', 'portugol');
  s.editSource('vermelho', 'texto autoral');
  render(<App session={s} />);
  const create = vi
    .fn<(blob: Blob) => string>()
    .mockReturnValue('blob:portugol');
  const revoke = vi.fn();
  vi.stubGlobal(
    'URL',
    Object.assign(class extends URL {}, {
      createObjectURL: create,
      revokeObjectURL: revoke,
    }),
  );
  const clicked = vi
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe('vermelho.por');
    });
  try {
    fireEvent.click(
      screen.getByRole('button', { name: 'Salvar código de vermelho' }),
    );
    expect(clicked).toHaveBeenCalledOnce();
    expect(create).toHaveBeenCalledOnce();
    expect(await create.mock.calls[0]![0].text()).toBe('texto autoral');
    await waitFor(() => expect(revoke).toHaveBeenCalledOnce());
  } finally {
    clicked.mockRestore();
    vi.unstubAllGlobals();
  }
});
