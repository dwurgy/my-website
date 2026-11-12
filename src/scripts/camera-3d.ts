// The camera, modelled in three.js. An original compact body in the style of
// a black-and-silver rangefinder: silver top plate and base, black body, a
// leatherette grip and thumb rest, two dials and a shutter button on top, a
// four-way dial, and a rear screen on a hinge along its top edge.
//
// It draws only when something changes (the pose, a photo, a press, the
// theme, or the size), never on a loop.
//
// Units are roughly centimetres: the body is 12 wide, 7 tall, and 3.4 deep.
// +x is right and +z points out of the back, toward the viewer.

import {
  CanvasTexture,
  CylinderGeometry,
  DirectionalLight,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NeutralToneMapping,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  RepeatWrapping,
  Scene,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
  type BufferGeometry,
  type Material,
  type Object3D,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export interface PhotoSource {
  small: string;
  large: string;
}

export interface DialLayout {
  prev: { x: number; y: number; size: number };
  next: { x: number; y: number; size: number };
}

export interface CameraModel {
  /** Pose from 0 (turned, screen out) to 1 (straight-on, flush), eased. */
  setPose(t: number): void;
  /** The pose's starting angles, in degrees. */
  setAngles(angles: { turn: number; lean: number; tilt: number }): void;
  /** Shows a photo on the screen, with a 250ms crossfade unless instant. */
  show(index: number, instant: boolean): void;
  /** A short press on one side of the dial. */
  press(direction: number): void;
}

const FADE_MS = 250;
const PRESS_MS = 160;

export function createCameraModel(
  canvas: HTMLCanvasElement,
  photos: PhotoSource[],
  onLayout: (layout: DialLayout) => void,
): CameraModel {
  // Whether a frame is already asked for (see requestRender).
  let queued = false;

  // Throws where WebGL isn't available; the caller falls back to a print.
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
  // dark theme, so the black body doesn't sink into the page.
  const rim = new DirectionalLight(0xffffff, 0.6);
  rim.position.set(7, 6, -9);
  scene.add(rim);

  const view = new PerspectiveCamera(24, 1.5, 1, 100);
  view.position.set(0, 0.4, 22);
  view.lookAt(0, 0, 0);

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

  const silver = new MeshPhysicalMaterial({
    color: 0xd8d5cf,
    metalness: 1,
    roughness: 0.3,
    bumpMap: brushed,
    bumpScale: 0.6,
  });
  const silverKnurl = new MeshPhysicalMaterial({
    color: 0xd8d5cf,
    metalness: 1,
    roughness: 0.34,
    bumpMap: knurl,
    bumpScale: 3,
  });
  // Satin black: a little sheen, but it stays black face-on.
  const paint = new MeshPhysicalMaterial({
    color: 0x121110,
    metalness: 0,
    roughness: 0.72,
    specularIntensity: 0.3,
    envMapIntensity: 0.3,
  });
  const blackKnurl = new MeshPhysicalMaterial({
    color: 0x161514,
    metalness: 0.3,
    roughness: 0.45,
    bumpMap: knurl,
    bumpScale: 3,
  });
  const leather = new MeshStandardMaterial({ color: 0x141312, roughness: 0.92, bumpMap: pebble, bumpScale: 2.2 });
  const rubber = new MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.95 });
  const recessMat = new MeshStandardMaterial({ color: 0x050505, roughness: 1 });
  const glassDark = new MeshPhysicalMaterial({ color: 0x06080b, metalness: 0, roughness: 0.06, clearcoat: 1 });
  const marks = new MeshStandardMaterial({ color: 0x8b867f, roughness: 0.6 });
  const shadowMat = new MeshBasicMaterial({
    map: softSpot(),
    transparent: true,
    depthWrite: false,
    color: 0x000000,
  });

  // ---- The camera -------------------------------------------------------

  const cam = new Group();
  scene.add(cam);

  // The body: silver top plate, black middle, thin silver base. Separate
  // pieces, so a fine seam shows where they meet, as on a real camera.
  add(rbox(12, 1.75, 3.4, 0.42), silver, cam, 0, 2.62, 0);
  add(rbox(11.94, 4.72, 3.36, 0.34), paint, cam, 0, -0.56, 0);
  add(rbox(12, 0.62, 3.4, 0.28), silver, cam, 0, -3.19, 0);

  // The raised part of the top plate, left of centre, with an accessory shoe.
  add(rbox(4.4, 0.62, 2.5, 0.2), silver, cam, -2.4, 3.6, -0.15);
  add(rbox(2.3, 0.08, 1.9, 0.02), rubber, cam, -2.4, 3.93, -0.15);
  add(rbox(0.18, 0.12, 1.9, 0.04), silver, cam, -3.48, 3.97, -0.15);
  add(rbox(0.18, 0.12, 1.9, 0.04), silver, cam, -1.32, 3.97, -0.15);

  // Two dials and the shutter button on top.
  dialOnTop(1.9, -0.35, 0.68, 0.46, silverKnurl);
  dialOnTop(4.55, 0.85, 0.54, 0.4, silverKnurl);
  const shutter = new Group();
  add(new CylinderGeometry(0.42, 0.42, 0.14, 48), paint, shutter, 0, 0.07, 0);
  add(new CylinderGeometry(0.3, 0.3, 0.3, 48), silver, shutter, 0, 0.29, 0);
  const dome = add(new SphereGeometry(0.3, 32, 12, 0, Math.PI * 2, 0, Math.PI / 6), silver, shutter, 0, 0.18, 0);
  dome.scale.y = 0.6;
  shutter.position.set(3.3, 3.5, -0.75);
  cam.add(shutter);

  // Strap lugs on both ends.
  for (const side of [-1, 1]) {
    const lug = add(new TorusGeometry(0.26, 0.07, 12, 32), silver, cam, side * 6.08, 2.55, 0);
    lug.rotation.y = Math.PI / 2;
  }

  // The grip, on the front at the right as seen from the back.
  add(rbox(1.9, 4.1, 0.55, 0.22), leather, cam, 4.9, -0.6, -1.85);
  // The lens mount and a body cap on the front.
  const mount = add(new CylinderGeometry(1.9, 1.9, 0.3, 64), silver, cam, -0.7, -0.4, -1.83);
  mount.rotation.x = Math.PI / 2;
  const cap = add(new CylinderGeometry(1.7, 1.75, 0.5, 64), rubber, cam, -0.7, -0.4, -2.1);
  cap.rotation.x = Math.PI / 2;

  // The back: the eyepiece, the thumb rest, and a few small buttons.
  const BACK = 1.68;
  add(rbox(1.55, 1.05, 0.42, 0.16), rubber, cam, -4.75, 2.62, 1.86);
  add(rbox(1.15, 0.7, 0.02, 0.08), glassDark, cam, -4.75, 2.62, 2.07);
  add(rbox(1.55, 2.1, 0.2, 0.1), leather, cam, 5.0, 0.55, BACK + 0.06);
  for (const [x, y] of [
    [1.75, 1.05],
    [2.75, 0.8],
    [1.65, 0.05],
    [1.55, -2.45],
    [5.3, -2.45],
  ]) {
    const b = add(new CylinderGeometry(0.24, 0.26, 0.16, 32), paint, cam, x, y, BACK + 0.06);
    b.rotation.x = Math.PI / 2;
  }

  // The four-way dial, with OK in the middle.
  const dial = new Group();
  dial.position.set(3.75, -1.15, BACK);
  cam.add(dial);
  const ring = add(new CylinderGeometry(1.02, 1.04, 0.2, 96), blackKnurl, dial, 0, 0, 0.1);
  ring.rotation.x = Math.PI / 2;
  const face = add(new CylinderGeometry(0.86, 0.86, 0.02, 96), paint, dial, 0, 0, 0.205);
  face.rotation.x = Math.PI / 2;
  const ok = add(new CylinderGeometry(0.4, 0.4, 0.16, 64), silver, dial, 0, 0, 0.28);
  ok.rotation.x = Math.PI / 2;
  for (let i = 0; i < 4; i++) {
    const tick = add(triangle(0.11), marks, dial, 0, 0, 0.222);
    const angle = (i * Math.PI) / 2;
    tick.position.x = Math.cos(angle) * 0.66;
    tick.position.y = Math.sin(angle) * 0.66;
    tick.rotation.z = angle;
  }

  // The screen: a recess in the body, and a panel on a hinge along its top.
  add(new PlaneGeometry(5.95, 4.5), recessMat, cam, -2.75, -0.58, BACK + 0.003);
  const hinge = new Group();
  hinge.position.set(-2.75, 1.66, BACK);
  cam.add(hinge);
  add(rbox(5.85, 4.45, 0.28, 0.12), paint, hinge, 0, -2.23, 0.15);
  const SCREEN_W = 5.5;
  const SCREEN_H = (SCREEN_W * 3) / 4;
  const screenBase = new MeshBasicMaterial({ toneMapped: false, color: 0x000000 });
  const screenTop = new MeshBasicMaterial({ toneMapped: false, transparent: true, opacity: 0 });
  const base = add(new PlaneGeometry(SCREEN_W, SCREEN_H), screenBase, hinge, 0, -2.23, 0.292);
  const top = add(new PlaneGeometry(SCREEN_W, SCREEN_H), screenTop, hinge, 0, -2.23, 0.294);
  top.visible = false;
  void base;

  // A soft shadow under the camera, which stays put while it turns. A flat
  // oval facing the viewer, drawn first so the camera always sits on it.
  const shadow = add(new PlaneGeometry(16, 2.2), shadowMat, scene, 0, -3.85, -1);
  shadow.renderOrder = -1;

  // ---- Photos -----------------------------------------------------------

  const textures: (Texture | undefined)[] = [];
  const pending = new Map<number, Promise<Texture>>();
  function texture(i: number): Promise<Texture> {
    const ready = textures[i];
    if (ready) return Promise.resolve(ready);
    let promise = pending.get(i);
    if (!promise) {
      const large = canvas.clientWidth * renderer.getPixelRatio() > 1100;
      promise = loader.loadAsync(large ? photos[i].large : photos[i].small).then((t) => {
        t.colorSpace = SRGBColorSpace;
        t.anisotropy = maxAniso;
        textures[i] = t;
        return t;
      });
      pending.set(i, promise);
    }
    return promise;
  }

  let shown = -1;
  let fadeStart = 0;
  function show(index: number, instant: boolean) {
    shown = index;
    texture(index).then((t) => {
      if (shown !== index) return;
      if (instant || !screenBase.map) {
        setMap(screenBase, t);
        top.visible = false;
        fadeStart = 0;
      } else {
        setMap(screenTop, t);
        screenTop.opacity = 0;
        top.visible = true;
        fadeStart = performance.now();
      }
      requestRender();
      // Get the rest ready, so a flip never waits on the network.
      photos.forEach((_, i) => void texture(i));
    });
  }

  function setMap(material: MeshBasicMaterial, t: Texture) {
    material.map = t;
    material.color.set(0xffffff);
    material.needsUpdate = true;
  }

  // ---- Pose, press, theme, size -----------------------------------------

  let pose = 0;
  let angles = { turn: 30, lean: 11, tilt: 46 };
  let pressDir = 0;
  let pressStart = 0;

  function applyTheme() {
    const dark = document.documentElement.dataset.theme === 'dark';
    rim.intensity = dark ? 2.4 : 0.6;
    shadowMat.opacity = dark ? 0.75 : 0.42;
    requestRender();
  }
  applyTheme();
  new MutationObserver(applyTheme).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    view.aspect = w / h;
    // Keep the whole body in frame, with room for the turn and the screen.
    const span = 2 * Math.tan(MathUtils.degToRad(view.fov / 2));
    view.position.z = Math.max(14 / view.aspect / span, 10.4 / span);
    view.updateProjectionMatrix();
    requestRender();
  }
  new ResizeObserver(resize).observe(canvas);

  // ---- Drawing ----------------------------------------------------------

  function requestRender() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(render);
  }

  const point = new Vector3();
  const edge = new Vector3();
  function project(local: Vector3, offset: Vector3) {
    point.copy(local);
    dial.localToWorld(point).project(view);
    edge.copy(offset);
    dial.localToWorld(edge).project(view);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const x = ((point.x + 1) / 2) * w;
    const y = ((1 - point.y) / 2) * h;
    const ex = ((edge.x + 1) / 2) * w;
    const ey = ((1 - edge.y) / 2) * h;
    return { x, y, size: Math.max(44, 2 * Math.hypot(ex - x, ey - y)) };
  }

  function render(now: number) {
    queued = false;
    let busy = false;

    const rest = 1 - pose;
    cam.rotation.set(
      MathUtils.degToRad(rest * angles.lean),
      // Negative: the screen end swings toward you and the grip end shows.
      MathUtils.degToRad(-rest * angles.turn),
      0,
    );
    hinge.rotation.x = -MathUtils.degToRad(rest * angles.tilt);

    // The photo crossfade.
    if (fadeStart) {
      const k = Math.min(1, (now - fadeStart) / FADE_MS);
      screenTop.opacity = k;
      if (k >= 1) {
        setMap(screenBase, screenTop.map!);
        top.visible = false;
        fadeStart = 0;
      } else busy = true;
    }

    // The dial rocks toward the pressed side and springs back.
    if (pressStart) {
      const k = Math.min(1, (now - pressStart) / PRESS_MS);
      const push = Math.sin(k * Math.PI);
      dial.rotation.y = pressDir * push * 0.12;
      dial.position.z = BACK - push * 0.03;
      if (k >= 1) pressStart = 0;
      else busy = true;
    }

    renderer.render(scene, view);

    cam.updateMatrixWorld();
    onLayout({
      prev: project(new Vector3(-0.6, 0, 0.2), new Vector3(-0.6 + 0.38, 0, 0.2)),
      next: project(new Vector3(0.6, 0, 0.2), new Vector3(0.6 + 0.38, 0, 0.2)),
    });

    if (busy) requestRender();
  }

  resize();

  return {
    setPose(t) {
      if (t === pose) return;
      pose = t;
      requestRender();
    },
    setAngles(next) {
      angles = next;
      requestRender();
    },
    show,
    press(direction) {
      pressDir = direction;
      pressStart = performance.now();
      requestRender();
    },
  };

  // ---- Helpers ----------------------------------------------------------

  function dialOnTop(x: number, z: number, r: number, h: number, sideMat: Material) {
    const g = add(new CylinderGeometry(r, r, h, 72), [sideMat, silver, silver], cam, x, 3.5 + h / 2, z);
    void g;
    // A thin dark collar where the dial meets the plate.
    add(new CylinderGeometry(r * 0.92, r * 0.92, 0.06, 72), paint, cam, x, 3.52, z);
  }
}

function rbox(w: number, h: number, d: number, r: number) {
  return new RoundedBoxGeometry(w, h, d, 5, r);
}

function add(
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

function triangle(size: number) {
  const s = new Shape();
  s.moveTo(size, 0);
  s.lineTo(-size * 0.6, size * 0.8);
  s.lineTo(-size * 0.6, -size * 0.8);
  s.closePath();
  return new ShapeGeometry(s);
}

/** Fine stripes on a canvas, for brushed metal or knurling. */
function stripes(w: number, h: number, direction: 'horizontal' | 'vertical', strength: number) {
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
  const t = new CanvasTexture(c);
  // MeshBasicMaterial multiplies colour by the map; use the map as alpha.
  return t;
}
