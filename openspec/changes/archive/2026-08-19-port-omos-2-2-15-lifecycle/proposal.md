## Why

oh-my-opencode-slim 2.2.15 clarifies how an orchestrator inspects, messages, cancels, and resumes background specialists without confusing transport acknowledgement with completed work. The Codex adapter already has native collaboration tools for those operations, but its Current Role Contract and managed orchestration Skill do not yet state the corresponding lifecycle safety rules.

## What Changes

- Define Codex-native specialist lifecycle behavior using `list_agents`, `wait_agent`, `send_message`, `interrupt_agent`, and `followup_task`.
- Require non-polling waits, conservative message acknowledgement, partial-work reconciliation after interruption, and preservation of required review and validation after cancellation.
- Update the reviewed upstream provenance to oh-my-opencode-slim 2.2.15 at commit `dafee9849fbae6fecaa51c5f406083cad4dfd08b`.
- Regenerate both supported preset snapshots under the existing unsuffixed Preset IDs and publish the maintenance as a new Package Version.
- Do not port OpenCode runtime task-manager code, Herdr integration, OpenCode-only presets, config normalization, or provider failover behavior.

## Capabilities

### New Capabilities

- `agent-lifecycle-orchestration`: Defines portable lifecycle controls and safety requirements for supervised Codex specialist agents.

### Modified Capabilities

- `model-generation-presets`: Requires every supported model-generation preset to carry the same updated lifecycle-aware Current Role Contract while retaining stable unsuffixed Preset IDs.

## Impact

- Current Role Contract orchestrator instructions and the managed `slim-orchestration` Skill.
- Preset generator provenance, contract tests, and committed `openai-5.5` / `openai-5.6` snapshots and manifests.
- Package Version only; no new dependency, runtime service, model mapping, role, or Preset ID.
