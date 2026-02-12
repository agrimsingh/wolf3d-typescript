export type OracleFunctionId =
  | 'wl_draw.FixedByFrac'
  | 'wl_main.BuildTablesHash'
  | 'wl_main.CalcProjectionHash'
  | 'id_ca.CarmackExpandHash'
  | 'id_ca.RLEWExpandHash'
  | 'id_ca.SetupMapFileHash'
  | 'id_ca.CacheMapHash'
  | 'wl_game.SetupGameLevelHash'
  | 'wl_game.DrawPlayScreenHash'
  | 'id_mm.MM_GetPtrHash'
  | 'id_mm.MM_FreePtrHash'
  | 'id_mm.MM_SetPurgeHash'
  | 'id_mm.MM_SetLockHash'
  | 'id_mm.MM_SortMemHash'
  | 'id_pm.PM_CheckMainMemHash'
  | 'id_pm.PM_GetPageAddressHash'
  | 'id_pm.PM_GetPageHash'
  | 'id_pm.PM_NextFrameHash'
  | 'id_pm.PM_ResetHash'
  | 'id_vh.VW_MeasurePropStringHash'
  | 'id_vh.VWB_DrawPicHash'
  | 'id_vh.VWB_BarHash'
  | 'id_vh.VWB_PlotHash'
  | 'id_vh.VWB_HlinHash'
  | 'id_vh.VWB_VlinHash'
  | 'id_vh.VWL_MeasureStringHash'
  | 'id_vh.VWB_DrawPropStringHash'
  | 'id_vl.VL_BarHash'
  | 'id_vl.VL_MemToScreenHash'
  | 'id_vl.VL_LatchToScreenHash'
  | 'id_vl.VL_FadeInHash'
  | 'id_vl.VL_FadeOutHash'
  | 'id_vl.VL_PlotHash'
  | 'id_vl.VL_HlinHash'
  | 'id_vl.VL_VlinHash'
  | 'id_vl.VL_ScreenToScreenHash'
  | 'id_vl.VL_MaskedToScreenHash'
  | 'id_vl.VL_MemToLatchHash'
  | 'id_vl.VL_ClearVideoHash'
  | 'id_vh.VW_DrawPropStringHash'
  | 'id_vh.VW_DrawColorPropStringHash'
  | 'id_vh.VW_MeasureMPropStringHash'
  | 'id_vh.VWB_DrawTile8Hash'
  | 'id_vh.VWB_DrawTile8MHash'
  | 'id_vl.VL_SetColorHash'
  | 'id_vl.VL_GetColorHash'
  | 'id_vl.VL_SetPaletteHash'
  | 'id_vl.VL_GetPaletteHash'
  | 'id_vl.VL_FillPaletteHash'
  | 'id_vh.VW_MarkUpdateBlockHash'
  | 'id_vh.VW_UpdateScreenHash'
  | 'id_vh.LatchDrawPicHash'
  | 'id_vh.LoadLatchMemHash'
  | 'id_vh.VL_MungePicHash'
  | 'id_vl.VL_SetLineWidthHash'
  | 'id_vl.VL_SetSplitScreenHash'
  | 'id_vl.VL_SetVGAPlaneModeHash'
  | 'id_vl.VL_SetTextModeHash'
  | 'id_vl.VL_ColorBorderHash'
  | 'wl_draw.TransformActorHash'
  | 'wl_draw.TransformTileHash'
  | 'wl_draw.CalcHeight'
  | 'wl_draw.HitVertWallHash'
  | 'wl_draw.HitHorizWallHash'
  | 'wl_draw.WallRefreshHash'
  | 'wl_draw.ThreeDRefreshHash'
  | 'wl_scale.SetupScalingHash'
  | 'wl_scale.ScaleShapeHash'
  | 'wl_scale.SimpleScaleShapeHash'
  | 'wl_state.SelectDodgeDirHash'
  | 'wl_state.SelectChaseDirHash'
  | 'wl_state.MoveObjHash'
  | 'wl_state.DamageActorHash'
  | 'wl_state.CheckLine'
  | 'wl_state.CheckSight'
  | 'wl_state.FirstSightingHash'
  | 'wl_state.SightPlayerHash'
  | 'wl_act2.TBiteHash'
  | 'wl_act2.TChaseHash'
  | 'wl_act2.TDogChaseHash'
  | 'wl_act2.TPathHash'
  | 'wl_act2.TProjectileHash'
  | 'wl_act2.TShootHash'
  | 'id_in.IN_ReadControlHash'
  | 'id_in.IN_UserInput'
  | 'wl_agent.TryMoveHash'
  | 'wl_agent.ClipMoveHash'
  | 'wl_agent.ThrustHash'
  | 'wl_agent.ControlMovementHash'
  | 'wl_agent.Cmd_FireHash'
  | 'wl_agent.Cmd_UseHash'
  | 'wl_agent.T_PlayerHash'
  | 'wl_play.PlayLoopHash'
  | 'wl_act1.CloseDoorHash'
  | 'wl_act1.MoveDoorsHash'
  | 'wl_act1.OpenDoorHash'
  | 'wl_act1.OperateDoorHash'
  | 'wl_act1.PushWallHash'
  | 'wl_act1.SpawnDoorHash'
  | 'wl_agent.GetBonusHash'
  | 'wl_agent.GiveAmmoHash'
  | 'wl_agent.GivePointsHash'
  | 'wl_agent.HealSelfHash'
  | 'wl_agent.TakeDamageHash'
  | 'wl_game.GameLoopHash'
  | 'wl_inter.CheckHighScoreHash'
  | 'wl_inter.LevelCompletedHash'
  | 'wl_inter.VictoryHash'
  | 'id_us_1.US_CPrintHash'
  | 'id_us_1.US_DrawWindowHash'
  | 'id_us_1.US_PrintHash'
  | 'wl_menu.CP_ControlHash'
  | 'wl_menu.CP_NewGameHash'
  | 'wl_menu.CP_SoundHash'
  | 'wl_menu.CP_ViewScoresHash'
  | 'wl_menu.DrawMainMenuHash'
  | 'wl_menu.DrawMenuHash'
  | 'wl_menu.MessageHash'
  | 'wl_menu.US_ControlPanelHash'
  | 'wl_text.EndTextHash'
  | 'wl_text.HelpScreensHash'
  | 'id_ca.CA_CacheAudioChunkHash'
  | 'id_ca.CAL_SetupAudioFileHash'
  | 'id_sd.SD_PlaySoundHash'
  | 'id_sd.SD_SetMusicModeHash'
  | 'id_sd.SD_SetSoundModeHash'
  | 'id_sd.SD_StopSoundHash'
  | 'wl_game.PlaySoundLocGlobalHash'
  | 'wl_game.SetSoundLocHash'
  | 'wl_game.UpdateSoundLocHash'
  | 'id_ca.RLEWExpandChecksum'
  | 'wl_draw.RaycastColumnHash'
  | 'wl_state.ActorTickHash'
  | 'wl_agent.PlayerMoveHash'
  | 'wl_game.GameStateHash'
  | 'wl_menu.MenuFlowHash'
  | 'id_sd.AudioStateHash';

