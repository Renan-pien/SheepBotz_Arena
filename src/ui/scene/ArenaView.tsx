import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { PerspectiveCamera, Spherical, Vector3, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { SimState, World } from '../../core';
import { configureCamera, orbitSettings, type CameraView } from './camera';
import { buildScene } from './graphics';
import { projectFrame, type SceneFrame } from './projection';

function attachViewport(host: HTMLElement, labels: HTMLElement, world: World) {
  const renderer = new WebGLRenderer({
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  host.append(renderer.domElement);
  const contents = buildScene(world);
  const camera = new PerspectiveCamera();
  const labelPosition = new Vector3();
  const labelNodes = world.robots.map(() => {
    const element = document.createElement('span');
    element.className = 'robot-caption';
    labels.append(element);
    return element;
  });
  let frame: SceneFrame = [];
  let showLabels = true;
  let view: CameraView = '3d';
  let controls: OrbitControls | undefined;
  let request = 0;

  function fit(next: CameraView) {
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    configureCamera(camera, world, width / height, next);
    controls?.dispose();
    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = orbitSettings.minDistance;
    controls.maxDistance = orbitSettings.maxDistance;
    controls.mouseButtons = orbitSettings.mouseButtons;
    controls.enableRotate = next === '3d';
    controls.update();
  }

  function resize() {
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    renderer.setSize(width, height, false);
    if (!controls) fit(view);
    else {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
  }

  function draw() {
    renderer.render(contents.scene, camera);
    const { clientWidth: width, clientHeight: height } = host;
    for (const [i, robot] of frame.entries()) {
      const element = labelNodes[i]!;
      if (element.hidden) continue;
      labelPosition
        .set(robot.center[0], robot.center[1] * 2 + 0.018, robot.center[2])
        .project(camera);
      element.style.left = (labelPosition.x + 1) * 0.5 * width + 'px';
      element.style.top = (1 - labelPosition.y) * 0.5 * height + 'px';
    }
    request = requestAnimationFrame(draw);
  }

  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  request = requestAnimationFrame(draw);
  host.dataset.graphics = 'ativa';

  return {
    update(next: SceneFrame, rays: boolean, withLabels: boolean) {
      frame = next;
      showLabels = withLabels;
      contents.update(frame, rays);
      frame.forEach((robot, i) => {
        const element = labelNodes[i]!;
        element.hidden = !showLabels && !robot.disabled;
        element.textContent = robot.disabled ? '⚠ ' + robot.id : robot.id;
        element.title = robot.disabled ? robot.id + ' · desativado' : robot.id;
      });
    },
    setView(next: CameraView) {
      view = next;
      fit(view);
    },
    keyboard(key: string, pan: boolean): boolean {
      if (
        !controls ||
        ![
          'ArrowLeft',
          'ArrowRight',
          'ArrowUp',
          'ArrowDown',
          '+',
          '-',
          '=',
        ].includes(key)
      )
        return false;
      const offset = camera.position.clone().sub(controls.target);
      if (key === '+' || key === '-' || key === '=') {
        offset.setLength(
          Math.max(
            orbitSettings.minDistance,
            Math.min(
              orbitSettings.maxDistance,
              offset.length() * (key === '-' ? 1.15 : 1 / 1.15),
            ),
          ),
        );
      } else if (pan || view === 'top') {
        const right = key === 'ArrowRight' ? 1 : key === 'ArrowLeft' ? -1 : 0;
        const up = key === 'ArrowDown' ? 1 : key === 'ArrowUp' ? -1 : 0;
        const shift = new Vector3(right, -up, 0)
          .applyQuaternion(camera.quaternion)
          .multiplyScalar(offset.length() * 0.06);
        controls.target.add(shift);
      } else {
        const orbit = new Spherical().setFromVector3(offset);
        orbit.theta +=
          key === 'ArrowRight' ? 0.12 : key === 'ArrowLeft' ? -0.12 : 0;
        orbit.phi += key === 'ArrowDown' ? 0.12 : key === 'ArrowUp' ? -0.12 : 0;
        offset.setFromSpherical(orbit.makeSafe());
      }
      camera.position.copy(controls.target).add(offset);
      controls.update();
      return true;
    },
    dispose() {
      cancelAnimationFrame(request);
      observer.disconnect();
      controls?.dispose();
      contents.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      labelNodes.forEach((element) => element.remove());
      delete host.dataset.graphics;
    },
  };
}

export function ArenaView({
  world,
  snapshot,
}: {
  world: World;
  snapshot: SimState;
}) {
  const [view, setView] = useState<CameraView>('3d');
  const [rays, setRays] = useState(true);
  const [labels, setLabels] = useState(true);
  const host = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const graphics = useRef<ReturnType<typeof attachViewport> | null>(null);

  useEffect(() => {
    if (
      !host.current ||
      !overlay.current ||
      typeof WebGL2RenderingContext === 'undefined'
    )
      return;
    try {
      graphics.current = attachViewport(host.current, overlay.current, world);
    } catch {
      return;
    }
    return () => {
      graphics.current?.dispose();
      graphics.current = null;
    };
  }, [world]);

  useEffect(() => {
    graphics.current?.setView(view);
  }, [view, world]);

  useEffect(() => {
    graphics.current?.update(projectFrame(world, snapshot), rays, labels);
  }, [world, snapshot, rays, labels]);

  function cameraKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (graphics.current?.keyboard(event.key, event.shiftKey))
      event.preventDefault();
  }

  return (
    <section
      aria-label="Cena 3D"
      className="arena-scene"
      data-rays={rays}
      data-labels={labels}
      data-view={view}
      data-tick={snapshot.tick}
    >
      <div
        className="arena-viewport"
        tabIndex={0}
        role="group"
        aria-label="Câmera. Setas movem, Shift com setas desloca, mais e menos ajustam o zoom."
        onKeyDown={cameraKeys}
      >
        <div ref={host} className="canvas-host" />
        <div ref={overlay} className="scene-labels" />
        <p className="scene-fallback">
          Visualização 3D indisponível neste navegador. A simulação pode ser
          operada pelos controles.
        </p>
      </div>
      <div className="scene-toolbar">
        {world.match.exit && <span>▦ Saída quadriculada</span>}
        <div role="group" aria-label="Vistas da câmera">
          <button
            type="button"
            aria-pressed={view === 'top'}
            onClick={() => setView('top')}
          >
            Vista de cima
          </button>
          <button
            type="button"
            aria-pressed={view === '3d'}
            onClick={() => setView('3d')}
          >
            Vista 3D
          </button>
          <button type="button" onClick={() => graphics.current?.setView(view)}>
            Centralizar
          </button>
        </div>
        <div className="scene-options">
          <label>
            <input
              type="checkbox"
              checked={rays}
              onChange={(event) => setRays(event.target.checked)}
            />{' '}
            Mostrar raios
          </label>
          <label>
            <input
              type="checkbox"
              checked={labels}
              onChange={(event) => setLabels(event.target.checked)}
            />{' '}
            Mostrar rótulos
          </label>
        </div>
      </div>
    </section>
  );
}
