import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ParityFailureRecord } from './types';

function sanitizeName(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function extractNumber(message: string, pattern: RegExp): number | undefined {
  const match = message.match(pattern);
  if (!match?.[1]) {
    return undefined;
  }
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function extractText(message: string, pattern: RegExp): string | undefined {
  const match = message.match(pattern);
  if (!match?.[1]) {
    return undefined;
  }
  return String(match[1]).trim();
}

function toFailureRecord(suite: string, error: unknown): ParityFailureRecord<string, string> {
  const message = error instanceof Error ? error.message : String(error);
  const seed = extractNumber(message, /seed:\s*(-?\d+)/i) ?? -1;
  const path = extractText(message, /path:\s*"?([^"\n]+)"?/i) ?? '';
  const counterexample = extractText(message, /Counterexample:\s*([^\n]+)/i) ?? '';
  const timestamp = new Date().toISOString();

  return {
    suite,
    seed,
    path,
    input: counterexample,
    actual: message,
    timestamp,
  };
}

function persistFailure(suite: string, error: unknown): void {
  const record = toFailureRecord(suite, error);
  const dir = join(process.cwd(), 'test', 'repro');
  mkdirSync(dir, { recursive: true });

  const stamp = record.timestamp.replace(/[:.]/g, '-');
  const file = join(dir, `${sanitizeName(suite)}.${stamp}.json`);
  writeFileSync(file, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
}

export function withReplay(suite: string, run: () => void | Promise<void>): void | Promise<void> {
  try {
    const result = run();
    if (result && typeof (result as Promise<void>).then === 'function') {
      return (result as Promise<void>).catch((error) => {
        persistFailure(suite, error);
        throw error;
      });
    }
    return;
  } catch (error) {
    persistFailure(suite, error);
    throw error;
  }
}
