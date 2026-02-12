import { readdirSync, readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, extname, basename, resolve } from 'node:path';

type PhaseName =
  | 'phase-1-math'
  | 'phase-2-map'
  | 'phase-3-raycast'
  | 'phase-4-ai'
  | 'phase-5-player'
  | 'phase-6-gamestate'
  | 'phase-7-menu-text'
  | 'phase-8-audio'
  | 'shared';

interface SymbolEntry {
  file: string;
  functionName: string;
  returnType: string;
  signature: string;
  line: number;
  phases: PhaseName[];
  primaryPhase: PhaseName;
}

const projectRoot = resolve(process.cwd());
const wolfsrc = resolve(
  process.env.WOLFSRC_MANIFEST_SRC_DIR
    ?? process.env.WOLF3D_SRC_DIR
    ?? join(projectRoot, 'c-oracle', 'wolfsrc-sanitized'),
);
const outDir = join(projectRoot, 'specs', 'generated');

const targetedPhaseMap: Record<string, Record<string, PhaseName>> = {
  'WL_DRAW.C': {
    FixedByFrac: 'phase-1-math',
    TransformActor: 'phase-3-raycast',
    TransformTile: 'phase-3-raycast',
    CalcHeight: 'phase-3-raycast',
    HitVertWall: 'phase-3-raycast',
    HitHorizWall: 'phase-3-raycast',
    WallRefresh: 'phase-3-raycast',
    ThreeDRefresh: 'phase-3-raycast',
  },
  'WL_MAIN.C': {
    BuildTables: 'phase-1-math',
    CalcProjection: 'phase-1-math',
  },
  'WL_SCALE.C': {
    SetupScaling: 'phase-3-raycast',
    ScaleShape: 'phase-3-raycast',
    SimpleScaleShape: 'phase-3-raycast',
  },
  'ID_CA.C': {
    CAL_CarmackExpand: 'phase-2-map',
    CA_RLEWexpand: 'phase-2-map',
    CA_CacheMap: 'phase-2-map',
    CAL_SetupMapFile: 'phase-2-map',
    CA_CacheAudioChunk: 'phase-8-audio',
    CAL_SetupAudioFile: 'phase-8-audio',
  },
  'WL_GAME.C': {
    SetupGameLevel: 'phase-2-map',
    DrawPlayScreen: 'phase-2-map',
    SetSoundLoc: 'phase-8-audio',
    PlaySoundLocGlobal: 'phase-8-audio',
    UpdateSoundLoc: 'phase-8-audio',
    GameLoop: 'phase-6-gamestate',
  },
  'WL_STATE.C': {
    SelectDodgeDir: 'phase-4-ai',
    SelectChaseDir: 'phase-4-ai',
    MoveObj: 'phase-4-ai',
    DamageActor: 'phase-4-ai',
    CheckLine: 'phase-4-ai',
    CheckSight: 'phase-4-ai',
    FirstSighting: 'phase-4-ai',
    SightPlayer: 'phase-4-ai',
  },
  'WL_ACT1.C': {
    SpawnDoor: 'phase-6-gamestate',
    OpenDoor: 'phase-6-gamestate',
    CloseDoor: 'phase-6-gamestate',
    OperateDoor: 'phase-6-gamestate',
    MoveDoors: 'phase-6-gamestate',
    PushWall: 'phase-6-gamestate',
  },
  'WL_ACT2.C': {
    T_Chase: 'phase-4-ai',
    T_Path: 'phase-4-ai',
    T_Shoot: 'phase-4-ai',
    T_Bite: 'phase-4-ai',
    T_DogChase: 'phase-4-ai',
    T_Projectile: 'phase-4-ai',
  },
  'WL_AGENT.C': {
    ControlMovement: 'phase-5-player',
    TryMove: 'phase-5-player',
    ClipMove: 'phase-5-player',
    Thrust: 'phase-5-player',
    Cmd_Fire: 'phase-5-player',
    Cmd_Use: 'phase-5-player',
    T_Player: 'phase-5-player',
    TakeDamage: 'phase-6-gamestate',
    HealSelf: 'phase-6-gamestate',
    GivePoints: 'phase-6-gamestate',
    GiveAmmo: 'phase-6-gamestate',
    GetBonus: 'phase-6-gamestate',
  },
  'WL_PLAY.C': {
    PlayLoop: 'phase-5-player',
  },
  'ID_IN.C': {
    IN_ReadControl: 'phase-5-player',
    IN_UserInput: 'phase-5-player',
  },
  'WL_INTER.C': {
    LevelCompleted: 'phase-6-gamestate',
    CheckHighScore: 'phase-6-gamestate',
    Victory: 'phase-6-gamestate',
  },
  'WL_MENU.C': {
    US_ControlPanel: 'phase-7-menu-text',
    DrawMainMenu: 'phase-7-menu-text',
    DrawMenu: 'phase-7-menu-text',
    CP_NewGame: 'phase-7-menu-text',
    CP_ViewScores: 'phase-7-menu-text',
    CP_Sound: 'phase-7-menu-text',
    CP_Control: 'phase-7-menu-text',
    Message: 'phase-7-menu-text',
  },
  'WL_TEXT.C': {
    HelpScreens: 'phase-7-menu-text',
    EndText: 'phase-7-menu-text',
  },
  'ID_US_1.C': {
    US_Print: 'phase-7-menu-text',
    US_CPrint: 'phase-7-menu-text',
    US_DrawWindow: 'phase-7-menu-text',
  },
  'ID_SD.C': {
    SD_SetSoundMode: 'phase-8-audio',
    SD_SetMusicMode: 'phase-8-audio',
    SD_PlaySound: 'phase-8-audio',
    SD_StopSound: 'phase-8-audio',
  },
};

