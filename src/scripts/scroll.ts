// The page's one animation loop. Scroll and resize ask for a frame; each
// frame runs every job's read first, then every job's write, so reading
// positions never forces the browser to lay the page out twice.
//
// A job reads what it needs and returns the writes to make, or nothing.

type Write = () => void;
type Job = () => Write | void;

const jobs: Job[] = [];
let queued = false;

function run() {
  queued = false;
  const writes = jobs.map((job) => job());
  for (const write of writes) write?.();
}

export function requestFrame() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(run);
}

export function onFrame(job: Job) {
  jobs.push(job);
  requestFrame();
}

addEventListener('scroll', requestFrame, { passive: true });
addEventListener('resize', requestFrame);

export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
reducedMotion.addEventListener('change', requestFrame);

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Eases in and out, so a pinned move starts and ends gently. */
export const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * How far through a pinned section the reader is, from 0 to 1.
 *
 * The pin ends when the section's sticky box (.stick) reaches the section's
 * bottom, so the travel is measured against that box, not innerHeight. On
 * phones innerHeight grows and shrinks as the browser's address bar hides and
 * shows mid-scroll, which made every photo jump; the sticky box is 100svh and
 * holds still.
 *
 * `lead` starts the move early, while the section is still scrolling in, as a
 * share of the sticky box's height. Without it, something scrolling up into a
 * pin stops dead the moment the pin catches it, then waits for the ease to get
 * going. With it, the move is already under way when the pin takes over.
 */
export function progress(section: HTMLElement, lead = 0) {
  const box = section.getBoundingClientRect();
  const pinned = section.querySelector<HTMLElement>('.stick')?.offsetHeight ?? innerHeight;
  const early = lead * pinned;
  const travel = box.height - pinned + early;
  return travel <= 0 ? 1 : clamp01((early - box.top) / travel);
}

/**
 * Whether the browser can tie motion straight to scrolling in CSS
 * (scroll-driven animations). Safari 26 and Chrome can. When it can, the CSS
 * runs the pinned motion in step with the finger, and the scripts only keep
 * each section's scroll range up to date. Without it, the scripts set the
 * motion each frame, as before. Reduced motion uses neither.
 */
export const cssDriven = CSS.supports('animation-timeline: scroll()');

/**
 * Reads where a pinned section's pin starts and ends, in page pixels, and
 * returns a write that hands them to the CSS as --pin-start and --pin-end.
 * Pixels, not screen heights, so the range holds still when a phone's address
 * bar hides or shows. Writes only when a value changes. `lead` is as in
 * progress().
 */
export function pinRange(section: HTMLElement, lead = 0): Write {
  const top = section.getBoundingClientRect().top + scrollY;
  const pinned = section.querySelector<HTMLElement>('.stick')?.offsetHeight ?? innerHeight;
  const start = `${Math.round(Math.max(0, top - lead * pinned))}px`;
  const end = `${Math.round(top + section.offsetHeight - pinned)}px`;
  return () => {
    if (section.style.getPropertyValue('--pin-start') !== start) section.style.setProperty('--pin-start', start);
    if (section.style.getPropertyValue('--pin-end') !== end) section.style.setProperty('--pin-end', end);
  };
}
