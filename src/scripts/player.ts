// The music player: plays a few My Brothers And I songs through Apple
// MusicKit JS. Visitors who aren't signed in to Apple Music hear Apple's
// 30-second previews; "Sign in with Apple Music for full songs" asks Apple to
// sign them in, and after that the songs play in full.
//
// MusicKit and its token load only when the player comes near, never at the
// top of the page. The token comes from the site's own Worker
// (/api/musickit-token); no key is ever in the page.
//
// The 3D model (player-3d.ts) loads at the same time. Dragging the knob, the
// buttons under the player, and the arrow keys change songs; a quick turn
// through several clicks settles on one song before Apple is asked for it.
// Without WebGL, the song's artwork shows as a plain print and the buttons
// still work. Nothing plays until someone presses play, and the music pauses
// when the player scrolls out of view.

import type { PlayerModel } from './player-3d';

// Just the parts of MusicKit this uses.
interface SongResource {
  id: string;
  attributes?: { name?: string; url?: string; durationInMillis?: number; artwork?: { url: string } };
}
interface MusicKitInstance {
  isAuthorized: boolean;
  isPlaying: boolean;
  currentPlaybackTime: number;
  currentPlaybackDuration: number;
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
/** How long the knob must rest before the song it's on is loaded. */
const SETTLE_MS = 280;

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
  artUrl?: string;
  art?: HTMLImageElement;
  seconds: number;
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
  // The song shown, which the knob can move ahead of the song loaded.
  let index = 0;
  let loaded = 0;
  let settle = 0;
  let playing = false;
  let seconds = -1;

  // ---- What shows ---------------------------------------------------------

  function showTrack() {
    const song = songs[index];
    titleText.textContent = song?.title ?? '';
    listen.href = song?.url ?? fallbackUrl;
    if (song?.artUrl) {
      flatArt.src = song.artUrl;
      flatArt.alt = `Artwork for ${song.title}`;
      flatArt.hidden = false;
    }
    canvas.setAttribute('aria-label', song ? `A music player. Its screen shows ${song.title}.` : 'A music player.');
    if (song && !song.art && song.artUrl) loadArt(song);
    showTime(true);
  }

  function showTime(force = false) {
    const t = music && index === loaded ? Math.floor(music.currentPlaybackTime || 0) : 0;
    if (!force && t === seconds) return;
    seconds = t;
    const song = songs[index];
    const track = songs.length ? `${pad(index + 1)} / ${pad(ids.length)}` : `-- / ${pad(ids.length)}`;
    const time = songs.length ? clock(t) : '-:--';
    const length = (index === loaded && music?.currentPlaybackDuration) || song?.seconds || 0;
    state.model?.setScreen({
      art: song?.art ?? null,
      title: song?.title ?? (ids.length ? '' : 'Songs coming soon'),
      track,
      time,
      progress: length ? t / length : 0,
    });
    readout.textContent = `${track}${songs.length ? ` · ${time}` : ''}`;
  }

  function loadArt(song: Song) {
    // Drawn into the 3D screen, so it must come with Apple's permission to do
    // that (CORS); without it, the screen shows the title alone.
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    image.onload = () => {
      song.art = image;
      if (songs[index] === song) showTime(true);
    };
    image.src = song.artUrl!;
  }

