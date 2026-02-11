function fnv1a(hash: number, value: number): number {
  let h = (hash ^ (value >>> 0)) >>> 0;
  h = Math.imul(h, 16777619) >>> 0;
  return h >>> 0;
}

export function rlewExpandChecksum(source: Uint16Array, tag: number, outLen: number): number {
  let hash = 2166136261 >>> 0;
  let src = 0;
  let out = 0;

  while (out < outLen && src < source.length) {
    const value = source[src++]!;
    if (value === (tag & 0xffff) && src + 1 < source.length) {
      const count = source[src++]!;
      const repeated = source[src++]!;
      for (let i = 0; i < count && out < outLen; i++) {
        hash = fnv1a(hash, repeated);
        out++;
      }
    } else {
      hash = fnv1a(hash, value);
      out++;
    }
  }

  hash = fnv1a(hash, out);
  hash = fnv1a(hash, outLen);
  return hash >>> 0;
}
