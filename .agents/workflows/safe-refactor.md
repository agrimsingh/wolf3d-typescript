# Safe Refactor with Property-Based Testing

## Purpose

Safely rewrite or refactor a module by using property-based testing (fast-check) to prove the new code behaves identically to the old code for all possible inputs. The idea: write a bridge that calls both versions, generate thousands of random inputs, and assert the outputs match.

## When to Use

Use this workflow when:
- Rewriting a module or function for performance, readability, or new architecture
- Migrating from one library/framework to another
- Refactoring complex business logic where manual test cases can't cover all edge cases
- Onboarding to a brownfield project and need confidence before changing things

Do NOT use this workflow when:
- The behavior itself needs to change (this proves equivalence, not correctness)
- The function has side effects that can't be isolated
- The function is trivial (a simple rename or one-liner doesn't need this)

## Wolf3D-Specific: Oracle Parity Bridge

For refactor equivalence, the bridge is typically:

- **Old** = current TS implementation
- **New** = refactored TS implementation
- **Assert** = old and new produce identical output for all valid inputs

If the TS module already has oracle parity tests, the refactor must preserve equivalence with both the oracle AND the old TS. Run property tests against the oracle after refactor to confirm.

## Prerequisites

- [ ] fast-check is installed (already in project)
- [ ] The original code is working and considered "correct" (it's the source of truth)
- [ ] You can identify the public interface of the module being refactored
- [ ] Side effects can be mocked or isolated

## Steps

### Step 1: Identify the Refactor Boundary

Determine exactly what you're refactoring. Define the boundary:

| Question | Answer |
| :--- | :--- |
| What function(s) are being rewritten? | List them |
| What are the input types? | Define precisely |
| What are the output types? | Define precisely |
| Are there side effects? | List them, plan to mock |
| What's the public API? | The contract that must not change |

**Key rule:** The refactor boundary should be as small as possible. Refactor one module at a time.

### Step 2: Write Input Generators (Arbitraries)

Create fast-check arbitraries that generate valid inputs. Use `specs/testing-strategy.md` — emphasize numeric boundaries, game-realistic domains, zero/one cases, symmetry.

### Step 3: Write the Bridge Test

Create a test that calls both old and new implementations:

```typescript
fc.assert(
  fc.property(inputArb, (input) => {
    const oldResult = oldImpl(input);
    const newResult = newImpl(input);
    expect(newResult).toEqual(oldResult);
  }),
  { numRuns: 1000, verbose: true, seed: 42 }
);
```

### Step 4: Run and Iterate

```bash
pnpm test:property:local
```

If tests pass: high confidence. If tests fail: fix counterexample, rerun until green.

### Step 5: Replace and Clean Up

1. Replace the old module with the new one
2. Keep the property tests — they become regression tests
3. Remove the bridge (old import) but keep the property assertions
4. Run full test suite: `pnpm verify`
5. Update docs if the refactor revealed spec inaccuracies

## Success Criteria

- [ ] Property tests pass with 1000+ runs
- [ ] Equivalence bridge confirms old and new produce identical output
- [ ] Oracle parity tests still pass (if applicable)
- [ ] Old module replaced with new module
- [ ] Full test suite passes
- [ ] Property tests kept as regression tests
