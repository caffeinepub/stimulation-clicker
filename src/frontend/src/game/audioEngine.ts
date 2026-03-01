let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(
  freq: number,
  type: OscillatorType,
  duration: number,
  gainVal: number,
  delay = 0,
  freqEnd?: number,
) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    if (freqEnd !== undefined) {
      osc.frequency.linearRampToValueAtTime(
        freqEnd,
        ctx.currentTime + delay + duration,
      );
    }
    gain.gain.setValueAtTime(0, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(gainVal, ctx.currentTime + delay + 0.005);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + delay + duration,
    );
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration + 0.01);
  } catch (_) {
    // Ignore audio errors
  }
}

function playNoise(duration: number, gainVal: number, delay = 0) {
  try {
    const ctx = getCtx();
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 200;
    filter.Q.value = 1;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(gainVal, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + delay + duration,
    );
    source.start(ctx.currentTime + delay);
    source.stop(ctx.currentTime + delay + duration + 0.01);
  } catch (_) {
    // Ignore audio errors
  }
}

export const audio = {
  click(comboMultiplier = 1) {
    const freq = 330 + Math.min(comboMultiplier * 30, 300);
    playTone(freq, "square", 0.06, 0.15, 0, freq * 1.5);
    playTone(freq * 2, "sine", 0.04, 0.08);
  },

  upgrade() {
    // Ascending C-E-G chord
    playTone(523, "sine", 0.12, 0.15, 0);
    playTone(659, "sine", 0.12, 0.12, 0.06);
    playTone(784, "sine", 0.15, 0.18, 0.12);
    playTone(1047, "sine", 0.1, 0.12, 0.2);
  },

  achievement() {
    // Fanfare sequence
    playTone(523, "triangle", 0.1, 0.15, 0);
    playTone(659, "triangle", 0.1, 0.15, 0.08);
    playTone(784, "triangle", 0.1, 0.15, 0.16);
    playTone(1047, "triangle", 0.2, 0.2, 0.24);
    playTone(1319, "triangle", 0.25, 0.18, 0.36);
  },

  prestige() {
    // Dramatic descending + ascending
    for (let i = 0; i < 8; i++) {
      playTone(1200 - i * 100, "sawtooth", 0.1, 0.12, i * 0.06);
    }
    for (let i = 0; i < 6; i++) {
      playTone(400 + i * 150, "sine", 0.12, 0.15, 0.5 + i * 0.07);
    }
  },

  combo(level: number) {
    const baseFreq = 440;
    const freq = baseFreq * 1.12 ** Math.min(level, 20);
    playTone(freq, "square", 0.08, 0.1, 0, freq * 1.2);
  },

  explosion() {
    playNoise(0.2, 0.3);
    playTone(80, "sawtooth", 0.15, 0.2, 0, 30);
  },

  firework() {
    playTone(300, "sine", 0.1, 0.1, 0, 900);
    playNoise(0.15, 0.2, 0.08);
  },

  manicMode() {
    playTone(880, "sawtooth", 0.1, 0.2, 0);
    playTone(1100, "sawtooth", 0.1, 0.2, 0.05);
    playTone(1320, "sawtooth", 0.15, 0.2, 0.1);
  },
};
