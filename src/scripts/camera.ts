// The camera viewer: the dial's buttons, arrow keys, and a sideways swipe on
// the camera flip through the photos, wrapping at both ends. The 3D model
// (camera-3d.ts, with three.js) loads only when the viewer comes near, so it
// never slows the top of the page. Without WebGL, the photos show as a plain
// print with the same buttons.

import type { CameraModel, DialLayout, PhotoSource } from './camera-3d';

/** Eases in and out, so the camera turns slowly at both ends of its move. */
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const narrow = matchMedia('(max-width: 760px)');

interface Viewer {
  progress: number;
  model?: CameraModel;
}

const viewers = new WeakMap<HTMLElement, Viewer>();

/** The opening pose. On phones the turn is about half as far. */
const angles = () =>
  narrow.matches ? { turn: 15, lean: 5.5, tilt: 34 } : { turn: 30, lean: 11, tilt: 46 };

/**
 * Sets the camera's pose from progress, 0 (turned, screen out) to 1
 * (straight-on, screen flush). With reduced motion it stays straight-on.
 */
export function setPose(root: HTMLElement, progress: number) {
  const viewer = viewers.get(root);
  if (!viewer) return;
  viewer.progress = Math.min(1, Math.max(0, progress));
  viewer.model?.setPose(reducedMotion.matches ? 1 : easeInOut(viewer.progress));
}

export function setupCamera(root: HTMLElement) {
  const viewer: Viewer = { progress: 0 };
  viewers.set(root, viewer);

  const photos = JSON.parse(root.dataset.photos ?? '[]') as (PhotoSource & { alt: string })[];
  const canvas = root.querySelector<HTMLCanvasElement>('[data-gl]')!;
  const scene = root.querySelector<HTMLElement>('[data-scene]')!;
  const shots = [...root.querySelectorAll<HTMLImageElement>('.shot')];
  const live = root.querySelector<HTMLElement>('[data-live]')!;
  const prevKey = root.querySelector<HTMLButtonElement>('.dial-key.prev')!;
  const nextKey = root.querySelector<HTMLButtonElement>('.dial-key.next')!;
  let index = 0;

  function step(by: number) {
    const next = (index + by + photos.length) % photos.length;
    if (next === index) return;
    // The flat print: the new photo fades in over the last one.
    for (const shot of shots) shot.classList.remove('was');
    shots[index].classList.replace('is-on', 'was');
    shots[next].classList.add('is-on');
    index = next;
    viewer.model?.show(index, reducedMotion.matches);
    viewer.model?.press(by);
    const alt = photos[index].alt;
    canvas.setAttribute('aria-label', alt);
    live.textContent = alt;
  }

  for (const button of [prevKey, nextKey]) {
    const by = Number(button.dataset.step);
    button.addEventListener('click', () => step(by));
  }

  root.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    if (event.altKey || event.metaKey || event.ctrlKey) return;
    event.preventDefault();
    step(event.key === 'ArrowLeft' ? -1 : 1);
  });

  // Swipe: a mostly sideways drag of at least 40px on the camera.
  let startX = 0;
  let startY = 0;
  let tracking = false;
  scene.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse') return;
    tracking = true;
    startX = event.clientX;
    startY = event.clientY;
  });
  scene.addEventListener('pointerup', (event) => {
    if (!tracking) return;
    tracking = false;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    step(dx < 0 ? 1 : -1);
  });
  scene.addEventListener('pointercancel', () => (tracking = false));

  // The buttons follow the drawn dial.
  function place(button: HTMLElement, spot: DialLayout['prev']) {
    button.style.transform = `translate(${spot.x.toFixed(1)}px, ${spot.y.toFixed(1)}px)`;
    button.style.width = button.style.height = `${spot.size.toFixed(0)}px`;
    button.style.margin = `${(-spot.size / 2).toFixed(1)}px 0 0 ${(-spot.size / 2).toFixed(1)}px`;
  }

  function flat() {
    root.classList.add('is-flat');
  }

  async function load() {
    try {
      const { createCameraModel } = await import('./camera-3d');
      const model = createCameraModel(canvas, photos, (layout) => {
        place(prevKey, layout.prev);
        place(nextKey, layout.next);
      });
      model.setAngles(angles());
      model.show(index, true);
      viewer.model = model;
      setPose(root, viewer.progress);
    } catch {
      flat();
    }
  }

  // Load when the viewer is within about a screen of view.
  const near = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      near.disconnect();
      void load();
    },
    { rootMargin: '100% 0px' },
  );
  near.observe(root);

  reducedMotion.addEventListener('change', () => setPose(root, viewer.progress));
  narrow.addEventListener('change', () => viewer.model?.setAngles(angles()));
}
