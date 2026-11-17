import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { App } from '../../src/ui/App';

it('exibe o título do simulador no navegador', () => {
  render(<App />);
  expect(
    screen.getByRole('heading', { name: 'SheepBotz Arena — em construção' }),
  ).toBeTruthy();
});
