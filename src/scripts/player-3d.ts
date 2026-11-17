// The music player, modelled in three.js with the camera's light (studio-3d.ts):
// in the style of a classic click-wheel player, at David's request
// (2026-11-16), with its own wheel and marks. A satin silver front, a glossy
// black screen area, a graphite wheel marked with a dot, back, forward, and
// play/pause around a silver centre button, and a polished steel back. No
// logo and no wordmark.
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
  Path,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  Shape,
  SRGBColorSpace,
  Vector2,
  Vector3,
  type Object3D,
} from 'three';
import { add, createStudio } from './studio-3d';

export type Part = 'play' | 'top' | 'prev' | 'next' | 'center';

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
const WHEEL_R = 1.7;
const CENTER_R = 0.62;

const CLICK = MathUtils.degToRad(24); // one click of the wheel
const PRESS_MS = 180;
const FOLLOW = 0.12;
const COAST = 0.55;
const DEG_PER_PX = 0.3;
// A drag turns it this far each way at most, so the back never shows.
const MAX_TURN = 35;

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
  const seam = new MeshBasicMaterial({ color: 0x55534f });
  // The wheel: satin graphite, like the camera's black, with its marks drawn on.
  const wheelFace = new MeshPhysicalMaterial({
    map: wheelMarks(),
    roughness: 0.62,
    specularIntensity: 0.35,
    envMapIntensity: 0.4,
  });
  const wheelSide = new MeshPhysicalMaterial({ color: 0x1c1b19, roughness: 0.6 });
  // The centre button: silver, a touch brighter than the front.
  const centerMat = new MeshPhysicalMaterial({ color: 0xdcdcda, metalness: 0.85, roughness: 0.32 });

  // ---- The player -------------------------------------------------------

  const root = new Group();
  scene.add(root);

  // The front: a flat plate with a fine bevel. The back: polished steel,
  // rounded off all round, like a pebble.
  // The wheel sits in a round well cut through the front, so it can rock in
  // when pressed without sinking behind the metal.
  const plate = roundedRect(W, H, CORNER);
  const well = new Path();
  well.absarc(0, WHEEL_Y, WHEEL_R + 0.055, 0, Math.PI * 2, true);
  plate.holes.push(well);
  const front = new ExtrudeGeometry(plate, {
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
  // The well's floor shows as the thin seam round the wheel.
  add(new CircleGeometry(WHEEL_R + 0.1, 96), seam, root, 0, WHEEL_Y, -0.2);
  // A deep side, so a rocking wheel shows graphite at its edge, not a gap.
  const rim = add(new CylinderGeometry(WHEEL_R, WHEEL_R, 0.16, 96, 1, true), wheelSide, wheel, 0, 0, -0.055);
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
      yawTarget = MathUtils.clamp(yawTarget + coast * dt, -MAX_TURN, MAX_TURN);
      if (Math.abs(yawTarget) === MAX_TURN) coast = 0;
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

    // Turned the opposite way to the camera, so the two face each other
    // across the section, and settled straight-on.
    const rest = 1 - pose;
    root.rotation.set(MathUtils.degToRad(rest * 10 + tilt), MathUtils.degToRad(rest * 28 + yaw), 0, 'YXZ');

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
      else if (pressPart === 'top') wheel.rotation.x = -rock;
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
      yawTarget = MathUtils.clamp(yawTarget + dx * DEG_PER_PX, -MAX_TURN, MAX_TURN);
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
      // Which quarter of the wheel: the dot at the top, then clockwise.
      local.copy(first.point);
      wheel.worldToLocal(local);
      const a = Math.atan2(local.y, local.x);
      if (a > Math.PI / 4 && a <= (3 * Math.PI) / 4) return 'top';
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

/**
 * The wheel's face: graphite, with four fine bone marks in the site's line
 * style: a dot at the top, back and forward at the sides, and play/pause at
 * the bottom.
 */
function wheelMarks() {
  const size = 1024;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  g.fillStyle = '#1e1d1b';
  g.fillRect(0, 0, size, size);
  const mid = size / 2;
  const at = size * 0.37; // distance of the marks from the centre
  const s = 26;
  g.strokeStyle = g.fillStyle = '#cfc8bd';
  g.lineWidth = 9;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  const line = (points: [number, number][]) => {
    g.beginPath();
    g.moveTo(...points[0]);
    for (const point of points.slice(1)) g.lineTo(...point);
    g.stroke();
  };

  // Top: a single dot.
  g.beginPath();
  g.arc(mid, mid - at, 11, 0, Math.PI * 2);
  g.fill();
  // Forward, on the right: a chevron and a bar.
  const fx = mid + at;
  line([[fx - s * 0.7, mid - s], [fx + s * 0.3, mid], [fx - s * 0.7, mid + s]]);
  line([[fx + s * 0.9, mid - s], [fx + s * 0.9, mid + s]]);
  // Back, on the left, mirrored.
  const bx = mid - at;
  line([[bx + s * 0.7, mid - s], [bx - s * 0.3, mid], [bx + s * 0.7, mid + s]]);
  line([[bx - s * 0.9, mid - s], [bx - s * 0.9, mid + s]]);
  // Play/pause, at the bottom: an outlined triangle and two bars.
  const py = mid + at;
  line([[mid - s * 1.3, py - s], [mid - s * 0.2, py], [mid - s * 1.3, py + s], [mid - s * 1.3, py - s]]);
  line([[mid + s * 0.45, py - s], [mid + s * 0.45, py + s]]);
  line([[mid + s * 1.15, py - s], [mid + s * 1.15, py + s]]);

  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/**
 * The screen, in the site's own language: warm paper with ink type. A small
 * mono label row (track count, and playing or paused), the artwork beside
 * the title and artist, and a fine ink progress line with the times in mono
 * at the bottom. The same in both themes, like a photo.
 */
function drawScreen(c: HTMLCanvasElement, screen: Screen) {
  const g = c.getContext('2d')!;
  const { width: w, height: h } = c;
  const sans = '"Archivo Variable", "Archivo", system-ui, sans-serif';
  const mono = '"JetBrains Mono", ui-monospace, monospace';
  const paper = '#ece6dc';
  const ink = '#1b1815';
  const muted = '#5b534a';
  const pad = 48;
  const right = w - pad;

  g.fillStyle = paper;
  g.fillRect(0, 0, w, h);

  // Labels: the track count, and whether it's playing.
  g.fillStyle = muted;
  g.font = `500 28px ${mono}`;
  g.textBaseline = 'top';
  g.textAlign = 'left';
  const spaced = (text: string) => text.toUpperCase().split('').join(' ');
  g.fillText(spaced(screen.track), pad, pad);
  g.textAlign = 'right';
  g.fillText(spaced(screen.track ? (screen.playing ? 'Playing' : 'Paused') : ''), right, pad);

  // Artwork, as a small print.
  const art = 330;
  const top = pad + 74;
  if (screen.art) g.drawImage(screen.art, pad, top, art, art);
  else {
    g.fillStyle = '#ddd5c9';
    g.fillRect(pad, top, art, art);
  }

  // Title and artist, beside it.
  const x = pad + art + 44;
  g.textAlign = 'left';
  g.fillStyle = ink;
  g.font = `640 54px ${sans}`;
  const lines = wrap(g, screen.title, right - x).slice(0, 4);
  lines.forEach((line, i) => g.fillText(line, x, top - 4 + i * 56));
  g.fillStyle = muted;
  g.font = `400 34px ${sans}`;
  wrap(g, screen.artist, right - x)
    .slice(0, 2)
    .forEach((line, i) => g.fillText(line, x, top + lines.length * 56 + 18 + i * 42));

  // Progress: a fine rule, filled in ink, with the times under it.
  const py = h - pad - 72;
  g.fillStyle = 'rgba(27,24,21,0.2)';
  g.fillRect(pad, py, w - pad * 2, 3);
  g.fillStyle = ink;
  g.fillRect(pad, py - 1, (w - pad * 2) * Math.min(1, Math.max(0, screen.progress)), 5);
  g.fillStyle = muted;
  g.font = `500 30px ${mono}`;
  g.textBaseline = 'top';
  g.fillText(screen.elapsed, pad, py + 26);
  g.textAlign = 'right';
  g.fillText(screen.remaining, right, py + 26);
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
