# WOLFSRC Runtime Symbol Classification

- Generated: 2026-02-12T15:35:28.358Z
- Source manifest: `specs/generated/wolfsrc-manifest.json`
- Runtime hits: `specs/generated/runtime-symbol-hits.json`
- Trace scenarios: 10
- Menu trace digest: 3960187756

## Totals

- Total symbols: 568
- Required runtime: 130
- Excluded non-runtime: 438
- Unclassified: 0

## Required Runtime Symbols

| File | Function | Trace IDs | Primary Phase |
| :--- | :--- | :--- | :--- |
| WL_DRAW.C | FixedByFrac | 79 | phase-1-math |
| WL_MAIN.C | BuildTables | 80 | phase-1-math |
| WL_MAIN.C | CalcProjection | 81 | phase-1-math |
| ID_CA.C | CA_CacheMap | 99 | phase-2-map |
| ID_CA.C | CA_RLEWexpand | 97 | phase-2-map |
| ID_CA.C | CAL_CarmackExpand | 96 | phase-2-map |
| ID_CA.C | CAL_SetupMapFile | 98 | phase-2-map |
| WL_GAME.C | DrawPlayScreen | 90 | phase-2-map |
| WL_GAME.C | SetupGameLevel | 100 | phase-2-map |
| WL_DRAW.C | CalcHeight | 84 | phase-3-raycast |
| WL_DRAW.C | HitHorizWall | 86 | phase-3-raycast |
| WL_DRAW.C | HitVertWall | 85 | phase-3-raycast |
| WL_DRAW.C | ThreeDRefresh | 22 | phase-3-raycast |
| WL_DRAW.C | TransformActor | 82 | phase-3-raycast |
| WL_DRAW.C | TransformTile | 83 | phase-3-raycast |
| WL_DRAW.C | WallRefresh | 21 | phase-3-raycast |
| WL_SCALE.C | ScaleShape | 88 | phase-3-raycast |
| WL_SCALE.C | SetupScaling | 87 | phase-3-raycast |
| WL_SCALE.C | SimpleScaleShape | 89 | phase-3-raycast |
| WL_ACT2.C | T_Bite | 35 | phase-4-ai |
| WL_ACT2.C | T_Chase | 32 | phase-4-ai |
| WL_ACT2.C | T_DogChase | 36 | phase-4-ai |
| WL_ACT2.C | T_Path | 33 | phase-4-ai |
| WL_ACT2.C | T_Projectile | 37 | phase-4-ai |
| WL_ACT2.C | T_Shoot | 34 | phase-4-ai |
| WL_STATE.C | CheckLine | 23, 161 | phase-4-ai |
| WL_STATE.C | CheckSight | 24, 162 | phase-4-ai |
| WL_STATE.C | DamageActor | 92 | phase-4-ai |
| WL_STATE.C | FirstSighting | 30 | phase-4-ai |
| WL_STATE.C | MoveObj | 25, 163 | phase-4-ai |
| WL_STATE.C | SelectChaseDir | 26, 164 | phase-4-ai |
| WL_STATE.C | SelectDodgeDir | 91 | phase-4-ai |
| WL_STATE.C | SightPlayer | 31 | phase-4-ai |
| ID_IN.C | IN_ReadControl | 58 | phase-5-player |
| ID_IN.C | IN_UserInput | 59 | phase-5-player |
| WL_AGENT.C | ClipMove | 17, 94, 165 | phase-5-player |
| WL_AGENT.C | Cmd_Fire | 46 | phase-5-player |
| WL_AGENT.C | Cmd_Use | 47 | phase-5-player |
| WL_AGENT.C | ControlMovement | 19, 95 | phase-5-player |
| WL_AGENT.C | T_Player | 48 | phase-5-player |
| WL_AGENT.C | Thrust | 49 | phase-5-player |
| WL_AGENT.C | TryMove | 18, 93 | phase-5-player |
| WL_PLAY.C | PlayLoop | 27 | phase-5-player |
| WL_ACT1.C | CloseDoor | 39 | phase-6-gamestate |
| WL_ACT1.C | MoveDoors | 41 | phase-6-gamestate |
| WL_ACT1.C | OpenDoor | 38 | phase-6-gamestate |
| WL_ACT1.C | OperateDoor | 40 | phase-6-gamestate |
| WL_ACT1.C | PushWall | 51 | phase-6-gamestate |
| WL_ACT1.C | SpawnDoor | 50 | phase-6-gamestate |
| WL_AGENT.C | GetBonus | 42 | phase-6-gamestate |
| WL_AGENT.C | GiveAmmo | 43 | phase-6-gamestate |
| WL_AGENT.C | GivePoints | 44 | phase-6-gamestate |
| WL_AGENT.C | HealSelf | 45 | phase-6-gamestate |
| WL_AGENT.C | TakeDamage | 52 | phase-6-gamestate |
| WL_GAME.C | GameLoop | 28 | phase-6-gamestate |
| WL_INTER.C | CheckHighScore | 29 | phase-6-gamestate |
| WL_INTER.C | LevelCompleted | 53 | phase-6-gamestate |
| WL_INTER.C | Victory | 54 | phase-6-gamestate |
| ID_US_1.C | US_CPrint | 67 | phase-7-menu-text |
| ID_US_1.C | US_DrawWindow | 68 | phase-7-menu-text |
| ID_US_1.C | US_Print | 66 | phase-7-menu-text |
| WL_MENU.C | CP_Control | 75 | phase-7-menu-text |
| WL_MENU.C | CP_NewGame | 72 | phase-7-menu-text |
| WL_MENU.C | CP_Sound | 74 | phase-7-menu-text |
| WL_MENU.C | CP_ViewScores | 73 | phase-7-menu-text |
| WL_MENU.C | DrawMainMenu | 70 | phase-7-menu-text |
| WL_MENU.C | DrawMenu | 71 | phase-7-menu-text |
| WL_MENU.C | Message | 76 | phase-7-menu-text |
| WL_MENU.C | US_ControlPanel | 69 | phase-7-menu-text |
| WL_TEXT.C | EndText | 78 | phase-7-menu-text |
| WL_TEXT.C | HelpScreens | 77 | phase-7-menu-text |
| ID_CA.C | CA_CacheAudioChunk | 65 | phase-8-audio |
| ID_CA.C | CAL_SetupAudioFile | 64 | phase-8-audio |
| ID_SD.C | SD_PlaySound | 62 | phase-8-audio |
| ID_SD.C | SD_SetMusicMode | 61 | phase-8-audio |
| ID_SD.C | SD_SetSoundMode | 60 | phase-8-audio |
| ID_SD.C | SD_StopSound | 63 | phase-8-audio |
| WL_GAME.C | PlaySoundLocGlobal | 57 | phase-8-audio |
| WL_GAME.C | SetSoundLoc | 55 | phase-8-audio |
| WL_GAME.C | UpdateSoundLoc | 56 | phase-8-audio |
| ID_MM.C | MM_FreePtr | 102 | shared |
| ID_MM.C | MM_GetPtr | 101 | shared |
| ID_MM.C | MM_SetLock | 104 | shared |
| ID_MM.C | MM_SetPurge | 103 | shared |
| ID_MM.C | MM_SortMem | 105 | shared |
| ID_PM.C | PM_CheckMainMem | 106 | shared |
| ID_PM.C | PM_GetPage | 108 | shared |
| ID_PM.C | PM_GetPageAddress | 107 | shared |
| ID_PM.C | PM_NextFrame | 109 | shared |
| ID_PM.C | PM_Reset | 110 | shared |
| ID_VH.C | LatchDrawPic | 143 | shared |
| ID_VH.C | LoadLatchMem | 144 | shared |
| ID_VH.C | VL_MungePic | 145 | shared |
| ID_VH.C | VW_DrawColorPropString | 132 | shared |
| ID_VH.C | VW_DrawPropString | 131 | shared |
| ID_VH.C | VW_MarkUpdateBlock | 141 | shared |
| ID_VH.C | VW_MeasureMPropString | 133 | shared |
| ID_VH.C | VW_MeasurePropString | 111 | shared |
| ID_VH.C | VW_UpdateScreen | 142 | shared |
| ID_VH.C | VWB_Bar | 113 | shared |
| ID_VH.C | VWB_DrawPic | 112 | shared |
| ID_VH.C | VWB_DrawPropString | 125 | shared |
| ID_VH.C | VWB_DrawTile8 | 134 | shared |
| ID_VH.C | VWB_DrawTile8M | 135 | shared |
| ID_VH.C | VWB_Hlin | 122 | shared |
| ID_VH.C | VWB_Plot | 121 | shared |
| ID_VH.C | VWB_Vlin | 123 | shared |
| ID_VH.C | VWL_MeasureString | 124 | shared |
| ID_VL.C | VL_Bar | 114 | shared |
| ID_VL.C | VL_ClearVideo | 130 | shared |
| ID_VL.C | VL_ColorBorder | 150 | shared |
| ID_VL.C | VL_FadeIn | 117 | shared |
| ID_VL.C | VL_FadeOut | 118 | shared |
| ID_VL.C | VL_FillPalette | 140 | shared |
| ID_VL.C | VL_GetColor | 137 | shared |
| ID_VL.C | VL_GetPalette | 139 | shared |
| ID_VL.C | VL_Hlin | 120 | shared |
| ID_VL.C | VL_LatchToScreen | 116 | shared |
| ID_VL.C | VL_MaskedToScreen | 128 | shared |
| ID_VL.C | VL_MemToLatch | 129 | shared |
| ID_VL.C | VL_MemToScreen | 115 | shared |
| ID_VL.C | VL_Plot | 119 | shared |
| ID_VL.C | VL_ScreenToScreen | 127 | shared |
| ID_VL.C | VL_SetColor | 136 | shared |
| ID_VL.C | VL_SetLineWidth | 146 | shared |
| ID_VL.C | VL_SetPalette | 138 | shared |
| ID_VL.C | VL_SetSplitScreen | 147 | shared |
| ID_VL.C | VL_SetTextMode | 149 | shared |
| ID_VL.C | VL_SetVGAPlaneMode | 148 | shared |
| ID_VL.C | VL_Vlin | 126 | shared |

## Excluded Non-Runtime Summary

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

