// Variação do Caçador que usa também os raios laterais.
function loop() {
  const leituras = readLaser();
  const info = getInfo();
  if (leituras.length === 0) {
    setSpeed(0, 0);
    return;
  }

  let alvo = -1;
  let menorDistancia = info.laser.maxRange;
  for (let raio = 0; raio < leituras.length; raio++) {
    if (leituras[raio] < menorDistancia) {
      alvo = raio;
      menorDistancia = leituras[raio];
    }
  }

  if (alvo === -1) {
    setSpeed(0, info.maxAngularSpeed / 2);
    return;
  }

  const centro = (leituras.length - 1) / 2;
  const angulo =
    centro === 0 ? 0 : ((alvo - centro) * info.laser.fov) / (2 * centro);
  const alinhado = Math.abs(angulo) <= Math.PI / 12;
  setSpeed(info.maxLinearSpeed * (alinhado ? 0.8 : 0.3), 3 * angulo);
}
