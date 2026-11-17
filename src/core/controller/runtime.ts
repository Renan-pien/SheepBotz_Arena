export type ControllerBindings = Readonly<
  Record<string, (...args: unknown[]) => unknown>
>;

export interface LoadedController {
  readonly setup?: () => void;
  readonly loop: () => void;
}

export type ControllerLoadResult =
  | { readonly ok: true; readonly value: LoadedController }
  | { readonly ok: false; readonly message: string };

export interface ControllerEngine {
  load(source: string, bindings: ControllerBindings): ControllerLoadResult;
}

export function errorDetail(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return String(error);
}
