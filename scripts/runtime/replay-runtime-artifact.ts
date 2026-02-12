import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WolfsrcOraclePort } from '../../src/oracle/runtimeOracle';
import { TsRuntimePort } from '../../src/runtime/tsRuntime';
import { assertRuntimeTraceParity, captureRuntimeTrace, type RuntimeParityScenario } from '../../src/runtime/parityHarness';

type Artifact = {
  suite: string;
  scenario: RuntimeParityScenario;
};

async function resolveArtifactPath(root: string, argPath?: string): Promise<string> {
  if (argPath) {
    return path.resolve(root, argPath);
  }

  const reproDir = path.join(root, 'test', 'repro', 'runtime');
  const files = (await readdir(reproDir)).filter((name) => name.endsWith('.json')).sort();
  const latest = files[files.length - 1];
  if (!latest) {
    throw new Error(`No runtime repro artifacts found in ${reproDir}`);
  }
  return path.join(reproDir, latest);
}

async function main(): Promise<void> {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const root = path.resolve(here, '..', '..');
  const artifactPath = await resolveArtifactPath(root, process.argv[2]);
  const artifact = JSON.parse(await readFile(artifactPath, 'utf8')) as Artifact;

  if (!artifact?.scenario) {
    throw new Error(`Artifact ${artifactPath} missing "scenario" payload`);
  }

  const oracle = new WolfsrcOraclePort();
  const tsRuntime = new TsRuntimePort();
  try {
    const oracleTrace = await captureRuntimeTrace(oracle, artifact.scenario);
    const tsTrace = await captureRuntimeTrace(tsRuntime, artifact.scenario);
    assertRuntimeTraceParity(artifact.scenario, oracleTrace, tsTrace);
    console.log(`Runtime replay passed for ${artifactPath}`);
    console.log(`suite=${artifact.suite} traceHash=${oracleTrace.traceHash >>> 0}`);
  } finally {
    await oracle.shutdown();
    await tsRuntime.shutdown();
  }
}

void main();
