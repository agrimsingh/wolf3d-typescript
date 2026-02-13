import type { RuntimeSnapshot } from '../runtime/contracts';
import { loadRuntimeCampaign } from '../runtime/wl6Campaign';
import { loadModernAssetMap, type ModernAssetRect } from '../assets/modernAssetMap';
import { WebAudioRuntimeAdapter } from './runtimeAudio';
import { RuntimeAppController, type RuntimeDebugActor, type RuntimeScenario } from './runtimeController';

const WIDTH = 320;
const HEIGHT = 200;
const MINIMAP_TILE_SIZE = 8;
const TEXTURE_SIZE = 64;
const MAX_WALL_TEXTURES = 64;
const AREATILE = 107;
const RENDER_FOV = Math.PI / 3;
const BASELINE_STATUS_TEXT = 'Wolf3D TS Runtime (WL6)';
const DATA_VARIANT = 'WL6';
const CAMPAIGN_BASE_URL = '/assets/wl6/raw';
const MODERN_ASSET_BASE_URL = '/assets/wl6-modern';
const MENU_SHEET_TARGET_ID = 'ui.menu.sheet';
const GUARD_SHEET_TARGET_ID = 'actor.guard.sheet';
const WALL_TEXTURE_TARGET_KIND = 'wallTexture';
const MODERN_WALLS_SOURCE_FILE = 'textures/walls.png';
const MODERN_WALL_TILE_SIZE = 64;
const MODERN_WALL_TILE_GAP = 1;
const MODERN_WALL_GRID_ORIGIN_X = 1;
const MODERN_WALL_GRID_ORIGIN_Y = 18;
const DOOR_TILE_MIN = 90;
const DOOR_TILE_MAX = 101;

const CURATED_WL6_WALL_SLOT_MAP: Array<{ tileId: number; row: number; col: number }> = [
  // Episode 1 opening room blue wall family.
  { tileId: 1, row: 2, col: 0 },
  { tileId: 2, row: 2, col: 1 },
  { tileId: 3, row: 2, col: 0 },
  { tileId: 5, row: 1, col: 6 },
  { tileId: 6, row: 1, col: 7 },
  { tileId: 7, row: 2, col: 1 },
  { tileId: 8, row: 1, col: 6 },
  { tileId: 9, row: 1, col: 7 },
  // Adjacent light stone band in opening.
  { tileId: 21, row: 0, col: 2 },
  // Opening room teal door family.
  { tileId: 90, row: 7, col: 0 },
  { tileId: 91, row: 7, col: 1 },
  { tileId: 100, row: 7, col: 0 },
  { tileId: 106, row: 7, col: 1 },
];

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

function readU16LE(bytes: Uint8Array, offset: number): number {
  if (offset < 0 || offset + 1 >= bytes.length) return 0;
  return (bytes[offset]! | (bytes[offset + 1]! << 8)) & 0xffff;
}

function readU32LE(bytes: Uint8Array, offset: number): number {
  if (offset < 0 || offset + 3 >= bytes.length) return 0;
  return (
    (bytes[offset]!) |
    (bytes[offset + 1]! << 8) |
    (bytes[offset + 2]! << 16) |
    (bytes[offset + 3]! << 24)
  ) >>> 0;
}

function parseVswapWallTextures(bytes: Uint8Array, maxTextures = MAX_WALL_TEXTURES): Uint8Array[] {
  if (bytes.length < 10) return [];
  const chunks = readU16LE(bytes, 0);
  const spriteStart = readU16LE(bytes, 2);
  if (chunks <= 0 || spriteStart <= 0) return [];

  const offsetTableStart = 6;
  const lengthTableStart = offsetTableStart + chunks * 4;
  if (lengthTableStart + chunks * 2 > bytes.length) return [];

  const out: Uint8Array[] = [];
  const wallChunks = Math.min(spriteStart, chunks, maxTextures);
  for (let i = 0; i < wallChunks; i++) {
    const off = readU32LE(bytes, offsetTableStart + i * 4);
    const len = readU16LE(bytes, lengthTableStart + i * 2);
    if (off === 0 || len < TEXTURE_SIZE * TEXTURE_SIZE) continue;
    if (off + len > bytes.length) continue;
    out.push(bytes.slice(off, off + TEXTURE_SIZE * TEXTURE_SIZE));
  }
  return out;
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

function normalizeRadians(angle: number): number {
  let out = angle;
  while (out < -Math.PI) out += Math.PI * 2;
  while (out > Math.PI) out -= Math.PI * 2;
  return out;
}

function wallAtTile(plane0: Uint16Array, mapWidth: number, mapHeight: number, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= mapWidth || y >= mapHeight) {
    return true;
  }
  const tile = plane0[y * mapWidth + x] ?? 0;
  return (tile & 0xffff) < AREATILE;
}

