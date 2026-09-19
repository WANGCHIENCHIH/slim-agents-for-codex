# Proposal

## Why

使用者希望將已討論的「給定目標，由 Root 協調 Council 與 Orchestrator 持續完成驗收」指令變成可重用 Skill。目前兩個 Skill 各自處理審議與執行，缺少 Root 層的目標核對入口。

## What Changes

- 新增 `slim-goal-loop`，沿用既有角色與工作紀錄，按驗收證據安排下一輪。
- 納入既有套件、安裝、切換、驗證與 rollback 路徑，成為第三個受管 Skill。
- 補上中英文用法與限制；不新增角色、daemon、排程或自動喚醒。

## Capabilities

### New Capabilities

- `root-goal-loop`: 一般 Root 的目標協調、持續驗收及 Skill 交付。

### Modified Capabilities

- `curated-release-publication`: 封裝驗證涵蓋全部三個受管 Skills。

## Impact

變更 Skill 文件與 UI metadata、安裝器受管清單、封裝白名單、既有 CLI 測試與使用文件。沿用 `0.4.4`，不變更 preset 或依賴。使用者已要求繼續至版本推送與發布，交付範圍包含規格同步、封存、限定範圍 commit、push 與 GitHub Release；不修改全域安裝。
