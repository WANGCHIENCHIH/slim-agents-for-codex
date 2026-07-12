# slim-agents-for-codex Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a publishable TypeScript npm CLI that deterministically generates, validates, installs, and manually distributes versioned Codex agent presets adapted from oh-my-opencode-slim.

**Architecture:** A small dependency-light core separates reviewed adapter prompts, immutable model manifests, deterministic TOML generation, validation, and safe Codex configuration installation. Commands are thin wrappers over core functions; committed preset snapshots are generated artifacts checked by tests and packaging verification.

**Tech Stack:** TypeScript, Node.js 20+, npm, Vitest, `smol-toml`, native Node filesystem APIs, GitHub Actions.

## Global Constraints

- Package name: `slim-agents-for-codex`; executable: `slim-agents-codex`.
- v1 supports only the `oh-my-opencode-slim` adapter through an extensible adapter interface.
- Conversion is deterministic and never calls an AI model.
- Presets are immutable; `openai-5.5` and `openai-5.6` remain packaged when newer presets are added.
- `latest` and `recommended` are aliases, not directories.
- Both CLI installation and manual-copy snapshots are first-class supported workflows.
- Global writes require preview and interactive confirmation, or explicit `--yes`.
- Preserve existing UTF-8 BOM and LF/CRLF; reject ambiguous encoding and replacement characters.
- Never silently overwrite same-name roles, delete historical presets, or perform model fallback.
- Generated discoverable roles include `name`, `description`, `model`, `model_reasoning_effort`, `sandbox_mode`, and `developer_instructions`.

---

### Task 1: Initialize the publishable TypeScript package

**Files:**
- Create: `outputs/slim-agents-for-codex/package.json`
- Create: `outputs/slim-agents-for-codex/tsconfig.json`
- Create: `outputs/slim-agents-for-codex/vitest.config.ts`
- Create: `outputs/slim-agents-for-codex/src/cli.ts`
- Create: `outputs/slim-agents-for-codex/.gitignore`

**Interfaces:**
- Produces executable `dist/cli.js` through package `bin.slim-agents-codex`.

- [ ] Initialize a Git repository and a Node package with ESM output, `engines.node >=20`, scripts `build`, `test`, `typecheck`, `snapshots`, and `pack:check`.
- [ ] Add runtime dependency `smol-toml`; add TypeScript, Vitest, and Node type definitions as dev dependencies.
- [ ] Write a smoke test that imports the CLI argument parser and confirms `--help` exits successfully.
- [ ] Implement the minimum shebang CLI entry point and run `npm test`, `npm run typecheck`, and `npm run build`.
- [ ] Commit as `chore: initialize TypeScript CLI package`.

### Task 2: Define adapter and immutable preset contracts

**Files:**
- Create: `src/core/types.ts`
- Create: `src/core/manifest.ts`
- Create: `src/adapters/oh-my-opencode-slim/index.ts`
- Create: `src/adapters/oh-my-opencode-slim/roles.ts`
- Create: `src/adapters/oh-my-opencode-slim/prompts/*.txt`
- Create: `presets/openai-5.5/manifest.json`
- Create: `presets/openai-5.6/manifest.json`
- Create: `presets/aliases.json`
- Test: `tests/unit/manifest.test.ts`

**Interfaces:**
- `AgentAdapter`: `{ id, schemaVersion, source, requiredRoles, roles }`.
- `PresetManifest`: immutable ID, adapter metadata, source provenance, lifecycle status, snapshot version, and exact role model/effort map.
- `loadPreset(idOrAlias): PresetManifest` resolves aliases while returning the immutable ID.

- [ ] Write failing tests for nine required roles, invalid effort, missing role, alias resolution, alias cycle, and immutable ID mismatch.
- [ ] Implement schemas and loaders with explicit errors and stable error codes.
- [ ] Port the nine reviewed Codex prompts from the approved design and current converted TOMLs; do not copy unsupported OpenCode tool syntax.
- [ ] Add `openai-5.5` and `openai-5.6` manifests and aliases with `latest` and `recommended` pointing to `openai-5.6`.
- [ ] Run targeted tests and commit as `feat: add adapter and versioned preset contracts`.

### Task 3: Generate deterministic TOML snapshots

**Files:**
- Create: `src/core/generator.ts`
- Create: `src/core/toml.ts`
- Create: `scripts/generate-snapshots.ts`
- Create: `presets/openai-5.5/agents/*.toml`
- Create: `presets/openai-5.6/agents/*.toml`
- Create: `presets/*/config.snippet.toml`
- Test: `tests/unit/generator.test.ts`
- Test: `tests/snapshots/presets.test.ts`

**Interfaces:**
- `generatePreset(adapter, manifest): GeneratedPreset` returns nine named TOMLs plus a config snippet.
- Output ordering is stable by required-role order and always ends with LF.

- [ ] Write failing tests for field completeness, TOML escaping, model differences with identical prompts, stable ordering, and forbidden OpenCode tokens.
- [ ] Implement deterministic generation without reading network state.
- [ ] Generate and commit both preset directories.
- [ ] Add a snapshot cleanliness test that regenerates into a temp directory and byte-compares every committed artifact.
- [ ] Run tests and commit as `feat: generate immutable preset snapshots`.

