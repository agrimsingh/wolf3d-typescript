import createModule from './generated/wolf_oracle.js';
import type { OracleBridgeContract, OracleFunctionId } from './types';

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
  wlDrawFixedByFrac: (a: number, b: number) => number;
  wlMainBuildTablesHash: () => number;
  wlMainCalcProjectionHash: (viewWidth: number, focal: number) => number;
  idCaCarmackExpandHash: (srcBytes: Uint8Array, srcLenBytes: number, expandedLengthBytes: number) => number;
  idCaRlewExpandHash: (srcBytes: Uint8Array, srcLenBytes: number, expandedLengthBytes: number, rlewTag: number) => number;
  idCaSetupMapFileHash: (mapheadBytes: Uint8Array, mapheadLenBytes: number) => number;
  idCaCacheMapHash: (
    gamemapsBytes: Uint8Array,
    gamemapsLenBytes: number,
    mapheadBytes: Uint8Array,
    mapheadLenBytes: number,
    mapnum: number,
  ) => number;
  wlGameSetupGameLevelHash: (plane0Bytes: Uint8Array, wordCount: number, mapWidth: number, mapHeight: number) => number;
  wlGameDrawPlayScreenHash: (
    viewWidth: number,
    viewHeight: number,
    bufferOfs: number,
    screenLoc0: number,
    screenLoc1: number,
    screenLoc2: number,
    statusBarPic: number,
  ) => number;
  wlDrawTransformActorHash: (
    obx: number,
    oby: number,
    viewx: number,
    viewy: number,
    viewcos: number,
    viewsin: number,
    scale: number,
    centerx: number,
    heightnumerator: number,
    mindist: number,
  ) => number;
  wlDrawTransformTileHash: (
    tx: number,
    ty: number,
    viewx: number,
    viewy: number,
    viewcos: number,
    viewsin: number,
    scale: number,
    centerx: number,
    heightnumerator: number,
    mindist: number,
  ) => number;
  wlDrawCalcHeight: (
    xintercept: number,
    yintercept: number,
    viewx: number,
    viewy: number,
    viewcos: number,
    viewsin: number,
    heightnumerator: number,
    mindist: number,
  ) => number;
  wlDrawHitVertWallHash: (
    xintercept: number,
    yintercept: number,
    xtilestep: number,
    pixx: number,
    xtile: number,
    ytile: number,
    lastside: number,
    lastintercept: number,
    lasttilehit: number,
    tilehit: number,
    postsourceLow: number,
    postwidth: number,
    prevheight: number,
    adjacentDoor: number,
    wallpicNormal: number,
    wallpicDoor: number,
    viewx: number,
    viewy: number,
    viewcos: number,
    viewsin: number,
    heightnumerator: number,
    mindist: number,
  ) => number;
  wlDrawHitHorizWallHash: (
    xintercept: number,
    yintercept: number,
    ytilestep: number,
    pixx: number,
    xtile: number,
    ytile: number,
    lastside: number,
    lastintercept: number,
    lasttilehit: number,
    tilehit: number,
    postsourceLow: number,
    postwidth: number,
    prevheight: number,
    adjacentDoor: number,
    wallpicNormal: number,
    wallpicDoor: number,
    viewx: number,
    viewy: number,
    viewcos: number,
    viewsin: number,
    heightnumerator: number,
    mindist: number,
  ) => number;
  wlDrawWallRefreshHash: (
    playerAngle: number,
    playerX: number,
    playerY: number,
    focallength: number,
    viewsin: number,
    viewcos: number,
  ) => number;
  wlDrawThreeDRefreshHash: (
    bufferofs: number,
    screenofs: number,
    frameon: number,
    fizzlein: number,
    wallRefreshHash: number,
  ) => number;
  wlScaleSetupScalingHash: (maxscaleheightIn: number, viewheight: number) => number;
  wlScaleScaleShapeHash: (
    xcenter: number,
    leftpix: number,
    rightpix: number,
    height: number,
    maxscale: number,
    viewwidth: number,
    wallheightSeed: number,
  ) => number;
  wlScaleSimpleScaleShapeHash: (xcenter: number, leftpix: number, rightpix: number, height: number) => number;
  wlStateSelectDodgeDirHash: (...args: number[]) => number;
  wlStateSelectChaseDirHash: (...args: number[]) => number;
  wlStateMoveObjHash: (...args: number[]) => number;
  wlStateDamageActorHash: (...args: number[]) => number;
  wlStateCheckLine: (ax: number, ay: number, px: number, py: number, mapLo: number, mapHi: number) => number;
  wlStateCheckSight: (ax: number, ay: number, px: number, py: number, mapLo: number, mapHi: number) => number;
  wlStateFirstSightingHash: (...args: number[]) => number;
  wlStateSightPlayerHash: (...args: number[]) => number;
  wlAct2TBiteHash: (...args: number[]) => number;
  wlAct2TChaseHash: (...args: number[]) => number;
  wlAct2TDogChaseHash: (...args: number[]) => number;
  wlAct2TPathHash: (...args: number[]) => number;
  wlAct2TProjectileHash: (...args: number[]) => number;
  wlAct2TShootHash: (...args: number[]) => number;
  idInReadControlHash: (keyMask: number, mouseDx: number, mouseDy: number, buttonMask: number) => number;
  idInUserInput: (delayTics: number, inputMask: number, rng: number) => number;
  wlAgentTryMoveHash: (mapLo: number, mapHi: number, xq8: number, yq8: number, dxq8: number, dyq8: number) => number;
  wlAgentClipMoveHash: (mapLo: number, mapHi: number, xq8: number, yq8: number, dxq8: number, dyq8: number) => number;
  wlAgentThrustHash: (mapLo: number, mapHi: number, xq8: number, yq8: number, angleDeg: number, speedQ8: number) => number;
  wlAgentControlMovementHash: (
    mapLo: number,
    mapHi: number,
    xq8: number,
    yq8: number,
    angleDeg: number,
    forwardQ8: number,
    strafeQ8: number,
    turnDeg: number,
  ) => number;
  wlAgentCmdFireHash: (ammo: number, weaponState: number, cooldown: number, buttonFire: number) => number;
  wlAgentCmdUseHash: (mapLo: number, mapHi: number, xq8: number, yq8: number, angleDeg: number, usePressed: number) => number;
  wlAgentTPlayerHash: (
    mapLo: number,
    mapHi: number,
    xq8: number,
    yq8: number,
    angleDeg: number,
    health: number,
    ammo: number,
    cooldown: number,
    flags: number,
    inputMask: number,
    rng: number,
  ) => number;
  wlPlayPlayLoopHash: (stateHash: number, tics: number, inputMask: number, rng: number) => number;
};

