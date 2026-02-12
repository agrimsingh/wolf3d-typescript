import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WolfsrcOraclePort } from '../../src/oracle/runtimeOracle';
import { OracleBridge } from '../../src/oracle/bridge';
import type { RuntimeConfig, RuntimeInput } from '../../src/runtime/contracts';

const AREATILE = 107;

type TraceSymbol = {
  id: number;
  file: string;
  func: string;
  notes: string;
};

type Plane0Map = {
  mapIndex: number;
  mapName: string;
  width: number;
  height: number;
  plane0: Uint16Array;
};

type TraceScenario = {
  mapIndex: number;
  mapName: string;
  seed: number;
  config: RuntimeConfig;
  steps: RuntimeInput[];
};

type SymbolParityCoverage = {
  status: 'done' | 'todo';
  parity: string;
};

const TRACE_SYMBOLS: TraceSymbol[] = [
  { id: 1, file: 'runtime/wolfsrc_runtime_oracle.c', func: 'oracle_runtime_init', notes: 'runtime bootstrap entrypoint' },
  { id: 2, file: 'runtime/wolfsrc_runtime_oracle.c', func: 'oracle_runtime_reset', notes: 'restores boot snapshot' },
  { id: 3, file: 'runtime/wolfsrc_runtime_oracle.c', func: 'oracle_runtime_step', notes: 'runtime tick loop entrypoint' },
  { id: 4, file: 'runtime/wolfsrc_runtime_oracle.c', func: 'oracle_runtime_snapshot_hash', notes: 'snapshot hash API' },
  { id: 5, file: 'runtime/wolfsrc_runtime_oracle.c', func: 'oracle_runtime_render_frame_hash', notes: 'frame-hash API' },
  { id: 6, file: 'runtime/wolfsrc_runtime_oracle.c', func: 'oracle_runtime_set_state', notes: 'deserialize/state restore API' },
  { id: 7, file: 'runtime/wolfsrc_runtime_oracle.c', func: 'oracle_runtime_get_map_lo', notes: 'snapshot readout' },
  { id: 8, file: 'runtime/wolfsrc_runtime_oracle.c', func: 'oracle_runtime_get_map_hi', notes: 'snapshot readout' },
  { id: 9, file: 'runtime/wolfsrc_runtime_oracle.c', func: 'oracle_runtime_get_xq8', notes: 'snapshot readout' },
  { id: 10, file: 'runtime/wolfsrc_runtime_oracle.c', func: 'oracle_runtime_get_yq8', notes: 'snapshot readout' },
  { id: 11, file: 'runtime/wolfsrc_runtime_oracle.c', func: 'oracle_runtime_get_angle_deg', notes: 'snapshot readout' },
  { id: 12, file: 'runtime/wolfsrc_runtime_oracle.c', func: 'oracle_runtime_get_health', notes: 'snapshot readout' },
  { id: 13, file: 'runtime/wolfsrc_runtime_oracle.c', func: 'oracle_runtime_get_ammo', notes: 'snapshot readout' },
  { id: 14, file: 'runtime/wolfsrc_runtime_oracle.c', func: 'oracle_runtime_get_cooldown', notes: 'snapshot readout' },
  { id: 15, file: 'runtime/wolfsrc_runtime_oracle.c', func: 'oracle_runtime_get_flags', notes: 'snapshot readout' },
  { id: 16, file: 'runtime/wolfsrc_runtime_oracle.c', func: 'oracle_runtime_get_tick', notes: 'snapshot readout' },
  { id: 17, file: 'WL_AGENT.C', func: 'ClipMove', notes: 'called via real_wl_agent_clip_move_apply shim' },
  { id: 18, file: 'WL_AGENT.C', func: 'TryMove', notes: 'called via oracle_real_wl_agent_try_move shim' },
  { id: 19, file: 'WL_AGENT.C', func: 'ControlMovement', notes: 'called via real_wl_agent_control_movement_apply shim' },
  { id: 20, file: 'WL_AGENT.C', func: 'TakeDamage', notes: 'called via real_wl_agent_take_damage_apply shim' },
  { id: 21, file: 'WL_DRAW.C', func: 'WallRefresh', notes: 'called via oracle_wl_draw_wall_refresh_hash from runtime render hash' },
  { id: 22, file: 'WL_DRAW.C', func: 'ThreeDRefresh', notes: 'called via oracle_wl_draw_three_d_refresh_hash from runtime render hash' },
];

