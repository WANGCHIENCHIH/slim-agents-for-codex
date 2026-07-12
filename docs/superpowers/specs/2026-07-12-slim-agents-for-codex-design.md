# slim-agents-for-codex Design

## Purpose

`slim-agents-for-codex` is a TypeScript npm package and deterministic CLI that converts reviewed `oh-my-opencode-slim` role semantics into Codex custom-agent TOML files. It supports both automated installation and manual copying of committed, pre-generated TOML snapshots.

The project is not affiliated with OpenAI or `oh-my-opencode-slim`. It does not call an AI model during conversion and does not promise that arbitrary OpenCode agents can be mechanically converted safely.

## Product Shape

- npm package: `slim-agents-for-codex`
- executable: `slim-agents-codex`
- implementation: TypeScript on a supported Node.js LTS baseline selected during implementation
- v1 adapter: `oh-my-opencode-slim`
- future adapters: supported through a narrow adapter interface, without claiming generic conversion in v1
- distribution: npm tarball and source repository both include CLI code, immutable preset manifests, generated agent TOMLs, config snippets, documentation, and licenses

The npm name returned `E404 Not Found` on 2026-07-12, so it appeared unregistered at that time. Availability is not reserved until publication.

## User Workflows

### CLI installation

```bash
npx slim-agents-for-codex install --preset openai-5.6
```

The command validates the preset and target, previews changes, asks for confirmation, creates a timestamped backup, installs the selected role files, updates `config.toml`, and validates the result. Non-interactive automation must pass `--yes`.

### Manual installation

Users can copy files from:

```text
presets/openai-5.6/agents/
```

and apply:

```text
presets/openai-5.6/config.snippet.toml
```

The README documents safe target paths, Codex recursive agent discovery, legacy storage outside the discovery tree, `max_threads`, `max_depth`, backups, and restart/new-task requirements.

## CLI Commands

- `convert`: generate a selected adapter/preset into an output directory without changing global configuration.
- `install`: generate or select committed snapshots, preview changes, confirm, back up, install, update config, and validate.
- `validate`: validate manifests, generated TOML, role completeness, config paths, encoding, and installation layout.
- `list-presets`: show immutable preset IDs, models, status metadata, source version, and aliases.
- `switch-preset`: explicitly activate another installed preset after preview and confirmation; never perform automatic model fallback.

Global options include `--codex-home`, `--adapter`, and machine-readable output where useful. `install` and `switch-preset` accept `--yes` for non-interactive use. No write command silently assumes confirmation when stdin is unavailable.

## Architecture

```text
src/
  cli.ts
  commands/
    convert.ts
    install.ts
    validate.ts
    list-presets.ts
    switch-preset.ts
  core/
    adapter.ts
    generator.ts
    installer.ts
    config-editor.ts
    encoding.ts
    validator.ts
  adapters/
    oh-my-opencode-slim/
      index.ts
      roles.ts
      prompts/
presets/
  openai-5.5/
    manifest.json
    agents/*.toml
    config.snippet.toml
  openai-5.6/
    manifest.json
    agents/*.toml
    config.snippet.toml
  aliases.json
tests/
  unit/
  integration/
  fixtures/
```

### Core boundaries

- Adapter: exposes reviewed Codex role definitions and validates adapter-specific role completeness.
- Manifest loader: reads immutable model/effort mappings and provenance metadata.
- Generator: combines one adapter with one manifest to produce deterministic TOML and a config snippet.
- Validator: checks schemas, expected roles, allowed effort values, TOML syntax, snapshots, and install layout.
- Encoding layer: reads and writes UTF-8 while preserving BOM and CRLF/LF for existing config files.
- Config editor: produces a surgical, reviewable transformation of `[agents]` and role tables without changing unrelated content.
- Installer: coordinates preview, confirmation, backup, staging, atomic replacement, and post-install validation.
- Command modules: translate CLI input into core calls; they contain no conversion or file-transformation business logic.

## Adapter Contract

The v1 adapter returns:

- adapter ID and schema version;
- source project and source commit/version;
- exactly nine role definitions: orchestrator, oracle, librarian, explorer, designer, fixer, council, councillor, observer;
- role name, description, sandbox mode, and reviewed Codex `developer_instructions`;
- required `max_threads` and `max_depth` constraints;
- unsupported OpenCode concepts that must not appear in generated output.

OpenCode `skills`, MCP lists, temperature, `@agent` syntax, `task_id`, Background Job Board, `council_session`, and provider-specific model arrays are not copied as unsupported Codex TOML. Their reviewed behavioral intent may be represented in prompts where Codex has an equivalent capability.

## Immutable Presets

Every published preset ID is immutable. Examples:

- `openai-5.5`
- `openai-5.6`
- future `openai-5.7` and `openai-5.8`

Adding a newer preset never deletes or rewrites an older preset. Corrections to published content use a new ID such as `openai-5.6.1` rather than modifying `openai-5.6`.

