// Music for the invitation. Three real sources plus "none":
//  - synth:   a generative piece in D major, built from oscillators. Nothing to load.
//  - upload:  an MP3 the host uploaded (Supabase storage URL), looped.
//  - youtube: a hidden YouTube player. Starts on the same tap that opens the envelope,
//             which satisfies autoplay rules.
import type { InviteConfig } from "@/lib/types";

export type MusicControl = { play: () => void; pause: () => void; playing: () => boolean; destroy: () => void };

const BPM = 68;
const BEAT = 60 / BPM;
const PROGRESSION: number[][] = [
  [62, 66, 69, 74, 78],
  [59, 62, 66, 71, 74],
  [55, 59, 62, 67, 71],
  [57, 61, 64, 69, 73],
];
const PATTERN = [0, 2, 1, 3, 2, 4, 3, 2];
const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

function makeReverb(ctx: AudioContext, seconds = 3.2, decay = 3) {
  const rate = ctx.sampleRate;
  const len = Math.floor(rate * seconds);
  const buf = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  const conv = ctx.createConvolver();
  conv.buffer = buf;
  return conv;
}

function createSynth(): MusicControl {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let timer: number | null = null;
  let nextNoteTime = 0;
  let step = 0;
  let playing = false;

  function setup() {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    const reverb = makeReverb(ctx);
    const wet = ctx.createGain();
    wet.gain.value = 0.55;
    const dry = ctx.createGain();
    dry.gain.value = 0.7;
    master.connect(dry).connect(ctx.destination);
    master.connect(reverb).connect(wet).connect(ctx.destination);
  }
  function pluck(midi: number, t: number, dur: number, vel: number) {
    if (!ctx || !master) return;
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = hz(midi);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1400;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vel, t + 0.02);
    g.gain.exponentialRampToValueAtTime(vel * 0.35, t + 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 1.2);
    osc.connect(lp).connect(g).connect(master);
    osc.start(t);
    osc.stop(t + dur + 1.4);
  }
  function pad(chord: number[], t: number, dur: number) {
    if (!ctx || !master) return;
    const c = ctx;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.11, t + 1.6);
    g.gain.setValueAtTime(0.11, t + dur - 1.2);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.6);
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 700;
    lp.connect(g).connect(master);
    [chord[0] - 12, chord[2] - 12].forEach((m, i) => {
      const a = c.createOscillator();
      a.type = "sine";
      a.frequency.value = hz(m);
      a.detune.value = i ? 6 : -6;
      a.connect(lp);
      a.start(t);
      a.stop(t + dur + 1);
    });
  }
  function schedule() {
    if (!ctx) return;
    while (nextNoteTime < ctx.currentTime + 0.4) {
      const bar = Math.floor(step / 16);
      const chord = PROGRESSION[bar % PROGRESSION.length];
      if (step % 16 === 0) pad(chord, nextNoteTime, BEAT * 8);
      const tone = chord[PATTERN[step % PATTERN.length]];
      if ((step * 7) % 11 !== 0) pluck(tone, nextNoteTime, BEAT * 0.9, step % 4 === 0 ? 0.16 : 0.1);
      nextNoteTime += BEAT / 2;
      step++;
    }
    timer = window.setTimeout(schedule, 120);
  }
  return {
    play() {
      if (!ctx) setup();
      if (!ctx || !master) return;
      if (ctx.state === "suspended") void ctx.resume();
      if (!playing) {
        nextNoteTime = ctx.currentTime + 0.1;
        schedule();
      }
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.8);
      playing = true;
    },
    pause() {
      if (!ctx || !master || !playing) return;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
      const c = ctx;
      window.setTimeout(() => {
        if (timer) window.clearTimeout(timer);
        timer = null;
        void c.suspend();
      }, 1400);
      playing = false;
    },
    playing: () => playing,
    destroy() {
      if (timer) window.clearTimeout(timer);
      void ctx?.close();
      ctx = null;
      playing = false;
    },
  };
}

