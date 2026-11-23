// Moves between doors in place. Every door is also a real page (see
// src/components/Site.astro), so this only makes the trip smoother: it never
// holds anything the plain pages don't.

const $ = <T extends HTMLElement = HTMLElement>(s: string, el: ParentNode = document) => el.querySelector<T>(s);
const $$ = <T extends HTMLElement = HTMLElement>(s: string, el: ParentNode = document) => [...el.querySelectorAll<T>(s)];

const sections = $$('[data-door]');
const words = $$<HTMLAnchorElement>('.line a');
const calm = matchMedia('(prefers-reduced-motion: reduce)');
const html = document.documentElement;

/** A door is an address without its slashes: '' is home, 'things/firn' is Firn. */
const doorOf = (pathname: string) => decodeURIComponent(pathname).replace(/^\/+|\/+$/g, '');
const pathOf = (door: string) => (door ? `/${door}/` : '/');
const known = (door: string) => door === '' || sections.some((s) => s.dataset.door === door);
const slugOf = (door: string) => (door.startsWith('things/') ? door.slice(7) : '');
const listName = (slug: string) => $(`.things a[data-peek="${slug}"] b`);

// What the page was built showing. On the 404 page that's 'lost'.
let shown = document.body.dataset.shown ?? '';
let cascadeTimer = 0;

function render(door: string) {
  sections.forEach((s) => { s.hidden = s.dataset.door !== door; });
  const word = door.split('/')[0];
  words.forEach((a) => {
    if (a.dataset.word === word) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  if (door) document.body.dataset.open = word; else delete document.body.dataset.open;
  document.title = sections.find((s) => s.dataset.door === door)?.dataset.title ?? document.body.dataset.homeTitle ?? document.title;
  scrollTo(0, 0);
  peek('');
  // Opening the list sets its names arriving in turn.
  const list = $('[data-door="things"]')!;
  $$('.things b.still').forEach((b) => b.classList.remove('still'));
  clearTimeout(cascadeTimer);
  list.classList.toggle('cascade', door === 'things' && shown !== 'things');
  cascadeTimer = window.setTimeout(() => list.classList.remove('cascade'), 1800);
  shown = door;
  warm();
}

/** Change doors. Leave `to` out when the address has already changed (Back and Forward). */
function go(to?: string) {
  const from = shown;
  const pushed = to !== undefined;
  const door = pushed ? to : doorOf(location.pathname);
  if (!known(door)) { location.reload(); return; }
  const update = () => { if (pushed) history.pushState(null, '', pathOf(door)); render(door); };
  if (!document.startViewTransition || calm.matches) return update();

  const named: HTMLElement[] = [];
  const name = (el: HTMLElement | null | undefined, n: string) => { if (el) { el.style.viewTransitionName = n; named.push(el); } };
  const clear = () => named.splice(0).forEach((el) => { el.style.viewTransitionName = ''; });
  // The same word makes the trip: a name from the list to its page's title, a title back
  // to the list, or the name after "Next," up to the top of the next page.
  const title = (d: string) => $(`[data-door="${d}"] h2`);
  const nextLink = slugOf(from) && slugOf(door) ? $(`[data-door="${from}"] .next a[href="${pathOf(door)}"]`) : null;
  const move = from === 'things' && slugOf(door) ? 'in' : slugOf(from) && door === 'things' ? 'back' : nextLink ? 'in' : '';
  // What's leaving fades where it stands; it doesn't slide to where the next thing will be.
  name($('.col section:not([hidden])'), 'col-out');
  if (move) html.dataset.sameName = move;
  if (from === 'things' && slugOf(door)) name(listName(slugOf(door)), 'thing-name');
  else if (move === 'back') name(title(from), 'thing-name');
  else if (nextLink) name(nextLink, 'thing-name');

  const transition = document.startViewTransition(() => {
    clear();
    update();
    if (move === 'back') {
      const home = listName(slugOf(from));
      home?.classList.add('still');
      name(home, 'thing-name');
    } else if (move) name(title(door), 'thing-name');
  });
  transition.finished.finally(() => { clear(); delete html.dataset.sameName; });
}

// Links to the site's own doors are followed in place. The open word closes its own door.
addEventListener('click', (e) => {
  const a = (e.target as Element).closest<HTMLAnchorElement>('a[href]');
  if (!a || a.origin !== location.origin || a.target || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
  const door = doorOf(a.pathname);
  if (!known(door)) return;
  e.preventDefault();
  go(door === shown && a.closest('.line') ? '' : door);
});
addEventListener('popstate', () => go());
addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || !shown || shown === 'lost') return;
  go(shown.includes('/') ? shown.split('/')[0] : '');
});
setTimeout(() => document.body.classList.remove('arrive'), 1400);

