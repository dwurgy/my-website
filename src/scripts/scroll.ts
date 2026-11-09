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

/** How far through a pinned section the reader is, from 0 to 1. */
export function progress(section: HTMLElement) {
  const box = section.getBoundingClientRect();
  const travel = box.height - innerHeight;
  return travel <= 0 ? 1 : clamp01(-box.top / travel);
}
