import { readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(process.cwd(), 'assets', 'wl1');

const required = [
  'GAMEMAPS.WL1',
  'MAPHEAD.WL1',
  'VSWAP.WL1',
  'VGAGRAPH.WL1',
  'VGAHEAD.WL1',
  'VGADICT.WL1',
  'AUDIOHED.WL1',
  'AUDIOT.WL1',
];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...walk(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

function main(): void {
  const files = walk(root);
  const names = new Set(files.map((path) => path.split('/').at(-1)?.toUpperCase() ?? ''));

  const missing = required.filter((name) => !names.has(name));
  if (missing.length > 0) {
    console.error('Missing WL1 files:');
    for (const m of missing) {
      console.error(`- ${m}`);
    }
    process.exit(1);
  }

  console.log(`WL1 assets valid at ${root}`);
  console.log(`Validated files: ${required.join(', ')}`);
}

main();
