# Delivery Workflow

Use this workflow for material work in this repository:

`grill-with-docs -> to_spec -> to_ticket -> implement -> review -> archive`

Matt Pocock's skills are the workflow authority: they define how decisions are
resolved, specs are synthesized, tickets are sliced, work is implemented, TDD
is performed, and changes are reviewed. OpenSpec is the institutional artifact
system used to preserve accepted specs and designs, expose executable target
tasks, verify change status, and archive completed changes. When their mechanics
differ, preserve the Matt skill's method and use OpenSpec as the record and
execution target.

Before invoking or recommending an OpenSpec skill, verify that its `SKILL.md`
exists under `.agents/skills/` or `.codex/skills/`. When no installed skill
owns an artifact step, follow `openspec status --change "<name>" --json` and
`openspec instructions "<artifact-id>" --change "<name>" --json` instead of
naming a removed workflow.

## One-shot exception for simple tasks

When a task qualifies for direct handling under global Rule 12, use a
one-shot workflow instead of the Matt Pocock workflow above. A one-shot task may
use Matt's `grill-with-docs` when limited clarification is needed and may use
Matt's `code-review` for code changes. Do not use `to-spec`, `to-tickets`, or
other Matt workflow stages, and do not create OpenSpec artifacts for a one-shot
task. If the task stops qualifying for direct handling, return to the full
workflow.

## 1. Grill with docs — Matt `grill-with-docs`

- Use Matt's `grill-with-docs` skill when requirements, tradeoffs, domain terms,
  or acceptance criteria are not yet settled. It composes the `grilling` and
  `domain-modeling` skills.
- At the start of every `grill-with-docs`, `grilling`, or composed grill
  workflow, create `docs/review/<topic>-grilling-ledger-YYYY-MM-DD.md` before
  asking the first material decision. Reuse the topic's existing ledger when
  resuming the same discussion.
- After each investigation or owner response, update the ledger with the scope,
  verified facts and sources, options and recommendation, the owner's exact
  decision, open questions, and next action. Update it before yielding or
  handing off so the file alone can resume the work after context compaction.
- Resolve one decision at a time. Investigate discoverable facts instead of
  asking the user, recommend an option, and wait for the user's decision.
- Create or update only the durable supporting documents that become necessary
  during the discussion:
  - ADRs for consequential, durable decisions;
  - operational or domain documents for background that must remain readable
    outside the change;
  - diagrams when they materially clarify a relationship or flow.
- The grilling ledger and supporting documents are recovery records, not a
  parallel requirements system. Confirmed product behavior must be captured by
  OpenSpec.
- Do not proceed to implementation until the user confirms shared
  understanding.

## 2. To spec — Matt `to-spec`, stored in OpenSpec

- Use Matt's `to-spec` skill as the primary method: synthesize the resolved
  conversation without reopening the interview, respect the domain glossary and
  ADRs, prefer existing public test seams, and confirm proposed seams with the
  user.
- In this repository, publish that synthesis into an OpenSpec change instead of
  creating a parallel PRD. For staged planning, scaffold with `openspec new
  change "<name>"`, then use OpenSpec status and artifact instructions to write
  only the approved proposal, capability specs, and design. Use
  `openspec-update-change` to revise artifacts that already exist.
- Use `openspec-propose` only when the user explicitly wants all apply-ready
  artifacts generated in one pass and Matt's spec and ticket decisions are
  already settled.
- Treat `openspec/specs/` as the authority for current accepted behavior.
- Treat `openspec/changes/<change>/` as the authority for the target behavior of
  that in-progress change. It does not describe shipped behavior until verified
  and archived.
- ADRs explain why; they do not override requirements or acceptance scenarios.

## 3. To ticket — Matt `to-tickets`, stored as OpenSpec tasks

- Use Matt's `to-tickets` skill as the primary method. Create tracer-bullet
  vertical slices that are independently demoable or verifiable, fit a fresh
  context window, and declare their blocking edges. Present the breakdown and
  obtain user approval before publishing it.
- In this repository, publish the approved tickets into the OpenSpec tasks
  artifact by following the current OpenSpec status and tasks instructions.
  Preserve ticket boundaries, blockers, acceptance criteria, and dependency
  order.
- Do not duplicate OpenSpec tasks in `docs/superpowers/` or another plan file.

## 4. Implement — Matt `implement` and `tdd`

- Use Matt's `implement` skill as the primary implementation workflow.
- Use `openspec-apply-change` to load the approved artifacts and target tasks;
  it is the execution ledger, not the implementation methodology.
- For code behavior, use Matt's `tdd` skill at the user-approved public seams:
  one failing behavior test, the minimum implementation to pass it, then the
  next vertical slice. Do not substitute a generic TDD workflow.
- Select additional skills according to the deliverable, when available:
  - code: Matt `tdd` plus the relevant language or framework skill;
  - documents: `doc-coauthoring` or the relevant document skill;
  - presentations: the presentation skill;
  - spreadsheets: the spreadsheet skill;
  - images or visual artifacts: the relevant image or visualization skill;
  - infrastructure or operations: the relevant platform skill.
- Read the applicable project files and conventions before changing anything.
- If implementation exposes a missing decision or invalid assumption, stop the
  affected work, return to Matt `grill-with-docs`, and update the OpenSpec
  artifacts before continuing.

## 5. Review — Matt `code-review`, then OpenSpec verification

- For code changes, use Matt's `code-review` skill as the primary review with an
  explicit fixed point and the originating OpenSpec change as the spec source.
  Keep its Standards and Spec review axes separate.
- When the `ponytail-review` skill is available, run it once after Matt's
  `code-review` and remove justified redundancy before OpenSpec verification.
- Then inspect `openspec status --change "<name>" --json`, run `openspec
  validate "<name>" --strict`, and compare the proposal, specs, design, and
  tasks against implementation and evidence before archive.
- For non-code deliverables, apply global Rule 15 against the
  originating OpenSpec acceptance scenarios. If no artifact-specific review
  workflow exists, use a context-free reader or reviewer.

## 6. Archive — OpenSpec lifecycle

- Use `openspec-archive-change` only after implementation and review are
  complete and the user accepts any remaining warnings.
- Use `openspec-sync-specs` when accepted delta specs must be merged before
  archive; then use `openspec-archive-change` to finalize the change.
- Update operational docs, ADR links, and acceptance evidence when the completed
  change affects them.

## Document authority

When sources conflict, do not blend them:

1. For current accepted behavior: `openspec/specs/`.
2. For the target of explicitly selected work: that active OpenSpec change.
3. For decision rationale: `docs/adr/`.
4. For operation, training, testing, database reference, review, and acceptance
   evidence: the corresponding `docs/` area.
5. For historical context only: `docs/superpowers/` and archived review files.

During migration, a capability may not yet have a main spec. Do not infer its
accepted behavior from historical plans. Check verified runtime behavior and
the relevant active change, report the missing main-spec boundary, and capture
the capability through the normal OpenSpec verify and archive flow.
