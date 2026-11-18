import { expect, it, vi } from 'vitest';
import { ArenaSession } from '../../../src/ui/arena/session';
import { controllerPresets } from '../../../src/ui/arena/catalog';
import { testEngine } from './support';

it('publica o Duelo da S2 com as fontes padrão e o mesmo objeto enquanto a sessão não muda', () => {
  const session = new ArenaSession(testEngine);
  const view = session.getSnapshot();
  expect(view.world.name).toBe('Duelo padrão');
  expect(view.status).toBe('pronta');
  expect(view.snapshot.tick).toBe(0);
  expect(view.snapshot.robots[0]?.laser[2]).toBeCloseTo(0.35, 8);
  expect(view.controllers).toEqual({
    vermelho: controllerPresets.cacador.source,
    azul: controllerPresets.girador.source,
  });
  const listener = vi.fn();
  const unsubscribe = session.subscribe(listener);
  expect(session.getSnapshot()).toBe(view);
  expect(listener).not.toHaveBeenCalled();
  unsubscribe();
});
