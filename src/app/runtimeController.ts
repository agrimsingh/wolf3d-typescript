import type { RuntimeConfig, RuntimeFramebufferView, RuntimeInput, RuntimePort, RuntimeSnapshot } from '../runtime/contracts';
import { TsRuntimePort } from '../runtime/tsRuntime';
import { NullRuntimeAudioAdapter, type RuntimeAudioAdapter } from './runtimeAudio';

const TIC_MS = 1000 / 70;

export interface RuntimeScenario {
  id: string;
  mapIndex: number;
  mapName: string;
  seed: number;
  config: RuntimeConfig;
  steps: RuntimeInput[];
}

export type RuntimeAppMode = 'loading' | 'menu' | 'playing' | 'error';

export interface RuntimeAppState {
  mode: RuntimeAppMode;
  errorMessage: string;
  scenarios: RuntimeScenario[];
  selectedScenarioIndex: number;
  currentScenario: RuntimeScenario | null;
  snapshot: RuntimeSnapshot | null;
  framebuffer: RuntimeFramebufferView | null;
  frameHash: number;
}

interface RuntimeControllerOptions {
  runtime?: RuntimePort;
  scenarioLoader?: () => Promise<RuntimeScenario[]>;
  audio?: RuntimeAudioAdapter;
}

export class RuntimeAppController {
  private readonly runtime: RuntimePort;
  private readonly scenarioLoader: () => Promise<RuntimeScenario[]>;
  private readonly audio: RuntimeAudioAdapter;
  private readonly heldKeys = new Set<string>();

  private state: RuntimeAppState = {
    mode: 'loading',
    errorMessage: '',
    scenarios: [],
    selectedScenarioIndex: 0,
    currentScenario: null,
    snapshot: null,
    framebuffer: null,
    frameHash: 0,
  };

  private lastFrameAtMs = 0;
  private tickAccumulatorMs = 0;
  private rngState = 0x12345678;
  private mouseTurnAccumulator = 0;
  private latchedInputMask = 0;
  private transitionToken = 0;

  private keyCodeToMask(code: string): number {
    switch (code) {
      case 'KeyW':
      case 'ArrowUp':
        return 1 << 0;
      case 'KeyS':
      case 'ArrowDown':
        return 1 << 1;
      case 'ArrowLeft':
        return 1 << 3;
      case 'ArrowRight':
        return 1 << 2;
      case 'KeyA':
        return 1 << 4;
      case 'KeyD':
        return 1 << 5;
      case 'Space':
        return 1 << 6;
      case 'KeyE':
      case 'Enter':
        return 1 << 7;
      default:
        return 0;
    }
  }

  constructor(options: RuntimeControllerOptions = {}) {
    this.runtime = options.runtime ?? new TsRuntimePort();
    this.scenarioLoader =
      options.scenarioLoader ??
      (async () => {
        throw new Error('No scenario loader configured for runtime controller');
      });
    this.audio = options.audio ?? new NullRuntimeAudioAdapter();
  }

  getState(): RuntimeAppState {
    return {
      mode: this.state.mode,
      errorMessage: this.state.errorMessage,
      scenarios: this.state.scenarios,
      selectedScenarioIndex: this.state.selectedScenarioIndex,
      currentScenario: this.state.currentScenario,
      snapshot: this.state.snapshot,
      framebuffer: this.state.framebuffer,
      frameHash: this.state.frameHash >>> 0,
    };
  }

