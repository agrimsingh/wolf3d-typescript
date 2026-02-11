export function actorStepPacked(state: number, playerDistQ8: number, canSee: boolean, rng: number): number {
  let next = state | 0;
  const timer = ((rng | 0) & 0x0f) + 1;

  if (state === 0 && canSee) {
    next = 2;
  } else if (state === 1 && canSee && playerDistQ8 < (4 << 8)) {
    next = 2;
  } else if (state === 2 && playerDistQ8 < (1 << 8)) {
    next = 3;
  } else if (state === 3 && playerDistQ8 > (2 << 8)) {
    next = canSee ? 2 : 1;
  }

  return (((next & 0x7) << 8) | (timer & 0xff)) | 0;
}
