import { wlDrawFixedByFrac } from '../wolf/math/wlMath';

export function fixedMul(a: number, b: number): number {
  return Number((BigInt(a | 0) * BigInt(b | 0)) >> 16n) | 0;
}

const usePhase1Math =
  process.env.WOLF_USE_PHASE1_MATH === '1' ||
  (((import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_WOLF_USE_PHASE1_MATH) === '1');

export function fixedByFrac(a: number, b: number): number {
  if (usePhase1Math) {
    return wlDrawFixedByFrac(a, b);
  }
  return fixedMul(a, b);
}
