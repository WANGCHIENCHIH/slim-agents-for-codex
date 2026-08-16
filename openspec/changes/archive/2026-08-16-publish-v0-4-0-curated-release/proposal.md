## Why

Formal GitHub Releases currently publish an Installation-only body, so users cannot tell what changed, whether an upgrade is breaking, or how to migrate safely. v0.4.0 also cannot be released through the current workflow because its smoke test still invokes the retired `openai-5.6.2` preset.

## What Changes

- Add one committed, English, user-impact-focused release-note file per tag under `docs/releases/`.
- Require the release workflow to select `docs/releases/<tag>.md` and fail before creating a Release when the file is absent.
- Replace the workflow's hard-coded Installation-only body with the selected curated file.
- Make release smoke validation derive the current recommended preset from `presets/aliases.json` instead of hard-coding a revision-suffixed ID.
- Add the approved v0.4.0 notes with What's New, **BREAKING** migration guidance, Fixes & Reliability, Installation / Upgrade, and Full Changelog sections.
- After review and merge, publish tag `v0.4.0` and verify its GitHub Release body, `.tgz`, SHA-256 asset, and successful release workflow.
- Keep npm-registry publication and the repository-only `.codex/agents/` catalog outside this release capability.

## Capabilities

### New Capabilities

- `curated-release-publication`: Defines tag-specific curated release notes, fail-loud publication prerequisites, alias-derived package smoke validation, and verification of the resulting GitHub Release.

### Modified Capabilities

None.

## Impact

- Affects `.github/workflows/release.yml` and adds `docs/releases/v0.4.0.md`.
- Changes the GitHub Actions tag and manual-dispatch release path, but not the package runtime API or npm distribution policy.
- Creates the external `v0.4.0` Git tag and GitHub Release only after the reviewed implementation is merged.
