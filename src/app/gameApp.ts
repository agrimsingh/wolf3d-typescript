import type { RuntimeSnapshot } from '../runtime/contracts';
import { loadRuntimeCampaign } from '../runtime/wl6Campaign';
import { loadModernAssetMap, type ModernAssetRect } from '../assets/modernAssetMap';
import { WebAudioRuntimeAdapter } from './runtimeAudio';
import { RuntimeAppController, type RuntimeScenario } from './runtimeController';
import {
  decodeSpriteChunk,
  decodeVswapIndex,
  decodeWallTexture,
} from '../runtime/wl6AssetDecode';

const WIDTH = 320;
const HEIGHT = 200;
const MINIMAP_TILE_SIZE = 8;
const MAX_WALL_TEXTURES = 128;
const AREATILE = 107;
const BASELINE_STATUS_TEXT = 'Wolf3D TS Runtime (WL6)';
const DATA_VARIANT = 'WL6';
const CAMPAIGN_BASE_URL = '/assets/wl6/raw';
const MODERN_ASSET_BASE_URL = '/assets/wl6-modern';
const MENU_SHEET_TARGET_ID = 'ui.menu.sheet';

function wallAtWindowBits(mapLo: number, mapHi: number, x: number, y: number): boolean {
  if (x < 0 || x >= 8 || y < 0 || y >= 8) {
    return true;
  }
  const bit = y * 8 + x;
  if (bit < 32) {
    return ((mapLo >>> bit) & 1) === 1;
  }
  return ((mapHi >>> (bit - 32)) & 1) === 1;
}

function wallAtPlane(plane0: Uint16Array, mapWidth: number, mapHeight: number, x: number, y: number): boolean {
  if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) {
    return true;
  }
  const tile = plane0[y * mapWidth + x] ?? 0;
  return (tile & 0xffff) < AREATILE;
}


function buildRenderPalette(): [number, number, number][] {
  const palette: [number, number, number][] = new Array(256);
  for (let i = 0; i < 256; i++) {
    const r3 = (i >> 5) & 0x07;
    const g3 = (i >> 2) & 0x07;
    const b2 = i & 0x03;
    const r = ((r3 * 255) / 7) | 0;
    const g = ((g3 * 255) / 7) | 0;
    const b = ((b2 * 255) / 3) | 0;
    palette[i] = [r, g, b];
  }
  // Runtime-fixed color indices used by tsRuntime for non-textured spans.
  palette[2] = [0, 0, 0];
  palette[6] = [92, 92, 92];
  palette[29] = [70, 70, 70];
  palette[228] = [180, 180, 180];
  return palette;
}

const RENDER_PALETTE = buildRenderPalette();

function paletteIndexToRgb(index: number): [number, number, number] {
  return RENDER_PALETTE[index & 0xff] ?? [0, 0, 0];
}

function clampI32(v: number, minv: number, maxv: number): number {
  return Math.max(minv, Math.min(maxv, v | 0)) | 0;
}

export class WolfApp {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly image: ImageData;
  private readonly controller = new RuntimeAppController({
    audio: new WebAudioRuntimeAdapter(),
    scenarioLoader: () =>
      loadRuntimeCampaign({
        baseUrl: CAMPAIGN_BASE_URL,
        stepsPerScenario: 64,
        variant: DATA_VARIANT,
      }),
  });
  private loopHandle = 0;
  private lastMouseClientX: number | null = null;
  private hudPanelImage: HTMLImageElement | null = null;
  private hudPanelRect: ModernAssetRect | null = null;
  private menuSheetImage: HTMLImageElement | null = null;
  private menuSheetRect: ModernAssetRect | null = null;

  constructor(container: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = WIDTH;
    this.canvas.height = HEIGHT;
    this.canvas.tabIndex = 0;
    this.canvas.style.width = 'min(96vw, 960px)';
    this.canvas.style.height = 'auto';
    this.canvas.style.aspectRatio = `${WIDTH} / ${HEIGHT}`;
    container.appendChild(this.canvas);

    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('2D context unavailable');
    this.ctx = ctx;
    this.image = ctx.createImageData(WIDTH, HEIGHT);

    this.bindControls();
    this.controller.setProceduralActorSpritesEnabled(false);
    void this.loadWallTextures();
    void this.loadHudPanel();
    void this.loadMenuSkin();
    void this.controller.boot();
    this.loopHandle = requestAnimationFrame((now) => this.loop(now));
  }

