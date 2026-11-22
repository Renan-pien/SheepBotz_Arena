/// <reference types="vite/client" />
import type { loadPyodide } from 'pyodide';
import type {
  ControllerBindings,
  ControllerEngine,
} from '../../core/controller/runtime';
import adapter from './arena.py?raw';
import pin from './machine.py?raw';

type Python = Awaited<ReturnType<typeof loadPyodide>>;
export type MakerRuntime = ControllerEngine;

function bridge(api: ControllerBindings) {
  const laser = () => api.readLaser!() as number[];
  const info = () =>
    api.getInfo!() as { time: number; startReleased?: boolean };
  const sides = new Map([
    ['frente', 'front'],
    ['traseira', 'rear'],
    ['esquerda', 'left'],
    ['direita', 'right'],
  ]);
  return {
    speed: api.setSpeed,
    contact: api.readBumper,
    random: api.random,
    log: api.log,
    laser: () => JSON.stringify(laser()),
    central: () => {
      const rays = laser();
      return rays[Math.floor(rays.length / 2)] ?? 0;
    },
    odometry: () => JSON.stringify(api.readOdometry!()),
    time: () => info().time,
    released: () => info().startReleased !== false,
    edge: (side: string) => {
      const key = sides.get(side);
      if (!key)
        throw new Error(
          'Lado inválido. Use frente, traseira, esquerda ou direita.',
        );
      return (
        (api.readEdge!() as Record<string, boolean> | null)?.[key] ?? false
      );
    },
  };
}

export function installMaker(
  py: Python,
  wheel: Uint8Array,
  plugin: Uint8Array,
): MakerRuntime {
  py.FS.mkdirTree('/arena/meupia_maker');
  py.FS.writeFile('/arena/core.whl', wheel);
  py.FS.writeFile('/arena/meupia_maker/plugin_iot.py', plugin);
  py.FS.writeFile('/arena/machine.py', pin);
  py.runPython(
    "import sys, zipfile\nzipfile.ZipFile('/arena/core.whl').extractall('/arena')\nsys.path.insert(0, '/arena')",
  );
  py.runPython(adapter);
  const build = py.globals.get('build_controller');
  return {
    load(source, bindings) {
      const call = build(source, bridge(bindings));
      if (typeof call === 'string') return { ok: false, message: call };
      const invoke = (initial: boolean) => {
        const message: unknown = call(initial);
        if (typeof message === 'string') throw new Error(message);
      };
      return {
        ok: true,
        value: { setup: () => invoke(true), loop: () => invoke(false) },
      };
    },
  };
}

let runtime: Promise<MakerRuntime> | undefined;
export function loadMaker(): Promise<MakerRuntime> {
  return (runtime ??= openRuntime().catch((error: unknown) => {
    runtime = undefined;
    throw error;
  }));
}

async function openRuntime() {
  const assets = new URL(
    import.meta.env.BASE_URL + 'meupia/',
    document.baseURI,
  );
  const frame = document.createElement('iframe');
  frame.hidden = true;
  frame.title = 'Motor de Portugol';
  const ready = new Promise<void>((resolve, reject) => {
    frame.onload = () => resolve();
    frame.onerror = () =>
      reject(new Error('Falha ao carregar o ambiente Portugol.'));
  });
  frame.src = new URL('runtime.html', assets).href;
  document.body.append(frame);
  try {
    await ready;
    const host = frame.contentWindow as
      (Window & { loadPyodide?: typeof loadPyodide }) | null;
    if (!host?.loadPyodide)
      throw new Error(
        'Motor Portugol indisponível. Verifique os arquivos da instalação.',
      );
    const bytes = async (file: string) => {
      const response = await fetch(new URL(file, assets));
      if (!response.ok) throw new Error('Falha ao carregar ' + file + '.');
      return new Uint8Array(await response.arrayBuffer());
    };
    const [py, wheel, plugin] = await Promise.all([
      host.loadPyodide({ indexURL: new URL('pyodide/', assets).href }),
      bytes('core-1.4.1.whl'),
      bytes('plugin_iot.py'),
    ]);
    return installMaker(py, wheel, plugin);
  } catch (error) {
    frame.remove();
    throw error;
  }
}
