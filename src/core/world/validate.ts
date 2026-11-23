import { normalizeAngle } from '../math/angle';
import { robotModels, type RobotModel } from '../models';
import type {
  LaserConfig,
  Pose,
  RobotConfig,
  ValidationError,
  World,
} from '../types';
import { errors } from './errors';
import { worldSchema, type Schema } from './schema';

type RobotDocument = Omit<RobotConfig, 'initialPose' | 'laser' | 'color'> &
  Pose & { readonly color?: string; readonly laser?: LaserConfig };

interface WorldDocument extends Omit<World, 'arena' | 'robots'> {
  readonly arena?: NonNullable<World['arena']>;
  readonly robots: readonly RobotDocument[];
}

type ValidFields<T> = T extends readonly (infer Item)[]
  ? readonly (ValidFields<Item> | undefined)[]
  : T extends object
    ? { readonly [Key in keyof T]?: ValidFields<T[Key]> }
    : T;

export type PartialWorld = ValidFields<WorldDocument>;

const colors = [
  '#E53935',
  '#1E88E5',
  '#43A047',
  '#FDD835',
  '#8E24AA',
  '#FB8C00',
  '#00ACC1',
  '#6D4C41',
];

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function childPath(parent: string, key: string): string {
  return parent ? `${parent}.${key}` : key;
}

function validateValue(
  schema: Schema,
  value: unknown,
  path: string,
  issues: ValidationError[],
): unknown {
  if (value === undefined) {
    if (schema.defaultValue !== undefined) {
      value = schema.defaultValue;
    } else {
      if (!schema.optional) issues.push(errors.required(path));
      return undefined;
    }
  }
  if (schema.kind === 'object') {
    if (!isObject(value)) {
      issues.push(errors.wrongType(path, 'um objeto'));
      return undefined;
    }
    for (const key of Object.keys(value)) {
      if (!Object.hasOwn(schema.fields, key))
        issues.push(errors.unknown(childPath(path, key)));
    }
    return Object.fromEntries(
      Object.entries(schema.fields).map(([key, field]) => [
        key,
        validateValue(
          field,
          Object.hasOwn(value, key) ? value[key] : undefined,
          childPath(path, key),
          issues,
        ),
      ]),
    );
  }
  if (schema.kind === 'list') {
    if (!Array.isArray(value)) {
      issues.push(errors.wrongType(path, 'uma lista'));
      return undefined;
    }
    if (value.length < schema.min || value.length > schema.max) {
      issues.push(errors.listSize(path, schema.min, schema.max, value.length));
      return undefined;
    }
    return value.map((item, index) =>
      validateValue(schema.item, item, `${path}[${index}]`, issues),
    );
  }

  let magnitude: number;
  if (schema.kind === 'text') {
    if (typeof value !== 'string') {
      issues.push(errors.wrongType(path, 'um texto'));
      return undefined;
    }
    if (schema.format && !schema.format.pattern.test(value)) {
      issues.push(errors.wrongFormat(path, schema.format.rule));
      return undefined;
    }
    magnitude = [...value].length;
  } else {
    if (
      typeof value !== 'number' ||
      !Number.isFinite(value) ||
      (schema.kind === 'integer' && !Number.isInteger(value))
    ) {
      issues.push(
        errors.wrongType(
          path,
          schema.kind === 'integer' ? 'um número inteiro' : 'um número',
        ),
      );
      return undefined;
    }
    magnitude = value;
  }

  const lower = schema.min;
  const upper = schema.max;
  const violatesMin =
    lower !== undefined &&
    (schema.exclusiveMin ? magnitude <= lower : magnitude < lower);
  const violatesMax = upper !== undefined && magnitude > upper;
  if (violatesMin || violatesMax) {
    const opening = schema.exclusiveMin ? '(' : '[';
    issues.push(
      errors.outOfRange(
        path,
        `${opening}${lower ?? '−∞'}, ${upper ?? '∞'}]`,
        magnitude,
      ),
    );
    return undefined;
  }
  return value;
}

function addDuplicateErrors(
  items: PartialWorld['robots'] | PartialWorld['obstacles'],
  path: string,
  issues: ValidationError[],
): void {
  const seen = new Set<string>();
  items?.forEach((item, index) => {
    const id = item?.id;
    if (id === undefined) return;
    if (seen.has(id)) issues.push(errors.duplicate(`${path}[${index}].id`, id));
    seen.add(id);
  });
}

export function validateDocument(
  worldData: Record<string, unknown>,
  issues: ValidationError[],
): PartialWorld {
  // O schema mantém os índices e devolve undefined para campos inválidos.
  const data = validateValue(
    worldSchema,
    worldData,
    '',
    issues,
  ) as PartialWorld;
  addDuplicateErrors(data.obstacles, 'obstacles', issues);
  addDuplicateErrors(data.robots, 'robots', issues);
  const usedModels = new Set<RobotModel>();
  const inputRobots = worldData.robots;
  const robots = data.robots?.map((robot, index) => {
    if (!robot?.model) return robot;
    const path = `robots[${index}]`;
    if (data.match?.mode === 'sumo' && usedModels.has(robot.model))
      issues.push(
        errors.matchRule(
          path + '.model',
          'O modelo já foi escolhido pela outra equipe.',
        ),
      );
    usedModels.add(robot.model);
    const radius = robotModels[robot.model].radius;
    const input = Array.isArray(inputRobots) ? inputRobots[index] : undefined;
    if (
      isObject(input) &&
      Object.hasOwn(input, 'radius') &&
      robot.radius !== undefined &&
      robot.radius !== radius
    )
      issues.push(
        errors.wrongFormat(
          path + '.radius',
          `use o raio do modelo (${radius} m)`,
        ),
      );
    return { ...robot, radius };
  });
  return { ...data, robots };
}

export function normalizeWorld(validated: PartialWorld): World {
  // Chamado após as duas fases, apenas se todos os campos obrigatórios foram validados.
  const { robots, arena, ...world } = validated as WorldDocument;
  return {
    ...world,
    match: world.match.exit
      ? world.match
      : { mode: world.match.mode, maxTicks: world.match.maxTicks },
    arena: arena ?? null,
    robots: robots.map(
      ({ x, y, theta, color, laser, model, ...robot }, index) => ({
        ...robot,
        ...(model && { model }),
        initialPose: { x, y, theta: normalizeAngle(theta) },
        color: color ?? colors[index % colors.length]!,
        laser: laser ?? null,
      }),
    ),
  };
}
