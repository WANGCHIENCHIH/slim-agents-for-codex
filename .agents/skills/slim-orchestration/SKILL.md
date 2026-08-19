---
name: slim-orchestration
description: Run a gated critical path for large, high-risk, multi-phase Codex execution through the five built-in Slim specialists. Use for cross-cutting changes, unsafe-to-partially-ship migrations, or sustained coordination that needs persistent state, dependency ordering, specialist handoffs, and phase verification. Route routine multi-file changes, simple fixes, and quick documentation work directly.
---

# Slim Orchestration

Act as the scheduler for one Root-approved execution subtree. Drive its critical path through explicit owners and phase gates; return smaller work to Root.

## Fixed team

Route work only to these five built-in Slim specialists:

- `explorer`: inspect the repository, trace symbols and dependencies, and gather local evidence.
- `librarian`: verify external documentation, APIs, compatibility, and source-backed facts.
- `oracle`: review architecture, plans, risk, correctness, and integration decisions.
- `designer`: define or implement visual and interaction work when design judgment is material.
- `fixer`: implement scoped changes and run proportionate verification.

Use the narrowest matching specialist. Keep deliberation with Council and execution here; custom roles and meta-coordinators remain outside this subtree.

## 1. Frame the critical path

- Confirm the objective, non-goals, constraints, Root approval boundary, and observable completion criteria.
- Keep `.slim/deepwork/` ignored, and create `.slim/deepwork/<task-slug>.md` before substantial delegation.
- Record evidence, open questions, dependency-ordered phases, owners, write ownership, phase gates, failures, recovery decisions, and unresolved risk.
- Use `explorer` when ownership or call paths are unclear and `librarian` when current external contracts can change the implementation.
- Give each phase one accountable owner, outputs, and a measurable gate. Route material unresolved direction choices to Root.
- Request an `oracle` plan review before irreversible, security-sensitive, architectural, or cross-cutting work.
- Obtain a `designer` handoff with intended behavior, states, and acceptance evidence before material visual or interaction work.
- Before dispatch, give Root the phase order, specialist ownership, and each planned Oracle review with its reason.

This stage is complete when the ledger can resume the work, dependencies and ownership are explicit, and every gate distinguishes pass from fail.

## 2. Dispatch single-writer lanes

- Run only independent lanes in parallel and use the smallest specialist set that covers the phase.
- Default to `fork_turns="none"`. Send the objective, non-goals, evidence, owned files or responsibility, expected output, and required checks. A full-history fork cannot select another specialist type.
- Tell writers they share the worktree, must preserve unrelated changes, and must accommodate concurrent edits. Keep a single writer for every overlapping file surface.
- Track actual status and wait for every required lane before integration. Diagnose failed, timed-out, or unusable lanes before changing the prompt, scope, or specialist.
- Keep the depth boundary explicit: Root is depth 0, Orchestrator depth 1, and specialists depth 2 with no further delegation.

### Specialist lifecycle controls

- Use list_agents for read-only status inspection and wait_agent to wait for agent updates without repeated polling. Keep non-terminal or uncertain lanes unresolved and never dispatch a duplicate merely to check progress.
- Use send_message only for concise additive guidance to a running specialist. It does not trigger a new model turn. A sent message proves delivery acceptance only, not that the specialist read, acknowledged, or acted on it.
- Use interrupt_agent only when the user asks, or when the lane is obsolete, wrong, or conflicts with a safer replacement. Interruption is not rollback: inspect and reconcile partial artifacts and shared-worktree changes before resuming or replacing the lane.
- Use followup_task when an existing idle or interrupted specialist should continue with retained context. Create a replacement only when the retained specialist is unsuitable or unavailable. Treat dispatch as a new turn to reconcile, not as completion.
- Required review and validation remain required after interruption. Resume them with the retained specialist or assign a clearly scoped replacement before closing the subtree.
This stage is complete when every required lane is terminal and no owner or dependency remains unresolved.

## 3. Pass each phase gate

- Inspect the actual diff or artifact, reconcile shared-worktree changes, and run focused checks that encode the phase intent.
- Before each Oracle review, record confirmed research and relevant file references so Oracle uses accepted context instead of repeating discovery.
- Request an Oracle review when the phase changes architecture, security boundaries, data contracts, or rollout risk.
- Batch material actionable findings into one bounded remediation pass and run focused checks. Allow at most two re-reviews; use one only when remediation changes the reviewed risk or focused evidence cannot resolve the finding.
- Label every Oracle prompt with the review attempt and re-review remaining count. Return exhausted gates and residual risk to Root.
- Record results and advance only after the phase gate passes or Root accepts the documented exception.

The phase is complete when its gate passes or the ledger records Root's exception and residual risk. Repeat until every phase is gated.

## 4. Close the subtree

Return the implemented lanes, passed evidence, skipped or failed checks with reasons, unresolved risks or decisions, and whether the subtree meets its completion criteria.

The subtree is complete when the ledger and report account for every phase, lane, check, exception, and unresolved risk. Root retains scope, deployment, publication, external decisions, and overall completion.
