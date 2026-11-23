function loop() {
  if (getInfo().startReleased === false) return;
  const l = readLaser();
  const frente = Math.min(l[3], l[4], l[5]);
  if (readBumper() || frente < 0.4) {
    setSpeed(0, 2);
  } else {
    setSpeed(0.5, 0);
  }
}
