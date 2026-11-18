import { parse } from 'acorn';
import 'ses';
import {
  errorDetail,
  type ControllerBindings,
  type ControllerEngine,
  type ControllerLoadResult,
} from '../core/controller/runtime';

const unavailable = [
  'Promise',
  'queueMicrotask',
  'setTimeout',
  'setInterval',
  'WeakRef',
  'FinalizationRegistry',
  'AsyncIterator',
  'AsyncDisposableStack',
  'WebAssembly',
  'eval',
  'Function',
  'Compartment',
] as const;

function validateSyntax(source: string): void {
  const script = parse(source, { ecmaVersion: 2025, sourceType: 'script' });
  const pending: object[] = [script];
  for (let node = pending.pop(); node; node = pending.pop()) {
    if ('type' in node && node.type === 'ImportExpression') {
      throw new Error('O script não aceita importação dinâmica.');
    }
    if (
      ('async' in node && node.async === true) ||
      ('await' in node && node.await === true) ||
      ('type' in node && node.type === 'AwaitExpression') ||
      ('kind' in node && node.kind === 'await using')
    ) {
      throw new Error('O script não aceita código assíncrono.');
    }
    for (const value of Object.values(node)) {
      if (value !== null && typeof value === 'object') pending.push(value);
    }
  }
}

function callback(value: unknown, name: 'setup' | 'loop'): () => void {
  if (typeof value !== 'function') {
    throw new Error(
      name === 'loop'
        ? 'A função loop() é obrigatória.'
        : 'setup() deve ser uma função.',
    );
  }
  if (Object.prototype.toString.call(value) === '[object GeneratorFunction]') {
    throw new Error(`O callback ${name}() não pode ser um gerador.`);
  }
  return () => {
    value();
  };
}

function load(
  source: string,
  bindings: ControllerBindings,
): ControllerLoadResult {
  try {
    validateSyntax(source);
    const compartment = new Compartment();
    for (const name of unavailable) {
      Object.defineProperty(compartment.globalThis, name, {
        value: undefined,
        configurable: false,
        writable: false,
      });
    }
    const script = compartment.evaluate(`(function () {
      'use strict';
      ${source}
      return {
        setup: typeof setup === 'undefined' ? undefined : setup,
        loop: typeof loop === 'undefined' ? undefined : loop,
      };
    })()`) as { setup: unknown; loop: unknown };
    const loop = callback(script.loop, 'loop');
    const setup =
      script.setup === undefined ? undefined : callback(script.setup, 'setup');
    for (const [name, binding] of Object.entries(bindings)) {
      Object.defineProperty(compartment.globalThis, name, { value: binding });
    }
    return { ok: true, value: { setup, loop } };
  } catch (error) {
    return { ok: false, message: errorDetail(error) };
  }
}

let engine: ControllerEngine | undefined;

export function initializeControllerEngine(): ControllerEngine {
  if (engine) return engine;
  if (typeof globalThis.harden !== 'function') {
    repairIntrinsics();
    if (!Reflect.deleteProperty(Array, 'fromAsync')) {
      throw new Error('Não foi possível desabilitar Array.fromAsync.');
    }
    hardenIntrinsics();
  }
  if ('fromAsync' in Array) {
    throw new Error('O ambiente do motor precisa desabilitar Array.fromAsync.');
  }
  engine = Object.freeze({ load });
  return engine;
}
