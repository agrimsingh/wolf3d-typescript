# Runtime Symbol Manifest (WL1 Runtime Path)

Authoritative runtime symbol checklist generated from deterministic trace artifacts and full WOLFSRC classification.

## Status

- Current state: `frozen`
- Source of truth: `specs/generated/runtime-symbol-hits.json` + `specs/generated/wolfsrc-runtime-classification.json`
- Trace scenarios: 60 (WL1 asset-backed)
- Deterministic menu-trace digest: `3960187756`
- Required runtime trace symbols: 169
- WOLFSRC required-runtime symbols: 130
- WOLFSRC excluded-non-runtime symbols: 438
- Refresh command: `pnpm runtime:manifest:extract`

## Buckets

### required-runtime (runtime wrapper/bridge symbols)

| Trace ID | File | Function | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| 1 | runtime/wolfsrc_runtime_oracle.c | oracle_runtime_init | `done` | runtime bootstrap entrypoint; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| 2 | runtime/wolfsrc_runtime_oracle.c | oracle_runtime_reset | `done` | restores boot snapshot; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| 3 | runtime/wolfsrc_runtime_oracle.c | oracle_runtime_step | `done` | runtime tick loop entrypoint; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| 4 | runtime/wolfsrc_runtime_oracle.c | oracle_runtime_snapshot_hash | `done` | snapshot hash API; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| 5 | runtime/wolfsrc_runtime_oracle.c | oracle_runtime_render_frame_hash | `done` | frame-hash API; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| 6 | runtime/wolfsrc_runtime_oracle.c | oracle_runtime_set_state | `done` | deserialize/state restore API; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| 7 | runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_map_lo | `done` | snapshot readout; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| 8 | runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_map_hi | `done` | snapshot readout; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| 9 | runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_xq8 | `done` | snapshot readout; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| 10 | runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_yq8 | `done` | snapshot readout; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| 11 | runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_angle_deg | `done` | snapshot readout; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| 12 | runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_health | `done` | snapshot readout; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| 13 | runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_ammo | `done` | snapshot readout; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| 14 | runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_cooldown | `done` | snapshot readout; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| 15 | runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_flags | `done` | snapshot readout; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| 16 | runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_tick | `done` | snapshot readout; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| 151 | c-oracle/wolf_oracle.c | oracle_fixed_mul | `done` | called via oracle_fixed_mul from runtime core probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| 152 | c-oracle/wolf_oracle.c | oracle_fixed_by_frac | `done` | called via oracle_fixed_by_frac from runtime core probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| 153 | c-oracle/wolf_oracle.c | oracle_rlew_expand_checksum | `done` | called via oracle_rlew_expand_checksum from runtime core probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| 154 | c-oracle/wolf_oracle.c | oracle_raycast_distance_q16 | `done` | called via oracle_raycast_distance_q16 from runtime core probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| 155 | c-oracle/wolf_oracle.c | oracle_actor_step_packed | `done` | called via oracle_actor_step_packed from runtime core probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| 156 | c-oracle/wolf_oracle.c | oracle_player_move_packed | `done` | called via oracle_player_move_packed from runtime core probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| 157 | c-oracle/wolf_oracle.c | oracle_game_event_hash | `done` | called via oracle_game_event_hash from runtime core probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| 158 | c-oracle/wolf_oracle.c | oracle_menu_reduce_packed | `done` | called via oracle_menu_reduce_packed from runtime core probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| 159 | c-oracle/wolf_oracle.c | oracle_measure_text_packed | `done` | called via oracle_measure_text_packed from runtime core probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| 160 | c-oracle/wolf_oracle.c | oracle_audio_reduce_packed | `done` | called via oracle_audio_reduce_packed from runtime core probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| 166 | runtime/wolfsrc_runtime_oracle.c | oracle_runtime_state_size | `done` | binary state save-size API; parity: test/property/runtime.lifecycle.test.ts:bootWl1/stepFrame/framebuffer/save-load parity remains deterministic |
| 167 | runtime/wolfsrc_runtime_oracle.c | oracle_runtime_save_state | `done` | binary state save API; parity: test/property/runtime.lifecycle.test.ts:bootWl1/stepFrame/framebuffer/save-load parity remains deterministic |
| 168 | runtime/wolfsrc_runtime_oracle.c | oracle_runtime_load_state | `done` | binary state load API; parity: test/property/runtime.lifecycle.test.ts:bootWl1/stepFrame/framebuffer/save-load parity remains deterministic |
| 169 | runtime/wolfsrc_runtime_oracle.c | oracle_runtime_framebuffer_size | `done` | indexed framebuffer size API; parity: test/property/runtime.lifecycle.test.ts:bootWl1/stepFrame/framebuffer/save-load parity remains deterministic |
| 170 | runtime/wolfsrc_runtime_oracle.c | oracle_runtime_render_indexed_frame | `done` | indexed framebuffer render API; parity: test/property/runtime.lifecycle.test.ts:bootWl1/stepFrame/framebuffer/save-load parity remains deterministic |

