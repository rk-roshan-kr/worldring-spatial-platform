// Web Audio API Synthesizer for WorldRing Spatial Simulator
// Pure browser-native synthesis — 0kb external assets, 100% reactive

let audioCtx: AudioContext | null = null;
let engineOsc: OscillatorNode | null = null;
let engineGain: GainNode | null = null;
let isAudioEnabled = true;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!audioCtx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtx = new AudioCtx();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export function setAudioEnabled(enabled: boolean) {
  isAudioEnabled = enabled;
  const ctx = getContext();
  if (ctx && !enabled && engineGain) {
    try {
      engineGain.gain.setValueAtTime(0, ctx.currentTime);
    } catch {
      // ignore
    }
  }
}

export function getAudioEnabled(): boolean {
  return isAudioEnabled;
}

// ── 1. SONAR RADAR PING (High-tech spatial acoustic sweep) ──
export function playSonarPing() {
  if (!isAudioEnabled) return;
  const ctx = getContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sine";
    const now = ctx.currentTime;

    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.08);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(3.5, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.70);
  } catch {
    // Audio context safe fallback
  }
}

// ── 2. MODE SWITCH CHIME (LiDAR / Heatmap / Semantic palette switch) ──
export function playModeSwitch() {
  if (!isAudioEnabled) return;
  const ctx = getContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    [
      { freq: 587.33, delay: 0 },
      { freq: 880.0, delay: 0.06 },
      { freq: 1174.66, delay: 0.12 },
    ].forEach(({ freq, delay }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.linearRampToValueAtTime(0.05, now + delay + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.30);
    });
  } catch {
    // Safe
  }
}

// ── 3. CAMERA PERSPECTIVE SHIFT (Mechanical gimbal servo sound) ──
export function playCameraSwitch() {
  if (!isAudioEnabled) return;
  const ctx = getContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.10);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  } catch {
    // Safe
  }
}

// ── 4. AUTONOMOUS CRUISE ENGAGE / DISENGAGE ──
export function playCruiseToggle(isEngaging: boolean) {
  if (!isAudioEnabled) return;
  const ctx = getContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    if (isEngaging) {
      osc.frequency.setValueAtTime(330, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.18);
    } else {
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(330, now + 0.18);
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.07, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  } catch {
    // Safe
  }
}

// ── 5. SUB-BASS PROPULSION HUM (Modulated by speed) ──
export function updateEngineHum(speedKmh: number) {
  if (!isAudioEnabled) {
    if (engineGain && audioCtx) {
      engineGain.gain.setValueAtTime(0, audioCtx.currentTime);
    }
    return;
  }
  const ctx = getContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    if (!engineOsc) {
      engineOsc = ctx.createOscillator();
      engineGain = ctx.createGain();

      engineOsc.type = "sine";
      engineOsc.frequency.setValueAtTime(48, now);
      engineGain.gain.setValueAtTime(0.0001, now);

      engineOsc.connect(engineGain);
      engineGain.connect(ctx.destination);
      engineOsc.start();
    }

    if (engineOsc && engineGain) {
      const targetFreq = 42.0 + Math.min(speedKmh, 85) * 0.55;
      const targetVol = speedKmh > 2 ? Math.min(0.045, 0.015 + (speedKmh / 90) * 0.03) : 0.0001;

      engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.15);
      engineGain.gain.setTargetAtTime(targetVol, now, 0.15);
    }
  } catch {
    // Safe
  }
}