  function showPlaying() {
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
        // Ignore it while the knob is still turning toward another song.
        if (at < 0 || at === loaded || settle) return;
        state.model?.stepKnob(at > loaded ? 1 : -1);
        loaded = index = at;
        showTrack();
        live.textContent = songs[index] ? `Now playing ${songs[index].title}` : '';
      });
      instance.addEventListener('playbackTimeDidChange', () => showTime());
      instance.addEventListener('authorizationStatusDidChange', showSignIn);

      // Titles, artwork, lengths, and links, in the chosen order.
      const answer = (await instance.api.music('/v1/catalog/{{storefrontId}}/songs', {
        ids: ids.join(','),
      })) as { data?: { data?: SongResource[] } | SongResource[] };
      const found = Array.isArray(answer.data) ? answer.data : (answer.data?.data ?? []);
      songs = ids.map((id) => {
        const a = found.find((s) => s.id === id)?.attributes;
        return {
          title: a?.name ?? 'Untitled',
          url: a?.url,
          artUrl: a?.artwork?.url.replace('{w}', '600').replace('{h}', '600'),
          seconds: (a?.durationInMillis ?? 0) / 1000,
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
      for (const key of root.querySelectorAll<HTMLButtonElement>('[data-play], [data-step]')) key.disabled = true;
    });
    return loading;
  }

  // ---- Actions ----------------------------------------------------------------

  async function toggle() {
    state.model?.press();
    const m = await loadMusic().catch(() => undefined);
    if (!m) return;
    if (m.isPlaying) m.pause();
    else await m.play().catch(() => fail('That song wouldn’t start. Try again.'));
  }

  /** One click of the knob (or a button or arrow key), forward or back. */
  function step(by: number) {
    if (!songs.length) return;
    // Back, a few seconds into a song, starts it again, as on most players.
    if (by < 0 && !settle && index === loaded && music && (music.currentPlaybackTime || 0) > 3) {
      void music.seekToTime(0);
      return;
    }
    index = (index + by + songs.length) % songs.length;
    showTrack();
    clearTimeout(settle);
    settle = window.setTimeout(commit, SETTLE_MS);
  }

  /** Loads the song the knob came to rest on. */
  async function commit() {
    settle = 0;
    const m = music;
    if (!m || index === loaded) return;
    const target = index;
    loaded = target;
    if (m.isPlaying) await m.changeToMediaAtIndex(target);
    else await m.setQueue({ songs: ids, startWith: target, startPlaying: false });
    showTime(true);
    live.textContent = songs[target] ? `Track ${pad(target + 1)}, ${songs[target].title}` : '';
  }

  function skip(by: number) {
    state.model?.stepKnob(by);
    step(by);
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
    if (m.isAuthorized && !m.isPlaying) await m.setQueue({ songs: ids, startWith: loaded, startPlaying: false });
  }

  // ---- Controls -----------------------------------------------------------

  playKey.addEventListener('click', () => void toggle());
  for (const key of root.querySelectorAll<HTMLButtonElement>('[data-step]')) {
    key.addEventListener('click', () => skip(Number(key.dataset.step)));
  }
  signIn.addEventListener('click', () => void startSignIn());

  stage.addEventListener('keydown', (event) => {
    if (event.altKey || event.metaKey || event.ctrlKey) return;
    if (event.key === ' ' || event.key === 'k') {
      event.preventDefault();
      void toggle();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      skip(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });

  // Dragging the knob turns it; dragging anywhere else turns the player; a
  // click (or tap) on the button plays or pauses. On touch screens only
  // sideways drags count, so the page still scrolls.
  type Down = { id: number; x: number; y: number; lastX: number; lastY: number; on: 'knob' | 'body'; moving: boolean; part: string | null };
  let down: Down | null = null;

  const partAt = (event: PointerEvent) => {
    if (!state.model) return null;
    const box = canvas.getBoundingClientRect();
    return state.model.hit(event.clientX - box.left, event.clientY - box.top);
  };

  scene.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const part = partAt(event);
    down = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      on: part === 'knob' ? 'knob' : 'body',
      moving: false,
      part,
    };
  });
  scene.addEventListener('pointermove', (event) => {
    if (!down || event.pointerId !== down.id) {
      if (event.pointerType === 'mouse') {
        const part = partAt(event);
        scene.style.cursor = part === 'play' ? 'pointer' : part === 'knob' ? 'ew-resize' : '';
      }
      return;
    }
    const dx = event.clientX - down.lastX;
    const dy = event.clientY - down.lastY;
    if (!down.moving && Math.hypot(event.clientX - down.x, event.clientY - down.y) > 5) {
      down.moving = true;
      scene.setPointerCapture(event.pointerId);
      if (down.on === 'body') {
        scene.style.cursor = 'grabbing';
        state.model?.grab();
      }
    }
    if (down.moving) {
      if (down.on === 'knob') state.model?.turnKnob(dx);
      else state.model?.dragBy(dx, event.pointerType === 'mouse' ? dy : 0);
    }
    down.lastX = event.clientX;
    down.lastY = event.clientY;
  });
  const end = (event: PointerEvent, cancelled: boolean) => {
    if (!down || event.pointerId !== down.id) return;
    const { moving, on, part } = down;
    down = null;
    scene.style.cursor = '';
    if (moving) {
      if (on === 'knob') state.model?.releaseKnob();
      else state.model?.release();
    } else if (!cancelled && part === 'play') void toggle();
  };
  scene.addEventListener('pointerup', (event) => end(event, false));
  scene.addEventListener('pointercancel', (event) => end(event, true));

  // ---- Loading, and pausing out of view -------------------------------------

  async function loadModel() {
    try {
      const { createPlayerModel } = await import('./player-3d');
      const model = createPlayerModel(canvas, (by) => step(by));
      model.setReducedMotion(reducedMotion.matches);
      state.model = model;
      setPlayerPose(root, state.progress);
      showTrack();
      // The screen's type, once the fonts are in.
      void document.fonts.ready.then(() => showTime(true));
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