export class OracleBridge implements OracleBridgeContract {
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
      wlDrawFixedByFrac: cwrap('oracle_wl_draw_fixed_by_frac', 'number', ['number', 'number']),
      wlMainBuildTablesHash: cwrap('oracle_wl_main_build_tables_hash', 'number', []),
      wlMainCalcProjectionHash: cwrap('oracle_wl_main_calc_projection_hash', 'number', ['number', 'number']),
      idCaCarmackExpandHash: cwrap('oracle_id_ca_carmack_expand_hash', 'number', ['array', 'number', 'number']),
      idCaRlewExpandHash: cwrap('oracle_id_ca_rlew_expand_hash', 'number', ['array', 'number', 'number', 'number']),
      idCaSetupMapFileHash: cwrap('oracle_id_ca_setup_map_file_hash', 'number', ['array', 'number']),
      idCaCacheMapHash: cwrap('oracle_id_ca_cache_map_hash', 'number', ['array', 'number', 'array', 'number', 'number']),
      wlGameSetupGameLevelHash: cwrap('oracle_wl_game_setup_game_level_hash', 'number', ['array', 'number', 'number', 'number']),
      wlGameDrawPlayScreenHash: cwrap('oracle_wl_game_draw_play_screen_hash', 'number', [
        'number',
        'number',
        'number',
        'number',
        'number',
        'number',
        'number',
      ]),
      wlDrawTransformActorHash: cwrap('oracle_wl_draw_transform_actor_hash', 'number', [
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
      wlDrawTransformTileHash: cwrap('oracle_wl_draw_transform_tile_hash', 'number', [
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
      wlDrawCalcHeight: cwrap('oracle_wl_draw_calc_height', 'number', [
        'number',
        'number',
        'number',
        'number',
        'number',
        'number',
        'number',
        'number',
      ]),
      wlDrawHitVertWallHash: cwrap('oracle_wl_draw_hit_vert_wall_hash', 'number', [
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
        'number',
        'number',
      ]),
      wlDrawHitHorizWallHash: cwrap('oracle_wl_draw_hit_horiz_wall_hash', 'number', [
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
        'number',
        'number',
      ]),
      wlDrawWallRefreshHash: cwrap('oracle_wl_draw_wall_refresh_hash', 'number', ['number', 'number', 'number', 'number', 'number', 'number']),
      wlDrawThreeDRefreshHash: cwrap('oracle_wl_draw_three_d_refresh_hash', 'number', ['number', 'number', 'number', 'number', 'number']),
      wlScaleSetupScalingHash: cwrap('oracle_wl_scale_setup_scaling_hash', 'number', ['number', 'number']),
      wlScaleScaleShapeHash: cwrap('oracle_wl_scale_scale_shape_hash', 'number', [
        'number',
        'number',
        'number',
        'number',
        'number',
        'number',
        'number',
      ]),
      wlScaleSimpleScaleShapeHash: cwrap('oracle_wl_scale_simple_scale_shape_hash', 'number', ['number', 'number', 'number', 'number']),
      wlStateSelectDodgeDirHash: cwrap('oracle_wl_state_select_dodge_dir_hash', 'number', [
        'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number',
      ]),
      wlStateSelectChaseDirHash: cwrap('oracle_wl_state_select_chase_dir_hash', 'number', [
        'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number',
      ]),
      wlStateMoveObjHash: cwrap('oracle_wl_state_move_obj_hash', 'number', [
        'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number',
      ]),
      wlStateDamageActorHash: cwrap('oracle_wl_state_damage_actor_hash', 'number', [
        'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number',
      ]),
      wlStateCheckLine: cwrap('oracle_wl_state_check_line', 'number', ['number', 'number', 'number', 'number', 'number', 'number']),
      wlStateCheckSight: cwrap('oracle_wl_state_check_sight', 'number', ['number', 'number', 'number', 'number', 'number', 'number']),
      wlStateFirstSightingHash: cwrap('oracle_wl_state_first_sighting_hash', 'number', [
        'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number',
      ]),
      wlStateSightPlayerHash: cwrap('oracle_wl_state_sight_player_hash', 'number', [
        'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number',
      ]),
      wlAct2TBiteHash: cwrap('oracle_wl_act2_t_bite_hash', 'number', [
        'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number',
      ]),
      wlAct2TChaseHash: cwrap('oracle_wl_act2_t_chase_hash', 'number', [
        'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number',
      ]),
      wlAct2TDogChaseHash: cwrap('oracle_wl_act2_t_dogchase_hash', 'number', [
        'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number',
      ]),
      wlAct2TPathHash: cwrap('oracle_wl_act2_t_path_hash', 'number', [
        'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number',
      ]),
      wlAct2TProjectileHash: cwrap('oracle_wl_act2_t_projectile_hash', 'number', [
        'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number',
      ]),
      wlAct2TShootHash: cwrap('oracle_wl_act2_t_shoot_hash', 'number', [
        'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number',
      ]),
      idInReadControlHash: cwrap('oracle_id_in_read_control_hash', 'number', ['number', 'number', 'number', 'number']),
      idInUserInput: cwrap('oracle_id_in_user_input', 'number', ['number', 'number', 'number']),
      wlAgentTryMoveHash: cwrap('oracle_wl_agent_try_move_hash', 'number', ['number', 'number', 'number', 'number', 'number', 'number']),
      wlAgentClipMoveHash: cwrap('oracle_wl_agent_clip_move_hash', 'number', ['number', 'number', 'number', 'number', 'number', 'number']),
      wlAgentThrustHash: cwrap('oracle_wl_agent_thrust_hash', 'number', ['number', 'number', 'number', 'number', 'number', 'number']),
      wlAgentControlMovementHash: cwrap('oracle_wl_agent_control_movement_hash', 'number', [
        'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number',
      ]),
      wlAgentCmdFireHash: cwrap('oracle_wl_agent_cmd_fire_hash', 'number', ['number', 'number', 'number', 'number']),
      wlAgentCmdUseHash: cwrap('oracle_wl_agent_cmd_use_hash', 'number', ['number', 'number', 'number', 'number', 'number', 'number']),
      wlAgentTPlayerHash: cwrap('oracle_wl_agent_t_player_hash', 'number', [
        'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number',
      ]),
      wlPlayPlayLoopHash: cwrap('oracle_wl_play_play_loop_hash', 'number', ['number', 'number', 'number', 'number']),
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

  wlDrawFixedByFrac(a: number, b: number): number {
    return this.assertReady().wlDrawFixedByFrac(a | 0, b | 0) | 0;
  }

  wlMainBuildTablesHash(): number {
    return this.assertReady().wlMainBuildTablesHash() >>> 0;
  }

  wlMainCalcProjectionHash(viewWidth: number, focal: number): number {
    return this.assertReady().wlMainCalcProjectionHash(viewWidth | 0, focal | 0) >>> 0;
  }

  idCaCarmackExpandHash(sourceBytes: Uint8Array, expandedLengthBytes: number): number {
    const bytes = new Uint8Array(sourceBytes.buffer, sourceBytes.byteOffset, sourceBytes.byteLength);
    return this.assertReady().idCaCarmackExpandHash(bytes, bytes.byteLength, expandedLengthBytes | 0) >>> 0;
  }

  idCaRlewExpandHash(sourceWords: Uint16Array, expandedLengthBytes: number, rlewTag: number): number {
    const bytes = new Uint8Array(sourceWords.buffer, sourceWords.byteOffset, sourceWords.byteLength);
    return this.assertReady().idCaRlewExpandHash(bytes, bytes.byteLength, expandedLengthBytes | 0, rlewTag & 0xffff) >>> 0;
  }

  idCaSetupMapFileHash(mapheadBytes: Uint8Array): number {
    const bytes = new Uint8Array(mapheadBytes.buffer, mapheadBytes.byteOffset, mapheadBytes.byteLength);
    return this.assertReady().idCaSetupMapFileHash(bytes, bytes.byteLength) >>> 0;
  }

  idCaCacheMapHash(gamemapsBytes: Uint8Array, mapheadBytes: Uint8Array, mapnum: number): number {
    const gm = new Uint8Array(gamemapsBytes.buffer, gamemapsBytes.byteOffset, gamemapsBytes.byteLength);
    const mh = new Uint8Array(mapheadBytes.buffer, mapheadBytes.byteOffset, mapheadBytes.byteLength);
    return this.assertReady().idCaCacheMapHash(gm, gm.byteLength, mh, mh.byteLength, mapnum | 0) >>> 0;
  }

  wlGameSetupGameLevelHash(plane0Words: Uint16Array, mapWidth: number, mapHeight: number): number {
    const bytes = new Uint8Array(plane0Words.buffer, plane0Words.byteOffset, plane0Words.byteLength);
    return this.assertReady().wlGameSetupGameLevelHash(bytes, plane0Words.length | 0, mapWidth | 0, mapHeight | 0) >>> 0;
  }

  wlGameDrawPlayScreenHash(
    viewWidth: number,
    viewHeight: number,
    bufferOfs: number,
    screenLoc0: number,
    screenLoc1: number,
    screenLoc2: number,
    statusBarPic: number,
  ): number {
    return this.assertReady().wlGameDrawPlayScreenHash(
      viewWidth | 0,
      viewHeight | 0,
      bufferOfs | 0,
      screenLoc0 | 0,
      screenLoc1 | 0,
      screenLoc2 | 0,
      statusBarPic | 0,
    ) >>> 0;
  }

  wlDrawTransformActorHash(
    obx: number,
    oby: number,
    viewx: number,
    viewy: number,
    viewcos: number,
    viewsin: number,
    scale: number,
    centerx: number,
    heightnumerator: number,
    mindist: number,
  ): number {
    return this.assertReady().wlDrawTransformActorHash(
      obx | 0,
      oby | 0,
      viewx | 0,
      viewy | 0,
      viewcos | 0,
      viewsin | 0,
      scale | 0,
      centerx | 0,
      heightnumerator | 0,
      mindist | 0,
    ) >>> 0;
  }

  wlDrawTransformTileHash(
    tx: number,
    ty: number,
    viewx: number,
    viewy: number,
    viewcos: number,
    viewsin: number,
    scale: number,
    centerx: number,
    heightnumerator: number,
    mindist: number,
  ): number {
    return this.assertReady().wlDrawTransformTileHash(
      tx | 0,
      ty | 0,
      viewx | 0,
      viewy | 0,
      viewcos | 0,
      viewsin | 0,
      scale | 0,
      centerx | 0,
      heightnumerator | 0,
      mindist | 0,
    ) >>> 0;
  }

  wlDrawCalcHeight(
    xintercept: number,
    yintercept: number,
    viewx: number,
    viewy: number,
    viewcos: number,
    viewsin: number,
    heightnumerator: number,
    mindist: number,
  ): number {
    return this.assertReady().wlDrawCalcHeight(
      xintercept | 0,
      yintercept | 0,
      viewx | 0,
      viewy | 0,
      viewcos | 0,
      viewsin | 0,
      heightnumerator | 0,
      mindist | 0,
    ) | 0;
  }

  wlDrawHitVertWallHash(
    xintercept: number,
    yintercept: number,
    xtilestep: number,
    pixx: number,
    xtile: number,
    ytile: number,
    lastside: number,
    lastintercept: number,
    lasttilehit: number,
    tilehit: number,
    postsourceLow: number,
    postwidth: number,
    prevheight: number,
    adjacentDoor: number,
    wallpicNormal: number,
    wallpicDoor: number,
    viewx: number,
    viewy: number,
    viewcos: number,
    viewsin: number,
    heightnumerator: number,
    mindist: number,
  ): number {
    return this.assertReady().wlDrawHitVertWallHash(
      xintercept | 0,
      yintercept | 0,
      xtilestep | 0,
      pixx | 0,
      xtile | 0,
      ytile | 0,
      lastside | 0,
      lastintercept | 0,
      lasttilehit | 0,
      tilehit | 0,
      postsourceLow | 0,
      postwidth | 0,
      prevheight | 0,
      adjacentDoor | 0,
      wallpicNormal | 0,
      wallpicDoor | 0,
      viewx | 0,
      viewy | 0,
      viewcos | 0,
      viewsin | 0,
      heightnumerator | 0,
      mindist | 0,
    ) >>> 0;
  }

  wlDrawHitHorizWallHash(
    xintercept: number,
    yintercept: number,
    ytilestep: number,
    pixx: number,
    xtile: number,
    ytile: number,
    lastside: number,
    lastintercept: number,
    lasttilehit: number,
    tilehit: number,
    postsourceLow: number,
    postwidth: number,
    prevheight: number,
    adjacentDoor: number,
    wallpicNormal: number,
    wallpicDoor: number,
    viewx: number,
    viewy: number,
    viewcos: number,
    viewsin: number,
    heightnumerator: number,
    mindist: number,
  ): number {
    return this.assertReady().wlDrawHitHorizWallHash(
      xintercept | 0,
      yintercept | 0,
      ytilestep | 0,
      pixx | 0,
      xtile | 0,
      ytile | 0,
      lastside | 0,
      lastintercept | 0,
      lasttilehit | 0,
      tilehit | 0,
      postsourceLow | 0,
      postwidth | 0,
      prevheight | 0,
      adjacentDoor | 0,
      wallpicNormal | 0,
      wallpicDoor | 0,
      viewx | 0,
      viewy | 0,
      viewcos | 0,
      viewsin | 0,
      heightnumerator | 0,
      mindist | 0,
    ) >>> 0;
  }

  wlDrawWallRefreshHash(
    playerAngle: number,
    playerX: number,
    playerY: number,
    focallength: number,
    viewsin: number,
    viewcos: number,
  ): number {
    return this.assertReady().wlDrawWallRefreshHash(
      playerAngle | 0,
      playerX | 0,
      playerY | 0,
      focallength | 0,
      viewsin | 0,
      viewcos | 0,
    ) >>> 0;
  }

  wlDrawThreeDRefreshHash(
    bufferofs: number,
    screenofs: number,
    frameon: number,
    fizzlein: number,
    wallRefreshHash: number,
  ): number {
    return this.assertReady().wlDrawThreeDRefreshHash(
      bufferofs | 0,
      screenofs | 0,
      frameon | 0,
      fizzlein | 0,
      wallRefreshHash | 0,
    ) >>> 0;
  }

  wlScaleSetupScalingHash(maxscaleheightIn: number, viewheight: number): number {
    return this.assertReady().wlScaleSetupScalingHash(maxscaleheightIn | 0, viewheight | 0) >>> 0;
  }

  wlScaleScaleShapeHash(
    xcenter: number,
    leftpix: number,
    rightpix: number,
    height: number,
    maxscale: number,
    viewwidth: number,
    wallheightSeed: number,
  ): number {
    return this.assertReady().wlScaleScaleShapeHash(
      xcenter | 0,
      leftpix | 0,
      rightpix | 0,
      height | 0,
      maxscale | 0,
      viewwidth | 0,
      wallheightSeed | 0,
    ) >>> 0;
  }

  wlScaleSimpleScaleShapeHash(xcenter: number, leftpix: number, rightpix: number, height: number): number {
    return this.assertReady().wlScaleSimpleScaleShapeHash(xcenter | 0, leftpix | 0, rightpix | 0, height | 0) >>> 0;
  }

  wlStateSelectDodgeDirHash(...args: number[]): number {
    return this.assertReady().wlStateSelectDodgeDirHash(...args.map((n) => n | 0)) >>> 0;
  }

  wlStateSelectChaseDirHash(...args: number[]): number {
    return this.assertReady().wlStateSelectChaseDirHash(...args.map((n) => n | 0)) >>> 0;
  }

  wlStateMoveObjHash(...args: number[]): number {
    return this.assertReady().wlStateMoveObjHash(...args.map((n) => n | 0)) >>> 0;
  }

  wlStateDamageActorHash(...args: number[]): number {
    return this.assertReady().wlStateDamageActorHash(...args.map((n) => n | 0)) >>> 0;
  }

  wlStateCheckLine(ax: number, ay: number, px: number, py: number, mapLo: number, mapHi: number): number {
    return this.assertReady().wlStateCheckLine(ax | 0, ay | 0, px | 0, py | 0, mapLo >>> 0, mapHi >>> 0) | 0;
  }

  wlStateCheckSight(ax: number, ay: number, px: number, py: number, mapLo: number, mapHi: number): number {
    return this.assertReady().wlStateCheckSight(ax | 0, ay | 0, px | 0, py | 0, mapLo >>> 0, mapHi >>> 0) | 0;
  }

  wlStateFirstSightingHash(...args: number[]): number {
    return this.assertReady().wlStateFirstSightingHash(...args.map((n) => n | 0)) >>> 0;
  }

  wlStateSightPlayerHash(...args: number[]): number {
    return this.assertReady().wlStateSightPlayerHash(...args.map((n) => n | 0)) >>> 0;
  }

  wlAct2TBiteHash(...args: number[]): number {
    return this.assertReady().wlAct2TBiteHash(...args.map((n) => n | 0)) >>> 0;
  }

  wlAct2TChaseHash(...args: number[]): number {
    return this.assertReady().wlAct2TChaseHash(...args.map((n) => n | 0)) >>> 0;
  }

  wlAct2TDogChaseHash(...args: number[]): number {
    return this.assertReady().wlAct2TDogChaseHash(...args.map((n) => n | 0)) >>> 0;
  }

  wlAct2TPathHash(...args: number[]): number {
    return this.assertReady().wlAct2TPathHash(...args.map((n) => n | 0)) >>> 0;
  }

  wlAct2TProjectileHash(...args: number[]): number {
    return this.assertReady().wlAct2TProjectileHash(...args.map((n) => n | 0)) >>> 0;
  }

  wlAct2TShootHash(...args: number[]): number {
    return this.assertReady().wlAct2TShootHash(...args.map((n) => n | 0)) >>> 0;
  }

  idInReadControlHash(keyMask: number, mouseDx: number, mouseDy: number, buttonMask: number): number {
    return this.assertReady().idInReadControlHash(keyMask | 0, mouseDx | 0, mouseDy | 0, buttonMask | 0) >>> 0;
  }

  idInUserInput(delayTics: number, inputMask: number, rng: number): number {
    return this.assertReady().idInUserInput(delayTics | 0, inputMask | 0, rng | 0) | 0;
  }

  wlAgentTryMoveHash(mapLo: number, mapHi: number, xq8: number, yq8: number, dxq8: number, dyq8: number): number {
    return this.assertReady().wlAgentTryMoveHash(mapLo >>> 0, mapHi >>> 0, xq8 | 0, yq8 | 0, dxq8 | 0, dyq8 | 0) >>> 0;
  }

  wlAgentClipMoveHash(mapLo: number, mapHi: number, xq8: number, yq8: number, dxq8: number, dyq8: number): number {
    return this.assertReady().wlAgentClipMoveHash(mapLo >>> 0, mapHi >>> 0, xq8 | 0, yq8 | 0, dxq8 | 0, dyq8 | 0) >>> 0;
  }

  wlAgentThrustHash(mapLo: number, mapHi: number, xq8: number, yq8: number, angleDeg: number, speedQ8: number): number {
    return this.assertReady().wlAgentThrustHash(mapLo >>> 0, mapHi >>> 0, xq8 | 0, yq8 | 0, angleDeg | 0, speedQ8 | 0) >>> 0;
  }

  wlAgentControlMovementHash(
    mapLo: number,
    mapHi: number,
    xq8: number,
    yq8: number,
    angleDeg: number,
    forwardQ8: number,
    strafeQ8: number,
    turnDeg: number,
  ): number {
    return this.assertReady().wlAgentControlMovementHash(
      mapLo >>> 0,
      mapHi >>> 0,
      xq8 | 0,
      yq8 | 0,
      angleDeg | 0,
      forwardQ8 | 0,
      strafeQ8 | 0,
      turnDeg | 0,
    ) >>> 0;
  }

  wlAgentCmdFireHash(ammo: number, weaponState: number, cooldown: number, buttonFire: number): number {
    return this.assertReady().wlAgentCmdFireHash(ammo | 0, weaponState | 0, cooldown | 0, buttonFire | 0) >>> 0;
  }

  wlAgentCmdUseHash(mapLo: number, mapHi: number, xq8: number, yq8: number, angleDeg: number, usePressed: number): number {
    return this.assertReady().wlAgentCmdUseHash(mapLo >>> 0, mapHi >>> 0, xq8 | 0, yq8 | 0, angleDeg | 0, usePressed | 0) >>> 0;
  }

  wlAgentTPlayerHash(
    mapLo: number,
    mapHi: number,
    xq8: number,
    yq8: number,
    angleDeg: number,
    health: number,
    ammo: number,
    cooldown: number,
    flags: number,
    inputMask: number,
    rng: number,
  ): number {
    return this.assertReady().wlAgentTPlayerHash(
      mapLo >>> 0,
      mapHi >>> 0,
      xq8 | 0,
      yq8 | 0,
      angleDeg | 0,
      health | 0,
      ammo | 0,
      cooldown | 0,
      flags | 0,
      inputMask | 0,
      rng | 0,
    ) >>> 0;
  }

  wlPlayPlayLoopHash(stateHash: number, tics: number, inputMask: number, rng: number): number {
    return this.assertReady().wlPlayPlayLoopHash(stateHash >>> 0, tics | 0, inputMask | 0, rng | 0) >>> 0;
  }

  call<TInput, TOutput>(fn: OracleFunctionId, input: TInput): TOutput {
    switch (fn) {
      case 'wl_draw.FixedByFrac': {
        const { a, b } = input as { a: number; b: number };
        return this.wlDrawFixedByFrac(a, b) as TOutput;
      }
      case 'wl_main.BuildTablesHash': {
        return this.wlMainBuildTablesHash() as TOutput;
      }
      case 'wl_main.CalcProjectionHash': {
        const { viewWidth, focal } = input as { viewWidth: number; focal: number };
        return this.wlMainCalcProjectionHash(viewWidth, focal) as TOutput;
      }
      case 'id_ca.RLEWExpandChecksum': {
        const { sourceWords, expandedLengthBytes, rlewTag } = input as {
          sourceWords: Uint16Array;
          expandedLengthBytes: number;
          rlewTag: number;
        };
        return this.idCaRlewExpandHash(sourceWords, expandedLengthBytes, rlewTag) as TOutput;
      }
      case 'id_ca.CarmackExpandHash': {
        const { sourceBytes, expandedLengthBytes } = input as { sourceBytes: Uint8Array; expandedLengthBytes: number };
        return this.idCaCarmackExpandHash(sourceBytes, expandedLengthBytes) as TOutput;
      }
      case 'id_ca.RLEWExpandHash': {
        const { sourceWords, expandedLengthBytes, rlewTag } = input as {
          sourceWords: Uint16Array;
          expandedLengthBytes: number;
          rlewTag: number;
        };
        return this.idCaRlewExpandHash(sourceWords, expandedLengthBytes, rlewTag) as TOutput;
      }
      case 'id_ca.SetupMapFileHash': {
        const { mapheadBytes } = input as { mapheadBytes: Uint8Array };
        return this.idCaSetupMapFileHash(mapheadBytes) as TOutput;
      }
      case 'id_ca.CacheMapHash': {
        const { gamemapsBytes, mapheadBytes, mapnum } = input as {
          gamemapsBytes: Uint8Array;
          mapheadBytes: Uint8Array;
          mapnum: number;
        };
        return this.idCaCacheMapHash(gamemapsBytes, mapheadBytes, mapnum) as TOutput;
      }
      case 'wl_game.SetupGameLevelHash': {
        const { plane0Words, mapWidth, mapHeight } = input as {
          plane0Words: Uint16Array;
          mapWidth: number;
          mapHeight: number;
        };
        return this.wlGameSetupGameLevelHash(plane0Words, mapWidth, mapHeight) as TOutput;
      }
      case 'wl_game.DrawPlayScreenHash': {
        const { viewWidth, viewHeight, bufferOfs, screenLoc0, screenLoc1, screenLoc2, statusBarPic } = input as {
          viewWidth: number;
          viewHeight: number;
          bufferOfs: number;
          screenLoc0: number;
          screenLoc1: number;
          screenLoc2: number;
          statusBarPic: number;
        };
        return this.wlGameDrawPlayScreenHash(
          viewWidth,
          viewHeight,
          bufferOfs,
          screenLoc0,
          screenLoc1,
          screenLoc2,
          statusBarPic,
        ) as TOutput;
      }
      case 'wl_draw.TransformActorHash': {
        const { obx, oby, viewx, viewy, viewcos, viewsin, scale, centerx, heightnumerator, mindist } = input as Record<string, number>;
        return this.wlDrawTransformActorHash(obx, oby, viewx, viewy, viewcos, viewsin, scale, centerx, heightnumerator, mindist) as TOutput;
      }
      case 'wl_draw.TransformTileHash': {
        const { tx, ty, viewx, viewy, viewcos, viewsin, scale, centerx, heightnumerator, mindist } = input as Record<string, number>;
        return this.wlDrawTransformTileHash(tx, ty, viewx, viewy, viewcos, viewsin, scale, centerx, heightnumerator, mindist) as TOutput;
      }
      case 'wl_draw.CalcHeight': {
        const { xintercept, yintercept, viewx, viewy, viewcos, viewsin, heightnumerator, mindist } = input as Record<string, number>;
        return this.wlDrawCalcHeight(xintercept, yintercept, viewx, viewy, viewcos, viewsin, heightnumerator, mindist) as TOutput;
      }
      case 'wl_draw.HitVertWallHash': {
        const args = (input as { args: number[] }).args;
        return this.wlDrawHitVertWallHash(
          args[0] ?? 0,
          args[1] ?? 0,
          args[2] ?? 0,
          args[3] ?? 0,
          args[4] ?? 0,
          args[5] ?? 0,
          args[6] ?? 0,
          args[7] ?? 0,
          args[8] ?? 0,
          args[9] ?? 0,
          args[10] ?? 0,
          args[11] ?? 0,
          args[12] ?? 0,
          args[13] ?? 0,
          args[14] ?? 0,
          args[15] ?? 0,
          args[16] ?? 0,
          args[17] ?? 0,
          args[18] ?? 0,
          args[19] ?? 0,
          args[20] ?? 0,
          args[21] ?? 0,
        ) as TOutput;
      }
      case 'wl_draw.HitHorizWallHash': {
        const args = (input as { args: number[] }).args;
        return this.wlDrawHitHorizWallHash(
          args[0] ?? 0,
          args[1] ?? 0,
          args[2] ?? 0,
          args[3] ?? 0,
          args[4] ?? 0,
          args[5] ?? 0,
          args[6] ?? 0,
          args[7] ?? 0,
          args[8] ?? 0,
          args[9] ?? 0,
          args[10] ?? 0,
          args[11] ?? 0,
          args[12] ?? 0,
          args[13] ?? 0,
          args[14] ?? 0,
          args[15] ?? 0,
          args[16] ?? 0,
          args[17] ?? 0,
          args[18] ?? 0,
          args[19] ?? 0,
          args[20] ?? 0,
          args[21] ?? 0,
        ) as TOutput;
      }
      case 'wl_draw.WallRefreshHash': {
        const { playerAngle, playerX, playerY, focallength, viewsin, viewcos } = input as Record<string, number>;
        return this.wlDrawWallRefreshHash(playerAngle, playerX, playerY, focallength, viewsin, viewcos) as TOutput;
      }
      case 'wl_draw.ThreeDRefreshHash': {
        const { bufferofs, screenofs, frameon, fizzlein, wallRefreshHash } = input as Record<string, number>;
        return this.wlDrawThreeDRefreshHash(bufferofs, screenofs, frameon, fizzlein, wallRefreshHash) as TOutput;
      }
      case 'wl_scale.SetupScalingHash': {
        const { maxscaleheightIn, viewheight } = input as Record<string, number>;
        return this.wlScaleSetupScalingHash(maxscaleheightIn, viewheight) as TOutput;
      }
      case 'wl_scale.ScaleShapeHash': {
        const { xcenter, leftpix, rightpix, height, maxscale, viewwidth, wallheightSeed } = input as Record<string, number>;
        return this.wlScaleScaleShapeHash(xcenter, leftpix, rightpix, height, maxscale, viewwidth, wallheightSeed) as TOutput;
      }
      case 'wl_scale.SimpleScaleShapeHash': {
        const { xcenter, leftpix, rightpix, height } = input as Record<string, number>;
        return this.wlScaleSimpleScaleShapeHash(xcenter, leftpix, rightpix, height) as TOutput;
      }
      case 'wl_state.SelectDodgeDirHash': {
        return this.wlStateSelectDodgeDirHash(...(input as { args: number[] }).args) as TOutput;
      }
      case 'wl_state.SelectChaseDirHash': {
        return this.wlStateSelectChaseDirHash(...(input as { args: number[] }).args) as TOutput;
      }
      case 'wl_state.MoveObjHash': {
        return this.wlStateMoveObjHash(...(input as { args: number[] }).args) as TOutput;
      }
      case 'wl_state.DamageActorHash': {
        return this.wlStateDamageActorHash(...(input as { args: number[] }).args) as TOutput;
      }
      case 'wl_state.CheckLine': {
        const { ax, ay, px, py, mapLo, mapHi } = input as Record<string, number>;
        return this.wlStateCheckLine(ax, ay, px, py, mapLo, mapHi) as TOutput;
      }
      case 'wl_state.CheckSight': {
        const { ax, ay, px, py, mapLo, mapHi } = input as Record<string, number>;
        return this.wlStateCheckSight(ax, ay, px, py, mapLo, mapHi) as TOutput;
      }
      case 'wl_state.FirstSightingHash': {
        return this.wlStateFirstSightingHash(...(input as { args: number[] }).args) as TOutput;
      }
      case 'wl_state.SightPlayerHash': {
        return this.wlStateSightPlayerHash(...(input as { args: number[] }).args) as TOutput;
      }
      case 'wl_act2.TBiteHash': {
        return this.wlAct2TBiteHash(...(input as { args: number[] }).args) as TOutput;
      }
      case 'wl_act2.TChaseHash': {
        return this.wlAct2TChaseHash(...(input as { args: number[] }).args) as TOutput;
      }
      case 'wl_act2.TDogChaseHash': {
        return this.wlAct2TDogChaseHash(...(input as { args: number[] }).args) as TOutput;
      }
      case 'wl_act2.TPathHash': {
        return this.wlAct2TPathHash(...(input as { args: number[] }).args) as TOutput;
      }
      case 'wl_act2.TProjectileHash': {
        return this.wlAct2TProjectileHash(...(input as { args: number[] }).args) as TOutput;
      }
      case 'wl_act2.TShootHash': {
        return this.wlAct2TShootHash(...(input as { args: number[] }).args) as TOutput;
      }
      case 'id_in.IN_ReadControlHash': {
        const { keyMask, mouseDx, mouseDy, buttonMask } = input as Record<string, number>;
        return this.idInReadControlHash(keyMask, mouseDx, mouseDy, buttonMask) as TOutput;
      }
      case 'id_in.IN_UserInput': {
        const { delayTics, inputMask, rng } = input as Record<string, number>;
        return this.idInUserInput(delayTics, inputMask, rng) as TOutput;
      }
      case 'wl_agent.TryMoveHash': {
        const { mapLo, mapHi, xq8, yq8, dxq8, dyq8 } = input as Record<string, number>;
        return this.wlAgentTryMoveHash(mapLo, mapHi, xq8, yq8, dxq8, dyq8) as TOutput;
      }
      case 'wl_agent.ClipMoveHash': {
        const { mapLo, mapHi, xq8, yq8, dxq8, dyq8 } = input as Record<string, number>;
        return this.wlAgentClipMoveHash(mapLo, mapHi, xq8, yq8, dxq8, dyq8) as TOutput;
      }
      case 'wl_agent.ThrustHash': {
        const { mapLo, mapHi, xq8, yq8, angleDeg, speedQ8 } = input as Record<string, number>;
        return this.wlAgentThrustHash(mapLo, mapHi, xq8, yq8, angleDeg, speedQ8) as TOutput;
      }
      case 'wl_agent.ControlMovementHash': {
        const { mapLo, mapHi, xq8, yq8, angleDeg, forwardQ8, strafeQ8, turnDeg } = input as Record<string, number>;
        return this.wlAgentControlMovementHash(mapLo, mapHi, xq8, yq8, angleDeg, forwardQ8, strafeQ8, turnDeg) as TOutput;
      }
      case 'wl_agent.Cmd_FireHash': {
        const { ammo, weaponState, cooldown, buttonFire } = input as Record<string, number>;
        return this.wlAgentCmdFireHash(ammo, weaponState, cooldown, buttonFire) as TOutput;
      }
      case 'wl_agent.Cmd_UseHash': {
        const { mapLo, mapHi, xq8, yq8, angleDeg, usePressed } = input as Record<string, number>;
        return this.wlAgentCmdUseHash(mapLo, mapHi, xq8, yq8, angleDeg, usePressed) as TOutput;
      }
      case 'wl_agent.T_PlayerHash': {
        const { mapLo, mapHi, xq8, yq8, angleDeg, health, ammo, cooldown, flags, inputMask, rng } = input as Record<string, number>;
        return this.wlAgentTPlayerHash(mapLo, mapHi, xq8, yq8, angleDeg, health, ammo, cooldown, flags, inputMask, rng) as TOutput;
      }
      case 'wl_play.PlayLoopHash': {
        const { stateHash, tics, inputMask, rng } = input as Record<string, number>;
        return this.wlPlayPlayLoopHash(stateHash, tics, inputMask, rng) as TOutput;
      }
      default:
        throw new Error(`call() not mapped for oracle function: ${fn}`);
    }
  }

  resetState(): void {
    // Current oracle exports are pure/stateless per call for supported functions.
  }

  async shutdown(): Promise<void> {
    this.fns = null;
    this.module = null;
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
