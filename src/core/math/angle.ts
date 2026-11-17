const fullTurn = 2 * Math.PI;

export function normalizeAngle(angle: number): number {
  const wrapped = angle - fullTurn * Math.ceil((angle - Math.PI) / fullTurn);
  if (wrapped > Math.PI || wrapped <= -Math.PI) {
    // Evita o cancelamento numérico fora do intervalo para entradas finitas muito grandes.
    const remainder = angle % fullTurn;
    return remainder - fullTurn * Math.ceil((remainder - Math.PI) / fullTurn);
  }
  return wrapped;
}

export function angleDiff(a: number, b: number): number {
  return normalizeAngle(a - b);
}
