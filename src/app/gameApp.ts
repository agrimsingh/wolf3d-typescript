import { raycastDistanceQ16 } from '../render/raycast';
import type { RuntimeSnapshot } from '../runtime/contracts';
import { WebAudioRuntimeAdapter } from './runtimeAudio';
import { RuntimeAppController } from './runtimeController';

const WIDTH = 320;
const HEIGHT = 200;
const FOV = Math.PI / 3;
const MINIMAP_TILE_SIZE = 8;

function wallAt(mapLo: number, mapHi: number, x: number, y: number): boolean {
  if (x < 0 || x >= 8 || y < 0 || y >= 8) {
    return true;
  }
  const bit = y * 8 + x;
  if (bit < 32) {
    return ((mapLo >>> bit) & 1) === 1;
  }
  return ((mapHi >>> (bit - 32)) & 1) === 1;
}

export class WolfApp {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly image: ImageData;
  private readonly controller = new RuntimeAppController({
    audio: new WebAudioRuntimeAdapter(),
  });
  private loopHandle = 0;

  constructor(container: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = WIDTH;
    this.canvas.height = HEIGHT;
    container.appendChild(this.canvas);

    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('2D context unavailable');
    this.ctx = ctx;
    this.image = ctx.createImageData(WIDTH, HEIGHT);

    this.bindControls();
    void this.controller.boot();
    this.loopHandle = requestAnimationFrame((now) => this.loop(now));
  }

  private bindControls(): void {
    window.addEventListener('keydown', (event) => {
      this.controller.onKeyDown(event.code);
      event.preventDefault();
    });

    window.addEventListener('keyup', (event) => {
      this.controller.onKeyUp(event.code);
      event.preventDefault();
    });

    this.canvas.addEventListener('click', () => {
      if (this.controller.getState().mode === 'playing' && document.pointerLockElement !== this.canvas) {
        void this.canvas.requestPointerLock();
      }
    });

    window.addEventListener('mousemove', (event) => {
      if (document.pointerLockElement !== this.canvas) {
        return;
      }
      this.controller.onMouseMove(event.movementX);
    });
  }

  private drawLoadingFrame(): void {
    this.ctx.fillStyle = '#040404';
    this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
    this.ctx.fillStyle = '#d6d6d6';
    this.ctx.font = '12px monospace';
    this.ctx.fillText('Loading WL1 assets and runtime...', 18, HEIGHT / 2);
  }

  private drawMenuFrame(): void {
    const state = this.controller.getState();

    this.ctx.fillStyle = '#02060d';
    this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
    this.ctx.fillStyle = '#d6dfef';
    this.ctx.font = '14px monospace';
    this.ctx.fillText('Wolf3D TS Runtime Menu', 18, 24);
    this.ctx.font = '10px monospace';
    this.ctx.fillText('Arrow keys: select map  Enter: start  N: next level  Esc: menu', 18, 40);

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
    const pixels = this.image.data;
    pixels.fill(0);

    // The oracle runtime currently exports a deterministic synthetic indexed buffer,
    // not a real frame. Render from runtime state + map data until real frame export lands.
    const angleRad = (snapshot.angleDeg * Math.PI) / 180;
    for (let x = 0; x < WIDTH; x++) {
      const camera = x / WIDTH - 0.5;
      const rayAngle = angleRad + camera * FOV;
      const dirXQ16 = (Math.cos(rayAngle) * 0.05 * 65536) | 0;
      const dirYQ16 = (Math.sin(rayAngle) * 0.05 * 65536) | 0;
      const distQ16 = raycastDistanceQ16(mapLo, mapHi, snapshot.xQ8 << 8, snapshot.yQ8 << 8, dirXQ16, dirYQ16, 1024);
      const safeDist = distQ16 > 0 ? distQ16 / 65536 : 1;
      const wallHeight = Math.min(HEIGHT, Math.max(2, (HEIGHT / (safeDist * 4)) | 0));
      const top = (HEIGHT / 2 - wallHeight / 2) | 0;
      const bottom = top + wallHeight;
      const shade = Math.max(40, Math.min(220, (220 / (1 + safeDist * 0.8)) | 0));

      for (let y = 0; y < HEIGHT; y++) {
        const idx = (y * WIDTH + x) * 4;
        if (y >= top && y <= bottom) {
          pixels[idx] = shade;
          pixels[idx + 1] = (shade * 0.4) | 0;
          pixels[idx + 2] = (shade * 0.3) | 0;
        } else if (y < HEIGHT / 2) {
          pixels[idx] = 22;
          pixels[idx + 1] = 28;
          pixels[idx + 2] = 56;
        } else {
          pixels[idx] = 16;
          pixels[idx + 1] = 14;
          pixels[idx + 2] = 12;
        }
        pixels[idx + 3] = 255;
      }
    }

    this.ctx.putImageData(this.image, 0, 0);
    this.drawMiniMap(mapLo, mapHi, snapshot);

    this.ctx.fillStyle = '#f5f7ff';
    this.ctx.font = '10px monospace';
    if (scenario) {
      this.ctx.fillText(`Map ${scenario.mapIndex}: ${scenario.mapName}`, 8, 12);
    } else {
      this.ctx.fillText('Runtime Framebuffer', 8, 12);
    }
    this.ctx.fillText(`hp:${snapshot.health} ammo:${snapshot.ammo} tick:${snapshot.tick}`, 8, 24);
    this.ctx.fillText(`x:${(snapshot.xQ8 / 256).toFixed(2)} y:${(snapshot.yQ8 / 256).toFixed(2)} angle:${snapshot.angleDeg}`, 8, 36);
    this.ctx.fillText(`snapshot:${snapshot.hash >>> 0} frame:${state.frameHash >>> 0}`, 8, HEIGHT - 10);
  }

  private drawMiniMap(mapLo: number, mapHi: number, snapshot: RuntimeSnapshot): void {
    const ox = WIDTH - MINIMAP_TILE_SIZE * 8 - 10;
    const oy = 10;
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    this.ctx.fillRect(ox - 3, oy - 3, MINIMAP_TILE_SIZE * 8 + 6, MINIMAP_TILE_SIZE * 8 + 6);

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        this.ctx.fillStyle = wallAt(mapLo, mapHi, x, y) ? '#61351d' : '#263243';
        this.ctx.fillRect(ox + x * MINIMAP_TILE_SIZE, oy + y * MINIMAP_TILE_SIZE, MINIMAP_TILE_SIZE - 1, MINIMAP_TILE_SIZE - 1);
      }
    }

    const px = ox + (snapshot.xQ8 / 256) * MINIMAP_TILE_SIZE;
    const py = oy + (snapshot.yQ8 / 256) * MINIMAP_TILE_SIZE;
    this.ctx.fillStyle = '#ffe082';
    this.ctx.fillRect(px - 1.5, py - 1.5, 3, 3);

    const dir = (snapshot.angleDeg * Math.PI) / 180;
    this.ctx.strokeStyle = '#ffe082';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(px, py);
    this.ctx.lineTo(px + Math.cos(dir) * 7, py + Math.sin(dir) * 7);
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