  private async loadWallTextures(): Promise<void> {
    try {
      const response = await fetch(`${CAMPAIGN_BASE_URL}/VSWAP.${DATA_VARIANT}`);
      if (!response.ok) return;
      const bytes = new Uint8Array(await response.arrayBuffer());
      const index = decodeVswapIndex(bytes);
      const textures: Uint8Array[] = [];
      const maxTextures = Math.min(index.wallCount | 0, MAX_WALL_TEXTURES);
      for (let i = 0; i < maxTextures; i++) {
        textures.push(decodeWallTexture(bytes, index, i));
      }
      if (textures.length > 0) {
        this.controller.setWallTextures(textures);
        this.controller.setVswapAssetIndex({
          ...index,
          bytes,
        });
        this.controller.setSpriteDecoder({
          decodeSprite: (spriteId: number) => {
            if (!Number.isInteger(spriteId) || spriteId < 0) {
              return null;
            }
            const sprite = decodeSpriteChunk(bytes, index, spriteId | 0);
            if (sprite.lastCol < sprite.firstCol || sprite.pixelPool.length <= 0) {
              return null;
            }
            return sprite;
          },
        });
      }
    } catch {
      // Keep runtime on procedural fallback if textures cannot be loaded.
    }
  }

  private async loadHudPanel(): Promise<void> {
    try {
      const assetMap = await loadModernAssetMap();
      const hudPanel = assetMap.entries.find((entry) => entry.targetKind === 'uiSprite' && entry.targetId === 'ui.hud.panel' && !!entry.rect);
      if (!hudPanel || !hudPanel.rect) {
        return;
      }
      const image = new Image();
      image.src = `${MODERN_ASSET_BASE_URL}/${hudPanel.sourceFile}`;
      await image.decode();
      this.hudPanelImage = image;
      this.hudPanelRect = hudPanel.rect;
    } catch {
      this.hudPanelImage = null;
      this.hudPanelRect = null;
    }
  }

  private async loadMenuSkin(): Promise<void> {
    try {
      const assetMap = await loadModernAssetMap();
      const menuSheet = assetMap.entries.find((entry) => entry.targetKind === 'uiSprite' && entry.targetId === MENU_SHEET_TARGET_ID && !!entry.rect);
      if (!menuSheet || !menuSheet.rect) {
        return;
      }
      const image = new Image();
      image.src = `${MODERN_ASSET_BASE_URL}/${menuSheet.sourceFile}`;
      await image.decode();
      this.menuSheetImage = image;
      this.menuSheetRect = menuSheet.rect;
    } catch {
      this.menuSheetImage = null;
      this.menuSheetRect = null;
    }
  }

