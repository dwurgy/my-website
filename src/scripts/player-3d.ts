// The music player, modelled in three.js with the camera's light (studio-3d.ts):
// in the style of a classic click-wheel player, at David's request
// (2026-11-16). A satin silver front, a glossy black screen area, a white
// wheel marked MENU, back, forward, and play/pause around a silver centre
// button, and a polished chrome back. No logo and no wordmark.
//
// It draws only while something moves (a drag, a press, the time on the
// screen), never on an idle loop.
//
// Units are roughly centimetres: 6.2 wide, 10.35 tall, and 1.05 deep. +y is
// up and +z points out of the front, toward the viewer.

import {
  CanvasTexture,
  CircleGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  MathUtils,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  RingGeometry,
  Shape,
  SRGBColorSpace,
  Vector2,
  Vector3,
  type Object3D,
} from 'three';
import { add, createStudio } from './studio-3d';

export type Part = 'play' | 'menu' | 'prev' | 'next' | 'center';

export interface Screen {
  /** The song's artwork, already loaded, or null. */
  art: HTMLImageElement | null;
  title: string;
  artist: string;
  /** Such as "2 of 4". */
  track: string;
  /** Such as "1:24" and "-1:06". */
  elapsed: string;
  remaining: string;
  /** How far through the song, 0 to 1. */
  progress: number;
  playing: boolean;
}

/** Where the wheel is on the canvas, in CSS pixels, for the touch zone. */
export interface WheelLayout {
  x: number;
  y: number;
  /** The wheel's outer and inner (centre button) radii, on screen. */
  outer: number;
  inner: number;
}

export interface PlayerModel {
  /** The scroll pose, 0 (turned) to 1 (settled), eased. */
  setPose(t: number): void;
  /** Drag on the body: turn the player to follow the hand; release coasts. */
  grab(): void;
  dragBy(dx: number, dy: number): void;
  release(): void;
  /**
   * Run a finger round the wheel by this angle (radians, clockwise on screen
   * positive); it calls onDetent for each click.
   */
  scroll(angle: number): void;
  endScroll(): void;
  /** A press on part of the wheel, or the centre button. */
  press(part: Part): void;
  setScreen(screen: Screen): void;
  /** What's under a point on the canvas, in CSS pixels. */
  hit(x: number, y: number): Part | 'body' | null;
  setReducedMotion(reduced: boolean): void;
}

const W = 6.2;
const H = 10.35;
const FRONT = 0.26; // the front plate's thickness
const BACK = 0.79; // the chrome back's depth, behind it
const CORNER = 0.6;
const SCREEN_Y = 2.45;
const DISPLAY_W = 4.7;
const DISPLAY_H = (DISPLAY_W * 3) / 4;
const WHEEL_Y = -2.5;
const WHEEL_R = 1.98;
const CENTER_R = 0.72;

const CLICK = MathUtils.degToRad(24); // one click of the wheel
const PRESS_MS = 180;
const FOLLOW = 0.12;
const COAST = 0.55;
const DEG_PER_PX = 0.3;

