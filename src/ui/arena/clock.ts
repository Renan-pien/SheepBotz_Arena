export const speeds = [0.25, 0.5, 1, 2, 4] as const;
export type PlaybackSpeed = (typeof speeds)[number];

const maxStepsPerPulse = 64;

export class TickClock {
  #creditMs = 0;

  clear(): void {
    this.#creditMs = 0;
  }

  consume(elapsedMs: number, dt: number, speed: PlaybackSpeed) {
    const tickMs = dt * 1000;
    this.#creditMs += Math.max(0, elapsedMs) * speed;
    const due = Math.floor((this.#creditMs + 1e-9) / tickMs);
    this.#creditMs = Math.max(0, this.#creditMs - due * tickMs);
    return {
      ticks: Math.min(due, maxStepsPerPulse),
      behind: due > maxStepsPerPulse,
    };
  }
}

export function startTicker(pulse: (elapsedMs: number) => void): () => void {
  let previous = performance.now();
  const timer = window.setInterval(() => {
    const now = performance.now();
    pulse(now - previous);
    previous = now;
  }, 10);
  return () => window.clearInterval(timer);
}