function primaryPhase(phases: PhaseName[]): PhaseName {
  const order: PhaseName[] = [
    'phase-1-math',
    'phase-2-map',
    'phase-3-raycast',
    'phase-4-ai',
    'phase-5-player',
    'phase-6-gamestate',
    'phase-7-menu-text',
    'phase-8-audio',
    'shared',
  ];
  for (const p of order) {
    if (phases.includes(p)) {
      return p;
    }
  }
  return 'shared';
}

function normalizeType(type: string): string {
  return type.replace(/\s+/g, ' ').replace(/\b(near|far|huge|interrupt|pascal)\b/g, '').replace(/\s+/g, ' ').trim();
}

function extractFromFile(filePath: string): SymbolEntry[] {
  const file = basename(filePath);
  const text = readFileSync(filePath, 'utf8');
  const lines = text.split(/\r?\n/);
  const entries: SymbolEntry[] = [];

  const regex = /(^|\n)\s*([A-Za-z_][A-Za-z0-9_\s\*\t]*?)\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^;{}]*)\)\s*\{/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const returnTypeRaw = match[2] ?? '';
    const fnName = match[3] ?? '';
    const args = (match[4] ?? '').trim();

    if (!fnName || ['if', 'for', 'while', 'switch'].includes(fnName)) {
      continue;
    }

    const returnType = normalizeType(returnTypeRaw);
    if (!returnType || returnType.startsWith('//')) {
      continue;
    }

    const before = text.slice(0, match.index);
    const line = before.split(/\r?\n/).length;

    const mapped = targetedPhaseMap[file]?.[fnName];
    const phases = mapped ? [mapped] : ['shared'];
    const signature = `${returnType} ${fnName}(${args})`;

    entries.push({
      file,
      functionName: fnName,
      returnType,
      signature,
      line,
      phases,
      primaryPhase: primaryPhase(phases),
    });
  }

  const seen = new Set<string>();
  return entries.filter((entry) => {
    const key = `${entry.file}:${entry.functionName}:${entry.line}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function toCsv(entries: SymbolEntry[]): string {
  const header = 'file,functionName,returnType,line,primaryPhase,phases,signature';
  const rows = entries.map((e) => {
    const esc = (v: string) => `"${v.replaceAll('"', '""')}"`;
    return [
      esc(e.file),
      esc(e.functionName),
      esc(e.returnType),
      String(e.line),
      esc(e.primaryPhase),
      esc(e.phases.join('|')),
      esc(e.signature),
    ].join(',');
  });
  return `${header}\n${rows.join('\n')}\n`;
}

