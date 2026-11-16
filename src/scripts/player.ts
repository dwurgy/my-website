// The CD player: plays a few My Brothers And I songs through Apple MusicKit
// JS. Visitors who aren't signed in to Apple Music hear Apple's 30-second
// previews; "Sign in with Apple Music for full songs" asks Apple to sign them
// in, and after that the songs play in full.
//
// MusicKit and its token load only when the player comes near, never at the
// top of the page. The token comes from the site's own Worker
// (/api/musickit-token); no key is ever in the page.
//
// The 3D model (player-3d.ts) loads at the same time. Without WebGL, the
// song's artwork shows as a plain print and the buttons under it still work.
// Nothing plays until someone presses play, and the music pauses when the
// player scrolls out of view.

import type { Part, PlayerModel } from './player-3d';

// Just the parts of MusicKit this uses.
interface Artwork {
  url: string;
}
interface SongResource {
  id: string;
  attributes?: { name?: string; url?: string; artwork?: Artwork };
}
interface MusicKitInstance {
  isAuthorized: boolean;
  isPlaying: boolean;
  currentPlaybackTime: number;
  nowPlayingItemIndex: number;
  play(): Promise<void>;
  pause(): void;
  seekToTime(seconds: number): Promise<void>;
  changeToMediaAtIndex(index: number): Promise<void>;
  setQueue(options: { songs: string[]; startWith?: number; startPlaying?: boolean }): Promise<unknown>;
  authorize(): Promise<string>;
  addEventListener(name: string, listener: () => void): void;
  api: { music(path: string, query?: Record<string, string>): Promise<unknown> };
}
declare global {
  interface Window {
    MusicKit?: { configure(options: object): Promise<MusicKitInstance> | MusicKitInstance };
  }
}

