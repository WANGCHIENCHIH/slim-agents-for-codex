## Context

See proposal.md for motivation and the managed-preset-installation spec for the observable contract.

The current installer has a useful preview/apply seam and creates config backups and archives before changing managed agents and Skills. Its implementation then mutates multiple live filesystem roots, returns, and leaves post-install validation to the CLI adapter. Because the roots are separately configurable, no single filesystem rename can make the whole operation atomic.

The confirmed design assumes one writer and handles only errors caught by the running process. It must preserve exact config bytes and unrelated sibling entries while concentrating commit, validation, and rollback knowledge inside one deep module.

## Goals / Non-Goals

**Goals:**

- Keep the existing installPreset(preview) interface as the install commit seam.
- Make installed-preset validation one core interface used by both commit and the validate CLI command.
- Restore prior package-managed state after caught apply or validation failures.
- Give callers one stable complete/incomplete rollback result instead of exposing mutation order.
- Prove the contract through the highest existing public seams.

**Non-Goals:**

- Crash, power-loss, or forced-termination recovery.
- Concurrent install reconciliation or cross-root locks.
- Candidate-tree promotion, whole-root replacement, or a durable journal.
- Automatic deletion or retention scheduling for backup and archive artifacts.
- A production failure-injection interface.
- Snapshot artifact inventory refactoring.
- Changes to Preset ID, Current Role Contract, model mappings, or generated snapshot behavior.

## Decisions

### Deepen the existing install commit module

installPreset(preview) remains the caller interface. The implementation owns the full sequence from pre-apply drift verification through recovery-state capture, scoped mutation, installed-preset validation, commit, or rollback.

This preserves caller leverage and keeps transaction knowledge out of the CLI adapter. A separate rollback command or CLI-owned transaction was rejected because it would leak recovery ordering across the seam.

### Use scoped compensating rollback

The implementation records enough pre-apply state to compare preview drift and restore exact config bytes plus package-managed agent and Skill paths. Existing backup and archive artifacts remain recovery sources and evidence. Freshly created managed paths are removed on rollback; unrelated siblings are never replaced.

Candidate-tree promotion was rejected because separately configurable roots still require compensating rollback and candidate trees complicate preservation of unrelated entries. Whole-root replacement was rejected because it violates package ownership.

### Recheck state before mutation instead of adding locks

Immediately before the first mutation, the module compares current config bytes and managed inventories/content with the previewed state. Drift fails without writes.

Cross-root locks and stale-lock recovery were rejected because concurrent installs are not a supported use case and crash recovery is a non-goal. The interface documents a single-writer contract.

### Put validation inside the commit window

One core installed-preset validation interface owns config, managed-agent, and managed-Skill validation. The validate CLI command and install commit module are its two real callers.

The install module calls validation before reporting commit. A validation callback was rejected as a hypothetical adapter seam; leaving validation in the CLI was rejected because it would leave known-bad state outside rollback ownership.

### Attempt best-effort complete rollback

After the first caught apply or validation failure, the implementation attempts every independent config, agent, Skill, and temporary-file restoration even when an earlier restoration fails. It verifies restored managed state against the pre-apply snapshot.

The failure result preserves the original failure and every rollback failure. Any failed restoration, verification, or temporary-file cleanup yields rollback incomplete. No automatic retry loop is added.

### Retain recovery artifacts and minimize cleanup

Backup and archive artifacts remain after both complete and incomplete rollback. Only temporary commit files are cleaned when possible. No retention framework or destructive error-path cleanup is introduced.

### Keep CLI output stable and controlled

The CLI maps the core result to two failure states: rollback complete and rollback incomplete. Both exit 1 and suppress the normal installed line. Output includes a controlled reason, unresolved package-managed categories when applicable, and only recovery artifact paths that exist.

Raw exceptions and unrelated filesystem paths are not part of the stable output contract. The top-level process adapter remains responsible only for stderr and exit-code handling.

## Testing Decisions

- Test the highest public install seam with real temporary filesystem roots.
- Create a directory collision at the config temporary-file path so failure occurs after managed agents and Skills have changed; assert exact config restoration, managed-path restoration/removal, unrelated-entry preservation, retained recovery artifacts, temporary cleanup, rollback-complete output, and exit 1.
- Use module-boundary fault injection only for a restoration failure that is impractical to create deterministically across platforms. Delegate all other operations to the real filesystem and assert that every independent restoration is attempted, failures are aggregated, rollback-incomplete output is emitted, and no success line appears.
- Reuse existing successful install, switch/archive, cancellation, retired-ID no-write, and installed-validation tests as compatibility evidence.
- Do not add a production failure hook, a completely mocked filesystem, or one duplicated test per mutation checkpoint.
- Tests assert the rollback and user-visible safety reasons, not the internal mutation sequence.

## Risks / Trade-offs

- **[Concurrent external writer can invalidate restoration assumptions]** → Document the single-writer contract and fail on pre-apply drift before mutation.
- **[Process termination can leave partial state]** → Do not claim crash safety; retain backup and archive artifacts for manual recovery.
- **[Rollback itself can fail]** → Attempt all independent restorations, verify state, aggregate failures, and report rollback incomplete.
- **[Raw filesystem errors can expose unrelated paths]** → Map failures to controlled reasons and managed categories at the CLI seam.
- **[Recovery artifacts accumulate]** → Preserve current operator-owned retention; add policy only after accumulation is demonstrated.

## Migration Plan

1. Add failing acceptance coverage at the public install seam for complete rollback.
2. Move installed-preset validation into the core interface while keeping validate-command behavior green.
3. Add pre-apply drift verification and scoped compensating rollback behind installPreset(preview).
4. Add rollback-incomplete aggregation coverage through external module-boundary fault injection.
5. Add stable CLI failure-state coverage and run existing install, switch, validation, generation, and packaging checks.
6. Release through the existing Package Version workflow; no stored data or configuration migration is required.