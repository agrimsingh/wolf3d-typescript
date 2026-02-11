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
