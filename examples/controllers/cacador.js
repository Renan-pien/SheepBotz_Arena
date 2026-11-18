function loop() {
  const leituras = readLaser();
  const info = getInfo();
  if (leituras.length === 0) {
    setSpeed(0, 3);
    return;
  }
  const central = leituras[Math.floor(leituras.length / 2)];
  if (central < info.laser.maxRange) {
    setSpeed(1, 0);
  } else {
    setSpeed(0, 3);
  }
}
