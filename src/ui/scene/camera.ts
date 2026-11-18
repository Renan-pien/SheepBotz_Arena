import { MathUtils, MOUSE, PerspectiveCamera, Vector3 } from 'three';
import type { World } from '../../core';

export type CameraView = '3d' | 'top';

export const orbitSettings = {
  minDistance: 0.3,
  maxDistance: 20,
  mouseButtons: { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN },
};

export function configureCamera(
  camera: PerspectiveCamera,
  world: World,
  aspect: number,
  view: CameraView,
): void {
  const halfWidth = world.arena?.radius ?? world.map.width / 2;
  const halfDepth = world.arena?.radius ?? world.map.height / 2;
  const extent = Math.hypot(halfWidth, halfDepth);
  const distance = MathUtils.clamp(
    extent * 2.75,
    orbitSettings.minDistance,
    orbitSettings.maxDistance,
  );
  // A higher angle leaves the closest edge visible even on large maps.
  const depthRatio =
    view === 'top' ? 0 : Math.min(0.66, distance / (2 * extent));
  camera.aspect = aspect;
  camera.fov = 90;
  camera.near = 0.01;
  camera.far = Math.max(40, extent * 6);
  camera.up.set(0, view === 'top' ? 0 : 1, view === 'top' ? -1 : 0);
  camera.position.set(
    0,
    distance * Math.sqrt(1 - depthRatio ** 2),
    distance * depthRatio,
  );
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();

  let frameExtent = 0;
  for (const x of [-halfWidth, halfWidth]) {
    for (const z of [-halfDepth, halfDepth]) {
      const point = new Vector3(x, 0, z).project(camera);
      frameExtent = Math.max(frameExtent, Math.abs(point.x), Math.abs(point.y));
    }
  }
  camera.fov = Math.max(
    38,
    MathUtils.radToDeg(2 * Math.atan(frameExtent * 1.18)),
  );
  camera.updateProjectionMatrix();
}