function createFile(src: string): MusicControl {
  const el = new Audio(src);
  el.loop = true;
  el.volume = 0.75;
  el.preload = "auto";
  let playing = false;
  return {
    play() {
      playing = true;
      void el.play().catch(() => {
        playing = false;
      });
    },
    pause() {
      el.pause();
      playing = false;
    },
    playing: () => playing,
    destroy() {
      el.pause();
      el.src = "";
    },
  };
}

// Minimal typing for the YouTube IFrame API.
type YTPlayer = { playVideo: () => void; pauseVideo: () => void; setVolume: (v: number) => void; destroy: () => void };
type YTNs = { Player: new (el: HTMLElement, opts: Record<string, unknown>) => YTPlayer };
declare global {
  interface Window {
    YT?: YTNs;
    onYouTubeIframeAPIReady?: () => void;
  }
}

function loadYouTubeApi(): Promise<YTNs> {
  return new Promise((resolve) => {
    if (window.YT?.Player) return resolve(window.YT);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(window.YT!);
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    }
  });
}

function createYouTube(videoId: string, startAt = 0, onFail?: () => void): MusicControl {
  let player: YTPlayer | null = null;
  let playing = false;
  let wantPlay = false;
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;width:1px;height:1px;left:-9999px;top:-9999px;opacity:0;pointer-events:none;";
  document.body.appendChild(host);
  const inner = document.createElement("div");
  host.appendChild(inner);

  void loadYouTubeApi().then((YT) => {
    player = new YT.Player(inner, {
      videoId,
      playerVars: { autoplay: 0, controls: 0, loop: 1, playlist: videoId, playsinline: 1, rel: 0, start: Math.max(0, Math.floor(startAt)), origin: window.location.origin },
      events: {
        onReady: () => {
          player?.setVolume(70);
          if (wantPlay) player?.playVideo();
        },
        // Embedding switched off by the video's owner, removed, or private: play the built-in score instead of silence.
        onError: () => onFail?.(),
      },
    });
  });

  return {
    play() {
      wantPlay = true;
      playing = true;
      player?.playVideo();
    },
    pause() {
      wantPlay = false;
      playing = false;
      player?.pauseVideo();
    },
    playing: () => playing,
    destroy() {
      player?.destroy();
      host.remove();
    },
  };
}

// A YouTube player that hands over to the built-in score if the video cannot be played.
function withFallback(videoId: string, startAt: number): MusicControl {
  let active: MusicControl;
  let fallback: MusicControl | null = null;
  let wantPlay = false;
  const yt = createYouTube(videoId, startAt, () => {
    if (fallback) return;
    yt.destroy();
    fallback = createSynth();
    active = fallback;
    if (wantPlay) fallback.play();
  });
  active = yt;
  return {
    play() {
      wantPlay = true;
      active.play();
    },
    pause() {
      wantPlay = false;
      active.pause();
    },
    playing: () => active.playing(),
    destroy() {
      yt.destroy();
      fallback?.destroy();
    },
  };
}

const silent: MusicControl = { play() {}, pause() {}, playing: () => false, destroy() {} };

export function createMusic(m: InviteConfig["music"]): MusicControl {
  if (typeof window === "undefined") return silent;
  switch (m.source) {
    case "synth":
      return createSynth();
    case "upload":
      return m.url ? createFile(m.url) : silent;
    case "youtube":
      return m.youtubeId ? withFallback(m.youtubeId, m.youtubeStart || 0) : silent;
    default:
      return silent;
  }
}

// Accepts a full URL, a short URL, or a bare id.
export function parseYouTubeId(input: string): string {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1, 12);
    const v = u.searchParams.get("v");
    if (v) return v.slice(0, 11);
    const m = u.pathname.match(/\/(?:embed|shorts|live)\/([\w-]{11})/);
    if (m) return m[1];
  } catch {
    /* not a url */
  }
  return "";
}
