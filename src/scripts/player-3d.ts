// The music player, modelled in three.js with the camera's light and
// materials (studio-3d.ts). An original compact digital player built like a
// classic object, as the camera is: a brushed silver top plate and base, a
// satin black body, strap lugs, a leatherette panel on the back, a 4:3 screen
// on the front, one silver play/pause button below it, and a knurled knob on
// the top plate that steps through the songs with soft detents.
//
// It draws only while something moves (a drag, the knob, a press, the time on
// the screen), never on an idle loop.
//
// Units are roughly centimetres: 6.4 wide, 10 tall, and 1.7 deep. +y is up
// and +z points out of the front (the screen), toward the viewer.

import {
  CanvasTexture,
  CylinderGeometry,
  Group,
  MathUtils,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  Shape,
  ShapeGeometry,
  SRGBColorSpace,
  TorusGeometry,
  Vector2,
  type Object3D,
} from 'three';
import { add, createStudio, rbox } from './studio-3d';

export type Part = 'play' | 'knob';

export interface Screen {
  /** The song's artwork, already loaded, or null. */
  art: HTMLImageElement | null;
  title: string;
  /** Such as "02 / 04". */
  track: string;
  /** Such as "1:24". */
  time: string;
  /** How far through the song, 0 to 1. */
  progress: number;
}

export interface PlayerModel {
  /** The scroll pose, 0 (turned) to 1 (settled), eased. */
  setPose(t: number): void;
  /** Drag on the body: turn the player to follow the hand; release coasts. */
  grab(): void;
  dragBy(dx: number, dy: number): void;
  release(): void;
  /** Drag on the knob: turn it by pixels; it calls onDetent for each click. */
  turnKnob(dx: number): void;
  releaseKnob(): void;
  /** Turn the knob one click, as when a skip comes from a key or button. */
  stepKnob(direction: number): void;
  press(): void;
  setScreen(screen: Screen): void;
  /** What's under a point on the canvas, in CSS pixels. */
  hit(x: number, y: number): Part | null;
  setReducedMotion(reduced: boolean): void;
}

const W = 6.4;
const H = 10;
const D = 1.7;
const FRONT = D / 2;
const SCREEN_W = 5.1;
const SCREEN_H = (SCREEN_W * 3) / 4;
const SCREEN_Y = 1.2;
const BUTTON_Y = -2.55;

const DETENT = MathUtils.degToRad(30); // one click of the knob
const KNOB_RAD_PER_PX = MathUtils.degToRad(1.1);
const STICK = 0.45; // how much of the turn between clicks shows: the "soft" in soft detents
const PRESS_MS = 200;
const FOLLOW = 0.12; // seconds for a drag to catch up with the hand
const KNOB_FOLLOW = 0.05;
const COAST = 0.55; // seconds for a flick to die away
const DEG_PER_PX = 0.3;

