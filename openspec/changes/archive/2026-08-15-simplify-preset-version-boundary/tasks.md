## 1. Ticket 01 — Consolidate the Current Role Contract

**Blocked by:** None — can start immediately.

**Deliverable:** The approved seven-role behavior and policy come from one Current Role Contract, generic rendering no longer recognizes a suffix Preset ID, and the existing latest generated behavior remains unchanged.

- [x] 1.1 Add or tighten the public generation regression that captures the approved current seven-role names, order, descriptions, instructions, sandbox choices, and role-specific policy before refactoring.
- [x] 1.2 Flatten the inherited role-source layers into one Current Role Contract while retaining concise upstream review provenance.
- [x] 1.3 Move all role-specific MCP guidance and optional Skill routing into the Current Role Contract and remove suffix-ID policy selection from generic rendering.
- [x] 1.4 Preserve explicit recognition of Observer as a retired managed role for safe archive/removal without retaining its historical role implementation.
- [x] 1.5 Verify that the pre-cutover latest preset remains semantically and byte identical, and that focused tests, type checking, and build checks pass.

## 2. Ticket 02 — Switch to Stable Model-Generation Presets

**Blocked by:** Ticket 01 — Consolidate the Current Role Contract.

**Deliverable:** The public CLI exposes only stable `openai-5.5` and `openai-5.6` model-generation presets, rejects retired suffix IDs before writes, produces package-identified deterministic snapshots, and safely migrates existing managed installations.

- [x] 2.1 Add failing public CLI acceptance coverage for the two supported IDs, alias resolution, the shared Current Role Contract, retired-ID guidance, and no mutation on retired installation input.
- [x] 2.2 Replace the composite preset catalog with the two unsuffixed model-generation mappings and resolve `latest` and `recommended` to `openai-5.6`.
- [x] 2.3 Add common retired-ID resolution errors for `openai-5.5.1` and `openai-5.6.1` through `openai-5.6.4`, including the replacement ID and historical package/tag guidance.
- [x] 2.4 Make generated manifests identify the Package Version and Preset ID while retaining only current audit provenance that does not select behavior.
- [x] 2.5 Regenerate the two supported seven-role snapshots and aliases, then remove suffix snapshots and historical role-source implementations from the latest source/package.
- [x] 2.6 Prove that switching an existing eight-role managed installation archives and removes Observer while preserving unrelated custom roles and Skills.
- [x] 2.7 Run the focused public CLI tests, full test suite, type checking, build, and committed snapshot comparison with all checks passing.

## 3. Ticket 03 — Complete Documentation and Release Verification

**Blocked by:** Ticket 02 — Switch to Stable Model-Generation Presets.

**Deliverable:** User, maintainer, architecture, and release materials consistently describe Package Version as the immutable history boundary and the release package contains only the two supported snapshots.

- [x] 3.1 Update English and Traditional Chinese user documentation to show the two supported Preset IDs, new alias targets, retired-ID migration, and package/tag historical reproduction.
- [x] 3.2 Update architecture, lifecycle, and preset-maintenance documentation to define Preset ID, Package Version, and Current Role Contract consistently with the domain glossary.
- [x] 3.3 Update release checks and examples that still expect a suffix preset or stale alias target, without changing installer transactionality or snapshot inventory structure.
- [x] 3.4 Verify the package dry-run contains only supported snapshots and current documentation, with no historical role-source or suffix snapshot artifacts.
- [x] 3.5 Run the full tests, type checking, build, snapshot comparison, package dry-run, and strict OpenSpec validation; record exact results and any skipped checks.
