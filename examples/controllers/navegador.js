// Malha de 0.50 m dos três labirintos. Cada decisão começa no centro de uma casa.
const cellSize = 0.5;
const quarterTurn = Math.PI / 2;
let heading = 0;
let target = null;

function loop() {
  const pose = readOdometry();
  const { dt } = getInfo();

  if (target === null) {
    const rays = readLaser();
    if (rays.length === 0) return setSpeed(0, 0);
    const center = Math.floor(rays.length / 2);
    let turn = 2;
    if (rays[0] > cellSize * 0.75) turn = -1;
    else if (rays[center] > cellSize * 0.75) turn = 0;
    else if (rays[rays.length - 1] > cellSize * 0.75) turn = 1;
    heading = pose.theta + turn * quarterTurn;
    target = {
      x: pose.x + cellSize * Math.cos(heading),
      y: pose.y + cellSize * Math.sin(heading),
    };
  }

  const angle = Math.atan2(
    Math.sin(heading - pose.theta),
    Math.cos(heading - pose.theta),
  );
  if (Math.abs(angle) > 0.0001) return setSpeed(0, angle / dt);

  const remaining = Math.hypot(target.x - pose.x, target.y - pose.y);
  if (remaining < 0.0001) {
    target = null;
    return setSpeed(0, 0);
  }
  setSpeed(Math.min(0.8, remaining / dt), 0);
}
