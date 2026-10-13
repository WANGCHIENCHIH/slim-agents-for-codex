# Coding project delivery workflow

For material requirement changes or a selected OpenSpec lifecycle task, follow
only applicable stages below.
Settled fixes and maintenance use the direct path in AGENTS.md. Stage completion
is a checkpoint; continue authorized work unless the user set a stop point.
Repository-relative paths are resolved from the project root.
Scope, approval gates, test requirements,
and document authority are defined in [AGENTS.md](../../AGENTS.md).

Relevant Matt Pocock skills provide the working method; OpenSpec preserves the
accepted specs, target tasks, verification, and archive. User-approved exceptions in
AGENTS.md apply when a skill prescribes broader ceremony. Apply explicit task
waivers under those scope rules before selecting stages; use approved behavior
and actual evidence for review when planning artifacts were waived.

Check tools and skills needed by the selected stage when using them. Copying
these files does not install tools or initialize OpenSpec. If a required prerequisite
is missing, report it and continue independent authorized work; install tooling
only within task authorization.

Before using a named skill, resolve and read its installed `SKILL.md`. For
OpenSpec skills, check `.agents/skills/` or `.codex/skills/`. When no installed
OpenSpec skill owns an artifact step, follow `openspec status --change "<name>"
--json` and `openspec instructions "<artifact-id>" --change "<name>" --json`.

## 1. Grill with docs — Matt `grill-with-docs`

- Use Matt's `grill-with-docs` skill when requirements, tradeoffs, domain terms,
  or acceptance criteria are not yet settled. It composes the `grilling` and
  `domain-modeling` skills.
- For material design discussions requiring multiple rounds, create or reuse
  `docs/review/<topic>-grilling-ledger-YYYY-MM-DD.md` before the first material
  decision. A single clarification does not require a ledger.
- Update the ledger when decisions change, significant evidence appears, or
  before handing off or yielding with unresolved decisions. Record scope,
  sources, options and recommendation, the owner's exact decision, open
  questions, and next action so the file can resume the discussion.
- Investigate discoverable facts first. Resolve dependent material decisions
  one at a time; proceed with independent, already-authorized work.
- Create or update only the durable supporting documents that become necessary
  during the discussion:
  - ADRs for consequential, durable decisions;
  - operational or domain documents for background that must remain readable
    outside the change;
  - diagrams when they materially clarify a relationship or flow.
- The grilling ledger and supporting documents are recovery records, not a
  parallel requirements system. Confirmed product behavior must be captured by
  OpenSpec.
- This stage is complete when product choices and acceptance criteria are
  settled. Unresolved choices block only affected work; preserve prior approvals.

## 2. To spec — Matt `to-spec`, stored in OpenSpec

- Use Matt's `to-spec` skill as the primary method: synthesize the resolved
  conversation without reopening the interview, respect the domain glossary and
  ADRs, and choose existing stable public test seams. Ask about a test seam only
  when it changes acceptance criteria, public contracts, or introduces a costly
  verification requirement.
- In this repository, publish that synthesis into an OpenSpec change instead of
  creating a parallel PRD. For staged planning, scaffold with `openspec new
  change "<name>"`, then use OpenSpec status and artifact instructions to write
  the proposal, capability specs, and design for the agreed scope. Use
  `openspec-update-change` to revise artifacts that already exist.
- Use `openspec-propose` only when the user explicitly wants all apply-ready
  artifacts generated in one pass and product decisions are already settled.
- This stage is complete when concrete specs and acceptance criteria capture
  agreed behavior. Obtain any still-required spec approval, then continue.

## 3. To ticket — Matt `to-tickets`, stored as OpenSpec tasks

- Use Matt's `to-tickets` skill as the primary method. Create tracer-bullet
  vertical slices that are independently demoable or verifiable, fit a fresh
  context window, and declare their blocking edges. Once specs capture agreed
  behavior, create and publish the breakdown unless the user requested a review stop.
- In this repository, publish the implementation tickets into the OpenSpec tasks
  artifact by following the current OpenSpec status and tasks instructions.
  Preserve ticket boundaries, blockers, acceptance criteria, and dependency
  order.
- This stage is complete when every accepted requirement maps to a verifiable
  slice with dependencies. Continue implementation without a separate approval.
- Do not duplicate OpenSpec tasks in a parallel plan file under `docs/` or
  elsewhere.

## 4. Implement — Matt `implement` and `tdd`

- Use Matt's `implement` skill as the primary implementation workflow under
  [the skill adaptations](../../AGENTS.md#adapt-upstream-skills-to-the-authorized-task).
- Use `openspec-apply-change` to load the approved artifacts and target tasks;
  it is the execution ledger, not the implementation methodology.
- Apply Matt's `tdd` skill at the selected public seams, using the applicability
  and verification rules in
  [AGENTS.md](../../AGENTS.md#verification-and-review).
  For each applicable slice, write one failing behavior test and the minimum
  implementation to pass it, then continue the next vertical slice.
- Investigate technical assumptions and recoverable errors directly. If the
  resolution changes a material product decision, pause only affected work,
  resolve that decision, and update affected OpenSpec artifacts before
  continuing it. Status questions and added measurements update the active
  scope; continue other accepted steps unless the user explicitly pauses them.
- Continue authorized slices through required checks. Verify the actual user
  entry point and data path; name unavailable runtime or device evidence.

## 5. Review — Matt `code-review`, then OpenSpec verification

- For code changes, use Matt's `code-review` skill as the primary review. Use a
  user-specified baseline or determine it from the actual task; include scoped
  working-tree changes when reviewing uncommitted work. State the baseline and
  keep the Standards and Spec review axes separate. Select reviewer count under
  [the verification and review rules](../../AGENTS.md#verification-and-review).
- Use the originating OpenSpec change as the requirements source. For settled
  maintenance or a planning-document waiver, use the accepted request or issue
  and established behavior; missing formal artifacts do not block that review.
- Include unnecessary complexity in the default code review. Use a separate
  `ponytail-review` only for an explicit user request, following the review
  adaptations in [AGENTS.md](../../AGENTS.md#adapt-upstream-skills-to-the-authorized-task).
- When reviewing an OpenSpec change before archive, inspect `openspec status
  --change "<name>" --json`, run `openspec validate "<name>" --strict`, and
  compare the proposal, specs, design, and tasks against implementation and
  evidence. A review without an OpenSpec change uses its accepted request or
  issue and the applicable checks above.
- For non-code deliverables, open or run the actual artifact and compare it
  with the accepted request or issue, using OpenSpec acceptance scenarios when
  applicable. Report manual or real-world acceptance boundaries. Choose
  independent review under the same risk criteria in AGENTS.md.
- Review is complete when required scenarios have evidence and actionable
  findings are resolved or explicitly accepted; document remaining boundaries.

## 6. Archive — OpenSpec lifecycle

- Use `openspec-archive-change` only after implementation and review are
  complete and the user accepts any remaining warnings.
- Use `openspec-sync-specs` when accepted delta specs must be merged before
  archive; then use `openspec-archive-change` to finalize the change.
- Update operational docs, ADR links, and acceptance evidence when the completed
  change affects them.
- Archive is complete after spec synchronization and archive are verified and
  affected status summaries are current. Follow the authorized delivery scope.
