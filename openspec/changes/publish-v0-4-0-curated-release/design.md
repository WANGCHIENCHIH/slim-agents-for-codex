## Context

See `proposal.md` for motivation. The existing tag workflow already checks package-version alignment, runs the package verification suite, builds a `.tgz` and SHA-256 file, smoke-tests installation, refuses overwrite, and creates a GitHub Release. Its release body and smoke preset are currently hard-coded, and the smoke preset is retired in v0.4.0.

The release note must be reviewed before its tag exists, while the workflow must use the exact file contained in the tagged commit. GitHub Release publication is an external, irreversible-enough boundary: code and prose must merge before the tag is created.

## Goals / Non-Goals

**Goals:**

- Make curated release prose a versioned input reviewed with the code it describes.
- Fail before package work when a selected tag lacks its release note.
- Keep packed smoke validation aligned with the tagged package's recommended alias.
- Publish and verify the approved v0.4.0 GitHub Release after merge.

**Non-Goals:**

- Generate prose from commits or pull requests.
- Publish to the npm registry.
- Package or advertise the repository-only `.codex/agents/` catalog.
- Edit or replace an already existing release and its assets.

## Decisions

### Select one committed note by exact tag

After checking out the resolved tag, the workflow constructs `docs/releases/<tag>.md`, verifies that it is a regular file, and passes it directly to `gh release create --notes-file`. This keeps the tag, reviewed prose, and published body on one boundary.

Alternatives rejected:

- GitHub-generated notes make user guidance depend on commit and PR titles.
- A fallback body permits the same Installation-only release defect to recur.
- A workflow-dispatch path input can select prose unrelated to the tagged source.

### Derive smoke identity from alias data

The workflow reads `recommended` from the tagged `presets/aliases.json` using the Node runtime it already installs. It confirms the CLI lists that mapping, then installs and validates the resolved canonical preset.

Alternatives rejected:

- Hard-coding `openai-5.6` fixes v0.4.0 but recreates the same maintenance trap for the next model generation.
- Passing the `recommended` alias directly would exercise alias resolution but would not prove which canonical identity the release validated.

### Keep publication after reviewed merge

The release-note file and workflow change land through a PR. Only the reviewed merged commit is tagged `v0.4.0`. The tag workflow remains the sole package and Release creator; no local package is uploaded manually.

## Risks / Trade-offs

- **[A note filename can disagree with its content]** → Review the exact v0.4.0 file in the PR and verify the published body after workflow completion.
- **[A failed tag workflow leaves a tag without a Release]** → Fix the reviewed workflow or note, then rerun the existing tag through `workflow_dispatch`; the no-overwrite guard remains safe because no Release exists.
- **[A release can succeed but contain an unexpected package surface]** → Preserve `npm pack` inspection, packed install/validate smoke checks, and post-publication asset verification.
- **[Curated prose requires one maintained file per release]** → Accept this deliberate maintenance cost to make user communication reviewable and fail loud.

## Migration Plan

1. Merge the approved note, workflow selection, and alias-derived smoke change through a PR.
2. Confirm `main` CI and the exact merged commit.
3. Create annotated tag `v0.4.0` at that merged commit and push only that tag.
4. Wait for the tag-triggered release workflow.
5. Verify workflow success, published body, `.tgz`, SHA-256 asset, and absence of npm publication claims.
6. If the workflow fails before Release creation, correct through a new reviewed commit and rerun the existing tag via manual dispatch only when the tag still identifies the intended package source; otherwise stop and resolve the tag boundary explicitly.