export function createPlayerModel(canvas: HTMLCanvasElement, onDetent: (direction: number) => void): PlayerModel {
  let queued = false;
  const { renderer, scene, materials } = createStudio(canvas, requestRender);
  const { silverKnurl, paint, leather, rubber, recess, glassDark, marks, shadow: shadowMat } = materials;
  // The camera's silver, brushed more finely: the player is smaller, and
  // shown larger, so the camera's brushing would read as ridges.
  const silver = materials.silver.clone();
  silver.bumpScale = 0.22;

  const view = new PerspectiveCamera(24, 1, 1, 100);

  // ---- The player -------------------------------------------------------

  const root = new Group();
  scene.add(root);

  // Silver top plate, black body, thin silver base, as on the camera: the
  // black runs up inside the plates, so only a fine seam shows.
  add(rbox(W, 1.1, D, 0.2), silver, root, 0, H / 2 - 0.55, 0);
  add(rbox(W - 0.06, H - 1.6, D - 0.04, 0.32), paint, root, 0, -0.25, 0);
  add(rbox(W, 0.55, D, 0.16), silver, root, 0, -H / 2 + 0.275, 0);

  // Strap lugs on both sides of the top plate.
  for (const side of [-1, 1]) {
    const lug = add(new TorusGeometry(0.24, 0.065, 12, 32), silver, root, side * (W / 2 + 0.08), H / 2 - 0.6, 0);
    lug.rotation.y = Math.PI / 2;
  }

  // The leatherette panel on the back.
  add(rbox(W - 0.8, H - 2.6, 0.14, 0.3), leather, root, 0, -0.4, -FRONT - 0.02);

  // The screen: a recess, a dark glass bezel, and the picture.
  add(new PlaneGeometry(SCREEN_W + 0.5, SCREEN_H + 0.5), recess, root, 0, SCREEN_Y, FRONT + 0.003);
  add(rbox(SCREEN_W + 0.36, SCREEN_H + 0.36, 0.1, 0.14), glassDark, root, 0, SCREEN_Y, FRONT + 0.03);
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 960;
  screenCanvas.height = 720;
  const screenTexture = new CanvasTexture(screenCanvas);
  screenTexture.colorSpace = SRGBColorSpace;
  screenTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const screenMat = new MeshBasicMaterial({ map: screenTexture, toneMapped: false });
  add(new PlaneGeometry(SCREEN_W, SCREEN_H), screenMat, root, 0, SCREEN_Y, FRONT + 0.082);

  // Play/pause: a silver button in a dark ring, below the screen.
  const ring = add(new CylinderGeometry(0.98, 0.98, 0.04, 64), rubber, root, 0, BUTTON_Y, FRONT + 0.01);
  ring.rotation.x = Math.PI / 2;
  const button = new Group();
  button.position.set(0, BUTTON_Y, FRONT);
  root.add(button);
  const cap = add(new CylinderGeometry(0.8, 0.82, 0.3, 64), silver, button, 0, 0, 0.15);
  cap.rotation.x = Math.PI / 2;
  for (const shape of playPause(0.3)) add(shape, marks, button, 0, 0, 0.302);
  button.traverse((o) => (o.userData.part = 'play'));

  // The knob, on the top plate at the right, with a fine index line.
  const KNOB_R = 0.78;
  const knob = new Group();
  knob.position.set(1.7, H / 2, 0);
  root.add(knob);
  add(new CylinderGeometry(KNOB_R * 0.9, KNOB_R * 0.9, 0.06, 72), paint, root, 1.7, H / 2 + 0.02, 0);
  add(new CylinderGeometry(KNOB_R, KNOB_R, 0.62, 96), [silverKnurl, silver, silver], knob, 0, 0.36, 0);
  add(rbox(0.06, 0.02, KNOB_R * 0.7, 0.01), marks, knob, 0, 0.675, KNOB_R * 0.45);
  knob.traverse((o) => (o.userData.part = 'knob'));

  // A soft shadow under the player, which stays put while it turns.
  const shadow = add(new PlaneGeometry(11, 2.4), shadowMat, scene, 0, -H / 2 - 0.25, -1.5);
  shadow.renderOrder = -1;

  // ---- State ------------------------------------------------------------

  let pose = 0;
  let reduced = false;
  let yawTarget = 0;
  let tiltTarget = 0;
  let yaw = 0;
  let tilt = 0;
  let coast = 0;
  let held = false;
  let lastMove = 0;
  let lastDx = 0;
  let lastDt = 16;

  // The knob: where the hand has turned it (raw), the click it sits in, and
  // the angle shown, which lags a little.
  let knobRaw = 0;
  let knobClick = 0;
  let knobShown = 0;

  let pressStart = 0;
  let lastFrame = 0;

  // ---- Size -------------------------------------------------------------

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    view.aspect = w / h;
    const span = 2 * Math.tan(MathUtils.degToRad(view.fov / 2));
    const dist = Math.max(12.5 / view.aspect / span, 13.6 / span);
    view.position.set(0, 0.3, dist);
    view.lookAt(0, 0.3, 0);
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

  /** The knob's angle with soft detents: it holds near each click. */
  function knobTarget() {
    const off = knobRaw - knobClick * DETENT;
    return knobClick * DETENT + off * STICK;
  }

  function render(now: number) {
    queued = false;
    let busy = false;
    const dt = lastFrame ? Math.min(0.064, (now - lastFrame) / 1000) : 1 / 60;

    if (!held && coast && !reduced) {
      yawTarget += coast * dt;
      coast *= Math.exp(-dt / COAST);
      if (Math.abs(coast) < 0.5) coast = 0;
      busy = true;
    }
    const follow = (shown: number, target: number, tau: number) => {
      if (reduced) return target;
      const next = shown + (target - shown) * (1 - Math.exp(-dt / tau));
      if (Math.abs(target - next) < 1e-3) return target;
      busy = true;
      return next;
    };
    yaw = follow(yaw, yawTarget, FOLLOW);
    tilt = follow(tilt, tiltTarget, FOLLOW);
    knobShown = follow(knobShown, knobTarget(), KNOB_FOLLOW);

    // Turned so the right side shows and leaning so the top shows; settled,
    // straight-on with a slight lean, so the knob still reads.
    const rest = 1 - pose;
    root.rotation.set(MathUtils.degToRad(7 + rest * 9 + tilt), MathUtils.degToRad(-rest * 28 + yaw), 0, 'YXZ');
    // Turning the knob clockwise, seen from above, skips forward.
    knob.rotation.y = -knobShown;

    // The button presses in and comes back with a little give.
    if (pressStart) {
      const k = Math.min(1, (now - pressStart) / PRESS_MS);
      const depth = k < 0.3 ? k / 0.3 : 1 - (k - 0.3) / 0.7 - 0.1 * Math.sin(((k - 0.3) / 0.7) * Math.PI);
      button.position.z = FRONT - 0.12 * Math.max(-0.1, depth);
      if (k >= 1) {
        button.position.z = FRONT;
        pressStart = 0;
      } else busy = true;
    }

    lastFrame = busy ? now : 0;
    renderer.render(scene, view);
    if (busy) requestRender();
  }

  resize();
  drawScreen(screenCanvas, { art: null, title: '', track: '-- / --', time: '-:--', progress: 0 });
  screenTexture.needsUpdate = true;

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
      tiltTarget = MathUtils.clamp(tiltTarget + dy * DEG_PER_PX * 0.5, -25, 25);
      requestRender();
    },
    release() {
      held = false;
      const recent = performance.now() - lastMove < 80;
      coast = recent && !reduced ? MathUtils.clamp((lastDx * DEG_PER_PX * 1000) / lastDt, -150, 150) : 0;
      requestRender();
    },
    turnKnob(dx) {
      knobRaw += dx * KNOB_RAD_PER_PX;
      // Each time the hand passes halfway to the next click, it clicks over.
      const click = Math.round(knobRaw / DETENT);
      while (click !== knobClick) {
        const direction = Math.sign(click - knobClick);
        knobClick += direction;
        onDetent(direction);
      }
      requestRender();
    },
    releaseKnob() {
      knobRaw = knobClick * DETENT;
      requestRender();
    },
    stepKnob(direction) {
      knobClick += direction;
      knobRaw = knobClick * DETENT;
      requestRender();
    },
    press() {
      pressStart = performance.now();
      requestRender();
    },
    setScreen(screen) {
      drawScreen(screenCanvas, screen);
      screenTexture.needsUpdate = true;
      requestRender();
    },
    hit(x, y) {
      ndc.set((x / canvas.clientWidth) * 2 - 1, 1 - (y / canvas.clientHeight) * 2);
      ray.setFromCamera(ndc, view);
      const [first] = ray.intersectObject(root, true);
      let o: Object3D | null = first?.object ?? null;
      while (o && !o.userData.part) o = o.parent;
      return (o?.userData.part as Part) ?? null;
    },
    setReducedMotion(next) {
      reduced = next;
      if (reduced) coast = 0;
      requestRender();
    },
  };
}

