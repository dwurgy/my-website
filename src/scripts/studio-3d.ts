// What the 3D objects in Off the clock share: one way of drawing (renderer,
// tone mapping), one studio light, one set of materials, a soft shadow, and
// the theme's effect on all of it. The camera (camera-3d.ts) and the CD player
// (player-3d.ts) each build their own shape from these, so they read as the
// same family of object.

import {
  CanvasTexture,
  DirectionalLight,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NeutralToneMapping,
  PMREMGenerator,
  RepeatWrapping,
  Scene,
  Shape,
  ShapeGeometry,
  SRGBColorSpace,
  TextureLoader,
  WebGLRenderer,
  type BufferGeometry,
  type Material,
  type Object3D,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export type Studio = ReturnType<typeof createStudio>;

/**
 * Sets up drawing on a canvas. Throws where WebGL isn't available; the caller
 * falls back to something flat. `requestRender` is called whenever a texture
 * arrives or the theme changes.
 */
export function createStudio(canvas: HTMLCanvasElement, requestRender: () => void) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1;

  const scene = new Scene();
  // Soft studio light for the reflections on the metal.
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  scene.environmentIntensity = 0.9;

  const key = new DirectionalLight(0xfff6ea, 1.6);
  key.position.set(-6, 9, 10);
  scene.add(key);
  // A light from behind and above that catches the edges; brighter on the
  // dark theme, so black parts don't sink into the page.
  const rim = new DirectionalLight(0xffffff, 0.6);
  rim.position.set(7, 6, -9);
  scene.add(rim);

  // ---- Materials --------------------------------------------------------

  const loader = new TextureLoader();
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  // The site's own grain tile, as the leatherette's pebble.
  const pebble = loader.load('/grain.png', () => requestRender());
  pebble.wrapS = pebble.wrapT = RepeatWrapping;
  pebble.repeat.set(2.5, 2.5);

  // Fine horizontal lines: brushed metal.
  const brushed = stripes(512, 64, 'horizontal', 0.18);
  // Fine vertical ridges around a dial's edge.
  const knurl = stripes(256, 8, 'vertical', 0.6);
  knurl.repeat.set(10, 1);

  const materials = {
    silver: new MeshPhysicalMaterial({
      color: 0xd8d5cf,
      metalness: 1,
      roughness: 0.3,
      bumpMap: brushed,
      bumpScale: 0.6,
    }),
    silverKnurl: new MeshPhysicalMaterial({
      color: 0xd8d5cf,
      metalness: 1,
      roughness: 0.34,
      bumpMap: knurl,
      bumpScale: 3,
    }),
    // Satin black: a little sheen, but it stays black face-on.
    paint: new MeshPhysicalMaterial({
      color: 0x121110,
      metalness: 0,
      roughness: 0.72,
      specularIntensity: 0.3,
      envMapIntensity: 0.3,
    }),
    blackKnurl: new MeshPhysicalMaterial({
      color: 0x161514,
      metalness: 0.3,
      roughness: 0.45,
      bumpMap: knurl,
      bumpScale: 3,
    }),
    leather: new MeshStandardMaterial({ color: 0x141312, roughness: 0.92, bumpMap: pebble, bumpScale: 2.2 }),
    // Small buttons: a touch lighter and shinier than the body, so they read.
    button: new MeshPhysicalMaterial({
      color: 0x1a1816,
      roughness: 0.45,
      specularIntensity: 0.5,
      envMapIntensity: 0.5,
    }),
    rubber: new MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.95 }),
    recess: new MeshStandardMaterial({ color: 0x050505, roughness: 1 }),
    glassDark: new MeshPhysicalMaterial({ color: 0x06080b, metalness: 0, roughness: 0.06, clearcoat: 1 }),
    marks: new MeshStandardMaterial({ color: 0x8b867f, roughness: 0.6 }),
    shadow: new MeshBasicMaterial({
      map: softSpot(),
      transparent: true,
      depthWrite: false,
      color: 0x000000,
    }),
  };

  function applyTheme() {
    const dark = document.documentElement.dataset.theme === 'dark';
    rim.intensity = dark ? 2.4 : 0.6;
    materials.shadow.opacity = dark ? 0.75 : 0.42;
    requestRender();
  }
  applyTheme();
  new MutationObserver(applyTheme).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  return { renderer, scene, key, rim, loader, maxAniso, materials };
}

// ---- Helpers ------------------------------------------------------------

export function rbox(w: number, h: number, d: number, r: number) {
  return new RoundedBoxGeometry(w, h, d, 5, r);
}

export function add(
  geometry: BufferGeometry,
  material: Material | Material[],
  parent: Object3D,
  x: number,
  y: number,
  z: number,
) {
  const mesh = new Mesh(geometry, material);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

/** A small arrowhead pointing along +x. */
export function triangle(size: number) {
  const s = new Shape();
  s.moveTo(size, 0);
  s.lineTo(-size * 0.6, size * 0.8);
  s.lineTo(-size * 0.6, -size * 0.8);
  s.closePath();
  return new ShapeGeometry(s);
}

/** Fine stripes on a canvas, for brushed metal or knurling. */
export function stripes(w: number, h: number, direction: 'horizontal' | 'vertical', strength: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  g.fillStyle = 'rgb(128,128,128)';
  g.fillRect(0, 0, w, h);
  if (direction === 'vertical') {
    for (let x = 0; x < w; x += 4) {
      g.fillStyle = `rgba(255,255,255,${strength})`;
      g.fillRect(x, 0, 2, h);
    }
  } else {
    // Brushing: many faint lines of varied brightness.
    for (let y = 0; y < h; y++) {
      const v = 128 + (Math.random() - 0.5) * 255 * strength;
      g.fillStyle = `rgb(${v},${v},${v})`;
      g.fillRect(0, y, w, 1);
    }
  }
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  return t;
}

/** A soft round shadow, dark in the middle and fading to nothing. */
function softSpot() {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(0,0,0,1)');
  grad.addColorStop(0.45, 'rgba(0,0,0,0.55)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  // MeshBasicMaterial multiplies colour by the map; use the map as alpha.
  return new CanvasTexture(c);
}
