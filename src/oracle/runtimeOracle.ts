import createModule from './generated/wolf_oracle.js';
import type { RuntimeConfig, RuntimeInput, RuntimePort, RuntimeSnapshot, RuntimeStepResult } from '../runtime/contracts';

type RuntimeFns = {
  init: (mapLo: number, mapHi: number, startXQ8: number, startYQ8: number, startAngleDeg: number, startHealth: number, startAmmo: number) => number;
  reset: () => void;
  step: (inputMask: number, tics: number, rng: number) => number;
  snapshotHash: () => number;
  renderHash: (viewWidth: number, viewHeight: number) => number;
  setState: (
    mapLo: number,
    mapHi: number,
    xQ8: number,
    yQ8: number,
    angleDeg: number,
    health: number,
    ammo: number,
    cooldown: number,
    flags: number,
    tick: number,
  ) => number;
  getMapLo: () => number;
  getMapHi: () => number;
  getXQ8: () => number;
  getYQ8: () => number;
  getAngleDeg: () => number;
  getHealth: () => number;
  getAmmo: () => number;
  getCooldown: () => number;
  getFlags: () => number;
  getTick: () => number;
};

export class WolfsrcOraclePort implements RuntimePort {
  private module: any | null = null;
  private fns: RuntimeFns | null = null;

  private assertReady(): RuntimeFns {
    if (!this.module || !this.fns) {
      throw new Error('WolfsrcOraclePort not initialized');
    }
    return this.fns;
  }

  async init(config: RuntimeConfig): Promise<void> {
    if (!this.module) {
      this.module = await createModule({});
      const cwrap = this.module.cwrap.bind(this.module);
      this.fns = {
        init: cwrap('oracle_runtime_init', 'number', ['number', 'number', 'number', 'number', 'number', 'number', 'number']),
        reset: cwrap('oracle_runtime_reset', null, []),
        step: cwrap('oracle_runtime_step', 'number', ['number', 'number', 'number']),
        snapshotHash: cwrap('oracle_runtime_snapshot_hash', 'number', []),
        renderHash: cwrap('oracle_runtime_render_frame_hash', 'number', ['number', 'number']),
        setState: cwrap('oracle_runtime_set_state', 'number', [
          'number',
          'number',
          'number',
          'number',
          'number',
          'number',
          'number',
          'number',
          'number',
          'number',
        ]),
        getMapLo: cwrap('oracle_runtime_get_map_lo', 'number', []),
        getMapHi: cwrap('oracle_runtime_get_map_hi', 'number', []),
        getXQ8: cwrap('oracle_runtime_get_xq8', 'number', []),
        getYQ8: cwrap('oracle_runtime_get_yq8', 'number', []),
        getAngleDeg: cwrap('oracle_runtime_get_angle_deg', 'number', []),
        getHealth: cwrap('oracle_runtime_get_health', 'number', []),
        getAmmo: cwrap('oracle_runtime_get_ammo', 'number', []),
        getCooldown: cwrap('oracle_runtime_get_cooldown', 'number', []),
        getFlags: cwrap('oracle_runtime_get_flags', 'number', []),
        getTick: cwrap('oracle_runtime_get_tick', 'number', []),
      };
    }

    const fns = this.assertReady();
    fns.init(
      config.mapLo >>> 0,
      config.mapHi >>> 0,
      config.startXQ8 | 0,
      config.startYQ8 | 0,
      config.startAngleDeg | 0,
      config.startHealth | 0,
      config.startAmmo | 0,
    );
  }

  reset(): void {
    this.assertReady().reset();
  }

  step(input: RuntimeInput): RuntimeStepResult {
    const fns = this.assertReady();
    const snapshotHash = fns.step(input.inputMask | 0, input.tics | 0, input.rng | 0) >>> 0;
    const frameHash = fns.renderHash(320, 200) >>> 0;
    return {
      snapshotHash,
      frameHash,
      tick: fns.getTick() | 0,
    };
  }

  renderHash(viewWidth: number, viewHeight: number): number {
    return this.assertReady().renderHash(viewWidth | 0, viewHeight | 0) >>> 0;
  }

  snapshot(): RuntimeSnapshot {
    const fns = this.assertReady();
    return {
      mapLo: fns.getMapLo() >>> 0,
      mapHi: fns.getMapHi() >>> 0,
      xQ8: fns.getXQ8() | 0,
      yQ8: fns.getYQ8() | 0,
      angleDeg: fns.getAngleDeg() | 0,
      health: fns.getHealth() | 0,
      ammo: fns.getAmmo() | 0,
      cooldown: fns.getCooldown() | 0,
      flags: fns.getFlags() | 0,
      tick: fns.getTick() | 0,
      hash: fns.snapshotHash() >>> 0,
    };
  }

  serialize(): Uint8Array {
    const payload = JSON.stringify(this.snapshot());
    return new TextEncoder().encode(payload);
  }

  deserialize(data: Uint8Array): void {
    const text = new TextDecoder().decode(data);
    const parsed = JSON.parse(text) as RuntimeSnapshot;
    this.assertReady().setState(
      parsed.mapLo >>> 0,
      parsed.mapHi >>> 0,
      parsed.xQ8 | 0,
      parsed.yQ8 | 0,
      parsed.angleDeg | 0,
      parsed.health | 0,
      parsed.ammo | 0,
      parsed.cooldown | 0,
      parsed.flags | 0,
      parsed.tick | 0,
    );
  }

  async shutdown(): Promise<void> {
    this.fns = null;
    this.module = null;
  }
}
