import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { RuntimeParityScenario, RuntimeTraceCapture } from '../../src/runtime/parityHarness';

function sanitizeName(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export interface RuntimeReproArtifact {
  suite: string;
  timestamp: string;
  scenario: RuntimeParityScenario;
  oracleTrace?: RuntimeTraceCapture;
  tsTrace?: RuntimeTraceCapture;
  error?: Record<string, unknown>;
}

export function persistRuntimeRepro(artifact: RuntimeReproArtifact): string {
  const dir = join(process.cwd(), 'test', 'repro', 'runtime');
  mkdirSync(dir, { recursive: true });
  const stamp = artifact.timestamp.replace(/[:.]/g, '-');
  const file = join(dir, `${sanitizeName(artifact.suite)}.${stamp}.json`);
  writeFileSync(file, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
  return file;
}