const TRACE_SYMBOL_MAP = new Map<number, TraceSymbol>(TRACE_SYMBOLS.map((entry) => [entry.id, entry]));

const SYMBOL_PARITY_COVERAGE = new Map<number, SymbolParityCoverage>([
  [1, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [2, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [3, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [4, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [5, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [6, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [7, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [8, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [9, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [10, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [11, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [12, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [13, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [14, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [15, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [16, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [17, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [18, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [19, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [20, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [21, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [22, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
]);

function fnv1a(hash: number, value: number): number {
  return Math.imul((hash ^ (value >>> 0)) >>> 0, 16777619) >>> 0;
}

function readU16(bytes: Uint8Array, offset: number): number {
  if (offset < 0 || offset + 1 >= bytes.length) {
    return 0;
  }
  return ((bytes[offset]! | (bytes[offset + 1]! << 8)) & 0xffff) >>> 0;
}

function readS32(bytes: Uint8Array, offset: number): number {
  if (offset < 0 || offset + 3 >= bytes.length) {
    return -1;
  }
  const value =
    (bytes[offset]!) |
    (bytes[offset + 1]! << 8) |
    (bytes[offset + 2]! << 16) |
    (bytes[offset + 3]! << 24);
  return value | 0;
}

function decodeAsciiName(bytes: Uint8Array): string {
  let end = bytes.length;
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] === 0) {
      end = i;
      break;
    }
  }
  return new TextDecoder().decode(bytes.subarray(0, end)).trim();
}

function idCaCarmackExpandWords(sourceBytes: Uint8Array, expandedLengthBytes: number): Uint16Array {
  const NEARTAG = 0xa7;
  const FARTAG = 0xa8;
  const outWords = Math.max(0, expandedLengthBytes | 0) >>> 1;
  const out = new Uint16Array(outWords);

  let src = 0;
  let dst = 0;
  while (dst < outWords) {
    const ch = readU16(sourceBytes, src);
    src += 2;
    const chHigh = (ch >>> 8) & 0xff;
    const count = ch & 0xff;

    if (chHigh === NEARTAG) {
      if (count === 0) {
        const low = src < sourceBytes.length ? sourceBytes[src]! : 0;
        src += 1;
        out[dst++] = ((ch & 0xff00) | low) & 0xffff;
        continue;
      }
      const offset = src < sourceBytes.length ? sourceBytes[src]! : 0;
      src += 1;
      for (let i = 0; i < count && dst < outWords; i++) {
        const copyIndex = dst - offset;
        out[dst++] = copyIndex >= 0 && copyIndex < dst ? out[copyIndex]! : 0;
      }
      continue;
    }

    if (chHigh === FARTAG) {
      if (count === 0) {
        const low = src < sourceBytes.length ? sourceBytes[src]! : 0;
        src += 1;
        out[dst++] = ((ch & 0xff00) | low) & 0xffff;
        continue;
      }
      const offset = readU16(sourceBytes, src);
      src += 2;
      for (let i = 0; i < count && dst < outWords; i++) {
        const copyIndex = offset + i;
        out[dst++] = copyIndex >= 0 && copyIndex < dst ? out[copyIndex]! : 0;
      }
      continue;
    }

    out[dst++] = ch & 0xffff;
  }
  return out;
}

function idCaRlewExpandWords(sourceWords: Uint16Array, expandedLengthBytes: number, rlewTag: number): Uint16Array {
  const outWords = Math.max(0, expandedLengthBytes | 0) >>> 1;
  const out = new Uint16Array(outWords);
  const tag = rlewTag & 0xffff;

  let src = 0;
  let dst = 0;
  while (dst < outWords) {
    const value = src < sourceWords.length ? (sourceWords[src++]! & 0xffff) : 0;
    if (value !== tag) {
      out[dst++] = value;
      continue;
    }
    const count = src < sourceWords.length ? (sourceWords[src++]! & 0xffff) : 0;
    const repeated = src < sourceWords.length ? (sourceWords[src++]! & 0xffff) : 0;
    if (count === 0) {
      out[dst++] = tag;
      continue;
    }
    for (let i = 0; i < count && dst < outWords; i++) {
      out[dst++] = repeated;
    }
  }
  return out;
}

function extractPlane0Map(gamemapsBytes: Uint8Array, mapheadBytes: Uint8Array, mapIndex: number): Plane0Map | null {
  const rlewTag = readU16(mapheadBytes, 0);
  const headerOffset = readS32(mapheadBytes, 2 + mapIndex * 4);
  if (headerOffset < 0 || headerOffset + 38 > gamemapsBytes.length) {
    return null;
  }

  const planeStart = [
    readS32(gamemapsBytes, headerOffset),
    readS32(gamemapsBytes, headerOffset + 4),
    readS32(gamemapsBytes, headerOffset + 8),
  ];
  const planeLength = [
    readU16(gamemapsBytes, headerOffset + 12),
    readU16(gamemapsBytes, headerOffset + 14),
    readU16(gamemapsBytes, headerOffset + 16),
  ];
  const width = readU16(gamemapsBytes, headerOffset + 18);
  const height = readU16(gamemapsBytes, headerOffset + 20);
  const name = decodeAsciiName(gamemapsBytes.subarray(headerOffset + 22, headerOffset + 38)) || `MAP${mapIndex}`;

  if (width <= 0 || height <= 0) {
    return null;
  }
  const p0Start = planeStart[0] | 0;
  const p0Len = planeLength[0] | 0;
  if (p0Start < 0 || p0Len <= 2 || p0Start + p0Len > gamemapsBytes.length) {
    return null;
  }

  const source = gamemapsBytes.subarray(p0Start, p0Start + p0Len);
  const expanded = readU16(source, 0);
  const carmack = idCaCarmackExpandWords(source.subarray(2), expanded);
  const rlewSource = carmack.subarray(carmack.length > 0 ? 1 : 0);
  const plane0 = idCaRlewExpandWords(rlewSource, width * height * 2, rlewTag);
  return { mapIndex, mapName: name, width, height, plane0 };
}

function wallInPlane(plane0: Uint16Array, width: number, height: number, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= width || y >= height) {
    return true;
  }
  return (plane0[y * width + x] ?? 0) < AREATILE;
}

function buildMapBitsFromPlane(plane: Plane0Map, seed: number): { mapLo: number; mapHi: number; startXQ8: number; startYQ8: number } {
  const maxX0 = Math.max(0, plane.width - 8);
  const maxY0 = Math.max(0, plane.height - 8);
  const x0 = maxX0 === 0 ? 0 : ((seed >>> 1) % (maxX0 + 1));
  const y0 = maxY0 === 0 ? 0 : ((seed >>> 5) % (maxY0 + 1));

  let lo = 0;
  let hi = 0;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const border = x === 0 || y === 0 || x === 7 || y === 7;
      const wall = border || wallInPlane(plane.plane0, plane.width, plane.height, x0 + x, y0 + y);
      if (!wall) continue;
      const bit = y * 8 + x;
      if (bit < 32) lo |= 1 << bit;
      else hi |= 1 << (bit - 32);
    }
  }

  let startTileX = 3;
  let startTileY = 3;
  let found = false;
  for (let y = 1; y <= 6 && !found; y++) {
    for (let x = 1; x <= 6; x++) {
      const bit = y * 8 + x;
      const isWall = bit < 32 ? ((lo >>> bit) & 1) === 1 : ((hi >>> (bit - 32)) & 1) === 1;
      if (!isWall) {
        startTileX = x;
        startTileY = y;
        found = true;
        break;
      }
    }
  }

  return {
    mapLo: lo >>> 0,
    mapHi: hi >>> 0,
    startXQ8: startTileX * 256 + 128,
    startYQ8: startTileY * 256 + 128,
  };
}

function buildScenarioSteps(seed: number, count: number): RuntimeInput[] {
  const steps: RuntimeInput[] = [];
  let s = seed | 0;
  for (let i = 0; i < count; i++) {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    steps.push({
      inputMask: s & 0xff,
      tics: (s >>> 8) & 0x7,
      rng: s ^ Math.imul(i + 1, 1103515245),
    });
  }
  return steps;
}

async function loadWl1Scenarios(root: string): Promise<TraceScenario[]> {
  const assetsDir = path.join(root, 'assets', 'wl1');
  const mapheadBytes = new Uint8Array(await readFile(path.join(assetsDir, 'MAPHEAD.WL1')));
  const gamemapsBytes = new Uint8Array(await readFile(path.join(assetsDir, 'GAMEMAPS.WL1')));

  const scenarios: TraceScenario[] = [];
  for (let mapIndex = 0; mapIndex < 100; mapIndex++) {
    const plane = extractPlane0Map(gamemapsBytes, mapheadBytes, mapIndex);
    if (!plane) {
      continue;
    }
    const seed = (Math.imul(mapIndex + 1, 0x45d9f3b) ^ 0x9e3779b9) >>> 0;
    const mapBits = buildMapBitsFromPlane(plane, seed);
    scenarios.push({
      mapIndex,
      mapName: plane.mapName,
      seed,
      config: {
        mapLo: mapBits.mapLo,
        mapHi: mapBits.mapHi,
        startXQ8: mapBits.startXQ8,
        startYQ8: mapBits.startYQ8,
        startAngleDeg: (mapIndex * 37) % 360,
        startHealth: 45 + (mapIndex % 40),
        startAmmo: 8 + (mapIndex % 12),
      },
      steps: buildScenarioSteps(seed | 0, 64),
    });
  }
  return scenarios;
}

function formatManifest(
  scenarioCount: number,
  menuTraceDigest: number,
  requiredSymbols: TraceSymbol[],
  excludedSymbols: TraceSymbol[],
): string {
  const requiredRows = requiredSymbols
    .map((entry) => {
      const coverage = SYMBOL_PARITY_COVERAGE.get(entry.id);
      const status = coverage?.status ?? 'todo';
      const notes = coverage ? `${entry.notes}; parity: ${coverage.parity}` : `${entry.notes}; parity: pending`;
      return `| ${entry.file} | ${entry.func} | \`${status}\` | ${notes} |`;
    })
    .join('\n');
  const excludedRows = excludedSymbols
    .map((entry) => `| ${entry.file} | ${entry.func} | not hit by deterministic runtime-trace harness |`)
    .join('\n');

  return `# Runtime Symbol Manifest (WL1 Runtime Path)

Authoritative symbol checklist for full runtime-complete WL1 parity.

## Status

- Current state: \`frozen\`
- Source of truth: deterministic oracle symbol trace outputs from Phase R2
- Trace scenarios: ${scenarioCount} (WL1 asset-backed)
- Deterministic menu-trace digest: \`${menuTraceDigest >>> 0}\`
- Refresh command: \`pnpm runtime:manifest:extract\`

## Buckets

### required-runtime

Symbols exercised by deterministic runtime trace scenarios.

| File | Function | Status | Notes |
| :--- | :--- | :--- | :--- |
${requiredRows || '| _pending_ | _pending_ | `todo` | Generated in Phase R2 |'}

### excluded-non-runtime

Symbols known to the runtime trace map but not hit by current deterministic trace scenarios.

| File | Function | Reason |
| :--- | :--- | :--- |
${excludedRows || '| _none_ | _none_ | all traced symbols are currently required-runtime |'}

## Rules

1. No symbol may move from \`required-runtime\` to \`excluded-non-runtime\` without trace evidence and commit note.
2. Phase R4 completion requires all \`required-runtime\` symbols marked \`done\` with parity tests.
3. Any new trace that hits an excluded symbol must reopen the manifest and add it to required.
`;
}

async function runDeterministicMenuTraceDigest(): Promise<number> {
  const oracle = new OracleBridge();
  await oracle.init();
  let hash = 2166136261 >>> 0;
  try {
    let screen = 0;
    let cursor = 0;
    const actions = [0, 1, 1, 2, 3, 1, 4, 0, 2, 1, 0, 3];

    for (let i = 0; i < actions.length; i++) {
      const action = actions[i] | 0;
      const control = oracle.wlMenuUsControlPanelHash(screen, cursor, action, 8) >>> 0;
      const main = oracle.wlMenuDrawMainMenuHash(cursor & 7, 0xff, i % 2) >>> 0;
      const draw = oracle.wlMenuDrawMenuHash(screen, cursor, 8, 0, i & 1) >>> 0;
      const sound = oracle.wlMenuCpSoundHash(i % 3, (i + 1) % 3, (i + 2) % 3, action) >>> 0;
      const controlCfg = oracle.wlMenuCpControlHash(i & 1, (i >>> 1) & 1, (i * 7) & 0xff, action) >>> 0;
      const msg = oracle.wlMenuMessageHash(8 + i, i & 1, (i * 13) & 0xff, (0x9e3779b9 ^ i) | 0) >>> 0;

      hash = fnv1a(hash, control);
      hash = fnv1a(hash, main);
      hash = fnv1a(hash, draw);
      hash = fnv1a(hash, sound);
      hash = fnv1a(hash, controlCfg);
      hash = fnv1a(hash, msg);

      cursor = control & 0xff;
      screen = (control >>> 8) & 0xff;
    }

    hash = fnv1a(hash, oracle.wlMenuCpNewGameHash(2, 0, 0, 1) >>> 0);
    hash = fnv1a(hash, oracle.wlMenuCpViewScoresHash(10000, 9000, 8000, 7000, 6000, 7654) >>> 0);
    hash = fnv1a(hash, oracle.idUs1UsPrintHash(8, 8, 24, 15, 8) >>> 0);
    hash = fnv1a(hash, oracle.idUs1UsCPrintHash(0, 320, 24, 1, 8) >>> 0);
    hash = fnv1a(hash, oracle.idUs1UsDrawWindowHash(16, 24, 30, 12, 14, 1) >>> 0);

    return hash >>> 0;
  } finally {
    await oracle.shutdown();
  }
}

async function main(): Promise<void> {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const root = path.resolve(here, '..', '..');
  const generatedDir = path.join(root, 'specs', 'generated');
  const manifestPath = path.join(root, 'specs', 'runtime-symbol-manifest.md');
  const hitsPath = path.join(generatedDir, 'runtime-symbol-hits.json');

  const scenarios = await loadWl1Scenarios(root);
  if (scenarios.length === 0) {
    throw new Error('No WL1 runtime scenarios were extracted from MAPHEAD.WL1/GAMEMAPS.WL1');
  }
  const menuTraceDigest = await runDeterministicMenuTraceDigest();

  const allHits = new Set<number>();
  const oracle = new WolfsrcOraclePort();
  try {
    for (const scenario of scenarios) {
      await oracle.init(scenario.config);
      oracle.resetTrace();
      await oracle.init(scenario.config);
      oracle.reset();
      oracle.snapshot();
      oracle.renderHash(320, 200);
      for (const step of scenario.steps) {
        oracle.step(step);
      }
      const blob = oracle.serialize();
      oracle.deserialize(blob);
      oracle.snapshot();
      for (const id of oracle.traceSymbolIds()) {
        allHits.add(id);
      }
    }
  } finally {
    await oracle.shutdown();
  }

  const hitIds = [...allHits].sort((a, b) => a - b);
  const requiredSymbols: TraceSymbol[] = hitIds.map((id) => {
    return (
      TRACE_SYMBOL_MAP.get(id) ?? {
        id,
        file: 'unknown',
        func: `unknown_symbol_${id}`,
        notes: 'symbol id not mapped yet',
      }
    );
  });
  const excludedSymbols = TRACE_SYMBOLS.filter((entry) => !allHits.has(entry.id));
  await mkdir(generatedDir, { recursive: true });
  await writeFile(
    hitsPath,
    JSON.stringify(
      {
        scenarioCount: scenarios.length,
        menuTraceDigest: menuTraceDigest >>> 0,
        traceScenarios: scenarios.map((scenario) => ({
          mapIndex: scenario.mapIndex,
          mapName: scenario.mapName,
          seedHex: `0x${scenario.seed.toString(16)}`,
        })),
        requiredRuntimeSymbolIds: hitIds,
        requiredRuntimeSymbols: requiredSymbols,
        excludedRuntimeSymbols: excludedSymbols,
      },
      null,
      2,
    ) + '\n',
    'utf8',
  );

  const manifest = formatManifest(scenarios.length, menuTraceDigest, requiredSymbols, excludedSymbols);
  await writeFile(manifestPath, manifest, 'utf8');

  console.log(`Wrote ${path.relative(root, hitsPath)} (${hitIds.length} required symbols).`);
  console.log(`Updated ${path.relative(root, manifestPath)} from ${scenarios.length} WL1 scenarios.`);
}

void main();
