import { describe, expect, it } from 'vitest';
import { getOracleBridge } from '../../src/oracle/bridge';

describe('phase 0 bridge sanity', () => {
  it('loads oracle and executes fixed mul', async () => {
    const oracle = await getOracleBridge();
    const out = oracle.fixedMul(2 << 16, 3 << 16);
    expect(out).toBe(6 << 16);
  });
});