  async boot(): Promise<void> {
    this.state = {
      ...this.state,
      mode: 'loading',
      errorMessage: '',
      scenarios: [],
      selectedScenarioIndex: 0,
      currentScenario: null,
      snapshot: null,
      framebuffer: null,
      frameHash: 0,
    };

    try {
      const scenarios = await this.scenarioLoader();
      if (scenarios.length === 0) {
        throw new Error('No WL1 scenarios were loaded.');
      }
      this.state = {
        ...this.state,
        mode: 'menu',
        scenarios,
        selectedScenarioIndex: 0,
        currentScenario: null,
        snapshot: null,
        framebuffer: null,
        frameHash: 0,
      };
    } catch (error) {
      this.state = {
        ...this.state,
        mode: 'error',
        errorMessage: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private nextRng(): number {
    this.rngState = (Math.imul(this.rngState, 1664525) + 1013904223) | 0;
    return this.rngState | 0;
  }

  private buildInputMask(): number {
    let inputMask = this.latchedInputMask | 0;
    this.latchedInputMask = 0;
    const key = (code: string) => this.heldKeys.has(code);

    if (key('KeyW') || key('ArrowUp')) inputMask |= 1 << 0;
    if (key('KeyS') || key('ArrowDown')) inputMask |= 1 << 1;
    // Runtime turn polarity from oracle control path is inverted relative to expected UI arrows.
    if (key('ArrowLeft')) inputMask |= 1 << 3;
    if (key('ArrowRight')) inputMask |= 1 << 2;
    if (key('KeyA')) inputMask |= 1 << 4;
    if (key('KeyD')) inputMask |= 1 << 5;
    if (key('Space')) inputMask |= 1 << 6;
    if (key('KeyE') || key('Enter')) inputMask |= 1 << 7;

    if (this.mouseTurnAccumulator <= -2) {
      inputMask |= 1 << 3;
      this.mouseTurnAccumulator += 2;
    } else if (this.mouseTurnAccumulator >= 2) {
      inputMask |= 1 << 2;
      this.mouseTurnAccumulator -= 2;
    }

    return inputMask | 0;
  }

  async startScenario(index: number): Promise<void> {
    if (this.state.scenarios.length === 0) {
      return;
    }
    const scenario = this.state.scenarios[index];
    if (!scenario) {
      return;
    }

    const token = ++this.transitionToken;
    await this.runtime.init(scenario.config);
    if (token !== this.transitionToken) {
      return;
    }
    this.runtime.reset();

    const snapshot = this.runtime.snapshot();
    const framebuffer = this.runtime.framebuffer(true);
    this.state = {
      ...this.state,
      mode: 'playing',
      selectedScenarioIndex: index,
      currentScenario: scenario,
      snapshot,
      framebuffer,
      frameHash: framebuffer.indexedHash >>> 0,
    };
    this.tickAccumulatorMs = 0;
    this.lastFrameAtMs = 0;
    this.rngState = scenario.seed | 0;
    this.mouseTurnAccumulator = 0;
    this.latchedInputMask = 0;
  }

  async startSelectedScenario(): Promise<void> {
    await this.startScenario(this.state.selectedScenarioIndex);
  }

  async startNextScenario(): Promise<void> {
    const total = this.state.scenarios.length;
    if (total === 0) {
      return;
    }
    const nextIndex = (this.state.selectedScenarioIndex + 1) % total;
    await this.startScenario(nextIndex);
  }

  returnToMenu(): void {
    this.transitionToken++;
    this.state = {
      ...this.state,
      mode: 'menu',
      currentScenario: null,
      snapshot: null,
      framebuffer: null,
      frameHash: 0,
    };
    this.lastFrameAtMs = 0;
    this.tickAccumulatorMs = 0;
    this.mouseTurnAccumulator = 0;
    this.latchedInputMask = 0;
  }

  onKeyDown(code: string): void {
    this.heldKeys.add(code);
    this.latchedInputMask |= this.keyCodeToMask(code);
    this.audio.unlock();

    if (this.state.mode === 'menu') {
      if (code === 'ArrowUp') {
        const total = this.state.scenarios.length;
        if (total > 0) {
          const selectedScenarioIndex = (this.state.selectedScenarioIndex + total - 1) % total;
          this.state = { ...this.state, selectedScenarioIndex };
        }
      } else if (code === 'ArrowDown') {
        const total = this.state.scenarios.length;
        if (total > 0) {
          const selectedScenarioIndex = (this.state.selectedScenarioIndex + 1) % total;
          this.state = { ...this.state, selectedScenarioIndex };
        }
      } else if (code === 'Enter') {
        void this.startSelectedScenario();
      }
      return;
    }

    if (this.state.mode === 'playing') {
      if (code === 'Escape') {
        this.returnToMenu();
      } else if (code === 'KeyN') {
        void this.startNextScenario();
      }
    }
  }

  onKeyUp(code: string): void {
    this.heldKeys.delete(code);
  }

  onMouseMove(deltaX: number): void {
    if (this.state.mode !== 'playing') {
      return;
    }
    this.mouseTurnAccumulator += deltaX;
  }

  tick(nowMs: number): void {
    if (this.state.mode !== 'playing' || !this.state.currentScenario || !this.state.snapshot) {
      return;
    }

    if (this.lastFrameAtMs === 0) {
      this.lastFrameAtMs = nowMs;
      return;
    }

    const deltaMs = Math.max(0, Math.min(200, nowMs - this.lastFrameAtMs));
    this.lastFrameAtMs = nowMs;
    this.tickAccumulatorMs += deltaMs;

    let pendingTics = Math.floor(this.tickAccumulatorMs / TIC_MS);
    if (pendingTics <= 0) {
      return;
    }

    this.tickAccumulatorMs -= pendingTics * TIC_MS;
    const inputMask = this.buildInputMask();

    while (pendingTics > 0) {
      const tics = Math.min(8, pendingTics);
      const input: RuntimeInput = {
        inputMask,
        tics,
        rng: this.nextRng(),
      };

      const previousSnapshot = this.state.snapshot;
      if (!previousSnapshot) {
        break;
      }
      const step = this.runtime.step(input);
      const nextSnapshot = this.runtime.snapshot();

      this.audio.onStep(previousSnapshot, nextSnapshot, inputMask);

      this.state = {
        ...this.state,
        snapshot: nextSnapshot,
        frameHash: step.frameHash >>> 0,
      };
      pendingTics -= tics;
    }

    const framebuffer = this.runtime.framebuffer(true);
    this.state = {
      ...this.state,
      framebuffer,
      frameHash: framebuffer.indexedHash >>> 0,
    };
  }

  async shutdown(): Promise<void> {
    this.transitionToken++;
    this.heldKeys.clear();
    await this.runtime.shutdown();
    await this.audio.shutdown();
  }
}
