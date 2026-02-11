import { raycastDistanceQ16 } from '../render/raycast';
import { playerMovePacked } from '../player/movement';
import { gameEventHash } from '../game/state';
import { menuReducePacked } from '../ui/menu';

const WIDTH = 320;
const HEIGHT = 200;
const FOV = Math.PI / 3;

function makeBorderMapBits(): { lo: number; hi: number } {
  let lo = 0;
  let hi = 0;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const wall = x === 0 || y === 0 || x === 7 || y === 7 || (x === 4 && y > 1 && y < 6);
      if (!wall) continue;
      const bit = y * 8 + x;
      if (bit < 32) lo |= 1 << bit;
      else hi |= 1 << (bit - 32);
    }
  }
  return { lo: lo >>> 0, hi: hi >>> 0 };
}

export class WolfApp {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly image: ImageData;
  private readonly map = makeBorderMapBits();

  private xQ8 = (2.5 * 256) | 0;
  private yQ8 = (2.5 * 256) | 0;
  private angle = 0;

  private score = 0;
  private lives = 3;
  private health = 100;
  private ammo = 8;
  private menuPacked = menuReducePacked(0, 0, 0, 4);

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
    requestAnimationFrame(() => this.loop());
  }

  private bindControls(): void {
    window.addEventListener('keydown', (event) => {
      const speed = 14;
      if (event.key === 'ArrowLeft') this.angle -= 0.1;
      if (event.key === 'ArrowRight') this.angle += 0.1;

      const dx = Math.cos(this.angle) * speed;
      const dy = Math.sin(this.angle) * speed;

      if (event.key === 'ArrowUp') {
        const packed = playerMovePacked(this.map.lo, this.map.hi, this.xQ8, this.yQ8, dx | 0, dy | 0);
        this.xQ8 = packed >> 16;
        this.yQ8 = (packed << 16) >> 16;
      }
      if (event.key === 'ArrowDown') {
        const packed = playerMovePacked(this.map.lo, this.map.hi, this.xQ8, this.yQ8, (-dx) | 0, (-dy) | 0);
        this.xQ8 = packed >> 16;
        this.yQ8 = (packed << 16) >> 16;
      }
      if (event.key === ' ') {
        this.score = (this.score + 25) | 0;
      }
      if (event.key.toLowerCase() === 'm') {
        this.menuPacked = menuReducePacked(this.menuPacked >> 8, this.menuPacked & 0xff, 1, 4);
      }
    });
  }

  private loop(): void {
    this.renderFrame();
    requestAnimationFrame(() => this.loop());
  }

  private renderFrame(): void {
    const pixels = this.image.data;
    pixels.fill(0);

    for (let x = 0; x < WIDTH; x++) {
      const camera = (x / WIDTH) - 0.5;
      const rayAngle = this.angle + camera * FOV;
      const dirXQ16 = (Math.cos(rayAngle) * 0.05 * 65536) | 0;
      const dirYQ16 = (Math.sin(rayAngle) * 0.05 * 65536) | 0;

      const distQ16 = raycastDistanceQ16(
        this.map.lo,
        this.map.hi,
        (this.xQ8 << 8) | 0,
        (this.yQ8 << 8) | 0,
        dirXQ16,
        dirYQ16,
        1024,
      );

      const safeDist = distQ16 > 0 ? distQ16 / 65536 : 1;
      const wallHeight = Math.min(HEIGHT, Math.max(2, (HEIGHT / (safeDist * 4)) | 0));
      const top = (HEIGHT / 2 - wallHeight / 2) | 0;
      const bottom = top + wallHeight;

      for (let y = 0; y < HEIGHT; y++) {
        const idx = (y * WIDTH + x) * 4;
        if (y >= top && y <= bottom) {
          pixels[idx] = 190;
          pixels[idx + 1] = 30;
          pixels[idx + 2] = 30;
        } else if (y < HEIGHT / 2) {
          pixels[idx] = 30;
          pixels[idx + 1] = 30;
          pixels[idx + 2] = 60;
        } else {
          pixels[idx] = 20;
          pixels[idx + 1] = 20;
          pixels[idx + 2] = 20;
        }
        pixels[idx + 3] = 255;
      }
    }

    const stateHash = gameEventHash(this.score, this.lives, this.health, this.ammo, 0, 0);
    const status = `x:${(this.xQ8 / 256).toFixed(2)} y:${(this.yQ8 / 256).toFixed(2)} score:${this.score} hash:${stateHash >>> 0} menu:${this.menuPacked}`;

    this.ctx.putImageData(this.image, 0, 0);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '10px monospace';
    this.ctx.fillText(status, 6, 12);
    this.ctx.fillText('Arrows move, Space scores, M advances menu', 6, HEIGHT - 8);
  }
}