### required-runtime (WOLFSRC symbol inventory)

| Phase | File | Function | Trace IDs | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| phase-1-math | WL_DRAW.C | FixedByFrac | 79 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-1-math | WL_MAIN.C | BuildTables | 80 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-1-math | WL_MAIN.C | CalcProjection | 81 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-2-map | ID_CA.C | CA_CacheMap | 99 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-2-map | ID_CA.C | CA_RLEWexpand | 97 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-2-map | ID_CA.C | CAL_CarmackExpand | 96 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-2-map | ID_CA.C | CAL_SetupMapFile | 98 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-2-map | WL_GAME.C | DrawPlayScreen | 90 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-2-map | WL_GAME.C | SetupGameLevel | 100 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-3-raycast | WL_DRAW.C | CalcHeight | 84 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-3-raycast | WL_DRAW.C | HitHorizWall | 86 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-3-raycast | WL_DRAW.C | HitVertWall | 85 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-3-raycast | WL_DRAW.C | ThreeDRefresh | 22 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-3-raycast | WL_DRAW.C | TransformActor | 82 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-3-raycast | WL_DRAW.C | TransformTile | 83 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-3-raycast | WL_DRAW.C | WallRefresh | 21 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-3-raycast | WL_SCALE.C | ScaleShape | 88 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-3-raycast | WL_SCALE.C | SetupScaling | 87 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-3-raycast | WL_SCALE.C | SimpleScaleShape | 89 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-4-ai | WL_ACT2.C | T_Bite | 35 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-4-ai | WL_ACT2.C | T_Chase | 32 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-4-ai | WL_ACT2.C | T_DogChase | 36 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-4-ai | WL_ACT2.C | T_Path | 33 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-4-ai | WL_ACT2.C | T_Projectile | 37 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-4-ai | WL_ACT2.C | T_Shoot | 34 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-4-ai | WL_STATE.C | CheckLine | 23, 161 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-4-ai | WL_STATE.C | CheckSight | 24, 162 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-4-ai | WL_STATE.C | DamageActor | 92 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-4-ai | WL_STATE.C | FirstSighting | 30 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-4-ai | WL_STATE.C | MoveObj | 25, 163 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-4-ai | WL_STATE.C | SelectChaseDir | 26, 164 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-4-ai | WL_STATE.C | SelectDodgeDir | 91 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-4-ai | WL_STATE.C | SightPlayer | 31 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-5-player | ID_IN.C | IN_ReadControl | 58 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-5-player | ID_IN.C | IN_UserInput | 59 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-5-player | WL_AGENT.C | ClipMove | 17, 94, 165 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-5-player | WL_AGENT.C | Cmd_Fire | 46 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-5-player | WL_AGENT.C | Cmd_Use | 47 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-5-player | WL_AGENT.C | ControlMovement | 19, 95 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-5-player | WL_AGENT.C | T_Player | 48 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-5-player | WL_AGENT.C | Thrust | 49 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-5-player | WL_AGENT.C | TryMove | 18, 93 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-5-player | WL_PLAY.C | PlayLoop | 27 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-6-gamestate | WL_ACT1.C | CloseDoor | 39 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-6-gamestate | WL_ACT1.C | MoveDoors | 41 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-6-gamestate | WL_ACT1.C | OpenDoor | 38 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-6-gamestate | WL_ACT1.C | OperateDoor | 40 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-6-gamestate | WL_ACT1.C | PushWall | 51 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-6-gamestate | WL_ACT1.C | SpawnDoor | 50 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-6-gamestate | WL_AGENT.C | GetBonus | 42 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-6-gamestate | WL_AGENT.C | GiveAmmo | 43 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-6-gamestate | WL_AGENT.C | GivePoints | 44 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-6-gamestate | WL_AGENT.C | HealSelf | 45 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-6-gamestate | WL_AGENT.C | TakeDamage | 52 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-6-gamestate | WL_GAME.C | GameLoop | 28 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-6-gamestate | WL_INTER.C | CheckHighScore | 29 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-6-gamestate | WL_INTER.C | LevelCompleted | 53 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-6-gamestate | WL_INTER.C | Victory | 54 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-7-menu-text | ID_US_1.C | US_CPrint | 67 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-7-menu-text | ID_US_1.C | US_DrawWindow | 68 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-7-menu-text | ID_US_1.C | US_Print | 66 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-7-menu-text | WL_MENU.C | CP_Control | 75 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-7-menu-text | WL_MENU.C | CP_NewGame | 72 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-7-menu-text | WL_MENU.C | CP_Sound | 74 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-7-menu-text | WL_MENU.C | CP_ViewScores | 73 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-7-menu-text | WL_MENU.C | DrawMainMenu | 70 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-7-menu-text | WL_MENU.C | DrawMenu | 71 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-7-menu-text | WL_MENU.C | Message | 76 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-7-menu-text | WL_MENU.C | US_ControlPanel | 69 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-7-menu-text | WL_TEXT.C | EndText | 78 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-7-menu-text | WL_TEXT.C | HelpScreens | 77 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-8-audio | ID_CA.C | CA_CacheAudioChunk | 65 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-8-audio | ID_CA.C | CAL_SetupAudioFile | 64 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-8-audio | ID_SD.C | SD_PlaySound | 62 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-8-audio | ID_SD.C | SD_SetMusicMode | 61 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-8-audio | ID_SD.C | SD_SetSoundMode | 60 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-8-audio | ID_SD.C | SD_StopSound | 63 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-8-audio | WL_GAME.C | PlaySoundLocGlobal | 57 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-8-audio | WL_GAME.C | SetSoundLoc | 55 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| phase-8-audio | WL_GAME.C | UpdateSoundLoc | 56 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_MM.C | MM_FreePtr | 102 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_MM.C | MM_GetPtr | 101 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_MM.C | MM_SetLock | 104 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_MM.C | MM_SetPurge | 103 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_MM.C | MM_SortMem | 105 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_PM.C | PM_CheckMainMem | 106 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_PM.C | PM_GetPage | 108 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_PM.C | PM_GetPageAddress | 107 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_PM.C | PM_NextFrame | 109 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_PM.C | PM_Reset | 110 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VH.C | LatchDrawPic | 143 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VH.C | LoadLatchMem | 144 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VH.C | VL_MungePic | 145 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VH.C | VW_DrawColorPropString | 132 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VH.C | VW_DrawPropString | 131 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VH.C | VW_MarkUpdateBlock | 141 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VH.C | VW_MeasureMPropString | 133 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VH.C | VW_MeasurePropString | 111 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VH.C | VW_UpdateScreen | 142 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VH.C | VWB_Bar | 113 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VH.C | VWB_DrawPic | 112 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VH.C | VWB_DrawPropString | 125 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VH.C | VWB_DrawTile8 | 134 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VH.C | VWB_DrawTile8M | 135 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VH.C | VWB_Hlin | 122 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VH.C | VWB_Plot | 121 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VH.C | VWB_Vlin | 123 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VH.C | VWL_MeasureString | 124 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VL.C | VL_Bar | 114 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VL.C | VL_ClearVideo | 130 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VL.C | VL_ColorBorder | 150 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VL.C | VL_FadeIn | 117 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VL.C | VL_FadeOut | 118 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VL.C | VL_FillPalette | 140 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VL.C | VL_GetColor | 137 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VL.C | VL_GetPalette | 139 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VL.C | VL_Hlin | 120 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VL.C | VL_LatchToScreen | 116 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VL.C | VL_MaskedToScreen | 128 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VL.C | VL_MemToLatch | 129 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VL.C | VL_MemToScreen | 115 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VL.C | VL_Plot | 119 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VL.C | VL_ScreenToScreen | 127 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VL.C | VL_SetColor | 136 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VL.C | VL_SetLineWidth | 146 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VL.C | VL_SetPalette | 138 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VL.C | VL_SetSplitScreen | 147 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VL.C | VL_SetTextMode | 149 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VL.C | VL_SetVGAPlaneMode | 148 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| shared | ID_VL.C | VL_Vlin | 126 | `done` | parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |

