import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { App } from '../../src/ui/App';
import { ArenaSession } from '../../src/ui/arena/session';
import { testEngine } from './s3/support';

it('exibe o título do simulador no navegador', () => {
  render(<App session={new ArenaSession(testEngine)} />);
  expect(screen.getByRole('heading', { name: 'SheepBotz Arena' })).toBeTruthy();
});
