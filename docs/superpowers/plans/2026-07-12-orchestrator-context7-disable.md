# Orchestrator Context7 Disable Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a role-local disabled Context7 MCP table to every generated orchestrator TOML and no other role.

**Architecture:** Keep the rule in the shared deterministic generator so existing and future presets behave consistently. Regenerate the committed `openai-5.5` and `openai-5.6` snapshots after the tested generator change.

**Tech Stack:** TypeScript, Vitest, smol-toml, npm

## Global Constraints

- Apply the rule to every existing and future preset.
- Do not add the table to non-orchestrator roles or `config.snippet.toml`.
- Do not change the package version, create a tag, push, or publish a Release in this task.

---

### Task 1: Generate the role-local Context7 override

**Files:**
- Modify: `tests/core.test.ts`
- Modify: `src/core/presets.ts`
- Regenerate: `presets/openai-5.5/agents/orchestrator.toml`
- Regenerate: `presets/openai-5.6/agents/orchestrator.toml`

**Interfaces:**
- Consumes: `generatePreset(idOrAlias: string)`
- Produces: `agents.orchestrator` containing `[mcp_servers.context7]` with `enabled = false`

- [ ] **Step 1: Write the failing test**

Add assertions for both presets and every non-orchestrator role:

```ts
for (const id of ["openai-5.5", "openai-5.6"]) {
  const generated = generatePreset(id);
  expect(generated.agents.orchestrator).toContain("[mcp_servers.context7]\nenabled = false");
  for (const [name, toml] of Object.entries(generated.agents)) {
    if (name !== "orchestrator") expect(toml).not.toContain("[mcp_servers.context7]");
  }
  expect(generated.snippet).not.toContain("[mcp_servers.context7]");
}
```

- [ ] **Step 2: Verify the test fails for the missing table**

Run: `npm test -- --run tests/core.test.ts`

Expected: FAIL because `agents.orchestrator` does not contain `[mcp_servers.context7]`.

- [ ] **Step 3: Add the minimal generator rule**

Append this suffix only when `name === "orchestrator"`:

```ts
const mcpOverrides = name === "orchestrator" ? "\n[mcp_servers.context7]\nenabled = false\n" : "";
```

- [ ] **Step 4: Verify the focused test passes**

Run: `npm test -- --run tests/core.test.ts`

Expected: all focused tests PASS.

- [ ] **Step 5: Regenerate and verify snapshots**

Run: `npm run build && npm run snapshots`

Expected: only the two orchestrator snapshots gain the role-local table.

- [ ] **Step 6: Run complete verification**

Run: `npm test && npm run typecheck && npm run build && npm run pack:check`

Expected: all commands exit successfully; the package remains at its current version.
