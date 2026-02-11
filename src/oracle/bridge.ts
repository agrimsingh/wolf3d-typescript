import createModule from './generated/wolf_oracle.js';

type OracleFns = {
  fixedMul: (a: number, b: number) => number;
  fixedByFrac: (a: number, b: number) => number;
  rlewExpandChecksum: (srcBytes: Uint8Array, srcLen: number, tag: number, outLen: number) => number;
  raycastDistanceQ16: (
    mapLo: number,
    mapHi: number,
    startXQ16: number,
    startYQ16: number,
    dirXQ16: number,
    dirYQ16: number,
    maxSteps: number,
  ) => number;
  actorStepPacked: (state: number, playerDistQ8: number, canSee: number, rng: number) => number;
  playerMovePacked: (mapLo: number, mapHi: number, xQ8: number, yQ8: number, dxQ8: number, dyQ8: number) => number;
  gameEventHash: (score: number, lives: number, health: number, ammo: number, eventKind: number, value: number) => number;
  menuReducePacked: (screen: number, cursor: number, action: number, itemCount: number) => number;
  measureTextPacked: (textLen: number, maxWidthChars: number) => number;
  audioReducePacked: (soundMode: number, musicMode: number, digiMode: number, eventKind: number, soundId: number) => number;
};

export class OracleBridge {
  private module: any | null = null;
  private fns: OracleFns | null = null;

  async init(): Promise<void> {
    if (this.module) {
      return;
    }

    this.module = await createModule({});
    const cwrap = this.module.cwrap.bind(this.module);

    this.fns = {
      fixedMul: cwrap('oracle_fixed_mul', 'number', ['number', 'number']),
      fixedByFrac: cwrap('oracle_fixed_by_frac', 'number', ['number', 'number']),
      rlewExpandChecksum: cwrap('oracle_rlew_expand_checksum', 'number', ['array', 'number', 'number', 'number']),
      raycastDistanceQ16: cwrap('oracle_raycast_distance_q16', 'number', [
        'number',
        'number',
        'number',
        'number',
        'number',
        'number',
        'number',
      ]),
      actorStepPacked: cwrap('oracle_actor_step_packed', 'number', ['number', 'number', 'number', 'number']),
      playerMovePacked: cwrap('oracle_player_move_packed', 'number', ['number', 'number', 'number', 'number', 'number', 'number']),
      gameEventHash: cwrap('oracle_game_event_hash', 'number', ['number', 'number', 'number', 'number', 'number', 'number']),
      menuReducePacked: cwrap('oracle_menu_reduce_packed', 'number', ['number', 'number', 'number', 'number']),
      measureTextPacked: cwrap('oracle_measure_text_packed', 'number', ['number', 'number']),
      audioReducePacked: cwrap('oracle_audio_reduce_packed', 'number', ['number', 'number', 'number', 'number', 'number']),
    };
  }

  private assertReady(): OracleFns {
    if (!this.fns || !this.module) {
      throw new Error('OracleBridge not initialized. Call init() first.');
    }
    return this.fns;
  }

  fixedMul(a: number, b: number): number {
    return this.assertReady().fixedMul(a | 0, b | 0) | 0;
  }

  fixedByFrac(a: number, b: number): number {
    return this.assertReady().fixedByFrac(a | 0, b | 0) | 0;
  }

  rlewExpandChecksum(src: Uint16Array, tag: number, outLen: number): number {
    const fns = this.assertReady();
    const bytes = new Uint8Array(src.buffer, src.byteOffset, src.byteLength);
    const result = fns.rlewExpandChecksum(bytes, src.length, tag & 0xffff, outLen | 0) >>> 0;
    return result;
  }

  raycastDistanceQ16(
    mapLo: number,
    mapHi: number,
    startXQ16: number,
    startYQ16: number,
    dirXQ16: number,
    dirYQ16: number,
    maxSteps: number,
  ): number {
    return (
      this.assertReady().raycastDistanceQ16(
        mapLo >>> 0,
        mapHi >>> 0,
        startXQ16 | 0,
        startYQ16 | 0,
        dirXQ16 | 0,
        dirYQ16 | 0,
        maxSteps | 0,
      ) | 0
    );
  }

  actorStepPacked(state: number, playerDistQ8: number, canSee: boolean, rng: number): number {
    return this.assertReady().actorStepPacked(state | 0, playerDistQ8 | 0, canSee ? 1 : 0, rng | 0) | 0;
  }

  playerMovePacked(mapLo: number, mapHi: number, xQ8: number, yQ8: number, dxQ8: number, dyQ8: number): number {
    return this.assertReady().playerMovePacked(mapLo >>> 0, mapHi >>> 0, xQ8 | 0, yQ8 | 0, dxQ8 | 0, dyQ8 | 0) | 0;
  }

  gameEventHash(score: number, lives: number, health: number, ammo: number, eventKind: number, value: number): number {
    return this.assertReady().gameEventHash(score | 0, lives | 0, health | 0, ammo | 0, eventKind | 0, value | 0) | 0;
  }

  menuReducePacked(screen: number, cursor: number, action: number, itemCount: number): number {
    return this.assertReady().menuReducePacked(screen | 0, cursor | 0, action | 0, itemCount | 0) | 0;
  }

  measureTextPacked(textLen: number, maxWidthChars: number): number {
    return this.assertReady().measureTextPacked(textLen | 0, maxWidthChars | 0) | 0;
  }

  audioReducePacked(soundMode: number, musicMode: number, digiMode: number, eventKind: number, soundId: number): number {
    return this.assertReady().audioReducePacked(soundMode | 0, musicMode | 0, digiMode | 0, eventKind | 0, soundId | 0) | 0;
  }
}

let singleton: OracleBridge | null = null;

export async function getOracleBridge(): Promise<OracleBridge> {
  if (!singleton) {
    singleton = new OracleBridge();
    await singleton.init();
  }
  return singleton;
}