### excluded-non-runtime (WOLFSRC inventory)

Complete per-symbol evidence is generated in `specs/generated/wolfsrc-runtime-classification.json`.

| File | Excluded Count |
| :--- | ---: |
| CONTIGSC.C | 6 |
| DETECT.C | 2 |
| ID_CA.C | 27 |
| ID_IN.C | 28 |
| ID_MM.C | 12 |
| ID_PM.C | 27 |
| ID_SD.C | 52 |
| ID_US_1.C | 16 |
| ID_VH.C | 1 |
| ID_VL.C | 8 |
| MUNGE.C | 1 |
| OLDSCALE.C | 6 |
| WL_ACT1.C | 11 |
| WL_ACT2.C | 49 |
| WL_AGENT.C | 21 |
| WL_DEBUG.C | 7 |
| WL_DRAW.C | 11 |
| WL_GAME.C | 11 |
| WL_INTER.C | 12 |
| WL_MAIN.C | 21 |
| WL_MENU.C | 63 |
| WL_PLAY.C | 21 |
| WL_SCALE.C | 3 |
| WL_STATE.C | 6 |
| WL_TEXT.C | 12 |
| WOLFHACK.C | 4 |

## Rules

1. No symbol may move from `required-runtime` to `excluded-non-runtime` without deterministic trace evidence and commit notes.
2. Phase F4 completion requires all `required-runtime` symbols marked `done` with parity tests.
3. Any new trace hit must regenerate runtime hits + classification + this manifest before merge.

