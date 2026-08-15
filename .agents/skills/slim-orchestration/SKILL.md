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

## 1. Open the execution ledger

- Confirm the objective, non-goals, constraints, Root approval boundary, and observable completion criteria.
- Inspect `.gitignore` and keep `.slim/deepwork/` local. Add the ignore entry when needed.
- Create `.slim/deepwork/<task-slug>.md` before substantial delegation.
- Record the objective, evidence, open questions, phases, dependencies, lane owners, write ownership, phase gates, failures, recovery decisions, final verification, and unresolved risk.

This stage is complete when the ledger exists, the assigned boundary is explicit, and progress can be resumed from the file without reconstructing prior work. Keep it current and continue reporting meaningful checkpoints to Root.

## 2. Map the critical path

- Ask `explorer` to map the affected surface when ownership or call paths are unclear.
- Ask `librarian` to verify current external contracts when versions, providers, APIs, or standards can change the implementation.
- Convert the evidence into dependency-ordered phases. Give each phase inputs, one accountable owner, outputs, and a measurable phase gate.
- Ask `oracle` to review the plan before irreversible, security-sensitive, architectural, or cross-cutting implementation.
- Obtain a `designer` handoff for material visual or interaction work. Capture intended behavior, states, and acceptance evidence before implementation.
- Assign implementation to `fixer`, or to `designer` for an explicitly visual or interaction-owned deliverable.

This stage is complete when every phase has enough evidence to execute, dependencies are ordered, ownership is non-overlapping, and each gate can distinguish pass from fail. Return material unresolved direction choices to Root.

## 3. Dispatch single-writer lanes

- Run independent lanes in parallel only when neither depends on the other's output.
- Use the smallest specialist set that covers the current phase.
- Default to `fork_turns="none"`. Send a self-contained assignment with objective, non-goals, evidence, owned files or responsibility, expected output, and required checks. A full-history fork inherits the current agent type, model, and effort and cannot select a different specialist type.
- Tell writers that they share the worktree, must preserve unrelated changes, and must accommodate concurrent edits.
- Keep a single writer for every overlapping file surface.
- Track each spawned agent by its task name or agent identity and actual status. Wait for every required lane before integration.
- Diagnose failed, timed-out, or unusable lanes before retrying; change the prompt, scope, or specialist to address that cause.
- Keep the depth boundary explicit: Root is depth 0, Orchestrator is depth 1, and specialists are depth 2 and must not delegate further.

This stage is complete when every required lane is terminal, its output is available for inspection, and no required owner or dependency remains unresolved.

## 4. Pass the phase gate

- Inspect the actual diff or artifact and reconcile shared-worktree changes.
- Run the focused checks that encode the phase's intent.
- Ask `oracle` for a second review when the phase changes architecture, security boundaries, data contracts, or rollout risk.
- Each Oracle gate allows at most two re-reviews. Use one only when remediation materially changes the reviewed risk or focused evidence cannot resolve the finding; do not reopen accepted, unchanged findings.
- Label every Oracle prompt with the review attempt and re-review remaining count. When the budget is exhausted, record the remaining risk and return the decision to Root.
- Record evidence, failures, recovery decisions, and remaining risk in the ledger.
- Advance the critical path only after the phase gate passes or Root explicitly accepts the documented exception.

The phase is complete when its observable gate passes, or the ledger contains Root's explicit exception and its residual risk. Repeat stages 2-4 until every phase is gated.

## 5. Close the subtree

Return a concise integration report containing:

- what was implemented and by which specialist lanes;
- the evidence and checks that passed;
- every skipped or failed check with the reason;
- unresolved risks, disagreements, or decisions still requiring Root;
- whether the assigned subtree satisfies its observable completion criteria.

The subtree is complete when the ledger and report account for every phase, lane, check, exception, and unresolved risk.

Keep the overall decision with Root: do not approve scope expansion, deploy, publish, make an external decision, or declare the user's whole task complete.
