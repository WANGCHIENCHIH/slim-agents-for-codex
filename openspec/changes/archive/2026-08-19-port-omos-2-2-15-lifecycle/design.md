## Context

See `proposal.md` for motivation. The package has two independently installed orchestration surfaces: generated Orchestrator role instructions and the managed `slim-orchestration` Skill. Both model-generation presets share one Current Role Contract, while exact output identity remains `(Package Version, Preset ID)`.

The upstream 2.2.15 release implements task lifecycle controls inside OpenCode. Codex already exposes native collaboration controls, so this adapter needs portable behavioral guidance rather than a second task runtime.

## Problem Statement

Maintainers can update the adapter's upstream provenance without giving installed Codex Orchestrators the lifecycle safety lessons introduced by oh-my-opencode-slim 2.2.15. Users consequently lack an explicit packaged contract for inspecting, messaging, interrupting, resuming, and reconciling specialists without duplicate work or overstated completion.

## Solution

Publish one lifecycle-aware Current Role Contract across both supported presets and align the managed orchestration Skill with Codex's native collaboration tools. Preserve the current seven roles, model mappings, preset IDs, installer boundary, and deterministic snapshot workflow.

## User Stories

1. As a Codex user, I want the Orchestrator to wait for required specialists without duplicate dispatches, so that work is not repeated unnecessarily.
2. As a Codex user, I want uncertain specialist status to remain visibly unresolved, so that incomplete work is not presented as complete.
3. As a Codex user, I want live guidance to avoid starting an extra model turn, so that a running specialist is not accidentally restarted.
4. As a Codex user, I want message delivery reported conservatively, so that transport acceptance is not confused with agent acknowledgement.
5. As a Codex user, I want interruption reserved for obsolete, unsafe, or explicitly cancelled work, so that useful specialist work is not discarded casually.
6. As a Codex user, I want partial writer changes inspected after interruption, so that cancellation does not conceal inconsistent workspace state.
7. As a Codex user, I want an existing specialist resumed when its retained context remains useful, so that the same investigation does not start from scratch.
8. As a Codex user, I want cancelled review and validation obligations reassigned or resumed, so that lifecycle control cannot bypass acceptance evidence.
9. As a preset installer, I want both OpenAI model-generation presets to carry identical orchestration policy, so that changing models does not change workflow semantics.
10. As a preset installer, I want stable unsuffixed Preset IDs, so that a prompt-policy maintenance release does not create another configuration selector.
11. As a maintainer, I want manifests to record the reviewed upstream release and commit, so that generated output has traceable audit provenance.
12. As a maintainer, I want deterministic committed snapshots to detect drift, so that generated agents and manifests match the released package.
13. As a maintainer, I want the managed Skill verified as a packaged artifact, so that installer validation covers the lifecycle workflow users actually receive.
14. As a maintainer, I want OpenCode-only runtime features excluded, so that the Codex adapter stays small and does not duplicate host functionality.

## Goals / Non-Goals

**Goals:**

- Express the final 2.2.15 lifecycle lessons in Codex-native terms.
- Keep role and Skill guidance consistent without introducing a new runtime abstraction.
- Preserve deterministic generation and installation boundaries.

**Non-Goals:**

- Emulate OpenCode's Background Job Board, task generations, leases, status endpoint, or task-result transport.
- Add Herdr, OpenCode Zen presets, legacy JSON config repair, model failover, roles, dependencies, or Preset IDs.
- Change existing OpenAI model or reasoning-effort mappings.

## Implementation Decisions

- Modify the existing Orchestrator role source and managed orchestration Skill; do not create a shared lifecycle module for two prose artifacts with different responsibilities.
- Map lifecycle behavior to the native Codex controls `list_agents`, `wait_agent`, `send_message`, `interrupt_agent`, and `followup_task`.
- Use `send_message` only for non-triggering additive communication and describe success as delivery acceptance, never proof of consumption.
- Use `followup_task` for deliberate continuation of an existing idle or interrupted specialist and keep terminal-result reconciliation separate from dispatch acknowledgement.
- Preserve interruption as a narrow control and explicitly require reconciliation of partial shared-worktree changes.
- Adopt the final 2.2.15 lifecycle vocabulary rather than the earlier `task_nudge` name superseded within that upstream release.
- Update the package as same-generation policy maintenance. Keep `openai-5.5` and `openai-5.6`; use a Package Version change for exact output identity.
- Record upstream version `2.2.15` and full commit `dafee9849fbae6fecaa51c5f406083cad4dfd08b` in generated manifests and concise role-source provenance.

## Testing Decisions

- Treat generated preset output as the first high-level seam. Verify that both supported model generations render the same lifecycle-aware Current Role Contract and upstream provenance while retaining their existing model mappings.
- Treat the packaged managed Skill as the second high-level seam because it is installed independently from generated role TOMLs. Verify its observable lifecycle instructions without introducing a new test-only interface.
- Reuse the existing public CLI snapshot check to prove committed generated outputs match the generator. It is final consistency evidence, not a third behavior seam.
- Prefer assertions on required and prohibited behavior over complete prompt snapshots: tests must fail if non-polling waits, conservative acknowledgement, interruption reconciliation, retained-context continuation, or surviving review obligations disappear.
- Reuse the existing preset-generation and managed-Skill tests as prior art. No runtime mock of OpenCode task APIs is warranted.

## Risks / Trade-offs

- [Risk] Similar lifecycle guidance exists in two prose artifacts and can drift. → Mitigation: verify both packaged surfaces in the same contract test area and keep each statement scoped to its role.
- [Risk] Tool semantics may evolve in Codex. → Mitigation: name only current native operations and keep OpenCode implementation terminology out of the portable contract.
- [Risk] Prompt assertions can become brittle. → Mitigation: assert required behavioral phrases and exclusions rather than full text equality.
- [Trade-off] This change records lifecycle policy but cannot execute a deterministic live multi-agent acceptance inside unit tests. → Mitigation: distinguish artifact tests from later real task evidence and do not claim runtime proof from snapshots.

## Migration Plan

1. Add failing contract assertions at the two confirmed seams.
2. Update the role source, managed Skill, and upstream provenance minimally.
3. Change the Package Version and regenerate both committed preset snapshots.
4. Run focused contract tests, public CLI snapshot validation, full tests, build, and strict OpenSpec validation.
5. Install or switch the resulting package only through the existing preview, backup, and post-validation workflow.

Rollback uses the prior package or Git tag, which retains the exact previous `(Package Version, Preset ID)` output. No data or runtime migration is required.

## Out of Scope

OpenCode task-manager code, task status endpoints, task leases, task generation fencing, Background Job Board persistence, multiplexer adapters, Herdr Marketplace integration, OpenCode-specific free models, `disabled_*` JSON normalization, provider fallback, and physical runtime proof are outside this spec.

## Further Notes

The OpenSpec change is the repository's issue-tracker record for this specification. Ticket slicing remains a separate approval stage; implementation does not begin from this artifact alone.