`aliases.json` contains movable aliases such as `latest` and `recommended`. Aliases are resolved before preview and the resolved immutable ID is shown to the user and recorded in installed metadata. Aliases are never physical preset directories.

Each manifest records:

- immutable preset ID;
- adapter ID and adapter schema version;
- source repository and commit/version;
- creation date;
- lifecycle status such as supported or deprecated;
- exact nine-role model and reasoning-effort mapping;
- snapshot format version.

Deprecated presets remain packaged. Removing old presets requires a documented major-version policy and must never happen silently.

## Snapshot Policy

Generated `presets/<id>/agents/*.toml` and `config.snippet.toml` are committed release artifacts. Role prompts have one maintained source in the adapter; manifests contain only versioned model/effort mapping and provenance. A build command regenerates snapshots deterministically.

CI regenerates every snapshot and fails when the working tree changes. This prevents manually edited TOML from drifting away from the adapter or manifest while preserving ready-to-copy files for manual users.

## Installation Layout

Active, discoverable role files are installed below:

```text
CODEX_HOME/agents/slim-agents-for-codex/<preset-id>/
```

Inactive historical copies, when retained locally, are stored outside recursive role discovery:

```text
CODEX_HOME/agent-presets/slim-agents-for-codex/<preset-id>/
```

The active `config.toml` references only the selected immutable preset. Switching presets does not delete historical preset files.

## Safe Configuration Editing

Before modifying `config.toml`, the installer:

1. reads bytes and strictly validates UTF-8;
2. detects and preserves BOM and newline convention;
3. rejects replacement characters or ambiguous encoding;
4. parses and validates relevant Codex configuration structure;
5. detects existing same-name roles and reports a conflict;
6. computes a preview containing selected preset, created files, config changes, and backup path;
7. requests interactive confirmation unless `--yes` was explicitly provided;
8. writes staged files and validates them before replacement;
9. creates a timestamped backup;
10. uses atomic replacement where the platform supports it;
11. validates the completed installation.

Failure before confirmation makes no global changes. Failure before final replacement leaves the original config intact. Post-replacement validation failure reports the backup and recovery command; automatic rollback is added only if it can be made deterministic and tested across all supported platforms.

## Error Policy

The CLI fails before writes for unknown presets, unresolved aliases, invalid manifests, missing roles, invalid effort values, malformed TOML, incompatible snapshot versions, non-UTF-8 config, same-name role conflicts, unsafe paths, or non-interactive writes without `--yes`.

Offline validation checks structure and consistency only. Model entitlement cannot be inferred offline. An optional explicit live probe may be designed later; v1 must not imply that structural validation proves account access to a model.

Errors identify the failed phase, affected path, whether any write occurred, backup path when present, and a concrete recovery action. Machine-readable mode returns stable error codes.

## Testing

Unit tests cover manifest and adapter validation, deterministic generation, alias resolution, TOML escaping, config transformation, UTF-8 BOM, LF/CRLF, path containment, confirmation rules, and stable error codes.

Integration tests use isolated temporary `CODEX_HOME` fixtures to cover dry conversion, confirmed installation, declined installation, `--yes`, backups, atomic replacement, conflict rejection, preset switching, historical retention outside discovery, and recovery reporting.

Golden tests compare generated snapshots with committed files. Packaging tests run `npm pack --dry-run` and inspect the tarball file list for the executable, compiled code, manifests, TOML snapshots, snippets, README, and licenses.

CI runs supported Node.js versions on Windows, Ubuntu, and macOS. It runs type checking, unit and integration tests, snapshot regeneration with a clean-tree assertion, package construction, and a smoke test invoking the packed CLI.

## Documentation and Licensing

The README includes quick start, manual installation, preset lifecycle, safety behavior, conflict handling, platform-specific paths, examples, and troubleshooting. The repository documents that role prompts are adapted from `oh-my-opencode-slim`, records upstream provenance, and includes all attribution and license notices required by the upstream license after verification.

## Out of Scope for v1

- arbitrary OpenCode-to-Codex conversion;
- automatic parsing of changing upstream TypeScript at user runtime;
- AI-assisted prompt rewriting;
- automatic model fallback;
- automatic deletion of historical presets;
- plugin packaging;
- remote GitHub synchronization;
- silent overwrite of existing roles;
- claiming multi-provider Council behavior when only one provider is configured.

## Success Criteria

- Both CLI and manual workflows install the same nine role definitions.
- `openai-5.5` and `openai-5.6` remain independently available after newer presets are added.
- Generation is deterministic and committed snapshots cannot drift unnoticed.
- Installation preserves unrelated config content, encoding, BOM, and newline style.
- No write occurs without preview plus confirmation or explicit `--yes`.
- Windows, Ubuntu, and macOS CI pass against the packed CLI artifact.
