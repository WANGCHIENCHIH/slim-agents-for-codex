## MODIFIED Requirements

### Requirement: Release smoke validation follows the recommended preset

The release workflow SHALL resolve the recommended Preset ID from the tagged package's committed alias data and SHALL use that resolved canonical ID for packed installation and validation. The smoke path SHALL NOT hard-code a retired revision-suffixed Preset ID.

#### Scenario: Recommended alias is current

- **WHEN** the release package declares a recommended Preset ID
- **THEN** the packed CLI installs and validates that canonical preset together with all three managed Slim Skills: `slim-council`, `slim-goal-loop`, and `slim-orchestration`

#### Scenario: Recommended generation changes later

- **WHEN** a future tagged package changes the recommended alias
- **THEN** release smoke validation follows the new alias without requiring a revision-suffixed preset literal in the workflow

### Requirement: Pull requests exercise the packed installation path

CI SHALL 在 push 與 pull request 實際打包、安裝至隔離的暫存目錄，並以封裝內的 CLI 驗證 recommended preset 與全部三個受管 Skills。CI 與 release SHALL 共用此驗證入口；release MUST 驗證即將發布的同一個封裝檔，任一步驟失敗 MUST 阻止後續發布。

#### Scenario: Pull request changes packaged content
- **WHEN** pull request 執行 CI
- **THEN** CI 使用 `npm run pack:smoke` 驗證實際封裝的安裝結果，而非只檢查 dry-run 檔案清單

#### Scenario: Release archive is supplied
- **WHEN** release 將已建立的 `.tgz` 傳入相同驗證入口
- **THEN** 該入口驗證所提供的封裝檔，不重新打包取代發布產物
