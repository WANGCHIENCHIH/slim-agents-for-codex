# Role MCP Blacklist Design

## Goal

Translate the reviewed oh-my-opencode-slim role MCP restrictions into deterministic Codex role TOMLs for the four known MCP server IDs: `exa`, `context7`, `grep`, and `codegraph`.

## Blacklist Matrix

| Role | MCP servers emitted with `enabled = false` |
|---|---|
| `librarian` | `codegraph` |
| `orchestrator` | `exa`, `context7`, `grep`, `codegraph` |
| `explorer` | `exa`, `context7`, `grep` |
| `designer` | `exa`, `context7`, `grep` |
| `oracle` | `context7`, `grep` |
| `fixer` | `context7`, `grep` |
| `council` | none |
| `observer` | none |

Each disabled server is rendered as a role-local TOML table:

```toml
[mcp_servers.<server-id>]
enabled = false
```

## Boundaries

The generator does not emit `enabled = true` for allowed servers, so it never reverses a user's global decision to disable one. It does not attempt to restrict unknown or future user-installed MCP servers because Codex currently exposes per-server disabling rather than a server allowlist. `config.snippet.toml` remains unchanged. The matrix applies to `openai-5.5`, `openai-5.6`, and future presets through the shared generator.

## Verification

Tests parse every generated role TOML and compare its disabled MCP server set with the exact matrix for both existing presets. Snapshot generation must change only the affected role TOMLs. Normal tests, typecheck, build, TOML validation, and package dry-run remain required.

## Release Boundary

This task is committed locally without changing the package version, pushing commits, creating tags, or publishing a Release.
