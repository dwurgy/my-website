// The CD player, modelled in three.js with the camera's light and materials
// (studio-3d.ts). An original round portable player, no brand: a brushed
// silver body, a silver lid with fine concentric brushing and a smoked round
// window, a small LCD, and three black buttons (previous, play/pause, next)
// at the front of the lid. The lid opens on a hinge at the back to show the
// disc, whose label is the song's Apple Music artwork.
//
// It draws only while something moves (a drag, the lid, the disc, a press),
// never on an idle loop.
//
// Units are roughly centimetres: 13 across and 2.3 tall. The player lies on
// its back with +y up out of the lid and +z toward the front (the buttons).

import {
  CanvasTexture,
  CircleGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  MathUtils,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  RepeatWrapping,
  RingGeometry,
  Shape,
  ShapeGeometry,
  SRGBColorSpace,
  Vector2,
  type Object3D,
  type Texture,
} from 'three';
import { add, createStudio, rbox } from './studio-3d';

export type Part = 'lid' | 'prev' | 'play' | 'next';

export interface PlayerModel {
  /** The scroll pose, 0 (turned and flatter) to 1 (settled), eased. */
  setPose(t: number): void;
  /** Drag: follow the hand by this many pixels; release lets it coast. */
  grab(): void;
  dragBy(dx: number, dy: number): void;
  release(): void;
  setLid(open: boolean): void;
  setPlaying(playing: boolean): void;
  /** The disc label: an image URL, or null for a plain silver disc. */
  setArt(url: string | null): void;
  /** The LCD's two readings, such as "02" and "1:24". */
  setLcd(track: string, time: string): void;
  press(part: Exclude<Part, 'lid'>): void;
  /** What's under a point on the canvas, in CSS pixels. */
  hit(x: number, y: number): Part | null;
  setReducedMotion(reduced: boolean): void;
}

const R = 6.5; // body radius
const BASE_H = 1.7;
const LID_H = 0.6;
const WINDOW_R = 3.3;
const DISC_R = 6.0;
const HINGE_Z = -6.2;
const LID_OPEN = MathUtils.degToRad(78);

const LID_MS = 520; // the lid's swing
const PRESS_MS = 180;
const SPIN = Math.PI * 2 * 1.1; // radians a second at full speed
const SPIN_UP = 0.35; // seconds to get most of the way up to speed
const SPIN_DOWN = 0.9; // and down: a gradual stop, not an instant one
const FOLLOW = 0.12; // seconds for a drag to catch up with the hand
const COAST = 0.55; // seconds for a flick to die away
const DEG_PER_PX = 0.2;