const SCRIPT = 'https://js-cdn.music.apple.com/musickit/v3/musickit.js';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const pad = (n: number) => String(n).padStart(2, '0');
const clock = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${pad(s % 60)}`;
};

interface Song {
  title: string;
  url?: string;
  art?: string;
}

const players = new WeakMap<HTMLElement, { progress: number; model?: PlayerModel }>();

/** Sets the player's scroll pose, 0 (turned) to 1 (settled). */
export function setPlayerPose(root: HTMLElement, progress: number) {
  let state = players.get(root);
  if (!state) players.set(root, (state = { progress: 0 }));
  state.progress = Math.min(1, Math.max(0, progress));
  state.model?.setPose(reducedMotion.matches ? 1 : easeInOut(state.progress));
}

export function setupPlayer(root: HTMLElement) {
  const state = players.get(root) ?? { progress: 0 };
  players.set(root, state);

  const ids = JSON.parse(root.dataset.songs ?? '[]') as string[];
  const fallbackUrl = root.dataset.artistUrl!;
  const canvas = root.querySelector<HTMLCanvasElement>('[data-gl]')!;
  const scene = root.querySelector<HTMLElement>('[data-scene]')!;
  const stage = root.querySelector<HTMLElement>('.stage')!;
  const flatArt = root.querySelector<HTMLImageElement>('[data-flat-art]')!;
  const lidKey = root.querySelector<HTMLButtonElement>('[data-lid]')!;
  const playKey = root.querySelector<HTMLButtonElement>('[data-play]')!;
  const readout = root.querySelector<HTMLElement>('[data-readout]')!;
  const titleText = root.querySelector<HTMLElement>('[data-title]')!;
  const listen = root.querySelector<HTMLAnchorElement>('[data-listen]')!;
  const signIn = root.querySelector<HTMLButtonElement>('[data-sign-in]')!;
  const note = root.querySelector<HTMLElement>('[data-note]')!;
  const live = root.querySelector<HTMLElement>('[data-live]')!;

  let music: MusicKitInstance | undefined;
  let loading: Promise<MusicKitInstance> | undefined;
  let songs: Song[] = [];
  let index = 0;
  let playing = false;
  let seconds = -1;
  let lidOpen = false;

  // ---- What shows ---------------------------------------------------------

  function showTrack() {
    const song = songs[index];
    titleText.textContent = song?.title ?? '';
    listen.href = song?.url ?? fallbackUrl;
    state.model?.setArt(song?.art ?? null);
    if (song?.art) {
      flatArt.src = song.art;
      flatArt.alt = `Artwork for ${song.title}`;
      flatArt.hidden = false;
    }
    canvas.setAttribute(
      'aria-label',
      song ? `A round CD player. The disc is ${song.title}.` : 'A round CD player.',
    );
    showTime(true);
  }

  function showTime(force = false) {
    const t = music ? Math.floor(music.currentPlaybackTime || 0) : 0;
    if (!force && t === seconds) return;
    seconds = t;
    const number = ids.length && songs.length ? pad(index + 1) : '--';
    const time = songs.length ? clock(t) : '-:--';
    state.model?.setLcd(number, time);
    readout.textContent = songs.length ? `${number} / ${pad(ids.length)} · ${time}` : `-- / ${pad(ids.length)}`;
  }

  function showPlaying() {
    state.model?.setPlaying(playing);
    playKey.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    playKey.dataset.state = playing ? 'playing' : 'paused';
  }

  function showSignIn() {
    signIn.hidden = !music || music.isAuthorized;
  }

  function fail(message: string) {
    note.textContent = message;
    note.hidden = false;
  }

  // ---- MusicKit -------------------------------------------------------------

  function loadMusic(): Promise<MusicKitInstance> {
    loading ??= (async () => {
      if (!ids.length) throw new Error('No songs chosen yet.');
      const [token] = await Promise.all([
        fetch('/api/musickit-token').then((r) => {
          if (!r.ok) throw new Error('No token');
          return r.json() as Promise<{ token: string }>;
        }),
        loadScript(),
      ]);
      const instance = await window.MusicKit!.configure({
        developerToken: token.token,
        app: { name: 'davidwurgler.com', build: '1.0' },
      });

      instance.addEventListener('playbackStateDidChange', () => {
        playing = instance.isPlaying;
        showPlaying();
      });
      instance.addEventListener('nowPlayingItemDidChange', () => {
        const at = instance.nowPlayingItemIndex;
        if (at >= 0 && at !== index) {
          index = at;
          showTrack();
          live.textContent = songs[index] ? `Now playing ${songs[index].title}` : '';
        }
      });
      instance.addEventListener('playbackTimeDidChange', () => showTime());
      instance.addEventListener('authorizationStatusDidChange', showSignIn);

      // Titles, artwork, and links, in the chosen order.
      const answer = (await instance.api.music('/v1/catalog/{{storefrontId}}/songs', {
        ids: ids.join(','),
      })) as { data?: { data?: SongResource[] } | SongResource[] };
      const found = Array.isArray(answer.data) ? answer.data : (answer.data?.data ?? []);
      songs = ids.map((id) => {
        const a = found.find((s) => s.id === id)?.attributes;
        return {
          title: a?.name ?? 'Untitled',
          url: a?.url,
          art: a?.artwork?.url.replace('{w}', '1000').replace('{h}', '1000'),
        };
      });

      await instance.setQueue({ songs: ids, startPlaying: false });
      music = instance;
      showTrack();
      showSignIn();
      return instance;
    })();
    loading.catch(() => {
      fail('The player can’t reach Apple Music right now.');
      playKey.disabled = true;
      for (const key of root.querySelectorAll<HTMLButtonElement>('[data-step]')) key.disabled = true;
    });
    return loading;
  }

  // ---- Actions ----------------------------------------------------------------

  async function toggle() {
    state.model?.press('play');
    const m = await loadMusic().catch(() => undefined);
    if (!m) return;
    if (m.isPlaying) m.pause();
    else await m.play().catch(() => fail('That song wouldn’t start. Try again.'));
  }

  async function step(by: number) {
    state.model?.press(by < 0 ? 'prev' : 'next');
    const m = await loadMusic().catch(() => undefined);
    if (!m || !songs.length) return;
    // Back, a few seconds into a song, starts it again, as on a real player.
    if (by < 0 && (m.currentPlaybackTime || 0) > 3) {
      await m.seekToTime(0);
      return;
    }
    const next = (index + by + songs.length) % songs.length;
    if (m.isPlaying) await m.changeToMediaAtIndex(next);
    else {
      await m.setQueue({ songs: ids, startWith: next, startPlaying: false });
      index = next;
      showTrack();
    }
    live.textContent = songs[next] ? `Track ${pad(next + 1)}, ${songs[next].title}` : '';
  }

  function setLid(open: boolean) {
    lidOpen = open;
    state.model?.setLid(open);
    lidKey.setAttribute('aria-pressed', String(open));
    lidKey.setAttribute('aria-label', open ? 'Close the lid' : 'Open the lid');
  }

  async function startSignIn() {
    const m = await loadMusic().catch(() => undefined);
    if (!m) return;
    try {
      await m.authorize();
    } catch {
      return;
    }
    showSignIn();
    // Start the queue again where it was, now with full songs.
    if (m.isAuthorized && !m.isPlaying) await m.setQueue({ songs: ids, startWith: index, startPlaying: false });
  }

  // ---- Controls -----------------------------------------------------------

  playKey.addEventListener('click', () => void toggle());
  lidKey.addEventListener('click', () => setLid(!lidOpen));
  for (const key of root.querySelectorAll<HTMLButtonElement>('[data-step]')) {
    key.addEventListener('click', () => void step(Number(key.dataset.step)));
  }
  signIn.addEventListener('click', () => void startSignIn());

  stage.addEventListener('keydown', (event) => {
    if (event.altKey || event.metaKey || event.ctrlKey) return;
    if (event.key === ' ' || event.key === 'k') {
      event.preventDefault();
      void toggle();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      void step(event.key === 'ArrowLeft' ? -1 : 1);
    } else if (event.key === 'o') {
      setLid(!lidOpen);
    }
  });

  // Drag turns the player; a click (or tap) presses what's under it. On touch
  // screens only a sideways drag turns it, so the page still scrolls.
  let down: { id: number; x: number; y: number; lastX: number; lastY: number; dragging: boolean } | null = null;
  scene.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    down = { id: event.pointerId, x: event.clientX, y: event.clientY, lastX: event.clientX, lastY: event.clientY, dragging: false };
  });
  scene.addEventListener('pointermove', (event) => {
    if (!down || event.pointerId !== down.id) {
      if (event.pointerType === 'mouse' && state.model) {
        const box = canvas.getBoundingClientRect();
        const part = state.model.hit(event.clientX - box.left, event.clientY - box.top);
        scene.style.cursor = part ? 'pointer' : 'grab';
      }
      return;
    }
    const dx = event.clientX - down.lastX;
    const dy = event.clientY - down.lastY;
    if (!down.dragging && Math.hypot(event.clientX - down.x, event.clientY - down.y) > 5) {
      down.dragging = true;
      scene.setPointerCapture(event.pointerId);
      scene.style.cursor = 'grabbing';
      state.model?.grab();
    }
    if (down.dragging) state.model?.dragBy(dx, event.pointerType === 'mouse' ? dy : 0);
    down.lastX = event.clientX;
    down.lastY = event.clientY;
  });
  scene.addEventListener('pointerup', (event) => {
    if (!down || event.pointerId !== down.id) return;
    const wasDrag = down.dragging;
    down = null;
    scene.style.cursor = '';
    if (wasDrag) {
      state.model?.release();
      return;
    }
    if (!state.model) return;
    const box = canvas.getBoundingClientRect();
    press(state.model.hit(event.clientX - box.left, event.clientY - box.top));
  });
  scene.addEventListener('pointercancel', () => {
    if (down?.dragging) state.model?.release();
    down = null;
  });

  function press(part: Part | null) {
    if (part === 'lid') setLid(!lidOpen);
    else if (part === 'play') void toggle();
    else if (part === 'prev') void step(-1);
    else if (part === 'next') void step(1);
  }

  // ---- Loading, and pausing out of view -------------------------------------

  async function loadModel() {
    try {
      const { createPlayerModel } = await import('./player-3d');
      const model = createPlayerModel(canvas);
      model.setReducedMotion(reducedMotion.matches);
      state.model = model;
      setPlayerPose(root, state.progress);
      showTrack();
      showPlaying();
      model.setLid(lidOpen);
    } catch {
      root.classList.add('is-flat');
    }
  }

  const near = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      near.disconnect();
      void loadModel();
      if (ids.length) void loadMusic().catch(() => undefined);
    },
    { rootMargin: '100% 0px' },
  );
  near.observe(root);

  // Music stops when the player leaves the screen.
  new IntersectionObserver((entries) => {
    if (entries.some((e) => !e.isIntersecting) && music?.isPlaying) music.pause();
  }).observe(root);

  reducedMotion.addEventListener('change', () => {
    state.model?.setReducedMotion(reducedMotion.matches);
    setPlayerPose(root, state.progress);
  });

  if (!ids.length) fail('Songs coming soon.');
  showTime(true);
}

function loadScript(): Promise<void> {
  if (window.MusicKit) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const ready = () => (window.MusicKit ? resolve() : undefined);
    document.addEventListener('musickitloaded', ready, { once: true });
    const script = document.createElement('script');
    script.src = SCRIPT;
    script.async = true;
    script.dataset.webComponents = '';
    script.onload = ready;
    script.onerror = () => reject(new Error('MusicKit did not load'));
    document.head.append(script);
  });
}