export function createPlayerModel(
  canvas: HTMLCanvasElement,
  onDetent: (direction: number) => void,
  onLayout: (layout: WheelLayout) => void,
): PlayerModel {
  let queued = false;
  const { renderer, scene, materials } = createStudio(canvas, requestRender);
  const { shadow: shadowMat } = materials;
  // The screen area: one even black, like glass with the display off.
  const glassDark = new MeshBasicMaterial({ color: 0x0b0b0c });

  const view = new PerspectiveCamera(24, 1, 1, 100);

  // ---- Materials of its own ---------------------------------------------

  // Satin anodised aluminium, finely brushed.
  const anodised = materials.silver.clone();
  anodised.color.set(0xa7a8aa);
  anodised.metalness = 0.65;
  anodised.roughness = 0.4;
  anodised.bumpScale = 0.12;
  // Polished stainless steel on the back.
  const chrome = new MeshPhysicalMaterial({ color: 0xf2f2f2, metalness: 1, roughness: 0.26 });
  const seam = new MeshBasicMaterial({ color: 0x9c9c9a });
  // The wheel: matte white plastic, with its marks drawn on.
  const wheelFace = new MeshPhysicalMaterial({
    map: wheelMarks(),
    roughness: 0.5,
    clearcoat: 0.15,
  });
  const wheelSide = new MeshPhysicalMaterial({ color: 0xe9e8e4, roughness: 0.5 });
  // The centre button: silver, a touch brighter than the front.
  const centerMat = new MeshPhysicalMaterial({ color: 0xdcdcda, metalness: 0.85, roughness: 0.32 });

  // ---- The player -------------------------------------------------------

  const root = new Group();
  scene.add(root);

  // The front: a flat plate with a fine bevel. The back: polished steel,
  // rounded off all round, like a pebble.
  const front = new ExtrudeGeometry(roundedRect(W, H, CORNER), {
    depth: FRONT - 0.06,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 3,
    curveSegments: 24,
  });
  add(front, anodised, root, 0, 0, -FRONT + 0.03);
  const back = new ExtrudeGeometry(roundedRect(W - 0.7, H - 0.7, CORNER - 0.3), {
    depth: 0.02,
    bevelEnabled: true,
    bevelThickness: BACK / 2,
    bevelSize: 0.34,
    bevelSegments: 10,
    curveSegments: 24,
  });
  add(back, chrome, root, 0, 0, -FRONT - BACK / 2 - 0.01);

  // The screen area: one sheet of glossy black, with the display inside it.
  const glass = new ExtrudeGeometry(roundedRect(W - 0.7, DISPLAY_H + 0.62, 0.12), {
    depth: 0.01,
    bevelEnabled: false,
  });
  add(glass, glassDark, root, 0, SCREEN_Y, 0.001);
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 960;
  screenCanvas.height = 720;
  const screenTexture = new CanvasTexture(screenCanvas);
  screenTexture.colorSpace = SRGBColorSpace;
  screenTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const screenMat = new MeshBasicMaterial({ map: screenTexture, toneMapped: false });
  add(new PlaneGeometry(DISPLAY_W, DISPLAY_H), screenMat, root, 0, SCREEN_Y, 0.014);

  // The wheel, set into the front, and the centre button.
  const wheel = new Group();
  wheel.position.set(0, WHEEL_Y, 0);
  root.add(wheel);
  add(new RingGeometry(WHEEL_R, WHEEL_R + 0.025, 96), seam, root, 0, WHEEL_Y, 0.002);
  const rim = add(new CylinderGeometry(WHEEL_R, WHEEL_R, 0.05, 96, 1, true), wheelSide, wheel, 0, 0, 0.0);
  rim.rotation.x = Math.PI / 2;
  const face = add(new CircleGeometry(WHEEL_R, 96), wheelFace, wheel, 0, 0, 0.026);
  face.userData.wheel = true;
  const button = new Group();
  button.position.set(0, WHEEL_Y, 0);
  root.add(button);
  const cap = add(new CylinderGeometry(CENTER_R, CENTER_R, 0.1, 64), centerMat, button, 0, 0, 0.04);
  cap.rotation.x = Math.PI / 2;
  button.traverse((o) => (o.userData.part = 'center'));

  // A soft shadow under the player, which stays put while it turns.
  const shadow = add(new PlaneGeometry(10, 2.2), shadowMat, scene, 0, -H / 2 - 0.2, -1.5);
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

  // How far round the wheel the finger has gone since its last click.
  let scrolled = 0;

  let pressPart: Part | null = null;
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
    const dist = Math.max(11.5 / view.aspect / span, 12.6 / span);
    view.position.set(0, 0, dist);
    view.lookAt(0, 0, 0);
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

  const toScreen = (local: Vector3) => {
    local.applyMatrix4(root.matrixWorld).project(view);
    return {
      x: ((local.x + 1) / 2) * canvas.clientWidth,
      y: ((1 - local.y) / 2) * canvas.clientHeight,
    };
  };

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
    const follow = (shown: number, target: number) => {
      if (reduced) return target;
      const next = shown + (target - shown) * (1 - Math.exp(-dt / FOLLOW));
      if (Math.abs(target - next) < 1e-3) return target;
      busy = true;
      return next;
    };
    yaw = follow(yaw, yawTarget);
    tilt = follow(tilt, tiltTarget);

    // Turned so the side shows, and settled straight-on.
    const rest = 1 - pose;
    root.rotation.set(MathUtils.degToRad(rest * 10 + tilt), MathUtils.degToRad(-rest * 28 + yaw), 0, 'YXZ');

    // A press: the wheel rocks toward the pressed side, or the centre button
    // goes in, and either comes back with a little give.
    wheel.rotation.set(0, 0, 0);
    button.position.z = 0;
    if (pressStart && pressPart) {
      const k = Math.min(1, (now - pressStart) / PRESS_MS);
      const depth = k < 0.3 ? k / 0.3 : 1 - (k - 0.3) / 0.7 - 0.12 * Math.sin(((k - 0.3) / 0.7) * Math.PI);
      const d = Math.max(-0.12, depth);
      const rock = MathUtils.degToRad(2.2) * d;
      if (pressPart === 'center') button.position.z = -0.05 * d;
      else if (pressPart === 'menu') wheel.rotation.x = -rock;
      else if (pressPart === 'play') wheel.rotation.x = rock;
      else if (pressPart === 'prev') wheel.rotation.y = -rock;
      else if (pressPart === 'next') wheel.rotation.y = rock;
      if (k >= 1) pressStart = 0;
      else busy = true;
    }

    lastFrame = busy ? now : 0;
    renderer.render(scene, view);

    root.updateMatrixWorld();
    const center = toScreen(new Vector3(0, WHEEL_Y, 0.03));
    const edge = toScreen(new Vector3(WHEEL_R, WHEEL_Y, 0.03));
    const inner = toScreen(new Vector3(CENTER_R, WHEEL_Y, 0.03));
    onLayout({
      x: center.x,
      y: center.y,
      outer: Math.hypot(edge.x - center.x, edge.y - center.y),
      inner: Math.hypot(inner.x - center.x, inner.y - center.y),
    });

    if (busy) requestRender();
  }

  resize();
  drawScreen(screenCanvas, {
    art: null,
    title: '',
    artist: '',
    track: '',
    elapsed: '-:--',
    remaining: '-:--',
    progress: 0,
    playing: false,
  });
  screenTexture.needsUpdate = true;

  const ray = new Raycaster();
  const ndc = new Vector2();
  const local = new Vector3();

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
    scroll(angle) {
      scrolled += angle;
      while (Math.abs(scrolled) >= CLICK) {
        const direction = Math.sign(scrolled);
        scrolled -= direction * CLICK;
        onDetent(direction);
      }
    },
    endScroll() {
      scrolled = 0;
    },
    press(part) {
      pressPart = part;
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
      if (!first) return null;
      let o: Object3D | null = first.object;
      while (o && !o.userData.part && !o.userData.wheel) o = o.parent;
      if (o?.userData.part) return o.userData.part as Part;
      if (!o?.userData.wheel) return 'body';
      // Which quarter of the wheel: MENU at the top, then clockwise.
      local.copy(first.point);
      wheel.worldToLocal(local);
      const a = Math.atan2(local.y, local.x);
      if (a > Math.PI / 4 && a <= (3 * Math.PI) / 4) return 'menu';
      if (a <= Math.PI / 4 && a > -Math.PI / 4) return 'next';
      if (a <= -Math.PI / 4 && a > (-3 * Math.PI) / 4) return 'play';
      return 'prev';
    },
    setReducedMotion(next) {
      reduced = next;
      if (reduced) coast = 0;
      requestRender();
    },
  };
}

