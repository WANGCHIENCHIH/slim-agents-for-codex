# Proposal

## Why

使用者已確認 `slim-goal-loop` 能成功呼叫 Council 與 Orchestrator，並要求移除不再需要的兩個 Root chair profiles、同步必要文件後發布新版本。

## What Changes

- **BREAKING**：所有支援 presets 停止產生及封裝 `council.config.toml`、`orchestrator.config.toml`。
- 保留七個代理及三個 Skills，以一般 Root 執行 `slim-goal-loop`。
- 重新產生時清除所選輸出目錄的兩個舊 profile；唯讀檢查拒絕殘留檔案。
- 更新現行文件與規格，以既有流程發布尚未發布的 `v0.4.5`。

## Capabilities

### New Capabilities

無。

### Modified Capabilities

- `model-generation-presets`：移除 Root profile 產物，保留代理映射及可重現性。
- `root-goal-loop`：一般 Root 為協調入口，保留宿主權限與可用性檢查。

## Impact

影響 generator、convert CLI、三個 presets、公開 CLI 測試、封裝驗證與現行文件。既有安裝器未安裝 Root profiles，無須修改使用者主設定；手動複製的舊 profiles 由升級文件指引移除。無相依套件更新。
