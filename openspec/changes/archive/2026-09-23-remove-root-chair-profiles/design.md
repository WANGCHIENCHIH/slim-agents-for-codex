# Design

## Context

動機見 proposal.md。Root profiles 只由 generator 與 convert 使用；安裝器仍以七個 child agents 與三個 Skills 為契約。

## Goals / Non-Goals

以刪除既有產生邏輯完成移除。保持代理角色、模型、effort 與權限不變，不掃描或改寫任意使用者 Codex 設定。

## Decisions

- 停止回傳及寫出 Root profiles，不保留空白相容物件，避免維護無用入口。
- `convert` 僅刪除所選 preset 輸出根目錄中兩個明確檔名；不遞迴刪除，不影響自訂 TOML。`--check` 檢查殘留但不修改檔案。
- 以既有 `runCli` seam 驗證產物與升級，再用實際封裝、下載的發布封裝驗證安裝。
- 發布現有未發布版本 `0.4.5`；使用者已授權 commit、push 與 release。

## Risks / Trade-offs

- 手動複製到其他位置的 Root profiles 不會自動消失 → 升級文件說明移除舊 chair 設定、保留 agents 與一般主設定。
- 舊流程使用者失去 Root chair 入口 → 一般 Root 加 `slim-goal-loop` 為替代入口；歷史 tag 保留舊產物。

## Migration Plan

完成測試、封裝與審查後同步規格、封存、推送並發布 `v0.4.5`。核對遠端 tag、Release assets、checksum，安裝下載的 `.tgz`。回復需求可使用舊 release，不覆寫既有 tag。
