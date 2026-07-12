# Role MCP Blacklists Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate the exact reviewed MCP disable set for each role across every preset.

**Architecture:** Define one declarative role-to-disabled-server matrix beside the shared TOML generator. Parse generated TOMLs in tests and compare exact disabled server sets, then regenerate both committed presets.

**Tech Stack:** TypeScript, Vitest, smol-toml, npm

## Global Constraints

- Limit the matrix to `exa`, `context7`, `grep`, and `codegraph`.
- Never emit `enabled = true`.
- Leave `council`, `observer`, and `config.snippet.toml` without MCP overrides.
- Do not change package version, push, tag, or publish.

---

### Task 1: Render exact role MCP blacklists

**Files:**
- Modify: `tests/core.test.ts`
- Modify: `src/core/presets.ts`
- Regenerate: affected TOMLs under `presets/openai-5.5/agents/`
- Regenerate: affected TOMLs under `presets/openai-5.6/agents/`

**Interfaces:**
- Consumes: `generatePreset(idOrAlias: string)`
- Produces: role TOMLs whose parsed `mcp_servers` disabled keys equal the approved matrix

- [ ] **Step 1: Replace the focused Context7 test with an exact parsed-matrix test**

Use `smol-toml` to parse every role TOML for `openai-5.5` and `openai-5.6`, collect entries with `enabled === false`, sort them, and compare them with the approved role matrix.

- [ ] **Step 2: Run `npm test -- --run tests/core.test.ts`**

Expected: FAIL because the current generator only disables Context7 for orchestrator.

- [ ] **Step 3: Add a declarative `disabledMcpsByRole` map and render each table**

The renderer emits `\n[mcp_servers.<id>]\nenabled = false\n` for every server in the role's array and emits an empty string for roles without entries.

- [ ] **Step 4: Re-run the focused test**

Expected: all focused tests PASS.

- [ ] **Step 5: Run `npm run build` and `npm run snapshots`**

Expected: affected role TOMLs in both presets gain only their specified disabled-server tables; snippets remain unchanged.

- [ ] **Step 6: Run full verification**

Run `npm test`, `npm run typecheck`, `npm run build`, validate both preset directories, and run `npm run pack:check` with a writable npm cache.
