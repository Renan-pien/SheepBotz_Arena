interface Common {
  readonly defaultValue?: unknown;
  readonly optional?: boolean;
}

type Interval = {
  readonly min?: number;
  readonly max?: number;
  readonly exclusiveMin?: boolean;
};

export type Schema = Common &
  (
    | {
        readonly kind: 'object';
        readonly fields: Readonly<Record<string, Schema>>;
      }
    | {
        readonly kind: 'list';
        readonly item: Schema;
        readonly min: number;
        readonly max: number;
      }
    | ({ readonly kind: 'number' | 'integer' } & Interval)
    | ({
        readonly kind: 'text';
        readonly format?: { pattern: RegExp; rule: string };
      } & Interval)
  );

const id = {
  kind: 'text',
  format: {
    pattern: /^[A-Za-z0-9_-]{1,32}$/,
    rule: "use de 1 a 32 letras, números, '_' ou '-'",
  },
} satisfies Schema;
const coordinate = { kind: 'number' } satisfies Schema;
const dimension = {
  kind: 'number',
  min: 0,
  exclusiveMin: true,
  max: 100,
} satisfies Schema;

const obstacle = {
  kind: 'object',
  fields: {
    id,
    x: coordinate,
    y: coordinate,
    width: dimension,
    height: dimension,
  },
} satisfies Schema;

const robot = {
  kind: 'object',
  fields: {
    id,
    x: coordinate,
    y: coordinate,
    theta: { kind: 'number', defaultValue: 0 },
    radius: { kind: 'number', min: 0.01, max: 1, defaultValue: 0.05 },
    maxLinearSpeed: {
      kind: 'number',
      min: 0,
      exclusiveMin: true,
      max: 10,
      defaultValue: 1,
    },
    maxAngularSpeed: {
      kind: 'number',
      min: 0,
      exclusiveMin: true,
      max: 50,
      defaultValue: 6,
    },
    color: {
      kind: 'text',
      optional: true,
      format: {
        pattern: /^#[0-9A-Fa-f]{6}$/,
        rule: 'use uma cor no formato #RRGGBB',
      },
    },
    laser: {
      kind: 'object',
      optional: true,
      fields: {
        rays: { kind: 'integer', min: 1, max: 360, defaultValue: 5 },
        fov: {
          kind: 'number',
          min: 0,
          exclusiveMin: true,
          max: 2 * Math.PI,
          defaultValue: Math.PI / 3,
        },
        maxRange: {
          kind: 'number',
          min: 0,
          exclusiveMin: true,
          max: 100,
          defaultValue: 1,
        },
      },
    },
  },
} satisfies Schema;

export const worldSchema = {
  kind: 'object',
  fields: {
    name: { kind: 'text', min: 1, max: 80, defaultValue: 'Mundo sem nome' },
    seed: { kind: 'integer', min: 0, max: 4_294_967_295, defaultValue: 1 },
    dt: { kind: 'number', min: 0.001, max: 0.1, defaultValue: 0.02 },
    map: { kind: 'object', fields: { width: dimension, height: dimension } },
    arena: {
      kind: 'object',
      optional: true,
      fields: { radius: { kind: 'number', min: 0, exclusiveMin: true } },
    },
    match: {
      kind: 'object',
      defaultValue: {},
      fields: {
        mode: {
          kind: 'text',
          format: { pattern: /^(free|sumo)$/, rule: 'use "free" ou "sumo"' },
          defaultValue: 'free',
        },
        maxTicks: {
          kind: 'integer',
          min: 1,
          max: 1_000_000,
          defaultValue: 3000,
        },
      },
    },
    obstacles: {
      kind: 'list',
      item: obstacle,
      min: 0,
      max: 100,
      defaultValue: [],
    },
    robots: { kind: 'list', item: robot, min: 1, max: 8 },
  },
} satisfies Schema;
