# Proposal

## Why

上游 oh-my-opencode-slim v2.2.22 新增明確的子代理模型覆寫規則。本專案已固定各角色的模型映射，卻未在 Council 與 Orchestrator 的派送入口說明何時可覆寫，可能使協調者自行更換模型或猜測模型 ID。

## What Changes

- 在生成的 Council、Orchestrator 提示與對應受管理 Skills 中，保留角色既有模型／effort；只有使用者明確要求，或 Root 傳達已授權的指定時，才依宿主實際支援的參數覆寫。
- 覆寫前核對宿主提供的可用模型與參數；無法確認時回報限制，不猜測 ID，也不自動替換模型。
- 將 Package Version 更新為 `0.4.5`，manifest 記錄已審閱的上游 `2.2.22` 與 commit `3685293ae6896deca1d85a14a38ba47510a50add`；Presets、角色與映射保持既有契約。
- 記錄上游其餘更新的適用性與實際驗證範圍。

## Capabilities

### New Capabilities

無。

### Modified Capabilities

- `model-generation-presets`: 協調者派送時遵守已設定模型與明確授權的覆寫，並更新已審閱的 upstream provenance。

## Impact

影響 Current Role Contract 的兩個協調者、兩個受管理 Skills、生成 snapshots、套件版本、既有公開生成／安裝驗證與發布草稿。無新增依賴、CLI 參數或 runtime。

上游比對範圍為 [v2.2.21...v2.2.22](https://github.com/alvinunreal/oh-my-opencode-slim/compare/v2.2.21...v2.2.22)：102 commits、117 個變更檔案。OpenCode terminal gate、task board、v2 SDK、project-local skill discovery、TUI、Companion、multiplexer 與 apply-patch hook 無本專案實作接點；既有生命週期核對規則沿用。

本次授權涵蓋移植、驗證、審查及規格同步／封存；不包含 commit、push、發布或全域安裝。保留現有 `AGENTS.md`、`openspec/config.yaml` 與 `docs/agents/` 修改。
