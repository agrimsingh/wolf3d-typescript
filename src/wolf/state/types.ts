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
