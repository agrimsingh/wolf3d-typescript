# Menu System and Text Rendering

## Overview

This phase ports menu flow logic and text/layout behavior relevant to game UI interaction and presentation.

Primary C references include:

- `WL_MENU.C` (control panel and menu flow)
- `WL_TEXT.C` (text scripting/layout)
- `ID_US_1.C` (print/measure/window helpers)

## Architecture

```text
ui input + ui state -> menu/text state update -> rendered instruction model
                                                 |
                                 oracle parity for state and layout outputs
```

## Core Types

```ts
export interface MenuState {
  screen: string;
  cursorIndex: number;
  selectedEpisode?: number;
  selectedDifficulty?: number;
}

export interface TextLayoutResult {
  lines: string[];
  width: number;
  height: number;
}
```

## API / Interface

- `updateMenuState(input): MenuState`
- `drawMenuModel(input): DrawCommand[]`
- `measureText(input): TextLayoutResult`
- `layoutScriptedText(input): TextLayoutResult`

## Property Test Requirements

- Menu transition parity across randomized input sequences.
- Text measure/layout parity for randomized strings within valid constraints.
- Deterministic output parity for draw command models.

## Completion Criteria

- Menu and text functions have oracle parity tests.
- Local 1k and CI 10k gates are green.
- Phase 7 checklist and commit complete in `TODO.md`.
