# Orchestrator Context7 Disable Design

## Goal

Represent oh-my-opencode-slim's `!context7` rule in every generated Codex orchestrator role without disabling Context7 for other roles.

## Design

The shared TOML generator appends the following role-local table only when generating `orchestrator.toml`:

```toml
[mcp_servers.context7]
enabled = false
```

This rule applies to every preset because it belongs to the orchestrator role rather than to a model generation. Existing `openai-5.5` and `openai-5.6` snapshots are regenerated, and future presets inherit the rule automatically. `config.snippet.toml` remains unchanged because placing the setting there could affect roles other than orchestrator.

## Verification

Tests must prove that both existing presets include the disabled Context7 table in `orchestrator.toml`, that no other role contains the table, and that committed snapshots match deterministic generator output. The normal test, typecheck, build, snapshot, packaging, and cross-platform CI checks remain release gates.

## Release

Publish the correction as a new patch version. Existing release tags remain unchanged.