export function createPlayerModel(canvas: HTMLCanvasElement): PlayerModel {
  let queued = false;
  const { renderer, scene, loader, maxAniso, materials } = createStudio(canvas, requestRender);
  const { silver, paint, recess, glassDark, marks, shadow: shadowMat } = materials;

  const view = new PerspectiveCamera(24, 4 / 3, 1, 100);

  // ---- Materials of its own ---------------------------------------------

  // The lid's top: silver brushed in fine circles around the centre.
  const lidTop = new MeshPhysicalMaterial({
    color: 0xd8d5cf,
    metalness: 1,
    roughness: 0.28,
    bumpMap: concentric(),
    bumpScale: 0.8,
  });
  // Smoked clear plastic over the disc.
  const smoke = new MeshPhysicalMaterial({
    color: 0x14110f,
    metalness: 0,
    roughness: 0.05,
    transparent: true,
    opacity: 0.5,
    clearcoat: 1,
    depthWrite: false,
    side: DoubleSide,
  });
  // The disc: bare silver until its artwork arrives.
  const bare = { color: 0xc9c6c1, metalness: 1, roughness: 0.18, iridescence: 0.5 };
  const label = new MeshPhysicalMaterial({ ...bare });
  const discUnder = new MeshPhysicalMaterial({ ...bare, roughness: 0.12, iridescence: 0.8 });
  // The clear plastic around the centre hole.
  const hubMat = new MeshPhysicalMaterial({
    color: 0xd6d2cb,
    metalness: 0.1,
    roughness: 0.15,
    transparent: true,
    opacity: 0.35,
  });
  const lcdText = new CanvasTexture(lcdCanvas());
  lcdText.colorSpace = SRGBColorSpace;
  const lcdMat = new MeshStandardMaterial({
    map: lcdText,
    emissiveMap: lcdText,
    emissive: 0xffffff,
    emissiveIntensity: 0.55,
    roughness: 0.3,
  });

  // ---- The player -------------------------------------------------------

  const root = new Group(); // scroll and drag turn this
  scene.add(root);
  const body = new Group(); // tilted back so the lid faces you
  root.add(body);

  // Brushed silver sides, black underneath and on the deck under the lid.
  const side = silver.clone();
  side.bumpMap = side.bumpMap!.clone();
  side.bumpMap.wrapS = side.bumpMap.wrapT = RepeatWrapping;
  side.bumpMap.repeat.set(1, 0.5);
  add(new CylinderGeometry(R, R, BASE_H, 128), [side, paint, paint], body, 0, BASE_H / 2, 0);
  // A soft bevel at the bottom edge.
  add(new CylinderGeometry(R - 0.12, R - 0.12, 0.12, 128), paint, body, 0, -0.04, 0);

  // The well under the lid: a silver rim, a dark floor, and the spindle.
  const deck = BASE_H + 0.002;
  flat(new RingGeometry(DISC_R + 0.2, R, 128), silver, body, deck);
  flat(new CircleGeometry(DISC_R + 0.2, 128), recess, body, deck - 0.001);
  add(new CylinderGeometry(0.62, 0.66, 0.36, 48), silver, body, 0, deck + 0.18, 0);

  // The disc, on the spindle.
  const disc = new Group();
  disc.position.set(0, deck + 0.14, 0);
  body.add(disc);
  add(new CylinderGeometry(DISC_R, DISC_R, 0.06, 128, 1, true), discUnder, disc, 0, 0, 0);
  flat(new RingGeometry(1.7, DISC_R, 128), label, disc, 0.031);
  flat(new RingGeometry(0.66, 1.7, 64), hubMat, disc, 0.031);
  flat(new RingGeometry(0.66, DISC_R, 128), discUnder, disc, -0.031, true);

  // The lid, on its hinge at the back.
  const hinge = new Group();
  hinge.position.set(0, BASE_H, HINGE_Z);
  body.add(hinge);
  const lid = new Group();
  lid.position.set(0, 0, -HINGE_Z);
  hinge.add(lid);
  add(new CylinderGeometry(R, R, LID_H, 128, 1, true), side, lid, 0, LID_H / 2, 0);
  flat(new RingGeometry(WINDOW_R + 0.22, R, 128), lidTop, lid, LID_H);
  flat(new RingGeometry(WINDOW_R, WINDOW_R + 0.22, 96), paint, lid, LID_H + 0.002);
  // The lid's underside: the same metal, left matte.
  const under = new MeshPhysicalMaterial({ color: 0xb9b5ae, metalness: 1, roughness: 0.55 });
  flat(new RingGeometry(WINDOW_R, R, 128), under, lid, 0, true);
  const tubeMat = paint.clone();
  tubeMat.side = DoubleSide;
  add(new CylinderGeometry(WINDOW_R, WINDOW_R, LID_H, 96, 1, true), tubeMat, lid, 0, LID_H / 2, 0);
  const lens = flat(new CircleGeometry(WINDOW_R, 96), smoke, lid, LID_H - 0.08);
  lens.renderOrder = 2;
  // Everything on the lid counts as the lid for a click.
  lid.traverse((o) => (o.userData.part = 'lid'));

  // The LCD, in a dark glass frame at the front of the lid.
  const lcd = new Group();
  lcd.position.set(0, LID_H, 4.15);
  lid.add(lcd);
  add(rbox(2.6, 0.1, 1.0, 0.04), glassDark, lcd, 0, 0.02, 0);
  flat(new PlaneGeometry(2.36, 0.78), lcdMat, lcd, 0.075);

  // Three buttons along the front edge.
  const buttons = {} as Record<'prev' | 'play' | 'next', Group>;
  const spots: ['prev' | 'play' | 'next', number][] = [
    ['prev', -25],
    ['play', 0],
    ['next', 25],
  ];
  for (const [name, angle] of spots) {
    const a = MathUtils.degToRad(angle);
    const button = new Group();
    button.position.set(Math.sin(a) * 5.45, LID_H, Math.cos(a) * 5.45);
    button.rotation.y = -a;
    lid.add(button);
    const r = name === 'play' ? 0.46 : 0.38;
    add(new CylinderGeometry(r * 1.12, r * 1.12, 0.04, 48), materials.rubber, button, 0, 0.02, 0);
    const cap = new Group();
    cap.position.y = 0.04;
    button.add(cap);
    add(new CylinderGeometry(r, r * 1.04, 0.2, 48), materials.button, cap, 0, 0.1, 0);
    for (const geometry of icon(name, r * 0.42)) flat(geometry, marks, cap, 0.202);
    button.traverse((o) => (o.userData.part = name));
    buttons[name] = cap as Group;
  }

  // A soft shadow under the player, which stays put while it turns.
  const shadow = add(new PlaneGeometry(17, 3.2), shadowMat, scene, 0, -3.9, -2);
  shadow.renderOrder = -1;

  // ---- State ------------------------------------------------------------

  let pose = 0;
  let reduced = false;
  // Drag: where the hand wants it (target), and where it is (shown).
  let yawTarget = 0;
  let tiltTarget = 0;
  let yaw = 0;
  let tilt = 0;
  let coast = 0; // degrees a second, after a flick
  let held = false;
  let lastMove = 0;
  let lastDx = 0;
  let lastDt = 16;

  let lidOpen = false;
  let lidT = 0; // 0 shut, 1 open
  let lidFrom = 0;
  let lidStart = 0;

  let playing = false;
  let spinSpeed = 0;
  const pressed = new Map<string, number>();
  let lastFrame = 0;

  // ---- Size -------------------------------------------------------------

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    view.aspect = w / h;
    // Keep the player in frame, with room above for the open lid.
    const span = 2 * Math.tan(MathUtils.degToRad(view.fov / 2));
    const dist = Math.max(18.5 / view.aspect / span, 21 / span);
    view.position.set(0, 2.7, dist);
    view.lookAt(0, 2.7, 0);
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

  function render(now: number) {
    queued = false;
    let busy = false;
    const dt = lastFrame ? Math.min(0.064, (now - lastFrame) / 1000) : 1 / 60;

    // A flick keeps turning after the hand lets go, and slows to rest.
    if (!held && coast && !reduced) {
      yawTarget += coast * dt;
      coast *= Math.exp(-dt / COAST);
      if (Math.abs(coast) < 0.5) coast = 0;
      busy = true;
    }
    // The shown turn follows the hand with a slight lag.
    if (reduced) {
      yaw = yawTarget;
      tilt = tiltTarget;
    } else {
      const k = 1 - Math.exp(-dt / FOLLOW);
      yaw += (yawTarget - yaw) * k;
      tilt += (tiltTarget - tilt) * k;
      if (Math.abs(yawTarget - yaw) > 0.01 || Math.abs(tiltTarget - tilt) > 0.01) busy = true;
      else {
        yaw = yawTarget;
        tilt = tiltTarget;
      }
    }

    const rest = 1 - pose;
    root.rotation.y = MathUtils.degToRad(-rest * 32);
    // Tilted back toward you; a drag turns it on its own axis, like turning
    // it on a table, so it never flips over.
    body.rotation.set(MathUtils.degToRad(54 - rest * 18 + tilt), MathUtils.degToRad(yaw), 0);
    // The body turns about its centre, which sits a little above its base.
    body.position.y = -1;

    // The lid swings, easing in and out.
    if (lidStart) {
      const k = reduced ? 1 : Math.min(1, (now - lidStart) / LID_MS);
      const target = lidOpen ? 1 : 0;
      lidT = lidFrom + (target - lidFrom) * easeInOut(k);
      if (k >= 1) lidStart = 0;
      else busy = true;
    }
    hinge.rotation.x = -lidT * LID_OPEN;

    // The disc spins up quickly and runs down slowly.
    const want = playing && !reduced ? SPIN : 0;
    spinSpeed += (want - spinSpeed) * (1 - Math.exp(-dt / (want > spinSpeed ? SPIN_UP : SPIN_DOWN)));
    if (want === 0 && spinSpeed < 0.02) spinSpeed = 0;
    disc.rotation.y -= spinSpeed * dt;
    if (spinSpeed) busy = true;

    // Buttons press in and come back with a little give.
    for (const [name, start] of pressed) {
      const k = Math.min(1, (now - start) / PRESS_MS);
      const depth = k < 0.35 ? k / 0.35 : Math.max(0, 1 - (k - 0.35) / 0.65) * 1.08 - 0.08 * Math.sin(k * Math.PI);
      buttons[name as keyof typeof buttons].position.y = 0.04 - 0.09 * depth;
      if (k >= 1) {
        buttons[name as keyof typeof buttons].position.y = 0.04;
        pressed.delete(name);
      } else busy = true;
    }

    lastFrame = busy ? now : 0;
    renderer.render(scene, view);
    if (busy) requestRender();
  }

  resize();

  // ---- Picking ----------------------------------------------------------

  const ray = new Raycaster();
  const ndc = new Vector2();

  return {
    setPose(t) {
      if (t === pose) return;
      pose = t;
      requestRender();
    },
    grab() {
      held = true;
      coast = 0;
      lastMove = performance.now();
      lastDx = 0;
    },
    dragBy(dx, dy) {
      const t = performance.now();
      lastDt = Math.max(8, t - lastMove);
      lastMove = t;
      lastDx = dx;
      yawTarget += dx * DEG_PER_PX;
      tiltTarget = MathUtils.clamp(tiltTarget + dy * DEG_PER_PX * 0.6, -30, 30);
      requestRender();
    },
    release() {
      held = false;
      // Only a hand still moving when it lets go makes the player coast.
      const recent = performance.now() - lastMove < 80;
      coast = recent && !reduced ? MathUtils.clamp((lastDx * DEG_PER_PX * 1000) / lastDt, -150, 150) : 0;
      requestRender();
    },
    setLid(open) {
      if (open === lidOpen) return;
      lidOpen = open;
      lidFrom = lidT;
      lidStart = performance.now();
      requestRender();
    },
    setPlaying(next) {
      playing = next;
      requestRender();
    },
    setArt(url) {
      if (!url) {
        clearArt();
        return;
      }
      loader
        .loadAsync(url)
        .then((t: Texture) => {
          t.colorSpace = SRGBColorSpace;
          t.anisotropy = maxAniso;
          label.map?.dispose();
          label.map = t;
          label.color.set(0xffffff);
          label.metalness = 0;
          label.roughness = 0.42;
          label.iridescence = 0;
          label.needsUpdate = true;
          requestRender();
        })
        .catch(clearArt);
    },
    setLcd(track, time) {
      drawLcd(lcdText.image as HTMLCanvasElement, track, time);
      lcdText.needsUpdate = true;
      requestRender();
    },
    press(part) {
      pressed.set(part, performance.now());
      requestRender();
    },
    hit(x, y) {
      ndc.set((x / canvas.clientWidth) * 2 - 1, 1 - (y / canvas.clientHeight) * 2);
      ray.setFromCamera(ndc, view);
      for (const found of ray.intersectObject(root, true)) {
        let o: Object3D | null = found.object;
        while (o && !o.userData.part) o = o.parent;
        if (o) return o.userData.part as Part;
        // The open lid's disc and well: a click there closes it.
        if (lidOpen) return 'lid';
        return null;
      }
      return null;
    },
    setReducedMotion(next) {
      reduced = next;
      if (reduced) coast = 0;
      requestRender();
    },
  };

  function clearArt() {
    label.map?.dispose();
    label.map = null;
    label.setValues(bare);
    label.needsUpdate = true;
    requestRender();
  }
}

