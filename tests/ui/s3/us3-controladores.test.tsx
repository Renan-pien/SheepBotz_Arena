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
import { controllerPresets, worldPresets } from '../../../src/ui/arena/catalog';
import { ArenaSession } from '../../../src/ui/arena/session';
import { testEngine } from './support';

const invalidScript = 'function loop(';
const failingScript = 'function loop() { throw Error("falha em execução"); }';
const engine: ControllerEngine = {
  load(source, bindings) {
    if (source === invalidScript)
      return { ok: false, message: 'Unexpected token (1:14)' };
    if (source === failingScript)
      return {
        ok: true,
        value: {
          loop() {
            throw new Error('falha em execução');
          },
        },
      };
    return testEngine.load(source, bindings);
  },
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function mount() {
  const session = new ArenaSession(engine);
  render(<App session={session} />);
  return session;
}
function button(name: string) {
  return screen.getByRole<HTMLButtonElement>('button', { name });
}

it('S3-US3-AC1: seletor troca para Sala com Desviador e tick zero', () => {
  const session = mount();
  fireEvent.change(screen.getByLabelText('Mundo'), {
    target: { value: 'sala' },
  });
  const view = session.getSnapshot();
  expect(view.world.name).toBe('Sala com obstáculos');
  expect(view.controllers.explorador).toBe(controllerPresets.desviador.source);
  expect(view.snapshot.tick).toBe(0);
});

it('S3-US3-AC2: arquivo válido inicia com Parado para todos os robôs', async () => {
  const session = mount();
  fireEvent.change(screen.getByLabelText('Abrir mundo'), {
    target: { files: [new File([worldPresets.sala.text], 'sala.json')] },
  });
  await waitFor(() =>
    expect(session.getSnapshot().world.name).toBe('Sala com obstáculos'),
  );
  expect(session.getSnapshot().controllers.explorador).toBe(
    controllerPresets.parado.source,
  );
  expect(session.getSnapshot().snapshot.tick).toBe(0);
});

it('S3-US3-AC3: exibe três erros com caminhos e conserva a sessão', async () => {
  const session = mount();
  const previous = session.getSnapshot().snapshot;
  const broken = JSON.stringify({
    ...JSON.parse(worldPresets.duelo.text),
    name: true,
    seed: -1,
    dt: 0,
  });
  fireEvent.change(screen.getByLabelText('Abrir mundo'), {
    target: { files: [new File([broken], 'inválido.json')] },
  });
  await waitFor(() => expect(session.getSnapshot().errors).toHaveLength(3));
  expect(session.getSnapshot().snapshot).toBe(previous);
  for (const path of ['name', 'seed', 'dt']) {
    expect(screen.getByRole('alert').textContent).toContain(path);
  }
});

it('S3-US3-AC4: escolher exemplo preenche o editor do robô correto', async () => {
  const session = mount();
  fireEvent.change(screen.getByLabelText('Exemplo de vermelho'), {
    target: { value: 'avanca' },
  });
  expect(session.getSnapshot().drafts.vermelho?.source).toBe(
    controllerPresets.avanca.source,
  );
  await waitFor(() => {
    const editor = screen.getByRole('textbox', { name: 'Código de vermelho' });
    const lines = Array.from(
      editor.querySelectorAll('.cm-line'),
      (line) => line.textContent,
    );
    expect(lines.join('\n')).toBe(controllerPresets.avanca.source);
  });
  expect(session.getSnapshot().drafts.azul?.source).toBe(
    controllerPresets.girador.source,
  );
});

it('S3-US3-AC5: rascunho só muda a execução depois de aplicar', () => {
  const session = mount();
  fireEvent.click(button('Avançar 1 tick'));
  act(() => session.editSource('vermelho', controllerPresets.avanca.source));
  expect(screen.getByText('alterações não aplicadas')).toBeTruthy();
  expect(session.getSnapshot().controllers.vermelho).toBe(
    controllerPresets.cacador.source,
  );
  fireEvent.click(button('Aplicar vermelho'));
  expect(session.getSnapshot().controllers.vermelho).toBe(
    controllerPresets.avanca.source,
  );
  expect(session.getSnapshot().snapshot.tick).toBe(0);
});

it('S3-US3-AC6: erro de sintaxe preserva o snapshot e o controlador aplicado', () => {
  const session = mount();
  fireEvent.click(button('Avançar 1 tick'));
  const before = session.getSnapshot();
  act(() => session.editSource('vermelho', invalidScript));
  fireEvent.click(button('Aplicar vermelho'));
  expect(screen.getByRole('alert').textContent).toContain(
    'CONTROLADOR_INVALIDO',
  );
  expect(screen.getByRole('alert').textContent).toContain('(1:14)');
  expect(session.getSnapshot().snapshot).toBe(before.snapshot);
  expect(session.getSnapshot().controllers).toBe(before.controllers);
  expect(session.getSnapshot().drafts.vermelho?.source).toBe(invalidScript);
});

it('S3-US3-AC7: abre e salva código sem aplicar automaticamente', async () => {
  const session = mount();
  const createObjectURL = vi.fn(() => 'blob:editor');
  vi.stubGlobal(
    'URL',
    Object.assign(class extends URL {}, {
      createObjectURL,
      revokeObjectURL: vi.fn(),
    }),
  );
  const click = vi
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe('vermelho.js');
    });
  fireEvent.change(screen.getByLabelText('Abrir código de vermelho'), {
    target: { files: [new File([invalidScript], 'rascunho.js')] },
  });
  await waitFor(() =>
    expect(session.getSnapshot().drafts.vermelho?.source).toBe(invalidScript),
  );
  expect(session.getSnapshot().controllers.vermelho).toBe(
    controllerPresets.cacador.source,
  );
  fireEvent.click(button('Salvar código de vermelho'));
  expect(click).toHaveBeenCalledOnce();
  expect(
    await (createObjectURL.mock.calls as unknown as [Blob][])[0]![0].text(),
  ).toBe(invalidScript);
});

it('S3-US3-AC8: controlador desativado é identificado e o núcleo continua', () => {
  const session = mount();
  act(() => {
    session.editSource('vermelho', failingScript);
    session.apply('vermelho');
    session.step();
    session.step();
  });
  expect(session.getSnapshot().snapshot.tick).toBe(2);
  expect(screen.getByText('desativado · falha em execução')).toBeTruthy();
});

it('S3-US3-AC9: aplica um rascunho e restaura apenas o exemplo indicado', () => {
  const session = mount();
  act(() => {
    session.selectExample('azul', 'desviador');
    session.editSource('azul', 'rascunho azul');
    session.editSource('vermelho', controllerPresets.avanca.source);
  });
  fireEvent.click(button('Aplicar vermelho'));
  expect(session.getSnapshot().controllers.azul).toBe(
    controllerPresets.girador.source,
  );
  expect(session.getSnapshot().drafts.azul?.source).toBe('rascunho azul');
  fireEvent.click(button('Restaurar exemplo de azul'));
  expect(session.getSnapshot().drafts.azul?.source).toBe(
    controllerPresets.desviador.source,
  );
  expect(session.getSnapshot().controllers.azul).toBe(
    controllerPresets.girador.source,
  );
});
