import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  Shape,
  TorusGeometry,
  type BufferGeometry,
} from 'three';
import type { RobotModel } from '../../core';
import type { Team } from '../arena/teams';

type Point = readonly [x: number, z: number];
const accents = {
  nimbo: '#67dfc3',
  pulga: '#9ae278',
  zarpa: '#f0b24d',
  quimera: '#ab92ee',
  arraia: '#69dfeb',
  torvelim: '#e67c58',
  brontes: '#9bb783',
  monolito: '#f1bf72',
  baluarte: '#bfc9e1',
} as const;

// Uma unidade local equivale ao raio físico; o eixo +x é a frente.
export function buildRobotModel(id: RobotModel, paint: string, team?: Team) {
  const group = new Group();
  group.name = id;
  const panel = new MeshLambertMaterial({ color: paint });
  const steel = new MeshLambertMaterial({ color: '#626e79' });
  const rubber = new MeshLambertMaterial({ color: '#202630' });
  const trim = new MeshLambertMaterial({ color: accents[id] });
  const light = new MeshLambertMaterial({
    color: '#e5f7ed',
    emissive: '#6d8f94',
  });
  const box = new BoxGeometry();
  const round = new CylinderGeometry(1, 1, 1, 24);
  function part(
    geometry: BufferGeometry,
    material: MeshLambertMaterial,
    x: number,
    y: number,
    z: number,
    a = 1,
    b = 1,
    c = 1,
  ) {
    const mesh = new Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.scale.set(a, b, c);
    group.add(mesh);
    return mesh;
  }
  function deck(
    points: Point[],
    base: number,
    height: number,
    material: MeshLambertMaterial,
  ) {
    const shape = new Shape();
    points.forEach(([x, z], i) => {
      if (i === 0) shape.moveTo(x, -z);
      else shape.lineTo(x, -z);
    });
    shape.closePath();
    const geometry = new ExtrudeGeometry(shape, {
      depth: height,
      bevelEnabled: false,
    });
    geometry.rotateX(-Math.PI / 2);
    return part(geometry, material, 0, base, 0);
  }
  function wheel(x: number, z: number, radius: number) {
    const tire = part(round, rubber, x, radius - 0.49, z, radius, 0.19, radius);
    tire.rotation.x = Math.PI / 2;
    const hub = part(
      round,
      steel,
      x,
      radius - 0.49,
      z + Math.sign(z) * 0.098,
      radius * 0.5,
      0.015,
      radius * 0.5,
    );
    hub.rotation.x = Math.PI / 2;
  }
  const hull: Point[] = [
    [0.82, -0.23],
    [0.55, -0.51],
    [-0.48, -0.55],
    [-0.76, -0.3],
    [-0.76, 0.3],
    [-0.48, 0.55],
    [0.55, 0.51],
    [0.82, 0.23],
  ];
  if (id !== 'pulga' && id !== 'arraia') deck(hull, -0.31, 0.28, rubber);
  let top = 0.2;
  switch (id) {
    case 'pulga': {
      const delta: Point[] = [
        [0.89, 0],
        [0.48, -0.2],
        [-0.48, -0.63],
        [-0.68, -0.35],
        [-0.68, 0.35],
        [-0.48, 0.63],
        [0.48, 0.2],
      ];
      deck(delta, -0.26, 0.22, panel);
      const arch = new TorusGeometry(1, 0.09, 8, 18, Math.PI);
      for (const side of [-1, 1]) {
        wheel(-0.46, side * 0.61, 0.28);
        part(arch, trim, -0.07, -0.04, side * 0.24, 0.5, 0.54, 0.5);
      }
      part(box, steel, -0.07, 0.49, 0, 0.1, 0.06, 0.52);
      const roller = part(round, rubber, 0.59, -0.3, 0, 0.18, 0.23, 0.18);
      roller.rotation.x = Math.PI / 2;
      top = -0.035;
      break;
    }
    case 'arraia': {
      for (const side of [-1, 1]) {
        const wing: Point[] = [
          [0.88, 0],
          [0.33, side * 0.52],
          [-0.39, side * 0.9],
          [-0.57, side * 0.79],
          [-0.31, side * 0.24],
          [-0.72, side * 0.14],
          [-0.82, 0],
        ];
        deck(wing, -0.18, 0.25, panel);
        deck(
          [
            [0.43, side * 0.33],
            [-0.4, side * 0.82],
            [-0.27, side * 0.57],
          ],
          0.075,
          0.032,
          trim,
        );
        wheel(-0.28, side * 0.35, 0.24);
      }
      part(round, steel, 0.08, 0.13, 0, 0.47, 0.14, 0.18);
      top = 0.2;
      break;
    }
    case 'monolito': {
      const plinth = new CylinderGeometry(0.8, 1, 1, 6);
      part(plinth, steel, 0, -0.18, 0, 0.96, 0.36, 0.96);
      part(plinth, panel, -0.03, 0.13, 0, 0.78, 0.41, 0.76);
      part(plinth, trim, -0.06, 0.37, 0, 0.58, 0.09, 0.55);
      part(plinth, panel, -0.08, 0.51, 0, 0.49, 0.24, 0.47);
      for (const side of [-1, 1]) {
        wheel(-0.36, side * 0.59, 0.22);
        wheel(0.36, side * 0.59, 0.22);
      }
      top = 0.63;
      break;
    }
    case 'nimbo':
      part(round, panel, -0.05, 0.04, 0, 0.76, 0.24, 0.61);
      part(round, steel, -0.2, 0.17, 0, 0.36, 0.08, 0.34);
      for (const side of [-1, 1]) {
        wheel(-0.22, side * 0.63, 0.24);
        deck(
          [
            [0.89, side * 0.1],
            [0.47, side * 0.52],
            [0.4, side * 0.18],
          ],
          -0.18,
          0.15,
          trim,
        );
      }
      top = 0.22;
      break;
    case 'zarpa':
      deck(hull, -0.055, 0.27, panel);
      for (const side of [-1, 1]) {
        wheel(-0.35, side * 0.6, 0.29);
        deck(
          [
            [0.17, side * 0.25],
            [0.92, side * 0.26],
            [0.82, side * 0.5],
            [0.18, side * 0.58],
          ],
          -0.35,
          0.18,
          trim,
        );
      }
      break;
    case 'quimera':
      part(box, steel, 0, -0.03, 0, 1.3, 0.29, 0.64);
      for (const side of [-1, 1]) {
        wheel(-0.32, side * 0.65, 0.26);
        wheel(0.37, side * 0.62, 0.2);
        const pod = part(
          round,
          panel,
          0.0,
          0.12,
          side * 0.43,
          0.65,
          0.37,
          0.29,
        );
        pod.rotation.y = side * 0.08;
        part(box, trim, 0.24, 0.32, side * 0.42, 0.26, 0.055, 0.2);
      }
      top = 0.17;
      break;
    case 'torvelim':
      part(round, panel, 0, -0.01, 0, 0.84, 0.39, 0.84);
      part(round, rubber, 0, 0.22, 0, 0.67, 0.1, 0.67);
      for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI * 2) / 3;
        const vane = part(
          box,
          trim,
          Math.cos(angle) * 0.35,
          0.3,
          Math.sin(angle) * 0.35,
          0.57,
          0.09,
          0.19,
        );
        vane.rotation.y = -angle - 0.34;
      }
      part(round, steel, 0, 0.34, 0, 0.2, 0.09, 0.2);
      top = 0.4;
      break;
    case 'brontes':
      for (const side of [-1, 1]) {
        part(box, rubber, -0.04, -0.12, side * 0.56, 1.3, 0.56, 0.36);
        for (let i = -3; i <= 3; i++)
          part(
            box,
            steel,
            i * 0.18 - 0.03,
            0.175,
            side * 0.56,
            0.08,
            0.06,
            0.36,
          );
      }
      part(box, panel, -0.07, 0.18, 0, 1.15, 0.5, 0.76);
      part(box, trim, 0.42, 0.26, 0, 0.16, 0.31, 0.9);
      top = 0.44;
      break;
    case 'baluarte': {
      deck(hull, -0.07, 0.46, panel);
      for (const side of [-1, 1]) {
        wheel(-0.37, side * 0.6, 0.32);
        part(box, trim, -0.27, 0.42, side * 0.37, 0.57, 0.08, 0.1);
      }
      const blade = part(box, steel, 0.62, -0.09, 0, 0.32, 0.49, 1.38);
      blade.rotation.z = -0.42;
      top = 0.4;
      break;
    }
  }
  // As faixas centrais continuam distinguindo as equipes com os rótulos ocultos.
  if (team === 'blue') {
    for (const side of [-1, 1])
      part(box, light, -0.11, top + 0.015, side * 0.09, 0.32, 0.032, 0.055);
  } else {
    deck(
      [
        [0.13, 0],
        [-0.22, -0.115],
        [-0.22, 0.115],
      ],
      top,
      0.035,
      light,
    );
  }
  part(box, light, 0.66, 0.015, 0, 0.09, 0.085, 0.28);
  return { group, paint: panel };
}
