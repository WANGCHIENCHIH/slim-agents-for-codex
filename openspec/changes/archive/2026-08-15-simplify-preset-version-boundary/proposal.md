## Why

Preset IDs currently version both an OpenAI model generation and the exact prompts, policies, model mappings, and generated snapshots shipped by a package. This duplicates the package/tag history boundary, creates suffix presets for routine same-generation maintenance, and forces the current implementation to retain historical role-source layers that users do not need in the latest package.

## What Changes

- **BREAKING**: Make `openai-5.5` and `openai-5.6` the only supported preset IDs in the latest package, each representing an OpenAI model generation rather than a configuration revision.
- **BREAKING**: Remove `openai-5.5.1` and `openai-5.6.1` through `openai-5.6.4`; reject retired suffix IDs before writes with guidance to use the unsuffixed ID or the corresponding historical package/tag.
- Make the package version and Git tag the immutable boundary for exact prompts, policies, model/effort mappings, and generated snapshots.
- Generate both supported presets from one Current Role Contract containing the approved seven roles; retain historical contracts only in historical packages/tags.
- Resolve `latest` and `recommended` to `openai-5.6`.
- Keep exact generated snapshot and package validation while updating the user and maintainer documentation to the new boundary.

## User Stories

1. As a CLI user, I want to select an OpenAI model generation with a stable preset ID, so that prompt maintenance does not create a new name I must discover.
2. As a GPT-5.5 user, I want `openai-5.5` to provide the package's current seven-role contract, so that the preset name describes my model generation.
3. As a GPT-5.6 user, I want `openai-5.6` to provide the package's current seven-role contract, so that the preset name describes my model generation.
4. As a user following the recommended configuration, I want `latest` and `recommended` to resolve to `openai-5.6`, so that aliases remain predictable.
5. As a user with an old suffix ID in a script, I want the CLI to fail before writing and explain the migration, so that a package upgrade cannot silently install different content under an apparently historical ID.
6. As a user who needs an exact historical configuration, I want to reproduce it from its package version or Git tag, so that the history boundary is explicit.
7. As a maintainer updating role descriptions or instructions, I want to publish a package revision without creating a same-generation preset suffix, so that routine maintenance does not expand the public preset catalog.
8. As a maintainer updating a model or effort mapping within one model generation, I want to publish a package revision without creating a same-generation preset suffix, so that mapping maintenance follows the same rule as role maintenance.
9. As a maintainer adopting a new OpenAI model generation, I want to add a new preset ID, so that genuinely different model-generation choices remain explicit.
10. As a maintainer, I want one Current Role Contract to own all seven roles and their policies, so that current behavior does not inherit through historical role-source revisions.
11. As a release verifier, I want generated snapshots to remain byte-exact within a package, so that removing preset suffixes does not weaken deterministic packaging.
12. As a package consumer, I want the latest package to contain only its supported model-generation snapshots, so that historical combinations do not remain as selectable current behavior.
13. As a user upgrading an existing eight-role installation, I want the preset switch to archive and remove the retired managed Observer role, so that the old role is not left active through Codex auto-discovery.

## Capabilities

### New Capabilities

- `model-generation-presets`: Defines stable model-generation preset IDs, package-scoped configuration history, retired-ID migration behavior, aliases, the shared Current Role Contract, and deterministic generated outputs.

### Modified Capabilities

- None. This repository does not yet have accepted capability specs.

## Impact

- Changes preset resolution, public CLI listing and error behavior, generated manifests and snapshots, and release documentation.
- Consolidates the current role contract and removes historical role-source and snapshot variants from the latest source/package.
- Requires migration messaging for existing scripts or commands that name suffix presets.
- Preserves recognition of retired managed role names only for safe installation cleanup; it does not preserve their historical role contracts.
- Does not change model entitlement, automatic fallback behavior, installer transactionality, or snapshot artifact inventory structure.
