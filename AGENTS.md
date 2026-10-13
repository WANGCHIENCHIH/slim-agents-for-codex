# Project agent instructions

## Scope and decisions

- Treat goals, acceptance criteria and explicit constraints as binding. Evaluate proposed
  techniques and assumptions as candidates; challenge them with evidence and explain
  meaningful departures. Independently choose in-scope, low-risk, reversible designs and tools.
- Clear requests authorize decomposition and follow-through through implementation, affected
  checks, review and necessary docs. Honor read-only, proposal and staged stop points.
  Ask only about unresolved material scope, acceptance, data, security, cost or external-effect
  decisions outside existing authorization; discover facts and recommend an option first.
- Resolve recoverable errors and pause only dependent work. Later messages steer ongoing
  work until explicit pause, cancellation or replacement; retain prior decisions and evidence.
- Preserve unrelated work, UTF-8 encoding, BOM and line endings. Keep private data and
  credentials out of logs, tests, artifacts and commits. Stage only authorized files.
  Commit, push, publication, release and deployment need task authorization; confirm
  destructive actions. Messages to others need explicit authorization.

## Workflow selection

Settled fixes, refactors, test maintenance and agreed presentation changes use implementation,
affected checks and review directly. For material requirement changes or a selected OpenSpec
lifecycle task, read only applicable sections of [Delivery workflow](docs/agents/delivery-workflow.md).
Approved scope covers remaining stages unless the user set a stop. Planning waivers retain
verification, affected operational docs and explicit spec gaps.

Read relevant code, callers, tests and requirements; reuse loaded guidance. For domain terms
or architectural tradeoffs, consult relevant existing GLOSSARY.md, GLOSSARY-MAP.md and ADRs
when present. Keep interfaces simple and hide complexity that would spread across callers.
These repository rules work without a personal global AGENTS.md.

## Adapt upstream skills to the authorized task

Use skills when useful or explicitly invoked; read the selected skill and only needed
references. Apply its method at the task's scope and risk. Recipes add no approval or
full-suite gates and grant no action authorization. Preserve upstream skills; keep local
adaptations here and OpenSpec artifact language/formatting in `openspec/config.yaml`.

- Before invoking/recommending an OpenSpec skill, verify its `SKILL.md` under
  `.agents/skills/` or `.codex/skills/`. When none owns the artifact step, use OpenSpec
  status and artifact instructions as described in the delivery workflow.
- For `openspec-apply-change`, repair authorized missing artifacts and recheck apply state;
  resolve its blocked state before implementation. Verify tasks before marking them complete.
- A separate `ponytail-review` is opt-in; assess complexity in the ordinary review.

## Verification and review

- Bug fixes, core behavior and high-risk logic/data/contracts start with a minimal failing
  behavior test at a stable public seam. Low-risk changes with adequate coverage may be
  changed then checked; copy/prose/styling may use direct checks. Derive expected results
  from specs, known-good examples or independent reasoning rather than copying implementation.
- For bugs, reproduce the actual failure pattern and rerun the original scenario after
  the fix; report reproduction gaps. Protect observable behavior, data, safety and contracts.
- Use current test configuration and required gates. Historical workarounds need a verified
  current reason. Diagnose failures before retrying, retain evidence and rerun affected checks.
  Broaden for shared inputs, unresolved interactions or required gates. Preserve material-risk
  coverage when simplifying tests. Validate configuration natively and scripts in their language.
- Self-review routine work. Material risks, substantial independent scopes or an explicit
  independent-review request need independent review. For code, use `code-review` with a
  stated scoped baseline and separate Standards and Spec axes, including complexity.
  Settled maintenance uses the accepted request/issue and established behavior.
- Open/run non-code artifacts against acceptance criteria; prose needs content, link/anchor,
  UTF-8/BOM/newline and whitespace checks. Verify actual entry/data paths and running versions
  when relevant and available. Report missing runtime, integration or device evidence;
  automated checks, documents and checked tasks establish only the layer they exercise.

## Document authority

1. Accepted behavior: `openspec/specs/`.
2. Selected target behavior and tasks: `openspec/changes/<change>/`.
3. Rationale: `docs/adr/`; it does not override requirements.
4. Operations, testing, review and acceptance evidence: the relevant `docs/` area.

For missing main specs, use verified behavior and an applicable active change; record the
gap and capture/sync specs within authorized scope. Historical plans do not establish
accepted behavior or block settled maintenance. Before archive, compare OpenSpec artifacts
with evidence, run status and strict validation, and obtain acceptance of remaining warnings.
Verify spec synchronization and archive separately from implementation and delivery.

## Maintenance records

Small completed work needs only its result/checks and, if committed, its description.
For unresolved work, durable decisions or handoffs, update an existing OpenSpec task,
originating review or issue; link rather than copy requirements/progress. Multi-round material
design discussions use the ledger in the delivery workflow; a single clarification needs none.
Keep outcome, evidence/version, remaining work and actual delivery/commit status first.
Keep AGENTS focused on judgment and conditional pointers; prefer existing automated checks
for recurring mechanical errors. New permanent tooling or docs need a demonstrated purpose.

## Repository context

This is a TypeScript/Node.js CLI. Use `package.json` and
[Development](README.md#development) for current environment, commands and package checks.
For role contracts, model mappings or generated presets, read
[Adding a model-generation preset](docs/adding-a-preset.md) and
[Preset lifecycle](docs/preset-lifecycle.md); edit canonical sources and regenerate snapshots.
Package validation does not establish live model access or agent behavior.
