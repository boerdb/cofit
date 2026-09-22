type Stoppable = { stop: (when?: number) => void };

let context: AudioContext | null = null;
let landing: Stoppable[] = [];
let rattles: Stoppable[] = [];
let chimes: Stoppable[] = [];

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctx =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!context) context = new Ctx();
  if (context.state === "suspended") void context.resume();
  return context;
}

function withAudio(run: (audio: AudioContext) => void) {
  const audio = audioContext();
  if (!audio) return;
  run(audio);
}

function halt(nodes: Stoppable[], audio: AudioContext) {
  const when = audio.currentTime;
  for (const node of nodes) {
    try {
      node.stop(when);
    } catch {
      // Already stopped.
    }
  }
  nodes.length = 0;
}

/** Opens the speaker during a tap, so the later clock chime is allowed. */
export function primeAudio() {
  try {
    audioContext();
  } catch {
    // A missing sound must not block the clock.
  }
}

/** Cuts tones still playing from the previous throw or a finished clock. */
export function stopSounds() {
  if (!context) return;
  try {
    halt(landing, context);
    halt(rattles, context);
    halt(chimes, context);
  } catch {
    landing = [];
    rattles = [];
    chimes = [];
  }
}

/** Short rattle while the die is showing random faces. */
export function playDiceRoll() {
  try {
    withAudio((audio) => {
      halt(landing, audio);
      halt(rattles, audio);
      const now = audio.currentTime;
      for (let i = 0; i < 7; i++) {
        const t = now + i * 0.09;
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(140 + ((i * 47) % 90), t);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.045, t + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
        osc.connect(gain);
        gain.connect(audio.destination);
        osc.start(t);
        osc.stop(t + 0.06);
        rattles.push(osc);
      }
    });
  } catch {
    // A missing sound must not block the throw.
  }
}

/** A tone that lasts exactly as many seconds as the number thrown. */
export function playLanding(seconds: number) {
  if (seconds <= 0) return;
  try {
    withAudio((audio) => {
      halt(landing, audio);
      const now = audio.currentTime;
      for (let i = 0; i < seconds; i++) {
        const t = now + i;
        const end = i === seconds - 1 ? now + seconds : t + 0.92;
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(i === seconds - 1 ? 659 : 494, t);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.07, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, end);
        osc.connect(gain);
        gain.connect(audio.destination);
        osc.start(t);
        osc.stop(end + 0.02);
        landing.push(osc);
      }
    });
  } catch {
    // A missing sound must not block the move.
  }
}

function chime(audio: AudioContext, when: number, freq: number, peak: number, duration: number) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, when);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(peak, when + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(when);
  osc.stop(when + duration + 0.02);
  chimes.push(osc);
}

/** Bright two-note bell when the exercise clock reaches zero. */
export function playClockDone() {
  try {
    withAudio((audio) => {
      const now = audio.currentTime;
      chime(audio, now, 880, 0.07, 0.55);
      chime(audio, now, 1320, 0.03, 0.4);
      chime(audio, now + 0.18, 1175, 0.08, 1.05);
      chime(audio, now + 0.18, 1760, 0.028, 0.75);
    });
  } catch {
    // A missing chime must not block the clock.
  }
}