function toMarkdown(entries: SymbolEntry[]): string {
  const byPhase = new Map<PhaseName, SymbolEntry[]>();
  for (const entry of entries) {
    const arr = byPhase.get(entry.primaryPhase) ?? [];
    arr.push(entry);
    byPhase.set(entry.primaryPhase, arr);
  }

  const phaseOrder: PhaseName[] = [
    'phase-1-math',
    'phase-2-map',
    'phase-3-raycast',
    'phase-4-ai',
    'phase-5-player',
    'phase-6-gamestate',
    'phase-7-menu-text',
    'phase-8-audio',
    'shared',
  ];

  const lines: string[] = [];
  lines.push('# WOLFSRC Port Manifest');
  lines.push('');
  lines.push('Authoritative symbol inventory for full TS port. Generated by `scripts/manifest/extract-wolfsrc-symbols.ts`.');
  lines.push('');
  lines.push('## Generated Outputs');
  lines.push('');
  lines.push('- `specs/generated/wolfsrc-manifest.json`');
  lines.push('- `specs/generated/wolfsrc-manifest.csv`');
  lines.push('');
  lines.push('## Phase Summary');
  lines.push('');
  lines.push('| Phase | Function Count |');
  lines.push('| :--- | ---: |');
  for (const phase of phaseOrder) {
    const count = byPhase.get(phase)?.length ?? 0;
    lines.push(`| ${phase} | ${count} |`);
  }

  lines.push('');
  lines.push('## Port Checklist');
  lines.push('');
  for (const phase of phaseOrder) {
    const phaseEntries = (byPhase.get(phase) ?? []).sort((a, b) => a.file.localeCompare(b.file) || a.functionName.localeCompare(b.functionName));
    lines.push(`### ${phase}`);
    lines.push('');
    if (phaseEntries.length === 0) {
      lines.push('- [ ] No symbols mapped');
      lines.push('');
      continue;
    }
    for (const entry of phaseEntries) {
      lines.push(`- [ ] \`${entry.file}:${entry.functionName}\` (line ${entry.line})`);
    }
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

function main(): void {
  if (!existsSync(wolfsrc)) {
    throw new Error(
      `WOLFSRC manifest source directory not found: ${wolfsrc}\n`
      + 'Set WOLFSRC_MANIFEST_SRC_DIR or WOLF3D_SRC_DIR, or run pnpm wasm:prepare:wolfsrc first.',
    );
  }

  const cFiles = readdirSync(wolfsrc)
    .filter((name) => extname(name).toUpperCase() === '.C')
    .map((name) => join(wolfsrc, name));

  let entries: SymbolEntry[] = [];
  for (const filePath of cFiles) {
    entries = entries.concat(extractFromFile(filePath));
  }

  entries.sort((a, b) => a.primaryPhase.localeCompare(b.primaryPhase) || a.file.localeCompare(b.file) || a.functionName.localeCompare(b.functionName) || a.line - b.line);

  mkdirSync(outDir, { recursive: true });

  writeFileSync(join(outDir, 'wolfsrc-manifest.json'), `${JSON.stringify({ generatedAt: new Date().toISOString(), total: entries.length, entries }, null, 2)}\n`, 'utf8');
  writeFileSync(join(outDir, 'wolfsrc-manifest.csv'), toCsv(entries), 'utf8');
  writeFileSync(join(projectRoot, 'specs', 'port-manifest.md'), toMarkdown(entries), 'utf8');

  const counts = new Map<string, number>();
  for (const entry of entries) {
    counts.set(entry.primaryPhase, (counts.get(entry.primaryPhase) ?? 0) + 1);
  }

  const summary = [...counts.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([phase, count]) => `${phase}:${count}`).join(', ');
  console.log(`Generated manifest for ${entries.length} functions (${summary})`);
}

main();
