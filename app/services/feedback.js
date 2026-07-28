let audioContext;
let noiseBuffer;

const getContext = () => {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  audioContext ||= new AudioContextClass({ latencyHint: "interactive" });
  if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
  return audioContext;
};

const getNoise = (context) => {
  if (noiseBuffer && noiseBuffer.sampleRate === context.sampleRate) return noiseBuffer;
  noiseBuffer = context.createBuffer(1, Math.floor(context.sampleRate * .08), context.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) {
    data[index] = (Math.random() * 2 - 1) * (1 - index / data.length);
  }
  return noiseBuffer;
};

export function playKeySound({ mode = "soft", volume = .3, correct = true } = {}) {
  if (mode === "silent" || volume <= 0) return;
  const context = getContext();
  if (!context) return;
  const now = context.currentTime;
  const gain = context.createGain();
  gain.gain.setValueAtTime(Math.max(.001, volume * (mode === "mechanical" ? .24 : .12)), now);
  gain.gain.exponentialRampToValueAtTime(.001, now + (mode === "mechanical" ? .055 : .08));
  gain.connect(context.destination);

  if (mode === "mechanical") {
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    source.buffer = getNoise(context);
    filter.type = "bandpass";
    filter.frequency.value = correct ? 1850 : 720;
    filter.Q.value = 1.6;
    source.connect(filter).connect(gain);
    source.start(now);
    source.stop(now + .06);
  } else {
    const oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(correct ? 540 : 190, now);
    oscillator.frequency.exponentialRampToValueAtTime(correct ? 390 : 120, now + .07);
    oscillator.connect(gain);
    oscillator.start(now);
    oscillator.stop(now + .08);
  }
}

export function triggerHaptic(pattern, enabled = true) {
  if (!enabled || typeof navigator === "undefined" || !navigator.vibrate) return false;
  return navigator.vibrate(pattern);
}

