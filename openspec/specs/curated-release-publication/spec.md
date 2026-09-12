# Curated Release Publication Specification

## Purpose

Defines how formal GitHub Releases use reviewed, tag-specific user guidance and verify the package, checksum, and recommended preset before publication.

## Requirements

### Requirement: Formal releases require curated tag-specific notes

The release workflow SHALL obtain its GitHub Release body from the committed `docs/releases/<tag>.md` file selected by the release tag. It SHALL fail before building or publishing release assets when that file is absent, and SHALL NOT fall back to generated notes or an Installation-only body.

#### Scenario: Curated note exists

- **WHEN** a tag-triggered or manually dispatched release resolves a tag with a committed `docs/releases/<tag>.md`
- **THEN** the workflow uses that file as the GitHub Release body

#### Scenario: Curated note is missing

- **WHEN** the selected tag does not contain `docs/releases/<tag>.md`
- **THEN** the workflow fails before building or publishing release assets and creates no GitHub Release

### Requirement: Release notes explain user impact

Each curated release note SHALL be written in English for users of the attached package. It SHALL describe What's New, Breaking Changes & Migration when applicable, Fixes & Reliability when applicable, Installation / Upgrade, and a Full Changelog link; empty optional sections SHALL be omitted. It SHALL explain required user action and SHALL NOT claim repository-only files are included in the attached package.

#### Scenario: Breaking release is reviewed

- **WHEN** a release retires a previously supported command, identifier, or upgrade path
- **THEN** its note places explicit migration guidance and executable replacement commands after What's New

#### Scenario: Repository-only content changed

- **WHEN** a repository change is absent from the attached package
- **THEN** the package-facing release highlights do not present that content as installed by the package

### Requirement: Release smoke validation follows the recommended preset

The release workflow SHALL resolve the recommended Preset ID from the tagged package's committed alias data and SHALL use that resolved canonical ID for packed installation and validation. The smoke path SHALL NOT hard-code a retired revision-suffixed Preset ID.

#### Scenario: Recommended alias is current

- **WHEN** the release package declares a recommended Preset ID
- **THEN** the packed CLI installs and validates that canonical preset together with both managed Slim Skills

#### Scenario: Recommended generation changes later

- **WHEN** a future tagged package changes the recommended alias
- **THEN** release smoke validation follows the new alias without requiring a revision-suffixed preset literal in the workflow

### Requirement: Pull requests exercise the packed installation path

CI SHALL 在 push 與 pull request 實際打包、安裝至隔離的暫存目錄，並以封裝內的 CLI 驗證 recommended preset 與兩個受管 Skills。CI 與 release SHALL 共用此驗證入口；release MUST 驗證即將發布的同一個封裝檔，任一步驟失敗 MUST 阻止後續發布。

#### Scenario: Pull request changes packaged content
- **WHEN** pull request 執行 CI
- **THEN** CI 使用 `npm run pack:smoke` 驗證實際封裝的安裝結果，而非只檢查 dry-run 檔案清單

#### Scenario: Release archive is supplied
- **WHEN** release 將已建立的 `.tgz` 傳入相同驗證入口
- **THEN** 該入口驗證所提供的封裝檔，不重新打包取代發布產物

### Requirement: Successful formal release publishes verified assets

A successful formal release SHALL be created from a reviewed tag whose version matches the package version. It SHALL contain the curated body, the packed `.tgz`, and the corresponding SHA-256 file. The workflow SHALL refuse to overwrite an existing Release for the same tag and SHALL NOT publish the package to the npm registry.

#### Scenario: v0.4.0 is published

- **WHEN** reviewed `main` is tagged `v0.4.0` and the release workflow succeeds
- **THEN** GitHub Release `v0.4.0` contains the approved English note, `slim-agents-for-codex-0.4.0.tgz`, and its SHA-256 file

#### Scenario: Release already exists

- **WHEN** the workflow is run for a tag that already has a GitHub Release
- **THEN** it fails without overwriting that Release or its assets

#### Scenario: Publication boundary is inspected

- **WHEN** the v0.4.0 release outputs are reviewed
- **THEN** no npm-registry publication occurred and `.codex/agents/` is not claimed as attached-package content