// ---- Helpers ------------------------------------------------------------

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/** A flat shape lying on a surface at height y, facing up (or down). */
function flat(
  geometry: CircleGeometry | RingGeometry | PlaneGeometry | ShapeGeometry,
  material: MeshPhysicalMaterial | MeshStandardMaterial,
  parent: Object3D,
  y: number,
  down = false,
) {
  const mesh = add(geometry, material, parent, 0, y, 0);
  mesh.rotation.x = down ? Math.PI / 2 : -Math.PI / 2;
  return mesh;
}

/** The marks on a button: previous, play/pause, or next. */
function icon(name: 'prev' | 'play' | 'next', s: number) {
  // Drawn facing up, with +y toward the back of the player (away from you),
  // so "right" on the shape is right as you look at it.
  const tri = (x: number, dir: number, size: number) => {
    const shape = new Shape();
    shape.moveTo(x + dir * size, 0);
    shape.lineTo(x - dir * size * 0.7, size * 0.85);
    shape.lineTo(x - dir * size * 0.7, -size * 0.85);
    shape.closePath();
    return new ShapeGeometry(shape);
  };
  const bar = (x: number, w: number, h: number) => {
    const shape = new Shape();
    shape.moveTo(x - w / 2, -h / 2);
    shape.lineTo(x + w / 2, -h / 2);
    shape.lineTo(x + w / 2, h / 2);
    shape.lineTo(x - w / 2, h / 2);
    shape.closePath();
    return new ShapeGeometry(shape);
  };
  if (name === 'play') return [tri(-s * 0.45, 1, s * 0.6), bar(s * 0.45, s * 0.18, s * 1.0), bar(s * 0.8, s * 0.18, s * 1.0)];
  const dir = name === 'next' ? 1 : -1;
  return [tri(-dir * s * 0.35, dir, s * 0.5), tri(dir * s * 0.35, dir, s * 0.5), bar(dir * s * 0.95, s * 0.16, s * 0.95)];
}

