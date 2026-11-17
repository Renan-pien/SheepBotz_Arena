import type { LoadWorldResult, ValidationError } from '../types';
import { errors } from './errors';
import { checkWorldGeometry } from './geometry-checks';
import { isObject, normalizeWorld, validateDocument } from './validate';

export function loadWorld(text: string): LoadWorldResult {
  let document: unknown;
  try {
    document = JSON.parse(text);
  } catch (cause) {
    return { ok: false, errors: [errors.invalidJson(cause)] };
  }
  if (!isObject(document)) return { ok: false, errors: [errors.invalidRoot()] };

  const issues: ValidationError[] = [];
  const validated = validateDocument(document, issues);
  checkWorldGeometry(validated, Object.hasOwn(document, 'arena'), issues);
  if (issues.length) return { ok: false, errors: issues };
  return { ok: true, world: normalizeWorld(validated) };
}