export type OracleRuntimeExportId =
  | 'oracle_runtime_init'
  | 'oracle_runtime_reset'
  | 'oracle_runtime_step'
  | 'oracle_runtime_snapshot_hash'
  | 'oracle_runtime_render_frame_hash'
  | 'oracle_runtime_set_state'
  | 'oracle_runtime_get_map_lo'
  | 'oracle_runtime_get_map_hi'
  | 'oracle_runtime_get_xq8'
  | 'oracle_runtime_get_yq8'
  | 'oracle_runtime_get_angle_deg'
  | 'oracle_runtime_get_health'
  | 'oracle_runtime_get_ammo'
  | 'oracle_runtime_get_cooldown'
  | 'oracle_runtime_get_flags'
  | 'oracle_runtime_get_tick'
  | 'oracle_runtime_state_size'
  | 'oracle_runtime_save_state'
  | 'oracle_runtime_load_state'
  | 'oracle_runtime_framebuffer_size'
  | 'oracle_runtime_render_indexed_frame'
  | 'oracle_runtime_trace_reset'
  | 'oracle_runtime_trace_count'
  | 'oracle_runtime_trace_symbol_id_at';

export type OracleFunctionClassification = 'required-runtime' | 'excluded-non-runtime' | 'unclassified';

export interface OracleFunctionManifestEntry {
  id: OracleFunctionId;
  sourceFile: string;
  classification: OracleFunctionClassification;
  evidence: string;
  parityTestPath?: string;
}

export interface OracleTraceRecord {
  tic: number;
  inputMask: number;
  rng: number;
  snapshotHash: number;
  frameHash: number;
  symbolIds: number[];
}

export interface OracleCall<TInput, TOutput> {
  fn: OracleFunctionId;
  input: TInput;
  output: TOutput;
}

export interface OracleMemoryView {
  ptr: number;
  lengthBytes: number;
  free(): void;
}

export interface OracleBridgeContract {
  init(): Promise<void>;
  call<TInput, TOutput>(fn: OracleFunctionId, input: TInput): TOutput;
  resetState(): void;
  shutdown(): Promise<void>;
}