/** Fine circles around the centre: brushing on the lid. */
function concentric() {
  const size = 1024;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  g.fillStyle = 'rgb(128,128,128)';
  g.fillRect(0, 0, size, size);
  g.lineWidth = 1;
  for (let r = 2; r < size * 0.71; r += 1.5) {
    const v = 128 + (Math.random() - 0.5) * 255 * 0.2;
    g.strokeStyle = `rgb(${v},${v},${v})`;
    g.beginPath();
    g.arc(size / 2, size / 2, r, 0, Math.PI * 2);
    g.stroke();
  }
  return new CanvasTexture(c);
}

function lcdCanvas() {
  const c = document.createElement('canvas');
  c.width = 640;
  c.height = 212;
  drawLcd(c, '--', '-:--');
  return c;
}

/** The LCD: a dark grey glass with the track number and time in pale type. */
function drawLcd(c: HTMLCanvasElement, track: string, time: string) {
  const g = c.getContext('2d')!;
  g.fillStyle = '#1c1d1b';
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = '#d9d4ca';
  g.textBaseline = 'middle';
  const mono = '"JetBrains Mono", ui-monospace, monospace';
  g.font = `500 30px ${mono}`;
  g.globalAlpha = 0.6;
  g.textAlign = 'left';
  g.fillText('TRACK', 40, 48);
  g.textAlign = 'right';
  g.fillText('TIME', c.width - 40, 48);
  g.globalAlpha = 1;
  g.font = `500 96px ${mono}`;
  g.textAlign = 'left';
  g.fillText(track, 36, 136);
  g.textAlign = 'right';
  g.fillText(time, c.width - 36, 136);
}
