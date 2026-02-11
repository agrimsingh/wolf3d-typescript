export interface ParityCase<TInput, TOutput> {
  name: string;
  input: TInput;
  expected: TOutput;
  actual: TOutput;
}

export interface ParityFailureRecord<TInput = unknown, TOutput = unknown> {
  suite: string;
  seed: number;
  path: string;
  input: TInput;
  expected?: TOutput;
  actual?: TOutput;
  timestamp: string;
}

export interface ParityResult {
  suite: string;
  passed: boolean;
  runs: number;
  failures: number;
}
