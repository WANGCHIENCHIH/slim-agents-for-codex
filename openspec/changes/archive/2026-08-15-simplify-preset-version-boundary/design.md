## Context

See `proposal.md` for motivation and the `model-generation-presets` spec for observable behavior.

The current preset registry binds a public ID to a versioned role source, model/effort mappings, renderer exceptions, and a committed snapshot directory. The latest Current Role Contract is assembled by inheriting through multiple historical role-source revisions. The package already has an immutable version and Git tag, so retaining every historical contract and snapshot inside the latest package duplicates the release boundary.

The existing installer also relies on the historical role-source union to recognize Observer as a managed role during an eight-role-to-seven-role switch. Removing historical sources must preserve that cleanup knowledge without preserving the historical role implementation.

## Goals / Non-Goals

**Goals:**

- Make the public preset catalog describe model generations only.
- Keep exact generated artifacts deterministic within each Package Version.
- Make one Current Role Contract own all current descriptions, instructions, sandbox choices, role order, and role-specific policy.
- Fail retired suffix IDs through the common preset-resolution boundary before any mutation.
- Preserve safe cleanup of retired managed roles during an existing installation switch.
- Accept the change through the agreed public CLI seam.

**Non-Goals:**

- Transactional installation or automatic rollback.
- Refactoring the snapshot artifact inventory.
- Retaining historical configurations in the latest package.
- Changing model entitlement, adding model fallback, or enforcing MCP isolation outside the generated role guidance.
- Creating implementation tasks in this specification stage.

## Decisions

### Package Version is the immutable configuration boundary

The exact configuration identity is `(Package Version, Preset ID)`. A Preset ID remains stable for its OpenAI model generation while same-generation role or mapping maintenance increments only the Package Version.

Generated manifests will identify the Package Version alongside the Preset ID so a detached snapshot still carries the complete identity needed for reproduction. Existing source and upstream provenance may remain as audit metadata, but it will not select a historical implementation.

Alternative considered: continue adding suffix Preset IDs. Rejected because it duplicates package history and is the source of the catalog growth being removed.

### The registry contains only supported model generations

The current registry will contain `openai-5.5` and `openai-5.6`; both aliases resolve to `openai-5.6`. Model and effort mappings remain properties of those generation entries.

A small retired-ID mapping will recognize `openai-5.5.1` and `openai-5.6.1` through `openai-5.6.4` only to produce actionable migration errors. Retired IDs will not resolve as aliases and will not select generated content.

Alternative considered: keep suffix IDs as deprecated aliases. Rejected because a historical-looking ID would silently produce the current configuration.

### One Current Role Contract feeds both presets

The current seven roles will be flattened into one source of complete role behavior. The renderer will serialize that contract with the selected generation's model/effort mapping; it will not branch on a suffix Preset ID or inherit behavior through historical role-source revisions.

Role-specific MCP guidance and optional Skill routing will be composed into the Current Role Contract before generic rendering. The current source will retain concise upstream review provenance, while Git history and old packages retain the previous implementations.

Alternative considered: keep the historical role-source inheritance chain as internal reuse. Rejected because the latest package does not expose historical contracts and the inheritance makes current behavior depend on obsolete implementation layers.

### Retired managed-role cleanup is data, not a historical contract

Observer will remain recognized as a retired managed role for archive/removal during `switch-preset`, but it will not appear in the Current Role Contract, generated config, or supported snapshot. This preserves the existing safe migration without retaining an eight-role source.

Alternative considered: derive managed-role history from retained role sources. Rejected because it would reintroduce the historical implementation dependency solely to preserve one cleanup name.

### Generated artifacts remain exact within a package

The committed snapshot set will be regenerated with only `openai-5.5`, `openai-5.6`, and the alias artifact. Snapshot byte comparison, semantic validation, type checking, build verification, and package dry-run remain release gates.

The artifact path/content inventory is intentionally unchanged in this change. It will be reviewed after the preset catalog is reduced, as agreed during grilling.

### Public CLI behavior is the primary test seam

Acceptance tests will enter through the public CLI runner:

- listing proves the two supported IDs and alias targets;
- conversion into a fresh temporary output proves the two seven-role snapshots and shared Current Role Contract;
- retired-ID conversion and installation prove actionable errors before writes;
- the existing committed snapshot comparison proves deterministic package artifacts.

Lower-level tests may remain where they protect parsing or rendering details already covered by the repository, but new acceptance behavior will not depend on the removed historical role-source modules.

## Risks / Trade-offs

- **[Breaking CLI inputs]** Existing scripts naming suffix IDs will fail. → Fail before mutation with the replacement ID and historical package/tag guidance; document the migration prominently.
- **[Unsuffixed IDs change across package versions]** A user could assume `openai-5.6` alone identifies exact bytes. → Record Package Version in generated identity and document that exact reproduction requires both values.
- **[Old Observer remains active after upgrade]** Deleting historical sources could remove the installer knowledge needed to clean it up. → Preserve an explicit retired managed-role name and retain the switch/archive acceptance scenario.
- **[Flattening changes prompt bytes accidentally]** Merging inherited role sources can introduce content drift. → Compare the new Current Role Contract against the approved current seven-role output before regenerating snapshots, then verify through the public conversion seam and byte-exact snapshots.
- **[Scope expands into unrelated review findings]** Snapshot inventory or rollback work could obscure the version-boundary result. → Keep both out of this change and follow the approved sequence.

## Migration Plan

1. Add public CLI acceptance coverage for the new catalog, aliases, retired-ID errors, shared Current Role Contract, and no-mutation behavior.
2. Flatten the approved current seven-role behavior and policy into the Current Role Contract while preserving current generated behavior.
3. Replace the composite preset registry with the two model-generation entries, common retired-ID errors, and explicit retired managed-role cleanup data.
4. Regenerate only the two supported snapshots and aliases; remove suffix snapshot directories and historical role-source implementations from the latest source/package.
5. Update English and Traditional Chinese user, architecture, lifecycle, and preset-maintenance documentation.
6. Run public CLI tests, the full test suite, type checking, build, committed snapshot comparison, strict OpenSpec validation, and package dry-run.

Rollback is release-based: restore the previous package version or Git tag. No published historical tag or release asset is rewritten.
