# Repository Instructions

## Sources of truth

- Treat `src/core/presets.ts` as the source of truth for roles, model/effort mappings, MCP blacklists, aliases, and generated agent TOML.
- Do not hand-edit files under `presets/<id>/agents/`. Change the generator, run tests, build, and regenerate snapshots.
- Keep exactly these eight roles unless a reviewed upstream change explicitly changes the adapter: `orchestrator`, `oracle`, `librarian`, `explorer`, `designer`, `fixer`, `council`, and `observer`. Do not invent a `councillor` role.

## Preset lifecycle

- Add a new preset directory for a new model/effort generation. Never silently rewrite or delete historical model mappings or manifests.
- Version role sources before adapting intentional prompt, role-list, or behavior changes from a newer upstream release.
- A correction to this project's existing Codex translation may update the shared generator and regenerate affected historical TOMLs. Publish such a correction only in a new package version; never move an existing tag or replace an existing Release asset.
- Keep `latest` and `recommended` as explicit movable aliases. Do not implement automatic model fallback.

## Codex layout and MCP rules

- Generate `config_file = "agents/<role>.toml"`. The path is relative to the declaring global or project `config.toml`.
- Install active global agents flat under `CODEX_HOME/agents/` and project agents flat under `<project>/.codex/agents/`. Keep inactive legacy copies outside auto-discovery, such as `CODEX_HOME/agent-presets/`.
- Express role MCP restrictions only as role-local `[mcp_servers.<id>]` tables with `enabled = false`. Do not force allowed servers to `enabled = true`, and do not put role-specific MCP restrictions in `config.snippet.toml`.
- Preserve the reviewed MCP blacklist matrix in `src/core/presets.ts`. Tests must compare the exact parsed disabled-server set for every role and preset.

## Change and verification discipline

- For generator, installer, validator, or CLI behavior changes, write a failing test first and observe the expected failure before implementation.
- Preserve UTF-8, BOM state, and line endings. Prefer `apply_patch`; do not rewrite text files through an encoding-implicit shell command.
- Before a local commit, run the focused test, `npm test`, `npm run typecheck`, `npm run build`, regenerate snapshots when generator output changes, validate every preset directory, and run `npm run pack:check`.
- On Windows, use a writable project-local npm cache if the default cache returns `EPERM`, for example `$env:npm_config_cache='.npm-cache'`.
- Structural validation does not prove model entitlement or MCP availability.

## Release and local installation

- Keep the npm package `private: true`. Distribution is through GitHub Releases, not the npm registry.
- Do not bump versions, push, tag, publish, or overwrite global/project Codex configuration unless the user explicitly requests that action.
- After updating a local Codex installation, validate it with `validate --codex-home`, compare installed role files with the selected preset, and tell the user that new agent configuration takes effect in a new Codex task.