// ---- Helpers ------------------------------------------------------------

function roundedRect(w: number, h: number, r: number) {
  const s = new Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** The wheel's face: white, with MENU, back, forward, and play/pause in grey. */
function wheelMarks() {
  const size = 1024;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  g.fillStyle = '#f3f2ef';
  g.fillRect(0, 0, size, size);
  g.fillStyle = '#8a8a8a';
  const mid = size / 2;
  const at = size * 0.39; // distance of the marks from the centre

  g.font = '600 72px "Archivo Variable", "Archivo", system-ui, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('MENU', mid, mid - at);

  const tri = (x: number, y: number, dir: number, s: number) => {
    g.beginPath();
    g.moveTo(x + dir * s, y);
    g.lineTo(x - dir * s, y - s);
    g.lineTo(x - dir * s, y + s);
    g.closePath();
    g.fill();
  };
  const bar = (x: number, y: number, s: number) => g.fillRect(x - 5, y - s, 10, s * 2);
  const s = 26;
  // Forward, on the right: two arrows and a bar.
  tri(mid + at - 22, mid, 1, s);
  tri(mid + at + 10, mid, 1, s);
  bar(mid + at + 38, mid, s);
  // Back, on the left.
  tri(mid - at + 22, mid, -1, s);
  tri(mid - at - 10, mid, -1, s);
  bar(mid - at - 38, mid, s);
  // Play/pause, at the bottom.
  tri(mid - 22, mid + at, 1, s);
  bar(mid + 18, mid + at, s);
  bar(mid + 40, mid + at, s);

  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/**
 * The screen, in the style of a classic player's Now Playing: a title bar,
 * the artwork on the left, the song, artist, and count on the right, and the
 * progress bar with elapsed and remaining time along the bottom. Dark type on
 * white, the same in both themes.
 */
function drawScreen(c: HTMLCanvasElement, screen: Screen) {
  const g = c.getContext('2d')!;
  const { width: w, height: h } = c;
  const sans = '"Archivo Variable", "Archivo", system-ui, sans-serif';
  g.fillStyle = '#fbfbfa';
  g.fillRect(0, 0, w, h);

  // Title bar.
  const bar = 76;
  g.fillStyle = '#e6e7ea';
  g.fillRect(0, 0, w, bar);
  g.fillStyle = '#b9bbc0';
  g.fillRect(0, bar - 2, w, 2);
  g.fillStyle = '#1b1b1d';
  g.font = `600 38px ${sans}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('Now Playing', w / 2, bar / 2 + 1);
  // Play or pause, at the left of the bar.
  g.fillStyle = '#55555a';
  if (screen.playing) {
    g.beginPath();
    g.moveTo(34, bar / 2 - 16);
    g.lineTo(62, bar / 2);
    g.lineTo(34, bar / 2 + 16);
    g.closePath();
    g.fill();
  } else {
    g.fillRect(34, bar / 2 - 16, 9, 32);
    g.fillRect(52, bar / 2 - 16, 9, 32);
  }

  // Artwork.
  const pad = 40;
  const art = 380;
  const top = bar + 44;
  if (screen.art) g.drawImage(screen.art, pad, top, art, art);
  else {
    g.fillStyle = '#e4e4e2';
    g.fillRect(pad, top, art, art);
  }

  // Song, artist, count.
  const x = pad * 2 + art;
  const right = w - pad;
  g.textAlign = 'left';
  g.textBaseline = 'top';
  g.fillStyle = '#1b1b1d';
  g.font = `600 46px ${sans}`;
  const lines = wrap(g, screen.title, right - x).slice(0, 4);
  lines.forEach((line, i) => g.fillText(line, x, top + 30 + i * 54));
  g.fillStyle = '#5c5c60';
  g.font = `400 38px ${sans}`;
  const below = top + 30 + lines.length * 54 + 14;
  wrap(g, screen.artist, right - x)
    .slice(0, 2)
    .forEach((line, i) => g.fillText(line, x, below + i * 46));
  g.fillText(screen.track, x, top + art - 44);

  // Progress, with elapsed and remaining time.
  const py = top + art + 70;
  g.fillStyle = '#d9dadd';
  g.fillRect(pad, py, w - pad * 2, 22);
  g.fillStyle = '#55555a';
  g.fillRect(pad, py, (w - pad * 2) * Math.min(1, Math.max(0, screen.progress)), 22);
  g.fillStyle = '#1b1b1d';
  g.font = `500 34px ${sans}`;
  g.textBaseline = 'top';
  g.fillText(screen.elapsed, pad, py + 36);
  g.textAlign = 'right';
  g.fillText(screen.remaining, w - pad, py + 36);
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
