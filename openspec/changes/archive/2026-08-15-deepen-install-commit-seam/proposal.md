## Why

### Problem Statement

A failed install or preset switch can leave managed config, agents, and Skills in
a mixed state because live filesystem mutations happen before validation and
there is no automatic rollback. The CLI then requires manual recovery without
telling the operator whether the prior managed state is actually restored.

### Solution

Treat installation as one deep commit module: reject preview drift before the
first mutation, keep validation inside the commit window, and restore the prior
managed state after any caught apply or validation failure. Report whether
rollback completed or remains incomplete, while retaining recovery artifacts.

## User Stories

1. As a Codex user, I want a failed install to restore my prior managed state, so that a recoverable filesystem error does not leave a mixed installation.
2. As a Codex user switching presets, I want the same rollback guarantee as a fresh install, so that both public commands have one safety contract.
3. As a user with an existing config, I want rollback to restore its exact bytes, so that encoding, BOM, newline style, comments, and unrelated settings survive.
4. As a user with custom agents, I want rollback to touch only managed agent files, so that unrelated agents remain mine.
5. As a user with unrelated Skills, I want rollback to touch only the two managed Skill directories, so that unrelated Skills remain unchanged.
6. As an operator, I want installation to commit only after public validation passes, so that success always means the installed preset and Skills are valid.
7. As an operator, I want a pre-apply drift check, so that an install does not overwrite state changed after preview.
8. As an operator, I want rollback to continue after one restoration fails, so that every independently recoverable path is still attempted.
9. As an operator, I want the original failure and all rollback failures preserved, so that incomplete recovery is diagnosable.
10. As an operator, I want backup and archive artifacts retained after failure, so that manual recovery evidence remains available.
11. As an operator, I want temporary commit files cleaned when possible, so that failed attempts do not masquerade as live state.
12. As a CLI user, I want a clear rollback-complete result, so that I know the previous managed state was verified.
13. As a CLI user, I want a clear rollback-incomplete result, so that I know manual recovery is still required.
14. As a CLI user, I want failure output limited to controlled managed-state and recovery information, so that unrelated filesystem paths are not exposed.
15. As a maintainer, I want install and validate to use one core validation interface, so that the public validation contract cannot drift between commands.
16. As a maintainer, I want rollback tested through the public filesystem seam, so that the test proves behavior rather than implementation order.

## What Changes

- Add caught-operation rollback for both install and preset switch.
- Treat installed-preset validation as part of the commit window.
- Recheck previewed managed state before the first live mutation.
- Restore exact prior config bytes and only package-managed agent and Skill paths.
- Attempt every independent restoration and distinguish complete from incomplete rollback.
- Retain backup and archive artifacts while cleaning temporary commit files when possible.
- Reuse one core installed-preset validation interface from the commit module and validate CLI command.
- Add stable CLI failure states without changing successful install, switch, validation, or cancellation behavior.

## Capabilities

### New Capabilities

- managed-preset-installation: Defines preview drift protection, validated commit, scoped automatic rollback, recovery evidence, and CLI failure reporting for managed installs and preset switches.

### Modified Capabilities

None. The in-progress model-generation-presets capability continues to define
Preset ID and Current Role Contract behavior; this change adds the previously
excluded installation consistency contract.

## Impact

- Affects the installer core module, the CLI adapter, and installer/CLI acceptance tests.
- Adds no runtime dependency, configuration key, schema, network call, or external system.
- Is not a breaking CLI change: successful output and cancellation exit code remain compatible; failed installs gain explicit rollback status.