## 1. Make formal releases explain user impact

**Blocked by:** None — can start immediately.

- [x] 1.1 Add the approved English v0.4.0 note with What's New, breaking migration commands, reliability changes, installation and upgrade commands, and the v0.3.0-to-v0.4.0 changelog link; confirm it does not claim repository-only expert agents are packaged.
- [x] 1.2 Make the release workflow select the committed note for the resolved tag, fail before package work when it is missing, and pass that exact file to GitHub Release creation without an Installation-only fallback.
- [x] 1.3 Make packed release smoke validation resolve the tagged package's recommended canonical preset from alias data, confirm the CLI mapping, and install and validate that preset with both managed Slim Skills.
- [x] 1.4 Run workflow-native validation when available, the repository test/typecheck/build/snapshot/pack checks, diff checking, and strict OpenSpec validation; record any unavailable check explicitly.

**Ticket 1 evidence:** The retired-ID public CLI smoke failed before writes; the alias-derived packed install/validate smoke passed for `openai-5.6`, seven roles, and two managed Skills. The 50-test suite, typecheck, build, snapshots, pack check, diff check, and strict OpenSpec validation passed. `actionlint` was unavailable locally; GitHub's native workflow parsing and PR CI remain required in Ticket 2.

## 2. Ship the reviewed v0.4.0 release preparation

**Blocked by:** Ticket 1 — Make formal releases explain user impact.

- [x] 2.1 Review the fixed-point implementation against repository standards and this OpenSpec change, then run ponytail review and remove only justified redundancy.
- [x] 2.2 Commit only the approved release-note, workflow, and OpenSpec paths; push a scoped branch and open a PR to `main` without creating a v0.4.0 tag.
- [x] 2.3 Require all PR CI checks to pass, merge the reviewed PR, record the merged `main` commit, and verify that no v0.4.0 tag or GitHub Release exists yet.

**Ticket 2 review evidence:** Fixed-point review against `origin/main` found no baseline smells. Spec review found that manual dispatch could select a branch or SHA; commit `67cbc63` now makes checkout resolve the input through `refs/tags/<tag>`, and re-review found no remaining spec blocker. Ponytail review returned `Lean already. Ship.` PR #5 passed all 12 Ubuntu, macOS, and Windows checks for Node 20 and 22, then squash-merged to `main` as `e0bc85bd1161da8e7f94cca3c583568d518ba68c`. No v0.4.0 tag or GitHub Release existed after merge.

## 3. Publish and verify v0.4.0

**Blocked by:** Ticket 2 — Ship the reviewed v0.4.0 release preparation.

- [x] 3.1 Confirm the merged `main` commit contains package version 0.4.0, the approved note, and the release workflow; confirm tag and Release `v0.4.0` do not already exist.
- [x] 3.2 Create annotated tag `v0.4.0` at the recorded merged commit and push only that tag.
- [x] 3.3 Wait for the tag-triggered release workflow and verify success, the exact approved English Release body, the `.tgz`, the `.sha256`, the tag target, and packed install/validate smoke evidence.
- [x] 3.4 Verify the formal release path did not publish to the npm registry and did not represent `.codex/agents/` as attached-package content.

**Ticket 3 preflight evidence:** `main` commit `e0bc85bd1161da8e7f94cca3c583568d518ba68c` contains package version `0.4.0`, `docs/releases/v0.4.0.md` (SHA-256 `DC1B7179B12DABD5ACABD22C15F63F7E46DAB3E8AD4243BF4A148CBB4E9A65CB`), and the reviewed release workflow. Local and remote tag queries returned no `v0.4.0`, and GitHub reported no matching Release before publication. Annotated tag `v0.4.0` was then created at and pushed for exactly that merge commit.

**Ticket 3 publication evidence:** Tag-triggered workflow run `31932047333` succeeded for `v0.4.0` at `e0bc85bd1161da8e7f94cca3c583568d518ba68c`; its tag resolution, curated-note resolution, tests, typecheck, build, snapshots, package build, packed install/validate smoke, and Release creation steps all succeeded. GitHub Release `v0.4.0` is public and non-prerelease, its body matches `docs/releases/v0.4.0.md`, and it contains only `slim-agents-for-codex-0.4.0.tgz` plus its `.sha256`. The tgz SHA-256 is `6b4f20d64ef32ff775c26bb3b834c3757fcba5407dc5a24b34379f6a9d701865`, matching the checksum asset. The npm registry has no `slim-agents-for-codex@0.4.0`, the release workflow contains no npm-publish step, and the attached tgz contains no `.codex/agents/` path.

## 4. Accept curated release publication as repository behavior

**Blocked by:** Ticket 3 — Publish and verify v0.4.0.

- [x] 4.1 Reconcile every checked task with implementation, CI, tag, Release, asset, and checksum evidence; leave any unproven claim unchecked.
- [x] 4.2 Sync the accepted `curated-release-publication` capability into the main OpenSpec specifications.
- [x] 4.3 Archive the completed change and run strict validation against the resulting OpenSpec state.