function castWallDistance(
  plane0: Uint16Array,
  mapWidth: number,
  mapHeight: number,
  startX: number,
  startY: number,
  dirX: number,
  dirY: number,
  maxDistance: number,
): number {
  const step = 0.05;
  let traveled = 0.0;
  while (traveled <= maxDistance) {
    const x = startX + dirX * traveled;
    const y = startY + dirY * traveled;
    const tx = Math.floor(x);
    const ty = Math.floor(y);
    if (wallAtTile(plane0, mapWidth, mapHeight, tx, ty)) {
      return traveled;
    }
    traveled += step;
  }
  return Number.POSITIVE_INFINITY;
}

function buildSyntheticPalette(): [number, number, number][] {
  return RENDER_PALETTE;
}

function nearestPaletteIndex(
  r: number,
  g: number,
  b: number,
  palette: [number, number, number][],
): number {
  let bestIndex = 0;
  let bestError = Number.POSITIVE_INFINITY;
  for (let i = 0; i < palette.length; i++) {
    const [pr, pg, pb] = palette[i]!;
    const dr = r - pr;
    const dg = g - pg;
    const db = b - pb;
    const err = dr * dr + dg * dg + db * db;
    if (err < bestError) {
      bestError = err;
      bestIndex = i;
    }
  }
  return bestIndex | 0;
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
  private guardSprite: HTMLCanvasElement | null = null;
  private loadedModernWallTextures = false;

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
    void this.loadGuardSprite();
    void this.controller.boot();
    this.loopHandle = requestAnimationFrame((now) => this.loop(now));
  }

  private async loadWallTextures(): Promise<void> {
    const loadedModern = await this.loadModernWallTextures();
    if (loadedModern) {
      this.loadedModernWallTextures = true;
      return;
    }

    try {
      const response = await fetch(`${CAMPAIGN_BASE_URL}/VSWAP.${DATA_VARIANT}`);
      if (!response.ok) return;
      const bytes = new Uint8Array(await response.arrayBuffer());
      const textures = parseVswapWallTextures(bytes, MAX_WALL_TEXTURES);
      if (textures.length > 0) {
        this.controller.setWallTextures(textures);
      }
    } catch {
      // Keep runtime on procedural fallback if textures cannot be loaded.
    }
  }

  private async loadModernWallTextures(): Promise<boolean> {
    try {
      const assetMap = await loadModernAssetMap();
      const wallEntries = assetMap.entries
        .filter((entry) => entry.targetKind === WALL_TEXTURE_TARGET_KIND && !!entry.rect)
        .sort((a, b) => a.targetId.localeCompare(b.targetId));
      if (wallEntries.length === 0) {
        return false;
      }

      const palette = buildSyntheticPalette();
      const imageCache = new Map<string, HTMLImageElement>();
      const extracted: Uint8Array[] = [];
      for (const entry of wallEntries) {
        const rect = entry.rect;
        if (!rect) {
          continue;
        }
        let image = imageCache.get(entry.sourceFile) ?? null;
        if (!image) {
          image = new Image();
          image.src = `${MODERN_ASSET_BASE_URL}/${entry.sourceFile}`;
          await image.decode();
          imageCache.set(entry.sourceFile, image);
        }
        const texture = this.extractModernWallTexture(image, rect, palette);
        if (texture) {
          extracted.push(texture);
        }
      }

      if (extracted.length === 0) {
        return false;
      }

      // Fill runtime slots with a coherent blue-wall default first.
      const expanded: Uint8Array[] = [];

      // Then force specific wall tile ids to known-correct atlas locations.
      let wallsImage = imageCache.get(MODERN_WALLS_SOURCE_FILE) ?? null;
      if (!wallsImage) {
        wallsImage = new Image();
        wallsImage.src = `${MODERN_ASSET_BASE_URL}/${MODERN_WALLS_SOURCE_FILE}`;
        await wallsImage.decode();
        imageCache.set(MODERN_WALLS_SOURCE_FILE, wallsImage);
      }
      const defaultBlueRect = {
        x: MODERN_WALL_GRID_ORIGIN_X + 0 * (MODERN_WALL_TILE_SIZE + MODERN_WALL_TILE_GAP),
        y: MODERN_WALL_GRID_ORIGIN_Y + 2 * (MODERN_WALL_TILE_SIZE + MODERN_WALL_TILE_GAP),
        w: MODERN_WALL_TILE_SIZE,
        h: MODERN_WALL_TILE_SIZE,
      };
      const defaultBlue = this.extractModernWallTexture(wallsImage, defaultBlueRect, palette) ?? extracted[0]!;
      for (let i = 0; i < MAX_WALL_TEXTURES; i++) {
        expanded.push(defaultBlue.slice());
      }
      for (const mapping of CURATED_WL6_WALL_SLOT_MAP) {
        const slot = (mapping.tileId - 1) | 0;
        if (slot < 0 || slot >= MAX_WALL_TEXTURES) {
          continue;
        }
        const rect = {
          x: MODERN_WALL_GRID_ORIGIN_X + mapping.col * (MODERN_WALL_TILE_SIZE + MODERN_WALL_TILE_GAP),
          y: MODERN_WALL_GRID_ORIGIN_Y + mapping.row * (MODERN_WALL_TILE_SIZE + MODERN_WALL_TILE_GAP),
          w: MODERN_WALL_TILE_SIZE,
          h: MODERN_WALL_TILE_SIZE,
        };
        const texture = this.extractModernWallTexture(wallsImage, rect, palette);
        if (texture) {
          expanded[slot] = texture;
        }
      }
      for (let tileId = DOOR_TILE_MIN; tileId <= DOOR_TILE_MAX; tileId++) {
        const slot = (tileId - 1) | 0;
        if (slot < 0 || slot >= MAX_WALL_TEXTURES) {
          continue;
        }
        const col = (tileId & 1) === 0 ? 0 : 1;
        const rect = {
          x: MODERN_WALL_GRID_ORIGIN_X + col * (MODERN_WALL_TILE_SIZE + MODERN_WALL_TILE_GAP),
          y: MODERN_WALL_GRID_ORIGIN_Y + 7 * (MODERN_WALL_TILE_SIZE + MODERN_WALL_TILE_GAP),
          w: MODERN_WALL_TILE_SIZE,
          h: MODERN_WALL_TILE_SIZE,
        };
        const texture = this.extractModernWallTexture(wallsImage, rect, palette);
        if (texture) {
          expanded[slot] = texture;
        }
      }
      this.controller.setWallTextures(expanded);
      return true;
    } catch {
      return false;
    }
  }

  private extractModernWallTexture(
    image: HTMLImageElement,
    rect: ModernAssetRect,
    palette: [number, number, number][],
  ): Uint8Array | null {
    const canvas = document.createElement('canvas');
    canvas.width = TEXTURE_SIZE;
    canvas.height = TEXTURE_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      image,
      rect.x | 0,
      rect.y | 0,
      Math.max(1, rect.w | 0),
      Math.max(1, rect.h | 0),
      0,
      0,
      TEXTURE_SIZE,
      TEXTURE_SIZE,
    );
    const pixels = ctx.getImageData(0, 0, TEXTURE_SIZE, TEXTURE_SIZE).data;
    const out = new Uint8Array(TEXTURE_SIZE * TEXTURE_SIZE);
    for (let y = 0; y < TEXTURE_SIZE; y++) {
      for (let x = 0; x < TEXTURE_SIZE; x++) {
        const src = (y * TEXTURE_SIZE + x) * 4;
        const r = pixels[src] ?? 0;
        const g = pixels[src + 1] ?? 0;
        const b = pixels[src + 2] ?? 0;
        // Runtime expects VSWAP-style column-major texels.
        out[x * TEXTURE_SIZE + y] = nearestPaletteIndex(r, g, b, palette);
      }
    }
    return out;
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

  private async loadGuardSprite(): Promise<void> {
    try {
      const assetMap = await loadModernAssetMap();
      const guardSheet = assetMap.entries.find((entry) => entry.targetKind === 'actorSheet' && entry.targetId === GUARD_SHEET_TARGET_ID && !!entry.rect);
      if (!guardSheet || !guardSheet.rect) {
        return;
      }
      const image = new Image();
      image.src = `${MODERN_ASSET_BASE_URL}/${guardSheet.sourceFile}`;
      await image.decode();
      this.guardSprite = this.extractGuardSprite(image, guardSheet.rect);
    } catch {
      this.guardSprite = null;
    }
  }

  private extractGuardSprite(image: HTMLImageElement, rect: ModernAssetRect): HTMLCanvasElement {
    const cols = 7;
    const rows = 7;
    const cellW = Math.max(1, Math.floor(rect.w / cols));
    const cellH = Math.max(1, Math.floor(rect.h / rows));
    const srcX = rect.x + 6;
    const srcY = rect.y + 2;
    const srcW = Math.max(1, cellW - 12);
    const srcH = Math.max(1, cellH - 6);
    const canvas = document.createElement('canvas');
    canvas.width = srcW;
    canvas.height = srcH;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return canvas;
    }

    ctx.drawImage(image, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);
    const imageData = ctx.getImageData(0, 0, srcW, srcH);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] ?? 0;
      const g = data[i + 1] ?? 0;
      const b = data[i + 2] ?? 0;
      const magenta = r >= 120 && b >= 120 && g <= 110 && Math.abs(r - b) <= 80;
      if (magenta) {
        data[i + 3] = 0;
      }
    }
    ctx.putImageData(imageData, 0, 0);

    let minX = srcW;
    let minY = srcH;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < srcH; y++) {
      for (let x = 0; x < srcW; x++) {
        const alpha = data[(y * srcW + x) * 4 + 3] ?? 0;
        if (alpha <= 6) {
          continue;
        }
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }

    if (maxX < minX || maxY < minY) {
      return canvas;
    }

    const outW = (maxX - minX + 1) | 0;
    const outH = (maxY - minY + 1) | 0;
    const trimmed = document.createElement('canvas');
    trimmed.width = outW;
    trimmed.height = outH;
    const trimmedCtx = trimmed.getContext('2d');
    if (!trimmedCtx) {
      return canvas;
    }
    trimmedCtx.imageSmoothingEnabled = false;
    trimmedCtx.drawImage(canvas, minX, minY, outW, outH, 0, 0, outW, outH);
    return trimmed;
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
    this.drawActorSprites(snapshot, scenario ?? null);
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

  private drawActorSprites(snapshot: RuntimeSnapshot, scenario: RuntimeScenario | null): void {
    if (!this.guardSprite) {
      return;
    }

    const actors = this.controller.getDebugActors().filter((actor) => (actor.hp | 0) > 0);
    if (actors.length === 0) {
      return;
    }

    const posX = (snapshot.worldXQ8 ?? snapshot.xQ8) / 256;
    const posY = (snapshot.worldYQ8 ?? snapshot.yQ8) / 256;
    const angleRad = ((snapshot.angleDeg | 0) * Math.PI) / 180;
    actors.sort((a, b) => {
      const adx = (a.xQ8 | 0) / 256 - posX;
      const ady = (a.yQ8 | 0) / 256 - posY;
      const bdx = (b.xQ8 | 0) / 256 - posX;
      const bdy = (b.yQ8 | 0) / 256 - posY;
      const da = (adx * adx) + (ady * ady);
      const db = (bdx * bdx) + (bdy * bdy);
      return db - da;
    });

    this.ctx.save();
    this.ctx.imageSmoothingEnabled = false;
    const plane0 = scenario?.config.plane0 ?? null;
    const mapWidth = scenario?.config.mapWidth ?? 0;
    const mapHeight = scenario?.config.mapHeight ?? 0;

    for (const actor of actors) {
      this.drawActorSprite(actor, posX, posY, angleRad, plane0, mapWidth, mapHeight);
    }
    this.ctx.restore();
  }

  private drawActorSprite(
    actor: RuntimeDebugActor,
    posX: number,
    posY: number,
    angleRad: number,
    plane0: Uint16Array | null,
    mapWidth: number,
    mapHeight: number,
  ): void {
    if (!this.guardSprite) {
      return;
    }

    const actorX = (actor.xQ8 | 0) / 256;
    const actorY = (actor.yQ8 | 0) / 256;
    const relX = actorX - posX;
    const relY = actorY - posY;
    const dist = Math.hypot(relX, relY);
    if (dist < 0.2 || dist > 16) {
      return;
    }
    if (plane0 && mapWidth > 0 && mapHeight > 0) {
      const dirX = relX / Math.max(0.0001, dist);
      const dirY = relY / Math.max(0.0001, dist);
      const wallDistance = castWallDistance(plane0, mapWidth, mapHeight, posX, posY, dirX, dirY, dist);
      if (wallDistance + 0.08 < dist) {
        return;
      }
    }

    const delta = normalizeRadians(Math.atan2(-relY, relX) - angleRad);
    if (Math.abs(delta) > (RENDER_FOV * 0.65)) {
      return;
    }

    const screenX = ((delta / RENDER_FOV) + 0.5) * WIDTH;
    const spriteH = clampI32((HEIGHT / dist) | 0, 14, 110);
    const spriteW = clampI32(((spriteH * this.guardSprite.width) / Math.max(1, this.guardSprite.height)) | 0, 8, 96);
    const left = clampI32((screenX - (spriteW / 2)) | 0, -spriteW, WIDTH);
    const top = clampI32(((HEIGHT / 2) - (spriteH / 2)) | 0, -spriteH, HEIGHT);
    this.ctx.globalAlpha = actor.mode === 2 ? 0.95 : 0.88;
    this.ctx.drawImage(this.guardSprite, left, top, spriteW, spriteH);
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
