export function fixedMul(a: number, b: number): number {
  return Number((BigInt(a | 0) * BigInt(b | 0)) >> 16n) | 0;
}

export function fixedByFrac(a: number, b: number): number {
  return fixedMul(a, b);
}
