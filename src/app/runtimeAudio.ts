import type { RuntimeSnapshot } from '../runtime/contracts';

export interface RuntimeAudioAdapter {
  unlock(): void;
  onStep(previous: RuntimeSnapshot, next: RuntimeSnapshot, inputMask: number): void;
  shutdown(): Promise<void> | void;
}

export class NullRuntimeAudioAdapter implements RuntimeAudioAdapter {
  unlock(): void {
    // no-op
  }

  onStep(_previous: RuntimeSnapshot, _next: RuntimeSnapshot, _inputMask: number): void {
    // no-op
  }

  shutdown(): void {
    // no-op
  }
}

function resolveAudioContextCtor(): (new () => AudioContext) | null {
  const g = globalThis as unknown as {
    AudioContext?: new () => AudioContext;
    webkitAudioContext?: new () => AudioContext;
  };
  return g.AudioContext ?? g.webkitAudioContext ?? null;
}

export class WebAudioRuntimeAdapter implements RuntimeAudioAdapter {
  private context: AudioContext | null = null;

  unlock(): void {
    const Ctor = resolveAudioContextCtor();
    if (!Ctor) {
      return;
    }
    if (!this.context) {
      this.context = new Ctor();
    }
    if (this.context.state === 'suspended') {
      void this.context.resume();
    }
  }

  private beep(frequency: number, durationMs: number, gainValue: number): void {
    if (!this.context) {
      return;
    }
    const ctx = this.context;
    if (ctx.state !== 'running') {
      return;
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    const duration = Math.max(0.01, durationMs / 1000);

    osc.type = 'square';
    osc.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(Math.max(0.0001, gainValue), now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  onStep(previous: RuntimeSnapshot, next: RuntimeSnapshot, _inputMask: number): void {
    const prevFlags = previous.flags | 0;
    const nextFlags = next.flags | 0;
    const shotEdge = (nextFlags & 0x10) !== 0 && (prevFlags & 0x10) === 0;
    const useEdge = (nextFlags & 0x20) !== 0 && (prevFlags & 0x20) === 0;
    const tookDamage = (next.health | 0) < (previous.health | 0);

    if (shotEdge) {
      this.beep(880, 55, 0.03);
    }
    if (useEdge) {
      this.beep(510, 40, 0.025);
    }
    if (tookDamage) {
      this.beep(180, 70, 0.035);
    }
  }

  async shutdown(): Promise<void> {
    if (!this.context) {
      return;
    }
    try {
      await this.context.close();
    } finally {
      this.context = null;
    }
  }
}
