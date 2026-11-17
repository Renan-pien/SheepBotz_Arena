import type { LoadWorldResult, ValidationError } from '../types';
import { errors } from './errors';
import { checkWorldGeometry } from './geometry-checks';
import { isObject, normalizeWorld, validateDocument } from './validate';

export function loadWorld(text: string): LoadWorldResult {
  let worldData: unknown;
  try {
    worldData = JSON.parse(text);
  } catch (cause) {
    return { ok: false, errors: [errors.invalidJson(cause)] };
  }
  if (!isObject(worldData))
    return { ok: false, errors: [errors.invalidRoot()] };

  const issues: ValidationError[] = [];
  const validated = validateDocument(worldData, issues);
  checkWorldGeometry(validated, Object.hasOwn(worldData, 'arena'), issues);
  if (issues.length) return { ok: false, errors: issues };
  return { ok: true, world: normalizeWorld(validated) };
}