  private bindControls(): void {
    window.addEventListener('keydown', (event) => {
      this.controller.onKeyDown(event.code);
      if (event.code.startsWith('Arrow') || event.code === 'Space' || event.code === 'Enter') {
        event.preventDefault();
      }
    });

    window.addEventListener('keyup', (event) => {
      this.controller.onKeyUp(event.code);
      if (event.code.startsWith('Arrow') || event.code === 'Space' || event.code === 'Enter') {
        event.preventDefault();
      }
    });

    this.canvas.addEventListener('click', () => {
      this.canvas.focus();
      this.lastMouseClientX = null;
      if (document.pointerLockElement !== this.canvas) {
        this.canvas.requestPointerLock?.();
      }
    });

    window.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement !== this.canvas) {
        this.lastMouseClientX = null;
      }
    });

    window.addEventListener('mousemove', (event) => {
      if (this.controller.getState().mode !== 'playing') {
        this.lastMouseClientX = null;
        return;
      }
      let deltaX = 0;
      if (document.pointerLockElement !== this.canvas) {
        if (document.activeElement !== this.canvas) {
          this.lastMouseClientX = null;
          return;
        }
        if (this.lastMouseClientX !== null) {
          deltaX = event.clientX - this.lastMouseClientX;
        }
        this.lastMouseClientX = event.clientX;
      } else {
        deltaX = event.movementX;
      }
      if (deltaX === 0) {
        return;
      }
      this.controller.onMouseMove(deltaX);
    });
  }

  private drawLoadingFrame(): void {
    this.ctx.fillStyle = '#040404';
    this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
    this.ctx.fillStyle = '#d6d6d6';
    this.ctx.font = '12px monospace';
    this.ctx.fillText('Loading WL6 assets and runtime...', 18, HEIGHT / 2);
  }

  private drawTitleFrame(): void {
    const drewMenuArt = this.drawMenuBackground();
    if (!drewMenuArt) {
      this.ctx.fillStyle = '#040814';
      this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
    this.ctx.fillStyle = '#f7f1d1';
    this.ctx.font = '18px monospace';
    this.ctx.fillText('Wolf3D TS Runtime (WL6)', 34, 82);
    this.ctx.fillStyle = '#d6dfef';
    this.ctx.font = '12px monospace';
    this.ctx.fillText('Press Enter to open Control Panel', 52, 128);
  }

  private drawMenuFrame(): void {
    const state = this.controller.getState();

    const drewMenuArt = this.drawMenuBackground();
    if (!drewMenuArt) {
      this.ctx.fillStyle = '#02060d';
      this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
    this.ctx.fillStyle = '#d6dfef';
    this.ctx.font = '14px monospace';
    this.ctx.fillText('Wolf3D TS Control Panel (WL6)', 18, 24);
    this.ctx.font = '10px monospace';
    this.ctx.fillStyle = '#d6dfef';
    this.ctx.fillText('Arrow keys: select map  Enter: New Game', 18, 40);

    let y = 62;
    for (let i = 0; i < state.scenarios.length; i++) {
      const scenario = state.scenarios[i]!;
      const selected = i === state.selectedScenarioIndex;
      this.ctx.fillStyle = selected ? '#ffd166' : '#9cb0cf';
      const marker = selected ? '>' : ' ';
      this.ctx.fillText(`${marker} [${scenario.mapIndex}] ${scenario.mapName}`, 20, y);
      y += 12;
    }
  }

  private drawIntermissionFrame(): void {
    const state = this.controller.getState();
    const nextScenario = state.scenarios[(state.selectedScenarioIndex + 1) % Math.max(1, state.scenarios.length)];
    const remaining = Math.max(0, Math.ceil((state.intermissionRemainingMs | 0) / 1000));

    const drewMenuArt = this.drawMenuBackground();
    if (!drewMenuArt) {
      this.ctx.fillStyle = '#0b060f';
      this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
    this.ctx.fillStyle = '#f9e6c1';
    this.ctx.font = '16px monospace';
    this.ctx.fillText('Intermission', 102, 62);
    this.ctx.fillStyle = '#d6dfef';
    this.ctx.font = '11px monospace';
    this.ctx.fillText(`Completed map: ${state.completedScenarioIndex}`, 62, 92);
    if (nextScenario) {
      this.ctx.fillText(`Next map: [${nextScenario.mapIndex}] ${nextScenario.mapName}`, 42, 112);
    }
    this.ctx.fillText(`Continuing in ${remaining}s (Enter to skip)`, 46, 142);
  }

  private drawErrorFrame(): void {
    const state = this.controller.getState();
    this.ctx.fillStyle = '#120306';
    this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
    this.ctx.fillStyle = '#ffd0d0';
    this.ctx.font = '12px monospace';
    this.ctx.fillText('Failed to boot runtime', 18, 32);
    this.ctx.fillStyle = '#ffc2a8';
    this.ctx.font = '10px monospace';
    this.ctx.fillText(state.errorMessage, 18, 50);
  }

  private drawPlayingFrame(): void {
    const state = this.controller.getState();
    const scenario = state.currentScenario;
    const snapshot = state.snapshot;
    if (!snapshot) {
      this.drawMenuFrame();
      return;
    }

    const mapLo = snapshot.mapLo >>> 0;
    const mapHi = snapshot.mapHi >>> 0;
    const posXQ8 = (snapshot.worldXQ8 ?? snapshot.xQ8) | 0;
    const posYQ8 = (snapshot.worldYQ8 ?? snapshot.yQ8) | 0;
    const pixels = this.image.data;
    const indexed = state.framebuffer?.indexedBuffer;
    if (indexed && indexed.length >= WIDTH * HEIGHT) {
      for (let i = 0; i < WIDTH * HEIGHT; i++) {
        const idx = i * 4;
        const [r, g, b] = paletteIndexToRgb(indexed[i] ?? 0);
        pixels[idx] = r;
        pixels[idx + 1] = g;
        pixels[idx + 2] = b;
        pixels[idx + 3] = 255;
      }
    } else {
      for (let i = 0; i < WIDTH * HEIGHT; i++) {
        const idx = i * 4;
        pixels[idx] = 0;
        pixels[idx + 1] = 0;
        pixels[idx + 2] = 0;
        pixels[idx + 3] = 255;
      }
    }

    this.ctx.putImageData(this.image, 0, 0);
    this.drawHudOverlay();
    this.drawMiniMap(mapLo, mapHi, snapshot, scenario ?? null);

    this.ctx.fillStyle = '#f5f7ff';
    this.ctx.font = '10px monospace';
    if (scenario) {
      this.ctx.fillText(`WL6 Map ${scenario.mapIndex}`, 8, 12);
    } else {
      this.ctx.fillText('Runtime Framebuffer', 8, 12);
    }
    this.ctx.fillText(`hp:${snapshot.health} ammo:${snapshot.ammo} tick:${snapshot.tick}`, 8, 24);
    this.ctx.fillText(`x:${(posXQ8 / 256).toFixed(2)} y:${(posYQ8 / 256).toFixed(2)} angle:${snapshot.angleDeg}`, 8, 36);
  }

  private drawHudOverlay(): void {
    if (!this.hudPanelImage || !this.hudPanelRect) {
      return;
    }
    const srcX = this.hudPanelRect.x | 0;
    const srcY = this.hudPanelRect.y | 0;
    const srcW = Math.min(320, this.hudPanelRect.w | 0);
    const srcH = Math.min(40, this.hudPanelRect.h | 0);
    const hudHeight = 28;
    this.ctx.save();
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.globalAlpha = 0.92;
    this.ctx.drawImage(this.hudPanelImage, srcX, srcY, srcW, srcH, 0, HEIGHT - hudHeight, WIDTH, hudHeight);
    this.ctx.restore();
  }

  private drawMiniMap(mapLo: number, mapHi: number, snapshot: RuntimeSnapshot, scenario: RuntimeScenario | null): void {
    const miniSize = MINIMAP_TILE_SIZE * 8;
    const ox = WIDTH - miniSize - 10;
    const oy = 10;
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    this.ctx.fillRect(ox - 3, oy - 3, miniSize + 6, miniSize + 6);

    const plane0 = scenario?.config.plane0;
    const mapWidth = scenario?.config.mapWidth ?? 8;
    const mapHeight = scenario?.config.mapHeight ?? 8;
    const useFullMap = !!plane0 && mapWidth > 0 && mapHeight > 0;

    if (useFullMap) {
      const tileW = miniSize / mapWidth;
      const tileH = miniSize / mapHeight;
      for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
          this.ctx.fillStyle = wallAtPlane(plane0!, mapWidth, mapHeight, x, y) ? '#61351d' : '#263243';
          this.ctx.fillRect(
            ox + x * tileW,
            oy + y * tileH,
            Math.max(1, tileW),
            Math.max(1, tileH),
          );
        }
      }

      const worldX = (snapshot.worldXQ8 ?? snapshot.xQ8) / 256;
      const worldY = (snapshot.worldYQ8 ?? snapshot.yQ8) / 256;
      const px = ox + worldX * tileW;
      const py = oy + worldY * tileH;
      const clampedPx = Math.max(ox + 1, Math.min(ox + miniSize - 2, px));
      const clampedPy = Math.max(oy + 1, Math.min(oy + miniSize - 2, py));

      this.ctx.fillStyle = '#ffe082';
      this.ctx.fillRect(clampedPx - 1.5, clampedPy - 1.5, 3, 3);
      const dir = (snapshot.angleDeg * Math.PI) / 180;
      this.ctx.strokeStyle = '#ffe082';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(clampedPx, clampedPy);
      this.ctx.lineTo(clampedPx + Math.cos(dir) * 7, clampedPy - Math.sin(dir) * 7);
      this.ctx.stroke();
      return;
    }

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        this.ctx.fillStyle = wallAtWindowBits(mapLo, mapHi, x, y) ? '#61351d' : '#263243';
        this.ctx.fillRect(ox + x * MINIMAP_TILE_SIZE, oy + y * MINIMAP_TILE_SIZE, MINIMAP_TILE_SIZE - 1, MINIMAP_TILE_SIZE - 1);
      }
    }

    const localX = snapshot.xQ8 / 256;
    const localY = snapshot.yQ8 / 256;
    const px = ox + localX * MINIMAP_TILE_SIZE;
    const py = oy + localY * MINIMAP_TILE_SIZE;
    const clampedPx = Math.max(ox + 1, Math.min(ox + miniSize - 2, px));
    const clampedPy = Math.max(oy + 1, Math.min(oy + miniSize - 2, py));
    this.ctx.fillStyle = '#ffe082';
    this.ctx.fillRect(clampedPx - 1.5, clampedPy - 1.5, 3, 3);

    const dir = (snapshot.angleDeg * Math.PI) / 180;
    this.ctx.strokeStyle = '#ffe082';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(clampedPx, clampedPy);
    this.ctx.lineTo(clampedPx + Math.cos(dir) * 7, clampedPy - Math.sin(dir) * 7);
    this.ctx.stroke();
  }

  private drawFrame(): void {
    const mode = this.controller.getState().mode;
    switch (mode) {
      case 'loading':
        this.drawLoadingFrame();
        break;
      case 'menu':
        this.drawMenuFrame();
        break;
      case 'title':
        this.drawTitleFrame();
        break;
      case 'playing':
        this.drawPlayingFrame();
        break;
      case 'intermission':
        this.drawIntermissionFrame();
        break;
      case 'error':
        this.drawErrorFrame();
        break;
    }
    if (mode !== 'playing') {
      this.drawBaselineStatus();
    }
  }

  private drawMenuBackground(): boolean {
    if (!this.menuSheetImage || !this.menuSheetRect) {
      return false;
    }

    this.ctx.save();
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.globalAlpha = 0.96;

    const dstX = 0;
    const dstY = 0;
    const dstW = WIDTH;
    const dstH = HEIGHT;
    const dstRatio = dstW / dstH;
    let sx = this.menuSheetRect.x | 0;
    let sy = this.menuSheetRect.y | 0;
    let sw = this.menuSheetRect.w | 0;
    let sh = this.menuSheetRect.h | 0;
    const srcRatio = sw / Math.max(1, sh);

    if (srcRatio > dstRatio) {
      const cropW = Math.round(sh * dstRatio);
      sx = sx + Math.floor(Math.max(0, sw - cropW) / 2);
      sw = Math.max(1, Math.min(sw, cropW));
    } else {
      const cropH = Math.round(sw / dstRatio);
      sy = sy + Math.floor(Math.max(0, sh - cropH) / 2);
      sh = Math.max(1, Math.min(sh, cropH));
    }

    this.ctx.drawImage(this.menuSheetImage, sx, sy, sw, sh, dstX, dstY, dstW, dstH);
    this.ctx.restore();
    return true;
  }

  private drawBaselineStatus(): void {
    const y = HEIGHT - 50;
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    this.ctx.fillRect(4, y, 176, 12);
    this.ctx.fillStyle = '#dce6ff';
    this.ctx.font = '7px monospace';
    this.ctx.fillText(`${BASELINE_STATUS_TEXT} [${DATA_VARIANT}]`, 8, y + 8);
  }

  private loop(now: number): void {
    this.controller.tick(now);
    const mode = this.controller.getState().mode;
    if (mode === 'playing' && document.activeElement !== this.canvas) {
      this.canvas.focus();
    }
    const debugGlobal = globalThis as {
      __wolfDebugState?: unknown;
      __wolfDebugController?: RuntimeAppController;
      __wolfDebugRuntime?: unknown;
    };
    debugGlobal.__wolfDebugState = this.controller.getState();
    debugGlobal.__wolfDebugController = this.controller;
    debugGlobal.__wolfDebugRuntime = (this.controller as unknown as { runtime?: unknown }).runtime;
    this.drawFrame();
    this.loopHandle = requestAnimationFrame((nextNow) => this.loop(nextNow));
  }

  dispose(): void {
    if (this.loopHandle !== 0) {
      cancelAnimationFrame(this.loopHandle);
      this.loopHandle = 0;
    }
    void this.controller.shutdown();
  }
}
