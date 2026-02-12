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
  idMmGetPtrHash: (freeBytes: number, requestSize: number, purgeMask: number, lockMask: number) => number;
  idMmFreePtrHash: (freeBytes: number, blockSize: number, allocMask: number, slot: number) => number;
  idMmSetPurgeHash: (purgeMask: number, lockMask: number, slot: number, purgeLevel: number) => number;
  idMmSetLockHash: (lockMask: number, slot: number, locked: number) => number;
  idMmSortMemHash: (allocMask: number, purgeMask: number, lockMask: number, lowWaterMark: number) => number;
  idPmCheckMainMemHash: (pageCount: number, residentMask: number, lockMask: number, pageSize: number) => number;
  idPmGetPageAddressHash: (residentMask: number, pageNum: number, pageSize: number, frame: number) => number;
  idPmGetPageHash: (residentMask: number, lockMask: number, pageNum: number, frame: number) => number;
  idPmNextFrameHash: (residentMask: number, lockMask: number, frame: number) => number;
  idPmResetHash: (pageCount: number, preloadMask: number, frameSeed: number) => number;
  idVhVwMeasurePropStringHash: (textLen: number, fontWidth: number, spacing: number, maxWidth: number) => number;
  idVhVwbDrawPicHash: (x: number, y: number, picnum: number, bufferofs: number, screenofs: number) => number;
  idVhVwbBarHash: (x: number, y: number, width: number, height: number, color: number) => number;
  idVlVlBarHash: (x: number, y: number, width: number, height: number, color: number, linewidth: number) => number;
  idVlVlMemToScreenHash: (srcLen: number, width: number, height: number, dest: number, mask: number) => number;
  idVlVlLatchToScreenHash: (source: number, width: number, height: number, x: number, y: number) => number;
  idVlVlFadeInHash: (start: number, end: number, steps: number, paletteSeed: number) => number;
  idVlVlFadeOutHash: (start: number, end: number, steps: number, paletteSeed: number) => number;
  idVlVlPlotHash: (x: number, y: number, color: number, linewidth: number) => number;
  idVlVlHlinHash: (x: number, y: number, width: number, color: number, linewidth: number) => number;
  idVhVwbPlotHash: (x: number, y: number, color: number, linewidth: number) => number;
  idVhVwbHlinHash: (x: number, y: number, width: number, color: number, linewidth: number) => number;
  idVhVwbVlinHash: (x: number, y: number, height: number, color: number, linewidth: number) => number;
  idVhVwlMeasureStringHash: (textLen: number, fontWidth: number, fontHeight: number, maxWidth: number) => number;
  idVhVwbDrawPropStringHash: (textLen: number, x: number, y: number, color: number, maxWidth: number) => number;
  idVlVlVlinHash: (x: number, y: number, height: number, color: number, linewidth: number) => number;
  idVlVlScreenToScreenHash: (source: number, dest: number, width: number, height: number, linewidth: number) => number;
  idVlVlMaskedToScreenHash: (source: number, width: number, height: number, x: number, y: number, mask: number) => number;
  idVlVlMemToLatchHash: (sourceLen: number, width: number, height: number, dest: number) => number;
  idVlVlClearVideoHash: (color: number, linewidth: number, pages: number, bufferofs: number) => number;
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
  wlStateRealCheckLine: (obx: number, oby: number, px: number, py: number, doorMask: number, doorPosQ8: number) => number;
  wlStateRealCheckSight: (
    obx: number,
    oby: number,
    px: number,
    py: number,
    dir: number,
    areaConnected: number,
    doorMask: number,
    doorPosQ8: number,
  ) => number;
  wlAgentRealTryMove: (x: number, y: number, mapLo: number, mapHi: number) => number;
  wlAgentRealClipMoveHash: (x: number, y: number, xmove: number, ymove: number, mapLo: number, mapHi: number, noclip: number) => number;
  wlStateRealMoveObjHash: (
    obx: number,
    oby: number,
    dir: number,
    playerx: number,
    playery: number,
    areaConnected: number,
    distance: number,
    move: number,
    obclass: number,
    tics: number,
  ) => number;
  wlStateRealSelectChaseDirHash: (
    obTileX: number,
    obTileY: number,
    dir: number,
    obclass: number,
    flags: number,
    playerTileX: number,
    playerTileY: number,
  ) => number;
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
  wlAct1CloseDoorHash: (doorMask: number, doorState: number, doorNum: number, speed: number, blocked: number) => number;
  wlAct1MoveDoorsHash: (doorMask: number, doorState: number, tics: number, speed: number, activeMask: number) => number;
  wlAct1OpenDoorHash: (doorMask: number, doorState: number, doorNum: number, speed: number, blocked: number) => number;
  wlAct1OperateDoorHash: (
    doorMask: number,
    doorState: number,
    doorNum: number,
    action: number,
    speed: number,
    blocked: number,
  ) => number;
  wlAct1PushWallHash: (mapLo: number, mapHi: number, pushX: number, pushY: number, dir: number, steps: number) => number;
  wlAct1SpawnDoorHash: (doorMask: number, doorState: number, tile: number, lock: number, vertical: number) => number;
  wlAgentGetBonusHash: (
    score: number,
    lives: number,
    health: number,
    ammo: number,
    keys: number,
    bonusKind: number,
    value: number,
  ) => number;
  wlAgentGiveAmmoHash: (ammo: number, maxAmmo: number, amount: number, weaponOwned: number) => number;
  wlAgentGivePointsHash: (score: number, lives: number, nextExtra: number, points: number) => number;
  wlAgentHealSelfHash: (health: number, maxHealth: number, amount: number) => number;
  wlAgentTakeDamageHash: (health: number, lives: number, damage: number, godMode: number, rng: number) => number;
  wlGameGameLoopHash: (
    stateHash: number,
    tics: number,
    inputMask: number,
    rng: number,
    doorHash: number,
    playerHash: number,
    actorHash: number,
  ) => number;
  wlInterCheckHighScoreHash: (newScore: number, s0: number, s1: number, s2: number, s3: number, s4: number) => number;
  wlInterLevelCompletedHash: (
    score: number,
    timeSec: number,
    parSec: number,
    killsFound: number,
    killsTotal: number,
    secretsFound: number,
    secretsTotal: number,
    treasureFound: number,
    treasureTotal: number,
    lives: number,
  ) => number;
  wlInterVictoryHash: (
    totalScore: number,
    totalTime: number,
    totalKills: number,
    totalSecrets: number,
    totalTreasures: number,
    episode: number,
    difficulty: number,
  ) => number;
  idUs1UsCPrintHash: (windowX: number, windowW: number, textLen: number, align: number, fontWidth: number) => number;
  idUs1UsDrawWindowHash: (x: number, y: number, w: number, h: number, frameColor: number, fillColor: number) => number;
  idUs1UsPrintHash: (cursorX: number, cursorY: number, textLen: number, color: number, fontWidth: number) => number;
  wlMenuCpControlHash: (mouseEnabled: number, joystickEnabled: number, sensitivity: number, action: number) => number;
  wlMenuCpNewGameHash: (difficulty: number, episode: number, startLevel: number, weapon: number) => number;
  wlMenuCpSoundHash: (soundMode: number, musicMode: number, digiMode: number, action: number) => number;
  wlMenuCpViewScoresHash: (top0: number, top1: number, top2: number, top3: number, top4: number, newScore: number) => number;
  wlMenuDrawMainMenuHash: (selected: number, enabledMask: number, episode: number) => number;
  wlMenuDrawMenuHash: (menuId: number, cursor: number, itemCount: number, disabledMask: number, scroll: number) => number;
  wlMenuMessageHash: (messageLen: number, waitForAck: number, inputMask: number, rng: number) => number;
  wlMenuUsControlPanelHash: (screen: number, cursor: number, inputMask: number, menuItems: number) => number;
  wlTextEndTextHash: (textLen: number, scrollPos: number, speed: number, inputMask: number) => number;
  wlTextHelpScreensHash: (page: number, totalPages: number, inputMask: number, rng: number) => number;
  idCaCacheAudioChunkHash: (chunkNum: number, offset: number, nextOffset: number, audiotLen: number, cacheMask: number) => number;
  idCaCalSetupAudioFileHash: (audiohedLen: number, audiotLen: number, start: number) => number;
  idSdPlaySoundHash: (soundMode: number, soundId: number, priority: number, currentPriority: number, channelBusy: number) => number;
  idSdSetMusicModeHash: (currentMode: number, requestedMode: number, hasDevice: number) => number;
  idSdSetSoundModeHash: (currentMode: number, requestedMode: number, hasDevice: number) => number;
  idSdStopSoundHash: (channelBusy: number, currentSound: number, currentPriority: number) => number;
  wlGamePlaySoundLocGlobalHash: (
    soundMode: number,
    soundId: number,
    gx: number,
    gy: number,
    listenerX: number,
    listenerY: number,
    channelBusy: number,
  ) => number;
  wlGameSetSoundLocHash: (gx: number, gy: number, listenerX: number, listenerY: number) => number;
  wlGameUpdateSoundLocHash: (
    gx: number,
    gy: number,
    listenerX: number,
    listenerY: number,
    velocityX: number,
    velocityY: number,
  ) => number;
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
      idMmGetPtrHash: cwrap('oracle_id_mm_mm_get_ptr_hash', 'number', ['number', 'number', 'number', 'number']),
      idMmFreePtrHash: cwrap('oracle_id_mm_mm_free_ptr_hash', 'number', ['number', 'number', 'number', 'number']),
      idMmSetPurgeHash: cwrap('oracle_id_mm_mm_set_purge_hash', 'number', ['number', 'number', 'number', 'number']),
      idMmSetLockHash: cwrap('oracle_id_mm_mm_set_lock_hash', 'number', ['number', 'number', 'number']),
      idMmSortMemHash: cwrap('oracle_id_mm_mm_sort_mem_hash', 'number', ['number', 'number', 'number', 'number']),
      idPmCheckMainMemHash: cwrap('oracle_id_pm_pm_check_main_mem_hash', 'number', ['number', 'number', 'number', 'number']),
      idPmGetPageAddressHash: cwrap('oracle_id_pm_pm_get_page_address_hash', 'number', ['number', 'number', 'number', 'number']),
      idPmGetPageHash: cwrap('oracle_id_pm_pm_get_page_hash', 'number', ['number', 'number', 'number', 'number']),
      idPmNextFrameHash: cwrap('oracle_id_pm_pm_next_frame_hash', 'number', ['number', 'number', 'number']),
      idPmResetHash: cwrap('oracle_id_pm_pm_reset_hash', 'number', ['number', 'number', 'number']),
      idVhVwMeasurePropStringHash: cwrap('oracle_id_vh_vw_measure_prop_string_hash', 'number', ['number', 'number', 'number', 'number']),
      idVhVwbDrawPicHash: cwrap('oracle_id_vh_vwb_draw_pic_hash', 'number', ['number', 'number', 'number', 'number', 'number']),
      idVhVwbBarHash: cwrap('oracle_id_vh_vwb_bar_hash', 'number', ['number', 'number', 'number', 'number', 'number']),
      idVlVlBarHash: cwrap('oracle_id_vl_vl_bar_hash', 'number', ['number', 'number', 'number', 'number', 'number', 'number']),
      idVlVlMemToScreenHash: cwrap('oracle_id_vl_vl_mem_to_screen_hash', 'number', ['number', 'number', 'number', 'number', 'number']),
      idVlVlLatchToScreenHash: cwrap('oracle_id_vl_vl_latch_to_screen_hash', 'number', ['number', 'number', 'number', 'number', 'number']),
      idVlVlFadeInHash: cwrap('oracle_id_vl_vl_fade_in_hash', 'number', ['number', 'number', 'number', 'number']),
      idVlVlFadeOutHash: cwrap('oracle_id_vl_vl_fade_out_hash', 'number', ['number', 'number', 'number', 'number']),
      idVlVlPlotHash: cwrap('oracle_id_vl_vl_plot_hash', 'number', ['number', 'number', 'number', 'number']),
      idVlVlHlinHash: cwrap('oracle_id_vl_vl_hlin_hash', 'number', ['number', 'number', 'number', 'number', 'number']),
      idVhVwbPlotHash: cwrap('oracle_id_vh_vwb_plot_hash', 'number', ['number', 'number', 'number', 'number']),
      idVhVwbHlinHash: cwrap('oracle_id_vh_vwb_hlin_hash', 'number', ['number', 'number', 'number', 'number', 'number']),
      idVhVwbVlinHash: cwrap('oracle_id_vh_vwb_vlin_hash', 'number', ['number', 'number', 'number', 'number', 'number']),
      idVhVwlMeasureStringHash: cwrap('oracle_id_vh_vwl_measure_string_hash', 'number', ['number', 'number', 'number', 'number']),
      idVhVwbDrawPropStringHash: cwrap('oracle_id_vh_vwb_draw_prop_string_hash', 'number', ['number', 'number', 'number', 'number', 'number']),
      idVlVlVlinHash: cwrap('oracle_id_vl_vl_vlin_hash', 'number', ['number', 'number', 'number', 'number', 'number']),
      idVlVlScreenToScreenHash: cwrap('oracle_id_vl_vl_screen_to_screen_hash', 'number', ['number', 'number', 'number', 'number', 'number']),
      idVlVlMaskedToScreenHash: cwrap('oracle_id_vl_vl_masked_to_screen_hash', 'number', ['number', 'number', 'number', 'number', 'number', 'number']),
      idVlVlMemToLatchHash: cwrap('oracle_id_vl_vl_mem_to_latch_hash', 'number', ['number', 'number', 'number', 'number']),
      idVlVlClearVideoHash: cwrap('oracle_id_vl_vl_clear_video_hash', 'number', ['number', 'number', 'number', 'number']),
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
      wlStateRealCheckLine: cwrap('oracle_real_wl_state_check_line', 'number', ['number', 'number', 'number', 'number', 'number', 'number']),
      wlStateRealCheckSight: cwrap('oracle_real_wl_state_check_sight', 'number', [
        'number',
        'number',
        'number',
        'number',
        'number',
        'number',
        'number',
        'number',
      ]),
      wlAgentRealTryMove: cwrap('oracle_real_wl_agent_try_move', 'number', ['number', 'number', 'number', 'number']),
      wlAgentRealClipMoveHash: cwrap('oracle_real_wl_agent_clip_move_hash', 'number', [
        'number',
        'number',
        'number',
        'number',
        'number',
        'number',
        'number',
      ]),
      wlStateRealMoveObjHash: cwrap('oracle_real_wl_state_move_obj_hash', 'number', [
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
      wlStateRealSelectChaseDirHash: cwrap('oracle_real_wl_state_select_chase_dir_hash', 'number', [
        'number',
        'number',
        'number',
        'number',
        'number',
        'number',
        'number',
      ]),
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
      wlAct1CloseDoorHash: cwrap('oracle_wl_act1_close_door_hash', 'number', ['number', 'number', 'number', 'number', 'number']),
      wlAct1MoveDoorsHash: cwrap('oracle_wl_act1_move_doors_hash', 'number', ['number', 'number', 'number', 'number', 'number']),
      wlAct1OpenDoorHash: cwrap('oracle_wl_act1_open_door_hash', 'number', ['number', 'number', 'number', 'number', 'number']),
      wlAct1OperateDoorHash: cwrap('oracle_wl_act1_operate_door_hash', 'number', ['number', 'number', 'number', 'number', 'number', 'number']),
      wlAct1PushWallHash: cwrap('oracle_wl_act1_push_wall_hash', 'number', ['number', 'number', 'number', 'number', 'number', 'number']),
      wlAct1SpawnDoorHash: cwrap('oracle_wl_act1_spawn_door_hash', 'number', ['number', 'number', 'number', 'number', 'number']),
      wlAgentGetBonusHash: cwrap('oracle_wl_agent_get_bonus_hash', 'number', ['number', 'number', 'number', 'number', 'number', 'number', 'number']),
      wlAgentGiveAmmoHash: cwrap('oracle_wl_agent_give_ammo_hash', 'number', ['number', 'number', 'number', 'number']),
      wlAgentGivePointsHash: cwrap('oracle_wl_agent_give_points_hash', 'number', ['number', 'number', 'number', 'number']),
      wlAgentHealSelfHash: cwrap('oracle_wl_agent_heal_self_hash', 'number', ['number', 'number', 'number']),
      wlAgentTakeDamageHash: cwrap('oracle_wl_agent_take_damage_hash', 'number', ['number', 'number', 'number', 'number', 'number']),
      wlGameGameLoopHash: cwrap('oracle_wl_game_game_loop_hash', 'number', ['number', 'number', 'number', 'number', 'number', 'number', 'number']),
      wlInterCheckHighScoreHash: cwrap('oracle_wl_inter_check_high_score_hash', 'number', ['number', 'number', 'number', 'number', 'number', 'number']),
      wlInterLevelCompletedHash: cwrap('oracle_wl_inter_level_completed_hash', 'number', [
        'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number',
      ]),
      wlInterVictoryHash: cwrap('oracle_wl_inter_victory_hash', 'number', ['number', 'number', 'number', 'number', 'number', 'number', 'number']),
      idUs1UsCPrintHash: cwrap('oracle_id_us_1_us_cprint_hash', 'number', ['number', 'number', 'number', 'number', 'number']),
      idUs1UsDrawWindowHash: cwrap('oracle_id_us_1_us_draw_window_hash', 'number', ['number', 'number', 'number', 'number', 'number', 'number']),
      idUs1UsPrintHash: cwrap('oracle_id_us_1_us_print_hash', 'number', ['number', 'number', 'number', 'number', 'number']),
      wlMenuCpControlHash: cwrap('oracle_wl_menu_cp_control_hash', 'number', ['number', 'number', 'number', 'number']),
      wlMenuCpNewGameHash: cwrap('oracle_wl_menu_cp_new_game_hash', 'number', ['number', 'number', 'number', 'number']),
      wlMenuCpSoundHash: cwrap('oracle_wl_menu_cp_sound_hash', 'number', ['number', 'number', 'number', 'number']),
      wlMenuCpViewScoresHash: cwrap('oracle_wl_menu_cp_view_scores_hash', 'number', ['number', 'number', 'number', 'number', 'number', 'number']),
      wlMenuDrawMainMenuHash: cwrap('oracle_wl_menu_draw_main_menu_hash', 'number', ['number', 'number', 'number']),
      wlMenuDrawMenuHash: cwrap('oracle_wl_menu_draw_menu_hash', 'number', ['number', 'number', 'number', 'number', 'number']),
      wlMenuMessageHash: cwrap('oracle_wl_menu_message_hash', 'number', ['number', 'number', 'number', 'number']),
      wlMenuUsControlPanelHash: cwrap('oracle_wl_menu_us_control_panel_hash', 'number', ['number', 'number', 'number', 'number']),
      wlTextEndTextHash: cwrap('oracle_wl_text_end_text_hash', 'number', ['number', 'number', 'number', 'number']),
      wlTextHelpScreensHash: cwrap('oracle_wl_text_help_screens_hash', 'number', ['number', 'number', 'number', 'number']),
      idCaCacheAudioChunkHash: cwrap('oracle_id_ca_ca_cache_audio_chunk_hash', 'number', ['number', 'number', 'number', 'number', 'number']),
      idCaCalSetupAudioFileHash: cwrap('oracle_id_ca_cal_setup_audio_file_hash', 'number', ['number', 'number', 'number']),
      idSdPlaySoundHash: cwrap('oracle_id_sd_sd_play_sound_hash', 'number', ['number', 'number', 'number', 'number', 'number']),
      idSdSetMusicModeHash: cwrap('oracle_id_sd_sd_set_music_mode_hash', 'number', ['number', 'number', 'number']),
      idSdSetSoundModeHash: cwrap('oracle_id_sd_sd_set_sound_mode_hash', 'number', ['number', 'number', 'number']),
      idSdStopSoundHash: cwrap('oracle_id_sd_sd_stop_sound_hash', 'number', ['number', 'number', 'number']),
      wlGamePlaySoundLocGlobalHash: cwrap('oracle_wl_game_play_sound_loc_global_hash', 'number', [
        'number', 'number', 'number', 'number', 'number', 'number', 'number',
      ]),
      wlGameSetSoundLocHash: cwrap('oracle_wl_game_set_sound_loc_hash', 'number', ['number', 'number', 'number', 'number']),
      wlGameUpdateSoundLocHash: cwrap('oracle_wl_game_update_sound_loc_hash', 'number', ['number', 'number', 'number', 'number', 'number', 'number']),
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

  idMmGetPtrHash(freeBytes: number, requestSize: number, purgeMask: number, lockMask: number): number {
    return this.assertReady().idMmGetPtrHash(freeBytes | 0, requestSize | 0, purgeMask | 0, lockMask | 0) >>> 0;
  }

  idMmFreePtrHash(freeBytes: number, blockSize: number, allocMask: number, slot: number): number {
    return this.assertReady().idMmFreePtrHash(freeBytes | 0, blockSize | 0, allocMask | 0, slot | 0) >>> 0;
  }

  idMmSetPurgeHash(purgeMask: number, lockMask: number, slot: number, purgeLevel: number): number {
    return this.assertReady().idMmSetPurgeHash(purgeMask | 0, lockMask | 0, slot | 0, purgeLevel | 0) >>> 0;
  }

  idMmSetLockHash(lockMask: number, slot: number, locked: number): number {
    return this.assertReady().idMmSetLockHash(lockMask | 0, slot | 0, locked | 0) >>> 0;
  }

  idMmSortMemHash(allocMask: number, purgeMask: number, lockMask: number, lowWaterMark: number): number {
    return this.assertReady().idMmSortMemHash(allocMask | 0, purgeMask | 0, lockMask | 0, lowWaterMark | 0) >>> 0;
  }

  idPmCheckMainMemHash(pageCount: number, residentMask: number, lockMask: number, pageSize: number): number {
    return this.assertReady().idPmCheckMainMemHash(pageCount | 0, residentMask | 0, lockMask | 0, pageSize | 0) >>> 0;
  }

  idPmGetPageAddressHash(residentMask: number, pageNum: number, pageSize: number, frame: number): number {
    return this.assertReady().idPmGetPageAddressHash(residentMask | 0, pageNum | 0, pageSize | 0, frame | 0) >>> 0;
  }

  idPmGetPageHash(residentMask: number, lockMask: number, pageNum: number, frame: number): number {
    return this.assertReady().idPmGetPageHash(residentMask | 0, lockMask | 0, pageNum | 0, frame | 0) >>> 0;
  }

  idPmNextFrameHash(residentMask: number, lockMask: number, frame: number): number {
    return this.assertReady().idPmNextFrameHash(residentMask | 0, lockMask | 0, frame | 0) >>> 0;
  }

  idPmResetHash(pageCount: number, preloadMask: number, frameSeed: number): number {
    return this.assertReady().idPmResetHash(pageCount | 0, preloadMask | 0, frameSeed | 0) >>> 0;
  }

  idVhVwMeasurePropStringHash(textLen: number, fontWidth: number, spacing: number, maxWidth: number): number {
    return this.assertReady().idVhVwMeasurePropStringHash(textLen | 0, fontWidth | 0, spacing | 0, maxWidth | 0) >>> 0;
  }

  idVhVwbDrawPicHash(x: number, y: number, picnum: number, bufferofs: number, screenofs: number): number {
    return this.assertReady().idVhVwbDrawPicHash(x | 0, y | 0, picnum | 0, bufferofs | 0, screenofs | 0) >>> 0;
  }

  idVhVwbBarHash(x: number, y: number, width: number, height: number, color: number): number {
    return this.assertReady().idVhVwbBarHash(x | 0, y | 0, width | 0, height | 0, color | 0) >>> 0;
  }

  idVlVlBarHash(x: number, y: number, width: number, height: number, color: number, linewidth: number): number {
    return this.assertReady().idVlVlBarHash(x | 0, y | 0, width | 0, height | 0, color | 0, linewidth | 0) >>> 0;
  }

  idVlVlMemToScreenHash(srcLen: number, width: number, height: number, dest: number, mask: number): number {
    return this.assertReady().idVlVlMemToScreenHash(srcLen | 0, width | 0, height | 0, dest | 0, mask | 0) >>> 0;
  }

  idVlVlLatchToScreenHash(source: number, width: number, height: number, x: number, y: number): number {
    return this.assertReady().idVlVlLatchToScreenHash(source | 0, width | 0, height | 0, x | 0, y | 0) >>> 0;
  }

  idVlVlFadeInHash(start: number, end: number, steps: number, paletteSeed: number): number {
    return this.assertReady().idVlVlFadeInHash(start | 0, end | 0, steps | 0, paletteSeed | 0) >>> 0;
  }

  idVlVlFadeOutHash(start: number, end: number, steps: number, paletteSeed: number): number {
    return this.assertReady().idVlVlFadeOutHash(start | 0, end | 0, steps | 0, paletteSeed | 0) >>> 0;
  }

  idVlVlPlotHash(x: number, y: number, color: number, linewidth: number): number {
    return this.assertReady().idVlVlPlotHash(x | 0, y | 0, color | 0, linewidth | 0) >>> 0;
  }

  idVlVlHlinHash(x: number, y: number, width: number, color: number, linewidth: number): number {
    return this.assertReady().idVlVlHlinHash(x | 0, y | 0, width | 0, color | 0, linewidth | 0) >>> 0;
  }

  idVhVwbPlotHash(x: number, y: number, color: number, linewidth: number): number {
    return this.assertReady().idVhVwbPlotHash(x | 0, y | 0, color | 0, linewidth | 0) >>> 0;
  }

  idVhVwbHlinHash(x: number, y: number, width: number, color: number, linewidth: number): number {
    return this.assertReady().idVhVwbHlinHash(x | 0, y | 0, width | 0, color | 0, linewidth | 0) >>> 0;
  }

  idVhVwbVlinHash(x: number, y: number, height: number, color: number, linewidth: number): number {
    return this.assertReady().idVhVwbVlinHash(x | 0, y | 0, height | 0, color | 0, linewidth | 0) >>> 0;
  }

  idVhVwlMeasureStringHash(textLen: number, fontWidth: number, fontHeight: number, maxWidth: number): number {
    return this.assertReady().idVhVwlMeasureStringHash(textLen | 0, fontWidth | 0, fontHeight | 0, maxWidth | 0) >>> 0;
  }

  idVhVwbDrawPropStringHash(textLen: number, x: number, y: number, color: number, maxWidth: number): number {
    return this.assertReady().idVhVwbDrawPropStringHash(textLen | 0, x | 0, y | 0, color | 0, maxWidth | 0) >>> 0;
  }

  idVlVlVlinHash(x: number, y: number, height: number, color: number, linewidth: number): number {
    return this.assertReady().idVlVlVlinHash(x | 0, y | 0, height | 0, color | 0, linewidth | 0) >>> 0;
  }

  idVlVlScreenToScreenHash(source: number, dest: number, width: number, height: number, linewidth: number): number {
    return this.assertReady().idVlVlScreenToScreenHash(source | 0, dest | 0, width | 0, height | 0, linewidth | 0) >>> 0;
  }

  idVlVlMaskedToScreenHash(source: number, width: number, height: number, x: number, y: number, mask: number): number {
    return this.assertReady().idVlVlMaskedToScreenHash(source | 0, width | 0, height | 0, x | 0, y | 0, mask | 0) >>> 0;
  }

  idVlVlMemToLatchHash(sourceLen: number, width: number, height: number, dest: number): number {
    return this.assertReady().idVlVlMemToLatchHash(sourceLen | 0, width | 0, height | 0, dest | 0) >>> 0;
  }

  idVlVlClearVideoHash(color: number, linewidth: number, pages: number, bufferofs: number): number {
    return this.assertReady().idVlVlClearVideoHash(color | 0, linewidth | 0, pages | 0, bufferofs | 0) >>> 0;
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

  wlStateRealCheckLine(obx: number, oby: number, px: number, py: number, doorMask: number, doorPosQ8: number): number {
    return this.assertReady().wlStateRealCheckLine(obx | 0, oby | 0, px | 0, py | 0, doorMask >>> 0, doorPosQ8 >>> 0) | 0;
  }

  wlStateRealCheckSight(
    obx: number,
    oby: number,
    px: number,
    py: number,
    dir: number,
    areaConnected: number,
    doorMask: number,
    doorPosQ8: number,
  ): number {
    return this.assertReady().wlStateRealCheckSight(
      obx | 0,
      oby | 0,
      px | 0,
      py | 0,
      dir | 0,
      areaConnected | 0,
      doorMask >>> 0,
      doorPosQ8 >>> 0,
    ) | 0;
  }

  wlAgentRealTryMove(x: number, y: number, mapLo: number, mapHi: number): number {
    return this.assertReady().wlAgentRealTryMove(x | 0, y | 0, mapLo >>> 0, mapHi >>> 0) | 0;
  }

  wlAgentRealClipMoveHash(x: number, y: number, xmove: number, ymove: number, mapLo: number, mapHi: number, noclip: number): number {
    return this.assertReady().wlAgentRealClipMoveHash(
      x | 0,
      y | 0,
      xmove | 0,
      ymove | 0,
      mapLo >>> 0,
      mapHi >>> 0,
      noclip | 0,
    ) >>> 0;
  }

  wlStateRealMoveObjHash(
    obx: number,
    oby: number,
    dir: number,
    playerx: number,
    playery: number,
    areaConnected: number,
    distance: number,
    move: number,
    obclass: number,
    tics: number,
  ): number {
    return this.assertReady().wlStateRealMoveObjHash(
      obx | 0,
      oby | 0,
      dir | 0,
      playerx | 0,
      playery | 0,
      areaConnected | 0,
      distance | 0,
      move | 0,
      obclass | 0,
      tics | 0,
    ) >>> 0;
  }

  wlStateRealSelectChaseDirHash(
    obTileX: number,
    obTileY: number,
    dir: number,
    obclass: number,
    flags: number,
    playerTileX: number,
    playerTileY: number,
  ): number {
    return this.assertReady().wlStateRealSelectChaseDirHash(
      obTileX | 0,
      obTileY | 0,
      dir | 0,
      obclass | 0,
      flags | 0,
      playerTileX | 0,
      playerTileY | 0,
    ) >>> 0;
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

  wlAct1CloseDoorHash(doorMask: number, doorState: number, doorNum: number, speed: number, blocked: number): number {
    return this.assertReady().wlAct1CloseDoorHash(doorMask | 0, doorState | 0, doorNum | 0, speed | 0, blocked | 0) >>> 0;
  }

  wlAct1MoveDoorsHash(doorMask: number, doorState: number, tics: number, speed: number, activeMask: number): number {
    return this.assertReady().wlAct1MoveDoorsHash(doorMask | 0, doorState | 0, tics | 0, speed | 0, activeMask | 0) >>> 0;
  }

  wlAct1OpenDoorHash(doorMask: number, doorState: number, doorNum: number, speed: number, blocked: number): number {
    return this.assertReady().wlAct1OpenDoorHash(doorMask | 0, doorState | 0, doorNum | 0, speed | 0, blocked | 0) >>> 0;
  }

  wlAct1OperateDoorHash(doorMask: number, doorState: number, doorNum: number, action: number, speed: number, blocked: number): number {
    return this.assertReady().wlAct1OperateDoorHash(doorMask | 0, doorState | 0, doorNum | 0, action | 0, speed | 0, blocked | 0) >>> 0;
  }

  wlAct1PushWallHash(mapLo: number, mapHi: number, pushX: number, pushY: number, dir: number, steps: number): number {
    return this.assertReady().wlAct1PushWallHash(mapLo >>> 0, mapHi >>> 0, pushX | 0, pushY | 0, dir | 0, steps | 0) >>> 0;
  }

  wlAct1SpawnDoorHash(doorMask: number, doorState: number, tile: number, lock: number, vertical: number): number {
    return this.assertReady().wlAct1SpawnDoorHash(doorMask | 0, doorState | 0, tile | 0, lock | 0, vertical | 0) >>> 0;
  }

  wlAgentGetBonusHash(score: number, lives: number, health: number, ammo: number, keys: number, bonusKind: number, value: number): number {
    return this.assertReady().wlAgentGetBonusHash(score | 0, lives | 0, health | 0, ammo | 0, keys | 0, bonusKind | 0, value | 0) >>> 0;
  }

  wlAgentGiveAmmoHash(ammo: number, maxAmmo: number, amount: number, weaponOwned: number): number {
    return this.assertReady().wlAgentGiveAmmoHash(ammo | 0, maxAmmo | 0, amount | 0, weaponOwned | 0) >>> 0;
  }

  wlAgentGivePointsHash(score: number, lives: number, nextExtra: number, points: number): number {
    return this.assertReady().wlAgentGivePointsHash(score | 0, lives | 0, nextExtra | 0, points | 0) >>> 0;
  }

  wlAgentHealSelfHash(health: number, maxHealth: number, amount: number): number {
    return this.assertReady().wlAgentHealSelfHash(health | 0, maxHealth | 0, amount | 0) >>> 0;
  }

  wlAgentTakeDamageHash(health: number, lives: number, damage: number, godMode: number, rng: number): number {
    return this.assertReady().wlAgentTakeDamageHash(health | 0, lives | 0, damage | 0, godMode | 0, rng | 0) >>> 0;
  }

  wlGameGameLoopHash(
    stateHash: number,
    tics: number,
    inputMask: number,
    rng: number,
    doorHash: number,
    playerHash: number,
    actorHash: number,
  ): number {
    return this.assertReady().wlGameGameLoopHash(
      stateHash >>> 0,
      tics | 0,
      inputMask | 0,
      rng | 0,
      doorHash | 0,
      playerHash | 0,
      actorHash | 0,
    ) >>> 0;
  }

  wlInterCheckHighScoreHash(newScore: number, s0: number, s1: number, s2: number, s3: number, s4: number): number {
    return this.assertReady().wlInterCheckHighScoreHash(newScore | 0, s0 | 0, s1 | 0, s2 | 0, s3 | 0, s4 | 0) >>> 0;
  }

  wlInterLevelCompletedHash(
    score: number,
    timeSec: number,
    parSec: number,
    killsFound: number,
    killsTotal: number,
    secretsFound: number,
    secretsTotal: number,
    treasureFound: number,
    treasureTotal: number,
    lives: number,
  ): number {
    return this.assertReady().wlInterLevelCompletedHash(
      score | 0,
      timeSec | 0,
      parSec | 0,
      killsFound | 0,
      killsTotal | 0,
      secretsFound | 0,
      secretsTotal | 0,
      treasureFound | 0,
      treasureTotal | 0,
      lives | 0,
    ) >>> 0;
  }

  wlInterVictoryHash(
    totalScore: number,
    totalTime: number,
    totalKills: number,
    totalSecrets: number,
    totalTreasures: number,
    episode: number,
    difficulty: number,
  ): number {
    return this.assertReady().wlInterVictoryHash(
      totalScore | 0,
      totalTime | 0,
      totalKills | 0,
      totalSecrets | 0,
      totalTreasures | 0,
      episode | 0,
      difficulty | 0,
    ) >>> 0;
  }

  idUs1UsCPrintHash(windowX: number, windowW: number, textLen: number, align: number, fontWidth: number): number {
    return this.assertReady().idUs1UsCPrintHash(windowX | 0, windowW | 0, textLen | 0, align | 0, fontWidth | 0) >>> 0;
  }

  idUs1UsDrawWindowHash(x: number, y: number, w: number, h: number, frameColor: number, fillColor: number): number {
    return this.assertReady().idUs1UsDrawWindowHash(x | 0, y | 0, w | 0, h | 0, frameColor | 0, fillColor | 0) >>> 0;
  }

  idUs1UsPrintHash(cursorX: number, cursorY: number, textLen: number, color: number, fontWidth: number): number {
    return this.assertReady().idUs1UsPrintHash(cursorX | 0, cursorY | 0, textLen | 0, color | 0, fontWidth | 0) >>> 0;
  }

  wlMenuCpControlHash(mouseEnabled: number, joystickEnabled: number, sensitivity: number, action: number): number {
    return this.assertReady().wlMenuCpControlHash(mouseEnabled | 0, joystickEnabled | 0, sensitivity | 0, action | 0) >>> 0;
  }

  wlMenuCpNewGameHash(difficulty: number, episode: number, startLevel: number, weapon: number): number {
    return this.assertReady().wlMenuCpNewGameHash(difficulty | 0, episode | 0, startLevel | 0, weapon | 0) >>> 0;
  }

  wlMenuCpSoundHash(soundMode: number, musicMode: number, digiMode: number, action: number): number {
    return this.assertReady().wlMenuCpSoundHash(soundMode | 0, musicMode | 0, digiMode | 0, action | 0) >>> 0;
  }

  wlMenuCpViewScoresHash(top0: number, top1: number, top2: number, top3: number, top4: number, newScore: number): number {
    return this.assertReady().wlMenuCpViewScoresHash(top0 | 0, top1 | 0, top2 | 0, top3 | 0, top4 | 0, newScore | 0) >>> 0;
  }

  wlMenuDrawMainMenuHash(selected: number, enabledMask: number, episode: number): number {
    return this.assertReady().wlMenuDrawMainMenuHash(selected | 0, enabledMask | 0, episode | 0) >>> 0;
  }

  wlMenuDrawMenuHash(menuId: number, cursor: number, itemCount: number, disabledMask: number, scroll: number): number {
    return this.assertReady().wlMenuDrawMenuHash(menuId | 0, cursor | 0, itemCount | 0, disabledMask | 0, scroll | 0) >>> 0;
  }

  wlMenuMessageHash(messageLen: number, waitForAck: number, inputMask: number, rng: number): number {
    return this.assertReady().wlMenuMessageHash(messageLen | 0, waitForAck | 0, inputMask | 0, rng | 0) >>> 0;
  }

  wlMenuUsControlPanelHash(screen: number, cursor: number, inputMask: number, menuItems: number): number {
    return this.assertReady().wlMenuUsControlPanelHash(screen | 0, cursor | 0, inputMask | 0, menuItems | 0) >>> 0;
  }

  wlTextEndTextHash(textLen: number, scrollPos: number, speed: number, inputMask: number): number {
    return this.assertReady().wlTextEndTextHash(textLen | 0, scrollPos | 0, speed | 0, inputMask | 0) >>> 0;
  }

  wlTextHelpScreensHash(page: number, totalPages: number, inputMask: number, rng: number): number {
    return this.assertReady().wlTextHelpScreensHash(page | 0, totalPages | 0, inputMask | 0, rng | 0) >>> 0;
  }

  idCaCacheAudioChunkHash(chunkNum: number, offset: number, nextOffset: number, audiotLen: number, cacheMask: number): number {
    return this.assertReady().idCaCacheAudioChunkHash(chunkNum | 0, offset | 0, nextOffset | 0, audiotLen | 0, cacheMask | 0) >>> 0;
  }

  idCaCalSetupAudioFileHash(audiohedLen: number, audiotLen: number, start: number): number {
    return this.assertReady().idCaCalSetupAudioFileHash(audiohedLen | 0, audiotLen | 0, start | 0) >>> 0;
  }

  idSdPlaySoundHash(soundMode: number, soundId: number, priority: number, currentPriority: number, channelBusy: number): number {
    return this.assertReady().idSdPlaySoundHash(soundMode | 0, soundId | 0, priority | 0, currentPriority | 0, channelBusy | 0) >>> 0;
  }

  idSdSetMusicModeHash(currentMode: number, requestedMode: number, hasDevice: number): number {
    return this.assertReady().idSdSetMusicModeHash(currentMode | 0, requestedMode | 0, hasDevice | 0) >>> 0;
  }

  idSdSetSoundModeHash(currentMode: number, requestedMode: number, hasDevice: number): number {
    return this.assertReady().idSdSetSoundModeHash(currentMode | 0, requestedMode | 0, hasDevice | 0) >>> 0;
  }

  idSdStopSoundHash(channelBusy: number, currentSound: number, currentPriority: number): number {
    return this.assertReady().idSdStopSoundHash(channelBusy | 0, currentSound | 0, currentPriority | 0) >>> 0;
  }

  wlGamePlaySoundLocGlobalHash(
    soundMode: number,
    soundId: number,
    gx: number,
    gy: number,
    listenerX: number,
    listenerY: number,
    channelBusy: number,
  ): number {
    return this.assertReady().wlGamePlaySoundLocGlobalHash(
      soundMode | 0,
      soundId | 0,
      gx | 0,
      gy | 0,
      listenerX | 0,
      listenerY | 0,
      channelBusy | 0,
    ) >>> 0;
  }

  wlGameSetSoundLocHash(gx: number, gy: number, listenerX: number, listenerY: number): number {
    return this.assertReady().wlGameSetSoundLocHash(gx | 0, gy | 0, listenerX | 0, listenerY | 0) >>> 0;
  }

  wlGameUpdateSoundLocHash(gx: number, gy: number, listenerX: number, listenerY: number, velocityX: number, velocityY: number): number {
    return this.assertReady().wlGameUpdateSoundLocHash(gx | 0, gy | 0, listenerX | 0, listenerY | 0, velocityX | 0, velocityY | 0) >>> 0;
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
      case 'id_mm.MM_GetPtrHash': {
        const { freeBytes, requestSize, purgeMask, lockMask } = input as Record<string, number>;
        return this.idMmGetPtrHash(freeBytes, requestSize, purgeMask, lockMask) as TOutput;
      }
      case 'id_mm.MM_FreePtrHash': {
        const { freeBytes, blockSize, allocMask, slot } = input as Record<string, number>;
        return this.idMmFreePtrHash(freeBytes, blockSize, allocMask, slot) as TOutput;
      }
      case 'id_mm.MM_SetPurgeHash': {
        const { purgeMask, lockMask, slot, purgeLevel } = input as Record<string, number>;
        return this.idMmSetPurgeHash(purgeMask, lockMask, slot, purgeLevel) as TOutput;
      }
      case 'id_mm.MM_SetLockHash': {
        const { lockMask, slot, locked } = input as Record<string, number>;
        return this.idMmSetLockHash(lockMask, slot, locked) as TOutput;
      }
      case 'id_mm.MM_SortMemHash': {
        const { allocMask, purgeMask, lockMask, lowWaterMark } = input as Record<string, number>;
        return this.idMmSortMemHash(allocMask, purgeMask, lockMask, lowWaterMark) as TOutput;
      }
      case 'id_pm.PM_CheckMainMemHash': {
        const { pageCount, residentMask, lockMask, pageSize } = input as Record<string, number>;
        return this.idPmCheckMainMemHash(pageCount, residentMask, lockMask, pageSize) as TOutput;
      }
      case 'id_pm.PM_GetPageAddressHash': {
        const { residentMask, pageNum, pageSize, frame } = input as Record<string, number>;
        return this.idPmGetPageAddressHash(residentMask, pageNum, pageSize, frame) as TOutput;
      }
      case 'id_pm.PM_GetPageHash': {
        const { residentMask, lockMask, pageNum, frame } = input as Record<string, number>;
        return this.idPmGetPageHash(residentMask, lockMask, pageNum, frame) as TOutput;
      }
      case 'id_pm.PM_NextFrameHash': {
        const { residentMask, lockMask, frame } = input as Record<string, number>;
        return this.idPmNextFrameHash(residentMask, lockMask, frame) as TOutput;
      }
      case 'id_pm.PM_ResetHash': {
        const { pageCount, preloadMask, frameSeed } = input as Record<string, number>;
        return this.idPmResetHash(pageCount, preloadMask, frameSeed) as TOutput;
      }
      case 'id_vh.VW_MeasurePropStringHash': {
        const { textLen, fontWidth, spacing, maxWidth } = input as Record<string, number>;
        return this.idVhVwMeasurePropStringHash(textLen, fontWidth, spacing, maxWidth) as TOutput;
      }
      case 'id_vh.VWB_DrawPicHash': {
        const { x, y, picnum, bufferofs, screenofs } = input as Record<string, number>;
        return this.idVhVwbDrawPicHash(x, y, picnum, bufferofs, screenofs) as TOutput;
      }
      case 'id_vh.VWB_BarHash': {
        const { x, y, width, height, color } = input as Record<string, number>;
        return this.idVhVwbBarHash(x, y, width, height, color) as TOutput;
      }
      case 'id_vl.VL_BarHash': {
        const { x, y, width, height, color, linewidth } = input as Record<string, number>;
        return this.idVlVlBarHash(x, y, width, height, color, linewidth) as TOutput;
      }
      case 'id_vl.VL_MemToScreenHash': {
        const { srcLen, width, height, dest, mask } = input as Record<string, number>;
        return this.idVlVlMemToScreenHash(srcLen, width, height, dest, mask) as TOutput;
      }
      case 'id_vl.VL_LatchToScreenHash': {
        const { source, width, height, x, y } = input as Record<string, number>;
        return this.idVlVlLatchToScreenHash(source, width, height, x, y) as TOutput;
      }
      case 'id_vl.VL_FadeInHash': {
        const { start, end, steps, paletteSeed } = input as Record<string, number>;
        return this.idVlVlFadeInHash(start, end, steps, paletteSeed) as TOutput;
      }
      case 'id_vl.VL_FadeOutHash': {
        const { start, end, steps, paletteSeed } = input as Record<string, number>;
        return this.idVlVlFadeOutHash(start, end, steps, paletteSeed) as TOutput;
      }
      case 'id_vl.VL_PlotHash': {
        const { x, y, color, linewidth } = input as Record<string, number>;
        return this.idVlVlPlotHash(x, y, color, linewidth) as TOutput;
      }
      case 'id_vl.VL_HlinHash': {
        const { x, y, width, color, linewidth } = input as Record<string, number>;
        return this.idVlVlHlinHash(x, y, width, color, linewidth) as TOutput;
      }
      case 'id_vh.VWB_PlotHash': {
        const { x, y, color, linewidth } = input as Record<string, number>;
        return this.idVhVwbPlotHash(x, y, color, linewidth) as TOutput;
      }
      case 'id_vh.VWB_HlinHash': {
        const { x, y, width, color, linewidth } = input as Record<string, number>;
        return this.idVhVwbHlinHash(x, y, width, color, linewidth) as TOutput;
      }
      case 'id_vh.VWB_VlinHash': {
        const { x, y, height, color, linewidth } = input as Record<string, number>;
        return this.idVhVwbVlinHash(x, y, height, color, linewidth) as TOutput;
      }
      case 'id_vh.VWL_MeasureStringHash': {
        const { textLen, fontWidth, fontHeight, maxWidth } = input as Record<string, number>;
        return this.idVhVwlMeasureStringHash(textLen, fontWidth, fontHeight, maxWidth) as TOutput;
      }
      case 'id_vh.VWB_DrawPropStringHash': {
        const { textLen, x, y, color, maxWidth } = input as Record<string, number>;
        return this.idVhVwbDrawPropStringHash(textLen, x, y, color, maxWidth) as TOutput;
      }
      case 'id_vl.VL_VlinHash': {
        const { x, y, height, color, linewidth } = input as Record<string, number>;
        return this.idVlVlVlinHash(x, y, height, color, linewidth) as TOutput;
      }
      case 'id_vl.VL_ScreenToScreenHash': {
        const { source, dest, width, height, linewidth } = input as Record<string, number>;
        return this.idVlVlScreenToScreenHash(source, dest, width, height, linewidth) as TOutput;
      }
      case 'id_vl.VL_MaskedToScreenHash': {
        const { source, width, height, x, y, mask } = input as Record<string, number>;
        return this.idVlVlMaskedToScreenHash(source, width, height, x, y, mask) as TOutput;
      }
      case 'id_vl.VL_MemToLatchHash': {
        const { sourceLen, width, height, dest } = input as Record<string, number>;
        return this.idVlVlMemToLatchHash(sourceLen, width, height, dest) as TOutput;
      }
      case 'id_vl.VL_ClearVideoHash': {
        const { color, linewidth, pages, bufferofs } = input as Record<string, number>;
        return this.idVlVlClearVideoHash(color, linewidth, pages, bufferofs) as TOutput;
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
      case 'wl_act1.CloseDoorHash': {
        const { doorMask, doorState, doorNum, speed, blocked } = input as Record<string, number>;
        return this.wlAct1CloseDoorHash(doorMask, doorState, doorNum, speed, blocked) as TOutput;
      }
      case 'wl_act1.MoveDoorsHash': {
        const { doorMask, doorState, tics, speed, activeMask } = input as Record<string, number>;
        return this.wlAct1MoveDoorsHash(doorMask, doorState, tics, speed, activeMask) as TOutput;
      }
      case 'wl_act1.OpenDoorHash': {
        const { doorMask, doorState, doorNum, speed, blocked } = input as Record<string, number>;
        return this.wlAct1OpenDoorHash(doorMask, doorState, doorNum, speed, blocked) as TOutput;
      }
      case 'wl_act1.OperateDoorHash': {
        const { doorMask, doorState, doorNum, action, speed, blocked } = input as Record<string, number>;
        return this.wlAct1OperateDoorHash(doorMask, doorState, doorNum, action, speed, blocked) as TOutput;
      }
      case 'wl_act1.PushWallHash': {
        const { mapLo, mapHi, pushX, pushY, dir, steps } = input as Record<string, number>;
        return this.wlAct1PushWallHash(mapLo, mapHi, pushX, pushY, dir, steps) as TOutput;
      }
      case 'wl_act1.SpawnDoorHash': {
        const { doorMask, doorState, tile, lock, vertical } = input as Record<string, number>;
        return this.wlAct1SpawnDoorHash(doorMask, doorState, tile, lock, vertical) as TOutput;
      }
      case 'wl_agent.GetBonusHash': {
        const { score, lives, health, ammo, keys, bonusKind, value } = input as Record<string, number>;
        return this.wlAgentGetBonusHash(score, lives, health, ammo, keys, bonusKind, value) as TOutput;
      }
      case 'wl_agent.GiveAmmoHash': {
        const { ammo, maxAmmo, amount, weaponOwned } = input as Record<string, number>;
        return this.wlAgentGiveAmmoHash(ammo, maxAmmo, amount, weaponOwned) as TOutput;
      }
      case 'wl_agent.GivePointsHash': {
        const { score, lives, nextExtra, points } = input as Record<string, number>;
        return this.wlAgentGivePointsHash(score, lives, nextExtra, points) as TOutput;
      }
      case 'wl_agent.HealSelfHash': {
        const { health, maxHealth, amount } = input as Record<string, number>;
        return this.wlAgentHealSelfHash(health, maxHealth, amount) as TOutput;
      }
      case 'wl_agent.TakeDamageHash': {
        const { health, lives, damage, godMode, rng } = input as Record<string, number>;
        return this.wlAgentTakeDamageHash(health, lives, damage, godMode, rng) as TOutput;
      }
      case 'wl_game.GameLoopHash': {
        const { stateHash, tics, inputMask, rng, doorHash, playerHash, actorHash } = input as Record<string, number>;
        return this.wlGameGameLoopHash(stateHash, tics, inputMask, rng, doorHash, playerHash, actorHash) as TOutput;
      }
      case 'wl_inter.CheckHighScoreHash': {
        const { newScore, s0, s1, s2, s3, s4 } = input as Record<string, number>;
        return this.wlInterCheckHighScoreHash(newScore, s0, s1, s2, s3, s4) as TOutput;
      }
      case 'wl_inter.LevelCompletedHash': {
        const { score, timeSec, parSec, killsFound, killsTotal, secretsFound, secretsTotal, treasureFound, treasureTotal, lives } =
          input as Record<string, number>;
        return this.wlInterLevelCompletedHash(
          score,
          timeSec,
          parSec,
          killsFound,
          killsTotal,
          secretsFound,
          secretsTotal,
          treasureFound,
          treasureTotal,
          lives,
        ) as TOutput;
      }
      case 'wl_inter.VictoryHash': {
        const { totalScore, totalTime, totalKills, totalSecrets, totalTreasures, episode, difficulty } = input as Record<string, number>;
        return this.wlInterVictoryHash(totalScore, totalTime, totalKills, totalSecrets, totalTreasures, episode, difficulty) as TOutput;
      }
      case 'id_us_1.US_CPrintHash': {
        const { windowX, windowW, textLen, align, fontWidth } = input as Record<string, number>;
        return this.idUs1UsCPrintHash(windowX, windowW, textLen, align, fontWidth) as TOutput;
      }
      case 'id_us_1.US_DrawWindowHash': {
        const { x, y, w, h, frameColor, fillColor } = input as Record<string, number>;
        return this.idUs1UsDrawWindowHash(x, y, w, h, frameColor, fillColor) as TOutput;
      }
      case 'id_us_1.US_PrintHash': {
        const { cursorX, cursorY, textLen, color, fontWidth } = input as Record<string, number>;
        return this.idUs1UsPrintHash(cursorX, cursorY, textLen, color, fontWidth) as TOutput;
      }
      case 'wl_menu.CP_ControlHash': {
        const { mouseEnabled, joystickEnabled, sensitivity, action } = input as Record<string, number>;
        return this.wlMenuCpControlHash(mouseEnabled, joystickEnabled, sensitivity, action) as TOutput;
      }
      case 'wl_menu.CP_NewGameHash': {
        const { difficulty, episode, startLevel, weapon } = input as Record<string, number>;
        return this.wlMenuCpNewGameHash(difficulty, episode, startLevel, weapon) as TOutput;
      }
      case 'wl_menu.CP_SoundHash': {
        const { soundMode, musicMode, digiMode, action } = input as Record<string, number>;
        return this.wlMenuCpSoundHash(soundMode, musicMode, digiMode, action) as TOutput;
      }
      case 'wl_menu.CP_ViewScoresHash': {
        const { top0, top1, top2, top3, top4, newScore } = input as Record<string, number>;
        return this.wlMenuCpViewScoresHash(top0, top1, top2, top3, top4, newScore) as TOutput;
      }
      case 'wl_menu.DrawMainMenuHash': {
        const { selected, enabledMask, episode } = input as Record<string, number>;
        return this.wlMenuDrawMainMenuHash(selected, enabledMask, episode) as TOutput;
      }
      case 'wl_menu.DrawMenuHash': {
        const { menuId, cursor, itemCount, disabledMask, scroll } = input as Record<string, number>;
        return this.wlMenuDrawMenuHash(menuId, cursor, itemCount, disabledMask, scroll) as TOutput;
      }
      case 'wl_menu.MessageHash': {
        const { messageLen, waitForAck, inputMask, rng } = input as Record<string, number>;
        return this.wlMenuMessageHash(messageLen, waitForAck, inputMask, rng) as TOutput;
      }
      case 'wl_menu.US_ControlPanelHash': {
        const { screen, cursor, inputMask, menuItems } = input as Record<string, number>;
        return this.wlMenuUsControlPanelHash(screen, cursor, inputMask, menuItems) as TOutput;
      }
      case 'wl_text.EndTextHash': {
        const { textLen, scrollPos, speed, inputMask } = input as Record<string, number>;
        return this.wlTextEndTextHash(textLen, scrollPos, speed, inputMask) as TOutput;
      }
      case 'wl_text.HelpScreensHash': {
        const { page, totalPages, inputMask, rng } = input as Record<string, number>;
        return this.wlTextHelpScreensHash(page, totalPages, inputMask, rng) as TOutput;
      }
      case 'id_ca.CA_CacheAudioChunkHash': {
        const { chunkNum, offset, nextOffset, audiotLen, cacheMask } = input as Record<string, number>;
        return this.idCaCacheAudioChunkHash(chunkNum, offset, nextOffset, audiotLen, cacheMask) as TOutput;
      }
      case 'id_ca.CAL_SetupAudioFileHash': {
        const { audiohedLen, audiotLen, start } = input as Record<string, number>;
        return this.idCaCalSetupAudioFileHash(audiohedLen, audiotLen, start) as TOutput;
      }
      case 'id_sd.SD_PlaySoundHash': {
        const { soundMode, soundId, priority, currentPriority, channelBusy } = input as Record<string, number>;
        return this.idSdPlaySoundHash(soundMode, soundId, priority, currentPriority, channelBusy) as TOutput;
      }
      case 'id_sd.SD_SetMusicModeHash': {
        const { currentMode, requestedMode, hasDevice } = input as Record<string, number>;
        return this.idSdSetMusicModeHash(currentMode, requestedMode, hasDevice) as TOutput;
      }
      case 'id_sd.SD_SetSoundModeHash': {
        const { currentMode, requestedMode, hasDevice } = input as Record<string, number>;
        return this.idSdSetSoundModeHash(currentMode, requestedMode, hasDevice) as TOutput;
      }
      case 'id_sd.SD_StopSoundHash': {
        const { channelBusy, currentSound, currentPriority } = input as Record<string, number>;
        return this.idSdStopSoundHash(channelBusy, currentSound, currentPriority) as TOutput;
      }
      case 'wl_game.PlaySoundLocGlobalHash': {
        const { soundMode, soundId, gx, gy, listenerX, listenerY, channelBusy } = input as Record<string, number>;
        return this.wlGamePlaySoundLocGlobalHash(soundMode, soundId, gx, gy, listenerX, listenerY, channelBusy) as TOutput;
      }
      case 'wl_game.SetSoundLocHash': {
        const { gx, gy, listenerX, listenerY } = input as Record<string, number>;
        return this.wlGameSetSoundLocHash(gx, gy, listenerX, listenerY) as TOutput;
      }
      case 'wl_game.UpdateSoundLocHash': {
        const { gx, gy, listenerX, listenerY, velocityX, velocityY } = input as Record<string, number>;
        return this.wlGameUpdateSoundLocHash(gx, gy, listenerX, listenerY, velocityX, velocityY) as TOutput;
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
