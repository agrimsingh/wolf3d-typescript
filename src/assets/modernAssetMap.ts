export type ModernAssetTargetKind =
  | 'wallTexture'
  | 'uiSprite'
  | 'actorSheet'
  | 'objectSheet'
  | 'weaponSheet'
  | 'soundEffect';

export type ModernAssetPaletteMode = 'indexed' | 'rgb' | 'rgba' | 'pcm-u8-mono';

export interface ModernAssetRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ModernAssetMapEntry {
  targetKind: ModernAssetTargetKind;
  targetId: string;
  sourceFile: string;
  rect: ModernAssetRect | null;
  flipX: boolean;
  flipY: boolean;
  rotate90: boolean;
  paletteMode: ModernAssetPaletteMode;
  soundName: string | null;
  soundCategory: string | null;
}

export interface ModernAssetMap {
  version: number;
  profile: string;
  entries: ModernAssetMapEntry[];
}

export interface ModernAssetValidationResult {
  errors: string[];
  warnings: string[];
}

const REQUIRED_TARGET_IDS = [
  'wall.stone.01',
  'wall.stone.02',
  'ui.achtung.sign',
  'ui.hud.panel',
  'ui.menu.sheet',
  'actor.guard.sheet',
  'object.items.sheet',
  'sfx.door.open',
  'sfx.door.close',
  'sfx.weapon.pistol',
  'sfx.weapon.machinegun',
  'sfx.level.complete',
] as const;

const IMAGE_PALETTE_MODES = new Set<ModernAssetPaletteMode>(['indexed', 'rgb', 'rgba']);

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function validateModernAssetMap(map: ModernAssetMap): ModernAssetValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Number.isInteger(map.version) || map.version <= 0) {
    errors.push(`Invalid manifest version: ${map.version}`);
  }

  if (typeof map.profile !== 'string' || map.profile.trim().length === 0) {
    errors.push('Manifest profile must be a non-empty string.');
  }

  const required = new Set<string>(REQUIRED_TARGET_IDS);
  const seenTargetKeys = new Set<string>();

  map.entries.forEach((entry, index) => {
    const prefix = `entry[${index}] ${entry.targetKind}:${entry.targetId}`;
    if (!entry.targetId || entry.targetId.trim().length === 0) {
      errors.push(`${prefix} has empty targetId.`);
    }

    if (!entry.sourceFile || entry.sourceFile.trim().length === 0) {
      errors.push(`${prefix} has empty sourceFile.`);
    }

    const targetKey = `${entry.targetKind}:${entry.targetId}`;
    if (seenTargetKeys.has(targetKey)) {
      errors.push(`${prefix} duplicates target key ${targetKey}.`);
    }
    seenTargetKeys.add(targetKey);

    if (typeof entry.flipX !== 'boolean' || typeof entry.flipY !== 'boolean' || typeof entry.rotate90 !== 'boolean') {
      errors.push(`${prefix} has non-boolean orientation fields.`);
    }

    if (entry.targetKind === 'soundEffect') {
      if (entry.rect !== null) {
        errors.push(`${prefix} must have rect=null for soundEffect.`);
      }
      if (entry.paletteMode !== 'pcm-u8-mono') {
        errors.push(`${prefix} must use paletteMode pcm-u8-mono.`);
      }
      if (!entry.soundName || entry.soundName.trim().length === 0) {
        errors.push(`${prefix} is missing soundName.`);
      }
      if (!entry.soundCategory || entry.soundCategory.trim().length === 0) {
        errors.push(`${prefix} is missing soundCategory.`);
      }
    } else {
      if (entry.rect === null) {
        errors.push(`${prefix} must define rect for image-based target.`);
      } else {
        const { x, y, w, h } = entry.rect;
        if (![x, y, w, h].every(isFiniteNumber)) {
          errors.push(`${prefix} rect has non-finite values.`);
        }
        if (x < 0 || y < 0 || w <= 0 || h <= 0) {
          errors.push(`${prefix} rect must have x/y >= 0 and w/h > 0.`);
        }
      }
      if (!IMAGE_PALETTE_MODES.has(entry.paletteMode)) {
        errors.push(`${prefix} has invalid image paletteMode ${entry.paletteMode}.`);
      }
      if (entry.soundName !== null || entry.soundCategory !== null) {
        warnings.push(`${prefix} has sound metadata that will be ignored for image target.`);
      }
    }

    required.delete(entry.targetId);
  });

  if (required.size > 0) {
    errors.push(`Missing required targetIds: ${Array.from(required).join(', ')}`);
  }

  return { errors, warnings };
}

export function indexModernAssetMap(map: ModernAssetMap): Map<string, ModernAssetMapEntry> {
  const indexed = new Map<string, ModernAssetMapEntry>();
  for (const entry of map.entries) {
    indexed.set(`${entry.targetKind}:${entry.targetId}`, entry);
  }
  return indexed;
}

export async function loadModernAssetMap(url = '/assets/manifests/modern-asset-map.json'): Promise<ModernAssetMap> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load modern asset map ${url}: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as ModernAssetMap;
}
