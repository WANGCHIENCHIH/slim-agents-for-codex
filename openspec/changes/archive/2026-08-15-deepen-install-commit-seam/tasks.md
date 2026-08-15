## 1. Share installed-preset validation

**Blocked by:** None — can start immediately.

**Deliverable:** The validate command and successful install path use one core installed-preset validation interface without changing existing successful output, errors, or exit codes.

**Status:** complete

- [x] 1.1 Add or adjust focused public behavior tests proving the validate command and install path enforce the same config, managed-agent, and managed-Skill validation contract without asserting internal call order.
- [x] 1.2 Move installed-preset validation behind one core interface and route both existing callers through it while preserving CLI behavior.
- [x] 1.3 Run the focused core and installer tests plus typecheck, and record exact pass/fail evidence for this ticket.

**Evidence (2026-08-15):**

- Red: `npm.cmd test -- --run tests/installer.test.ts -t "rejects a direct install whose managed agent output fails installed validation"` failed as intended because `installPreset(preview)` resolved instead of rejecting.
- Green: the same focused test passed; `npm.cmd test -- --run tests/core.test.ts tests/installer.test.ts` passed 2 files and 42 tests; `npm.cmd run typecheck` passed.

## 2. Abort drifted previews without mutation

**Blocked by:** None — can start immediately.

**Deliverable:** Install and preset switch recheck previewed config bytes and package-managed agent/Skill state immediately before mutation, then fail with zero installation changes when drift is detected.

**Status:** complete

- [x] 2.1 Add failing public install tests for config drift and managed-path drift after preview, asserting no config, agent, Skill, backup, archive, or temporary installation path changes.
- [x] 2.2 Capture the scoped preview state needed for exact comparison and reject drift before the first live mutation under the single-writer contract.
- [x] 2.3 Run the focused installer tests plus typecheck, and record exact pass/fail evidence for this ticket.

**Evidence (2026-08-15):**

- Red: `npm.cmd test -- --run tests/installer.test.ts -t "rejects (config|managed)"` failed before the implementation because the config and managed-agent drift tests resolved instead of rejecting; the initial Skill fixture also needed recursive directory creation and was corrected before the green run.
- Green: the same focused command passed 1 file and 3 tests; `npm.cmd test -- --run tests/installer.test.ts` passed 1 file and 16 tests; `npm.cmd run typecheck` passed.

## 3. Restore managed state after caught failures

**Blocked by:** 1 — Share installed-preset validation; 2 — Abort drifted previews without mutation.

**Deliverable:** The install commit module owns mutate, validate, commit, and rollback. A caught apply or validation failure restores exact prior config bytes and package-managed agent/Skill state, preserves unrelated entries and recovery artifacts, cleans temporary files, and reports rollback complete.

**Status:** complete

- [x] 3.1 Add failing public tests using real temporary filesystem roots for a config temporary-file directory collision after agent/Skill mutation and for post-apply validation failure.
- [x] 3.2 Make installed-preset validation part of the commit window and implement scoped compensating rollback behind the existing installPreset(preview) interface.
- [x] 3.3 Assert exact config restoration or fresh-config removal, managed agent/Skill restoration or removal, unrelated-entry preservation, recovery-artifact retention, temporary cleanup, exit code 1, rollback-complete output, and absence of the normal installed line.
- [x] 3.4 Re-run successful install, preset switch/archive, cancellation, retired-ID no-write, validation, focused rollback, and typecheck evidence before completing this ticket.

**Evidence (2026-08-15):**

- Red: `npm.cmd test -- --run tests/installer.test.ts -t "rolls back a fresh install|reports complete rollback"` failed 2 tests before the rollback implementation: fresh post-validation left the newly created config, and the temp-path collision propagated raw `EISDIR`.
- Green focused rollback: the same command passed 1 file and 2 tests.
- Green compatibility: `npm.cmd test -- --run tests/installer.test.ts` passed 1 file and 18 tests; `npm.cmd test -- --run tests/core.test.ts tests/installer.test.ts` passed 2 files and 47 tests, covering successful install, switch/archive, cancellation, retired-ID no-write, and validation.
- Green typecheck: `npm.cmd run typecheck` passed.

## 4. Report incomplete rollback without stopping recovery

**Blocked by:** 3 — Restore managed state after caught failures.

**Deliverable:** A restoration failure does not stop independent recovery attempts. The CLI retains the original and all rollback failures, reports rollback incomplete with unresolved managed categories and available recovery artifacts, and does not expose unrelated filesystem paths.

**Status:** complete

- [x] 4.1 Add one external filesystem module-seam fault-injection test that delegates normal operations to the real temporary filesystem, forces a restoration failure, and proves every independent restoration is attempted.
- [x] 4.2 Aggregate the original install failure with all restoration, verification, and temporary-cleanup failures; map the result to controlled rollback-incomplete CLI output and exit code 1.
- [x] 4.3 Assert unresolved managed categories and existing recovery artifacts are reported, raw unrelated paths and the normal installed line are absent, and rollback-complete behavior remains green.
- [x] 4.4 Run npm test, npm run typecheck, npm run build, npm run snapshots, npm run pack:check, and openspec validate deepen-install-commit-seam --strict; record exact results and any skipped checks.

**Evidence (2026-08-15):**

- Red: `npm.cmd test -- --run tests/installer.test.ts -t "reports incomplete rollback after an agent restoration fault"` failed 1 test with 18 skipped because Skill restoration stopped after the injected agent restoration failure.
- Green focused: `npm.cmd test -- --run tests/installer.test.ts -t "reports incomplete rollback"` passed 1 test with 18 skipped, including controlled restore/verify failure output and existing recovery artifacts.
- Review red: `npm.cmd test -- --run tests/installer.test.ts -t "reports preview drift through the controlled CLI failure state"` failed because preview drift escaped the controlled CLI result; the expanded incomplete-rollback test also failed before the fix because an early Skill restore failure prevented a later Skill write.
- Final after review fixes: `npm.cmd test` passed 3 files and 50 tests; `npm.cmd run typecheck`, `npm.cmd run build`, `npm.cmd run snapshots`, `npm.cmd run pack:check`, and `openspec validate deepen-install-commit-seam --strict` passed. The first sandboxed test and pack runs hit environment `EPERM`; the same commands passed outside the sandbox. No required check was skipped.
