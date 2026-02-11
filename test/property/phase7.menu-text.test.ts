import { beforeAll, describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { getOracleBridge, OracleBridge } from '../../src/oracle/bridge';
import { getNumRuns, getSeed } from './config';
import { withReplay } from './replay';
import {
  idUs1UsCPrintHash,
  idUs1UsDrawWindowHash,
  idUs1UsPrintHash,
  wlMenuCpControlHash,
  wlMenuCpNewGameHash,
  wlMenuCpSoundHash,
  wlMenuCpViewScoresHash,
  wlMenuDrawMainMenuHash,
  wlMenuDrawMenuHash,
  wlMenuMessageHash,
  wlMenuUsControlPanelHash,
  wlTextEndTextHash,
  wlTextHelpScreensHash,
} from '../../src/wolf/menu/wlMenuText';

describe('phase 7 real WOLFSRC menu/text parity', () => {
  let oracle: OracleBridge;

  beforeAll(async () => {
    oracle = await getOracleBridge();
  });

  it('ID_US_1.US_Print hash matches oracle', () => {
    withReplay('phase7.id_us_1.US_Print', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -1000, max: 1000 }),
          fc.integer({ min: -1000, max: 1000 }),
          fc.integer({ min: -16, max: 512 }),
          fc.integer({ min: 0, max: 255 }),
          fc.integer({ min: -8, max: 32 }),
          (cursorX, cursorY, textLen, color, fontWidth) => {
            expect(idUs1UsPrintHash(cursorX, cursorY, textLen, color, fontWidth) >>> 0).toBe(
              oracle.idUs1UsPrintHash(cursorX, cursorY, textLen, color, fontWidth) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('ID_US_1.US_CPrint hash matches oracle', () => {
    withReplay('phase7.id_us_1.US_CPrint', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -1000, max: 1000 }),
          fc.integer({ min: -1000, max: 1000 }),
          fc.integer({ min: -16, max: 512 }),
          fc.integer({ min: 0, max: 1 }),
          fc.integer({ min: -8, max: 32 }),
          (windowX, windowW, textLen, align, fontWidth) => {
            expect(idUs1UsCPrintHash(windowX, windowW, textLen, align, fontWidth) >>> 0).toBe(
              oracle.idUs1UsCPrintHash(windowX, windowW, textLen, align, fontWidth) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('ID_US_1.US_DrawWindow hash matches oracle', () => {
    withReplay('phase7.id_us_1.US_DrawWindow', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -1000, max: 1000 }),
          fc.integer({ min: -1000, max: 1000 }),
          fc.integer({ min: -100, max: 1000 }),
          fc.integer({ min: -100, max: 1000 }),
          fc.integer({ min: 0, max: 255 }),
          fc.integer({ min: 0, max: 255 }),
          (x, y, w, h, frameColor, fillColor) => {
            expect(idUs1UsDrawWindowHash(x, y, w, h, frameColor, fillColor) >>> 0).toBe(
              oracle.idUs1UsDrawWindowHash(x, y, w, h, frameColor, fillColor) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_MENU.US_ControlPanel hash matches oracle', () => {
    withReplay('phase7.wl_menu.US_ControlPanel', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 16 }),
          fc.integer({ min: -32, max: 64 }),
          fc.integer({ min: 0, max: 0xff }),
          fc.integer({ min: 0, max: 32 }),
          (screen, cursor, inputMask, menuItems) => {
            expect(wlMenuUsControlPanelHash(screen, cursor, inputMask, menuItems) >>> 0).toBe(
              oracle.wlMenuUsControlPanelHash(screen, cursor, inputMask, menuItems) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_MENU.DrawMainMenu hash matches oracle', () => {
    withReplay('phase7.wl_menu.DrawMainMenu', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -16, max: 32 }),
          fc.integer({ min: 0, max: 0xff }),
          fc.integer({ min: 0, max: 2 }),
          (selected, enabledMask, episode) => {
            expect(wlMenuDrawMainMenuHash(selected, enabledMask, episode) >>> 0).toBe(
              oracle.wlMenuDrawMainMenuHash(selected, enabledMask, episode) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_MENU.DrawMenu hash matches oracle', () => {
    withReplay('phase7.wl_menu.DrawMenu', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 32 }),
          fc.integer({ min: -32, max: 64 }),
          fc.integer({ min: -4, max: 32 }),
          fc.integer({ min: 0, max: 0xffffffff }),
          fc.integer({ min: -128, max: 128 }),
          (menuId, cursor, itemCount, disabledMask, scroll) => {
            expect(wlMenuDrawMenuHash(menuId, cursor, itemCount, disabledMask, scroll) >>> 0).toBe(
              oracle.wlMenuDrawMenuHash(menuId, cursor, itemCount, disabledMask, scroll) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_MENU.CP_NewGame hash matches oracle', () => {
    withReplay('phase7.wl_menu.CP_NewGame', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 5 }),
          fc.integer({ min: 0, max: 2 }),
          fc.integer({ min: 0, max: 15 }),
          fc.integer({ min: 0, max: 4 }),
          (difficulty, episode, startLevel, weapon) => {
            expect(wlMenuCpNewGameHash(difficulty, episode, startLevel, weapon) >>> 0).toBe(
              oracle.wlMenuCpNewGameHash(difficulty, episode, startLevel, weapon) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_MENU.CP_ViewScores hash matches oracle', () => {
    withReplay('phase7.wl_menu.CP_ViewScores', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 2_000_000 }),
          fc.integer({ min: 0, max: 2_000_000 }),
          fc.integer({ min: 0, max: 2_000_000 }),
          fc.integer({ min: 0, max: 2_000_000 }),
          fc.integer({ min: 0, max: 2_000_000 }),
          fc.integer({ min: 0, max: 2_000_000 }),
          (top0, top1, top2, top3, top4, newScore) => {
            expect(wlMenuCpViewScoresHash(top0, top1, top2, top3, top4, newScore) >>> 0).toBe(
              oracle.wlMenuCpViewScoresHash(top0, top1, top2, top3, top4, newScore) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_MENU.CP_Sound hash matches oracle', () => {
    withReplay('phase7.wl_menu.CP_Sound', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 3 }),
          fc.integer({ min: 0, max: 3 }),
          fc.integer({ min: 0, max: 3 }),
          fc.integer({ min: 0, max: 3 }),
          (soundMode, musicMode, digiMode, action) => {
            expect(wlMenuCpSoundHash(soundMode, musicMode, digiMode, action) >>> 0).toBe(
              oracle.wlMenuCpSoundHash(soundMode, musicMode, digiMode, action) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_MENU.CP_Control hash matches oracle', () => {
    withReplay('phase7.wl_menu.CP_Control', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1 }),
          fc.integer({ min: 0, max: 1 }),
          fc.integer({ min: -8, max: 32 }),
          fc.integer({ min: 0, max: 3 }),
          (mouseEnabled, joystickEnabled, sensitivity, action) => {
            expect(wlMenuCpControlHash(mouseEnabled, joystickEnabled, sensitivity, action) >>> 0).toBe(
              oracle.wlMenuCpControlHash(mouseEnabled, joystickEnabled, sensitivity, action) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_MENU.Message hash matches oracle', () => {
    withReplay('phase7.wl_menu.Message', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -32, max: 2048 }),
          fc.integer({ min: 0, max: 1 }),
          fc.integer({ min: 0, max: 0xff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          (messageLen, waitForAck, inputMask, rng) => {
            expect(wlMenuMessageHash(messageLen, waitForAck, inputMask, rng) >>> 0).toBe(
              oracle.wlMenuMessageHash(messageLen, waitForAck, inputMask, rng) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_TEXT.HelpScreens hash matches oracle', () => {
    withReplay('phase7.wl_text.HelpScreens', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -16, max: 64 }),
          fc.integer({ min: -4, max: 32 }),
          fc.integer({ min: 0, max: 0xff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          (page, totalPages, inputMask, rng) => {
            expect(wlTextHelpScreensHash(page, totalPages, inputMask, rng) >>> 0).toBe(
              oracle.wlTextHelpScreensHash(page, totalPages, inputMask, rng) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_TEXT.EndText hash matches oracle', () => {
    withReplay('phase7.wl_text.EndText', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -32, max: 4096 }),
          fc.integer({ min: -128, max: 32768 }),
          fc.integer({ min: -8, max: 64 }),
          fc.integer({ min: 0, max: 0xff }),
          (textLen, scrollPos, speed, inputMask) => {
            expect(wlTextEndTextHash(textLen, scrollPos, speed, inputMask) >>> 0).toBe(
              oracle.wlTextEndTextHash(textLen, scrollPos, speed, inputMask) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });
});
