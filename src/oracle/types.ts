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
  | 'id_ca.RLEWExpandChecksum'
  | 'wl_draw.RaycastColumnHash'
  | 'wl_state.ActorTickHash'
  | 'wl_agent.PlayerMoveHash'
  | 'wl_game.GameStateHash'
  | 'wl_menu.MenuFlowHash'
  | 'id_sd.AudioStateHash';

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