### Task 4: Validate presets and installations

**Files:**
- Create: `src/core/validator.ts`
- Create: `src/core/errors.ts`
- Test: `tests/unit/validator.test.ts`

**Interfaces:**
- `validatePreset(path): ValidationReport`.
- `validateInstallation(codexHome, presetId): ValidationReport`.
- `ValidationReport` contains checks, warnings, and stable coded errors without claiming model entitlement.

- [ ] Write failing tests for malformed TOML, missing names, wrong sandbox mode, missing role, extra role, legacy inside discovery tree, bad config paths, and structural success.
- [ ] Implement validators with no writes and no live model calls.
- [ ] Ensure output distinguishes structural validity from account model availability.
- [ ] Run tests and commit as `feat: validate presets and Codex installations`.

### Task 5: Implement encoding-safe configuration editing and installation

**Files:**
- Create: `src/core/encoding.ts`
- Create: `src/core/config-editor.ts`
- Create: `src/core/installer.ts`
- Test: `tests/unit/encoding.test.ts`
- Test: `tests/unit/config-editor.test.ts`
- Test: `tests/integration/install.test.ts`

**Interfaces:**
- `readUtf8Document(path): EncodedDocument` preserves BOM and newline.
- `previewInstall(request): InstallPreview` performs all preflight work without writes.
- `applyInstall(preview): InstallResult` validates staged output, backs up, atomically replaces, and post-validates.

- [ ] Write failing tests for UTF-8 BOM, LF/CRLF, replacement characters, same-name conflicts, unrelated-config preservation, decline/no-write, backup, success, and partial-failure safety.
- [ ] Implement path containment and reject active legacy paths under recursive discovery.
- [ ] Implement preview output including resolved immutable preset, paths, config changes, and backup path.
- [ ] Implement confirmed writes and post-install validation; expose deterministic recovery information.
- [ ] Run tests and commit as `feat: install presets safely`.

### Task 6: Implement CLI commands and confirmation behavior

**Files:**
- Create: `src/commands/convert.ts`
- Create: `src/commands/install.ts`
- Create: `src/commands/validate.ts`
- Create: `src/commands/list-presets.ts`
- Create: `src/commands/switch-preset.ts`
- Modify: `src/cli.ts`
- Test: `tests/integration/cli.test.ts`

**Interfaces:**
- Commands: `convert`, `install`, `validate`, `list-presets`, `switch-preset`.
- Global options: `--codex-home`, `--adapter`; write commands support `--yes`.

- [ ] Write failing CLI tests for help, unknown command, alias display, conversion output, declined install, non-interactive refusal, `--yes`, validation exit codes, and preset switching retention.
- [ ] Implement thin command modules over core APIs.
- [ ] Ensure write commands print the immutable resolved preset before confirmation.
- [ ] Run tests and commit as `feat: expose preset management CLI`.

### Task 7: Add manual workflow documentation and licensing

**Files:**
- Create: `README.md`
- Create: `LICENSE`
- Create: `NOTICE.md`
- Create: `docs/manual-installation.md`
- Create: `docs/preset-lifecycle.md`
- Copy: `docs/superpowers/specs/2026-07-12-slim-agents-for-codex-design.md`

**Interfaces:**
- Manual users can copy one immutable preset and apply its config snippet without invoking the CLI.

- [ ] Verify the upstream license and record required attribution without claiming affiliation.
- [ ] Document CLI quick start, manual copy workflow, paths on Windows/macOS/Linux, backups, conflicts, restart behavior, and preset retention.
- [ ] Document adding 5.7 without modifying 5.5 or 5.6.
- [ ] Run link/path checks and commit as `docs: document installation and preset lifecycle`.

### Task 8: Verify package contents and cross-platform CI

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `scripts/check-package.ts`
- Modify: `package.json`
- Test: `tests/integration/package.test.ts`

**Interfaces:**
- `npm pack --dry-run --json` must include compiled CLI, all immutable presets, README, LICENSE, and NOTICE.

- [ ] Write a failing package-content test for required and forbidden tarball paths.
- [ ] Configure package `files` and lifecycle build scripts.
- [ ] Add Windows, Ubuntu, and macOS CI for Node 20 and the current LTS available at implementation time.
- [ ] Run full `npm test`, `npm run typecheck`, `npm run build`, snapshot cleanliness, `npm pack --dry-run --json`, and packed CLI smoke tests.
- [ ] Commit as `ci: verify cross-platform package release`.

### Task 9: Final repository verification

**Files:**
- Inspect all project files and Git status.

**Interfaces:**
- Produces a clean, locally publishable repository; does not publish npm or create a remote repository.

- [ ] Run the complete verification suite from a clean checkout state.
- [ ] Install the local tarball into an isolated temp prefix and run `slim-agents-codex list-presets`, `convert`, and a declined `install` smoke test.
- [ ] Confirm 5.5 and 5.6 snapshots both remain in the tarball and aliases resolve to 5.6.
- [ ] Inspect the final diff and commit any verification-only fixes.
- [ ] Report repository path, commit history, tests, tarball result, and explicitly excluded npm/GitHub publication.
