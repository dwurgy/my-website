// The camera viewer: the dial's buttons, arrow keys, and a sideways swipe on
// the screen flip through the photos, wrapping at both ends. The screen and
// the blurred colour field behind the camera crossfade to the new photo.

/** Eases in and out, so the camera turns slowly at both ends of its move. */
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * Sets the camera's pose from progress, 0 (turned, screen out) to 1
 * (straight-on, screen flush). Writes only when the value changes.
 */
export function setPose(root: HTMLElement, progress: number) {
  const t = easeInOut(Math.min(1, Math.max(0, progress))).toFixed(4);
  if (root.style.getPropertyValue('--t') !== t) root.style.setProperty('--t', t);
}

export function setupCamera(root: HTMLElement) {
  const shots = [...root.querySelectorAll<HTMLImageElement>('.shot')];
  const backs = [...root.querySelectorAll<HTMLImageElement>('.back-shot')];
  const screen = root.querySelector<HTMLElement>('[data-screen]')!;
  const dial = root.querySelector<HTMLElement>('[data-dial]')!;
  const live = root.querySelector<HTMLElement>('[data-live]')!;
  let index = 0;
  let pressTimer = 0;

  // The new layer fades in over the old one, which stays lit underneath.
  function swap(layers: HTMLElement[], from: number, to: number) {
    for (const layer of layers) layer.classList.remove('was');
    layers[from].classList.replace('is-on', 'was');
    layers[to].classList.add('is-on');
  }

  function step(by: number) {
    const next = (index + by + shots.length) % shots.length;
    if (next === index) return;
    swap(shots, index, next);
    swap(backs, index, next);
    index = next;
    const alt = shots[index].dataset.alt ?? '';
    screen.setAttribute('aria-label', alt);
    live.textContent = alt;
  }

  // A short press on the dial, so keys and swipes feel the same as a click.
  function press(by: number) {
    dial.classList.remove('press-prev', 'press-next');
    dial.classList.add(by < 0 ? 'press-prev' : 'press-next');
    clearTimeout(pressTimer);
    pressTimer = window.setTimeout(() => dial.classList.remove('press-prev', 'press-next'), 160);
  }

  for (const button of root.querySelectorAll<HTMLButtonElement>('[data-step]')) {
    const by = Number(button.dataset.step);
    button.addEventListener('click', () => {
      press(by);
      step(by);
    });
  }

  root.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    if (event.altKey || event.metaKey || event.ctrlKey) return;
    event.preventDefault();
    const by = event.key === 'ArrowLeft' ? -1 : 1;
    press(by);
    step(by);
  });

  // Swipe: a mostly sideways drag of at least 40px on the screen.
  let startX = 0;
  let startY = 0;
  let tracking = false;
  screen.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse') return;
    tracking = true;
    startX = event.clientX;
    startY = event.clientY;
  });
  screen.addEventListener('pointerup', (event) => {
    if (!tracking) return;
    tracking = false;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    const by = dx < 0 ? 1 : -1;
    press(by);
    step(by);
  });
  screen.addEventListener('pointercancel', () => (tracking = false));
}