// ---- Helpers ------------------------------------------------------------

/** A play triangle beside a pause pair, flat on the button's face. */
function playPause(s: number) {
  const shape = (points: [number, number][]) => {
    const p = new Shape();
    p.moveTo(...points[0]);
    for (const point of points.slice(1)) p.lineTo(...point);
    p.closePath();
    return new ShapeGeometry(p);
  };
  const bar = (x: number) =>
    shape([
      [x - s * 0.09, -s * 0.5],
      [x + s * 0.09, -s * 0.5],
      [x + s * 0.09, s * 0.5],
      [x - s * 0.09, s * 0.5],
    ]);
  return [
    shape([
      [-s * 0.95, s * 0.5],
      [-s * 0.95, -s * 0.5],
      [-s * 0.15, 0],
    ]),
    bar(s * 0.35),
    bar(s * 0.8),
  ];
}

/**
 * The screen: the artwork on the left; the track count, title, elapsed time,
 * and a thin progress line on the right. Pale type on near-black, the same in
 * both themes.
 */
function drawScreen(c: HTMLCanvasElement, screen: Screen) {
  const g = c.getContext('2d')!;
  const { width: w, height: h } = c;
  g.fillStyle = '#0f0e0d';
  g.fillRect(0, 0, w, h);

  // The artwork, square, on the left, a little over half the width.
  const pad = 44;
  const art = 500;
  const top = (h - art) / 2;
  if (screen.art) {
    g.drawImage(screen.art, pad, top, art, art);
  } else {
    g.fillStyle = '#1f1d1b';
    g.fillRect(pad, top, art, art);
  }

  const x = pad * 2 + art;
  const right = w - pad;
  const mono = '"JetBrains Mono", ui-monospace, monospace';
  const sans = '"Archivo Variable", "Archivo", system-ui, sans-serif';

  g.fillStyle = '#a39a8e';
  g.textBaseline = 'top';
  g.font = `500 30px ${mono}`;
  g.fillText(screen.track, x, top + 2);

  // The title, wrapped to at most four lines.
  g.fillStyle = '#f0eae1';
  g.font = `600 50px ${sans}`;
  const lines = wrap(g, screen.title, right - x).slice(0, 5);
  lines.forEach((line, i) => g.fillText(line, x, top + 62 + i * 56));

  // Elapsed time and a progress line at the bottom.
  g.fillStyle = '#f0eae1';
  const bottom = top + art;
  g.font = `500 56px ${mono}`;
  g.textBaseline = 'alphabetic';
  g.fillText(screen.time, x, bottom - 28);
  g.fillStyle = 'rgba(240,234,225,0.22)';
  g.fillRect(x, bottom - 6, right - x, 6);
  g.fillStyle = '#f0eae1';
  g.fillRect(x, bottom - 6, (right - x) * Math.min(1, Math.max(0, screen.progress)), 6);
}

function wrap(g: CanvasRenderingContext2D, text: string, width: number) {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && g.measureText(next).width > width) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}
