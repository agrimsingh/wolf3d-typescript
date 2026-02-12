export interface GameType {
  difficulty: number;
  mapon: number;
  episode: number;
  score: number;
  lives: number;
  health: number;
  ammo: number;
  keys: number;
  weapon: number;
  chosenweapon: number;
  bestweapon: number;
  TimeCount: number;
  killcount: number;
  killtotal: number;
  treasurecount: number;
  treasuretotal: number;
  secretcount: number;
  secrettotal: number;
  victoryflag: boolean;
}

export interface ActorSnapshot {
  id: number;
  x: number;
  y: number;
  tilex: number;
  tiley: number;
  angle: number;
  speed: number;
  state: string;
  flags: number;
  hitpoints: number;
}

export interface DoorState {
  id: number;
  tilex: number;
  tiley: number;
  vertical: boolean;
  lock: number;
  action: number;
  position: number;
}

export interface RenderContext {
  viewx: number;
  viewy: number;
  viewangle: number;
  viewsin: number;
  viewcos: number;
  scale: number;
  wallheight: Int32Array;
}

export interface MapPlanes {
  width: number;
  height: number;
  plane0: Uint16Array;
  plane1: Uint16Array;
  plane2: Uint16Array;
}

export interface RuntimePlayerSnapshot {
  xQ8: number;
  yQ8: number;
  angleDeg: number;
  health: number;
  ammo: number;
  flags: number;
}

export interface RuntimeDoorSnapshot {
  id: number;
  action: number;
  positionQ8: number;
}

export interface RuntimeMenuSnapshot {
  mode: number;
  cursor: number;
}

export interface RuntimeCoreSnapshotState {
  tick: number;
  mapLo: number;
  mapHi: number;
  player: RuntimePlayerSnapshot;
  score: number;
  lives: number;
  keys: number;
  doors: RuntimeDoorSnapshot[];
  actors: ActorSnapshot[];
  menu: RuntimeMenuSnapshot;
}

export interface RuntimeCoreNormalizedSnapshot {
  tick: number;
  mapLo: number;
  mapHi: number;
  player: RuntimePlayerSnapshot;
  score: number;
  lives: number;
  keys: number;
  doorsHash: number;
  actorsHash: number;
  menuMode: number;
}

function hashFold(hash: number, value: number): number {
  return Math.imul((hash ^ (value >>> 0)) >>> 0, 16777619) >>> 0;
}

export function normalizeRuntimeCoreSnapshot(snapshot: RuntimeCoreSnapshotState): RuntimeCoreNormalizedSnapshot {
  let doorsHash = 2166136261 >>> 0;
  for (const door of snapshot.doors) {
    doorsHash = hashFold(doorsHash, door.id | 0);
    doorsHash = hashFold(doorsHash, door.action | 0);
    doorsHash = hashFold(doorsHash, door.positionQ8 | 0);
  }

  let actorsHash = 2166136261 >>> 0;
  for (const actor of snapshot.actors) {
    actorsHash = hashFold(actorsHash, actor.id | 0);
    actorsHash = hashFold(actorsHash, actor.x | 0);
    actorsHash = hashFold(actorsHash, actor.y | 0);
    actorsHash = hashFold(actorsHash, actor.state.length | 0);
  }

  return {
    tick: snapshot.tick | 0,
    mapLo: snapshot.mapLo >>> 0,
    mapHi: snapshot.mapHi >>> 0,
    player: {
      xQ8: snapshot.player.xQ8 | 0,
      yQ8: snapshot.player.yQ8 | 0,
      angleDeg: snapshot.player.angleDeg | 0,
      health: snapshot.player.health | 0,
      ammo: snapshot.player.ammo | 0,
      flags: snapshot.player.flags | 0,
    },
    score: snapshot.score | 0,
    lives: snapshot.lives | 0,
    keys: snapshot.keys | 0,
    doorsHash: doorsHash >>> 0,
    actorsHash: actorsHash >>> 0,
    menuMode: snapshot.menu.mode | 0,
  };
}
