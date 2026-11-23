import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  Group,
  InstancedMesh,
  MeshLambertMaterial,
  Object3D,
} from 'three';

export const sceneryNames = {
  classic: 'Clássico',
  dojo: 'Dojô de Bambu',
  orbital: 'Hangar Orbital',
} as const;
export type Scenery = keyof typeof sceneryNames;

type Piece = readonly [
  x: number,
  y: number,
  z: number,
  width: number,
  height: number,
  depth: number,
  yaw?: number,
  lean?: number,
];

function batch(
  group: Group,
  name: string,
  color: string,
  pieces: Piece[],
  cylinder = false,
  glow = false,
) {
  const geometry = cylinder
    ? new CylinderGeometry(0.5, 0.5, 1, 8)
    : new BoxGeometry();
  const material = new MeshLambertMaterial({
    color,
    ...(glow && { emissive: new Color(color), emissiveIntensity: 0.55 }),
  });
  const mesh = new InstancedMesh(geometry, material, pieces.length);
  mesh.name = name;
  const part = new Object3D();
  pieces.forEach(
    ([x, y, z, width, height, depth, yaw = 0, lean = 0], index) => {
      part.position.set(x, y, z);
      part.rotation.set(0, yaw, lean);
      part.scale.set(width, height, depth);
      part.updateMatrix();
      mesh.setMatrixAt(index, part.matrix);
    },
  );
  group.add(mesh);
}

function dojo(group: Group) {
  const mats: Piece[] = [],
    stitches: Piece[] = [],
    bamboo: Piece[] = [],
    knots: Piece[] = [];
  for (const side of [-1, 1]) {
    for (let i = -3; i <= 3; i++) {
      mats.push([i * 0.65, 0, side * 1.52, 0.62, 0.01, 0.84]);
      for (let line = -2; line <= 2; line++)
        stitches.push([
          i * 0.65 + line * 0.11,
          0.007,
          side * 1.52,
          0.009,
          0.003,
          0.79,
        ]);
    }
    for (const end of [-1, 1]) {
      for (let i = 0; i < 4; i++) {
        const x = side * (1.15 + i * 0.12),
          z = end * (1.35 + (i % 2) * 0.1);
        const h = 0.38 + (i % 3) * 0.11;
        bamboo.push([x, h / 2, z, 0.065, h, 0.065]);
        for (let joint = 0.1; joint < h; joint += 0.13)
          knots.push([x, joint, z, 0.074, 0.018, 0.074]);
      }
    }
  }
  batch(group, 'Tatames', '#b7985d', mats);
  batch(group, 'Trama de palha', '#8f743e', stitches);
  batch(group, 'Bambus', '#456d39', bamboo, true);
  batch(group, 'Nós do bambu', '#aac174', knots, true);
}

function orbital(group: Group) {
  const panels: Piece[] = [],
    vents: Piece[] = [],
    lights: Piece[] = [],
    stripes: Piece[] = [];
  for (const side of [-1, 1]) {
    for (let i = -3; i <= 3; i++) {
      const x = i * 0.61;
      panels.push([x, 0, side * 1.54, 0.58, 0.035, 0.87]);
      for (let slot = -1; slot <= 1; slot++)
        vents.push([x, 0.019, side * (1.6 + slot * 0.065), 0.36, 0.007, 0.029]);
      lights.push([x, 0.026, side * 1.2, 0.43, 0.015, 0.028]);
    }
    for (let i = -3; i <= 3; i++)
      stripes.push([
        side * 1.35,
        0.012,
        i * 0.15,
        0.19,
        0.014,
        0.053,
        side * 0.48,
      ]);
  }
  batch(group, 'Painéis de aço', '#354c62', panels);
  batch(group, 'Grelhas de ventilação', '#132331', vents);
  batch(group, 'Balizas do hangar', '#4fe6ef', lights, false, true);
  batch(group, 'Sinalização do hangar', '#e7ac44', stripes);
}

export function buildScenery(
  theme: Exclude<Scenery, 'classic'>,
  radius: number,
) {
  const group = new Group();
  group.name = sceneryNames[theme];
  group.scale.setScalar(radius);
  group.position.y = -0.009;
  if (theme === 'dojo') dojo(group);
  else orbital(group);
  return group;
}

export function releaseScenery(group: Group) {
  group.traverse((object) => {
    if (object instanceof InstancedMesh) {
      object.dispose();
      object.geometry.dispose();
      object.material.dispose();
    }
  });
  group.removeFromParent();
}
