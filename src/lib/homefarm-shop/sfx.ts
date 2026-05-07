let _ctx: AudioContext | null = null;
let _muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!_ctx) {
    _ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  if (_ctx.state === "suspended") _ctx.resume();
  return _ctx;
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  vol = 0.3,
  delay = 0,
) {
  if (_muted) return;
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + delay);
  gain.gain.setValueAtTime(0, c.currentTime + delay);
  gain.gain.linearRampToValueAtTime(vol, c.currentTime + delay + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);
  osc.start(c.currentTime + delay);
  osc.stop(c.currentTime + delay + duration + 0.05);
}

// White noise burst qua highpass filter — dùng cho tiếng dao "xẹt"
function swish(duration: number, vol: number, delay: number, filterFreq = 1800) {
  if (_muted) return;
  const c = getCtx();
  if (!c) return;
  const frameCount = Math.ceil(c.sampleRate * (duration + 0.05));
  const buffer = c.createBuffer(1, frameCount, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) data[i] = Math.random() * 2 - 1;
  const source = c.createBufferSource();
  source.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = filterFreq;
  const gain = c.createGain();
  source.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);
  gain.gain.setValueAtTime(0, c.currentTime + delay);
  gain.gain.linearRampToValueAtTime(vol, c.currentTime + delay + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);
  source.start(c.currentTime + delay);
  source.stop(c.currentTime + delay + duration + 0.05);
}

export function setSfxMuted(muted: boolean) {
  _muted = muted;
}

export const sfx = {
  // Tap đúng món
  tap: () => tone(900, 0.07, "sine", 0.3),

  // Tap sai / thiếu hàng
  wrong: () => {
    tone(180, 0.1, "square", 0.4);
    tone(140, 0.18, "square", 0.28, 0.09);
  },

  // Giao hàng thành công
  deliver: () => {
    tone(523, 0.09, "sine", 0.4);
    tone(659, 0.09, "sine", 0.4, 0.09);
    tone(784, 0.18, "sine", 0.45, 0.18);
  },

  // Combo 3+ — fanfare tăng dần theo level
  combo: (level: number) => {
    const freqs = [523, 659, 784, 1047, 1319];
    const count = level >= 10 ? 5 : level >= 5 ? 4 : 3;
    freqs.slice(0, count).forEach((f, i) => tone(f, 0.11, "sine", 0.38, i * 0.07));
  },

  // Khách bỏ đi / combo reset
  fail: () => {
    tone(330, 0.12, "sine", 0.35);
    tone(247, 0.28, "sine", 0.3, 0.1);
  },

  // Thu tiền — nhập hàng, nâng cấp
  cash: () => {
    tone(440, 0.07, "triangle", 0.32);
    tone(554, 0.12, "triangle", 0.32, 0.07);
  },

  // Game over
  gameOver: () => {
    tone(392, 0.16, "sawtooth", 0.38);
    tone(349, 0.16, "sawtooth", 0.34, 0.22);
    tone(294, 0.16, "sawtooth", 0.34, 0.44);
    tone(220, 0.38, "sawtooth", 0.38, 0.66);
  },

  // Fillet dao — "xẹt xẹt"
  knife: () => {
    swish(0.065, 0.55, 0, 1600);
    swish(0.065, 0.5, 0.14, 1600);
  },

  // Nút UI chung — mở import, mở upgrade
  button: () => tone(480, 0.06, "sine", 0.28),

  // Stepper +/−
  stepper: () => tone(720, 0.035, "sine", 0.22),

  // Qua ngày
  nextDay: () => {
    tone(392, 0.1, "sine", 0.35);
    tone(523, 0.1, "sine", 0.35, 0.11);
    tone(659, 0.22, "sine", 0.38, 0.22);
  },
};
