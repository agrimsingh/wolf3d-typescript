import type { RuntimeSnapshot } from '../runtime/contracts';
import { loadWl1RuntimeScenarios } from '../runtime/wl1RuntimeScenarios';
import { WebAudioRuntimeAdapter } from './runtimeAudio';
import { RuntimeAppController, type RuntimeScenario } from './runtimeController';

const WIDTH = 320;
const HEIGHT = 200;
const MINIMAP_TILE_SIZE = 8;
const TEXTURE_SIZE = 64;
const MAX_WALL_TEXTURES = 64;
const AREATILE = 107;
const PROTOTYPE_BASELINE_BANNER = 'Prototype runtime baseline active (G0-G9)';
const PROTOTYPE_BASELINE_BANNER_ID = 'runtime-baseline-banner';

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

function paletteIndexToRgb(index: number): [number, number, number] {
  const c = index & 0xff;
  const r = Math.min(255, c * 3);
  const g = Math.min(255, c * 2);
  const b = Math.min(255, c + ((c >> 5) * 8));
  return [r | 0, g | 0, b | 0];
}

export class WolfApp {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly image: ImageData;
  private readonly controller = new RuntimeAppController({
    audio: new WebAudioRuntimeAdapter(),
    scenarioLoader: () => loadWl1RuntimeScenarios('/assets/wl1', 64),
  });
  private loopHandle = 0;
  private lastMouseClientX: number | null = null;

  constructor(container: HTMLElement) {
    if (!container.querySelector(`#${PROTOTYPE_BASELINE_BANNER_ID}`)) {
      const banner = document.createElement('div');
      banner.id = PROTOTYPE_BASELINE_BANNER_ID;
      banner.textContent = PROTOTYPE_BASELINE_BANNER;
      banner.style.color = '#ffb703';
      banner.style.font = '12px monospace';
      banner.style.marginBottom = '8px';
      container.appendChild(banner);
    }

    this.canvas = document.createElement('canvas');
    this.canvas.width = WIDTH;
    this.canvas.height = HEIGHT;
    this.canvas.tabIndex = 0;
    container.appendChild(this.canvas);

    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('2D context unavailable');
    this.ctx = ctx;
    this.image = ctx.createImageData(WIDTH, HEIGHT);

    this.bindControls();
    void this.loadWallTextures();
    void this.controller.boot();
    this.loopHandle = requestAnimationFrame((now) => this.loop(now));
  }

  private async loadWallTextures(): Promise<void> {
    try {
      const response = await fetch('/assets/wl1/VSWAP.WL1');
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
    this.ctx.fillText('Loading WL1 assets and runtime...', 18, HEIGHT / 2);
    this.ctx.fillStyle = '#ffb703';
    this.ctx.font = '10px monospace';
    this.ctx.fillText(PROTOTYPE_BASELINE_BANNER, 18, HEIGHT / 2 + 16);
  }

  private drawMenuFrame(): void {
    const state = this.controller.getState();

    this.ctx.fillStyle = '#02060d';
    this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
    this.ctx.fillStyle = '#d6dfef';
    this.ctx.font = '14px monospace';
    this.ctx.fillText('Wolf3D TS Runtime Menu', 18, 24);
    this.ctx.fillStyle = '#ffb703';
    this.ctx.font = '10px monospace';
    this.ctx.fillText(PROTOTYPE_BASELINE_BANNER, 18, 34);
    this.ctx.font = '10px monospace';
    this.ctx.fillStyle = '#d6dfef';
    this.ctx.fillText('Arrow keys: select map  Enter: start  N: next level  Esc: menu', 18, 48);

    let y = 70;
    for (let i = 0; i < state.scenarios.length; i++) {
      const scenario = state.scenarios[i]!;
      const selected = i === state.selectedScenarioIndex;
      this.ctx.fillStyle = selected ? '#ffd166' : '#9cb0cf';
      const marker = selected ? '>' : ' ';
      this.ctx.fillText(`${marker} [${scenario.mapIndex}] ${scenario.mapName}`, 20, y);
      y += 12;
    }
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
    this.drawMiniMap(mapLo, mapHi, snapshot, scenario ?? null);

    this.ctx.fillStyle = '#f5f7ff';
    this.ctx.font = '10px monospace';
    if (scenario) {
      this.ctx.fillText(`Map ${scenario.mapIndex}: ${scenario.mapName}`, 8, 12);
    } else {
      this.ctx.fillText('Runtime Framebuffer', 8, 12);
    }
    this.ctx.fillText(`hp:${snapshot.health} ammo:${snapshot.ammo} tick:${snapshot.tick}`, 8, 24);
    this.ctx.fillText(`x:${(posXQ8 / 256).toFixed(2)} y:${(posYQ8 / 256).toFixed(2)} angle:${snapshot.angleDeg}`, 8, 36);
    this.ctx.fillText(`snapshot:${snapshot.hash >>> 0} frame:${state.frameHash >>> 0}`, 8, HEIGHT - 10);
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
    switch (this.controller.getState().mode) {
      case 'loading':
        this.drawLoadingFrame();
        break;
      case 'menu':
        this.drawMenuFrame();
        break;
      case 'playing':
        this.drawPlayingFrame();
        break;
      case 'error':
        this.drawErrorFrame();
        break;
    }
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
