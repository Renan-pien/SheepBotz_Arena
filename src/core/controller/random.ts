export function createControllerRandom(
  seed: number,
  index: number,
): () => number {
  let state = (seed + Math.imul(index, 0x9e3779b9)) >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