// A line about the thing under your hand, under the list.
function peek(slug: string) {
  $$('.peek figure').forEach((f) => f.classList.toggle('on', f.dataset.peek === slug));
}
$$<HTMLAnchorElement>('.things a').forEach((a) => {
  const slug = a.dataset.peek!;
  a.addEventListener('pointerenter', () => {
    peek(slug);
    // Start fetching its first picture, so the page is ready by the time it's clicked.
    const first = $<HTMLImageElement>(`[data-door="things/${slug}"] .frame img`);
    if (first) first.loading = 'eager';
  });
  a.addEventListener('pointerleave', () => peek(''));
  a.addEventListener('focus', () => peek(slug));
  a.addEventListener('blur', () => peek(''));
});

// Reels of pictures. Back and Next are written above each; the arrow keys, a swipe,
// and a click on either half of the picture do the same.
const warmers: (() => void)[] = [];
/** Fetch the pictures either side of the one showing, in whatever's open, so a slide never arrives blank. */
function warm() {
  setTimeout(() => warmers.forEach((w) => w()), 600);
}
$$('.reel').forEach((fig) => {
  const frame = $('.frame', fig)!;
  const imgs = $$<HTMLImageElement>('img', frame);
  if (imgs.length < 2) return;
  const count = $('figcaption span', fig)!;
  const wrap = (n: number) => (n + imgs.length) % imgs.length;
  let at = 0;
  warmers.push(() => {
    if (fig.closest('[hidden]')) return;
    imgs[wrap(at + 1)].loading = 'eager';
    imgs[wrap(at - 1)].loading = 'eager';
  });
  function show(dir: number) {
    const out = imgs[at];
    at = wrap(at + dir);
    const next = imgs[at];
    next.loading = 'eager';
    // The next one pushes the last one out, the way you'd slide prints across a table.
    next.style.transition = 'none';
    next.style.transform = `translateX(${dir * 102}%)`;
    void next.offsetWidth;
    next.style.transition = '';
    next.style.transform = 'none';
    out.style.transform = `translateX(${dir * -102}%)`;
    out.classList.remove('front');
    out.setAttribute('aria-hidden', 'true');
    next.classList.add('front');
    next.removeAttribute('aria-hidden');
    // The frame eases to this picture's own shape.
    frame.style.aspectRatio = next.dataset.ratio!;
    count.textContent = `${at + 1} / ${imgs.length}`;
    imgs[wrap(at + dir)].loading = 'eager';
  }
  const side = (e: MouseEvent) => (e.clientX - frame.getBoundingClientRect().left < frame.offsetWidth / 2 ? -1 : 1);
  let downX: number | null = null;
  let swiped = false;
  frame.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') frame.style.cursor = side(e) < 0 ? 'w-resize' : 'e-resize'; });
  frame.addEventListener('pointerdown', (e) => { downX = e.clientX; swiped = false; });
  frame.addEventListener('pointerup', (e) => {
    if (downX !== null && Math.abs(e.clientX - downX) > 40) { swiped = true; show(e.clientX < downX ? 1 : -1); }
    downX = null;
  });
  frame.addEventListener('click', (e) => { if (!swiped) show(side(e)); });
  fig.addEventListener('click', (e) => {
    const button = (e.target as Element).closest<HTMLButtonElement>('.ctl button');
    if (button) show(Number(button.dataset.dir));
  });
  fig.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') show(1);
    if (e.key === 'ArrowLeft') show(-1);
  });
});
warm();

const copy = $<HTMLButtonElement>('#copy');
copy?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText($('#email')!.textContent!.trim());
    copy.textContent = 'Copied';
  } catch {
    copy.textContent = 'Select it instead';
  }
  setTimeout(() => { copy.textContent = 'Copy'; }, 1600);
});
