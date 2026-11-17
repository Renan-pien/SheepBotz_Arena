export function robot(overrides: Record<string, unknown> = {}) {
  return {
    id: 'r1',
    x: 0,
    y: 0,
    theta: 0,
    radius: 0.1,
    maxLinearSpeed: 1,
    maxAngularSpeed: 6,
    ...overrides,
  };
}

export function makeWorld(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Mundo-base de teste',
    dt: 0.1,
    map: { width: 4, height: 4 },
    match: { mode: 'free' },
    obstacles: [],
    robots: [robot()],
    ...overrides,
  };
}

export function worldText(overrides?: Record<string, unknown>): string {
  return JSON.stringify(makeWorld(overrides));
}
