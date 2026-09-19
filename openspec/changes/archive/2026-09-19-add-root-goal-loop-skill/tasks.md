# Tasks

目前結果：Skill、安裝路徑與中英文使用說明已完成並驗證；delta 已同步至 main specs，Standards／Spec 審查通過並已封存。下一步為已授權的限定範圍 commit、push、跨平台 CI 與 `v0.4.4` GitHub Release；不修改全域安裝。

## 1. 可安裝的 Root 目標入口

無前置依賴；交付完整 Skill 至公開 CLI 安裝路徑。

- [x] 1.1 建立 Skill 與 UI metadata，擴充既有清單及封裝；以 CLI 安裝測試的 red/green 與 Skill validator 驗證。
- [x] 1.2 驗證兩個 Skills 升級至三個、封存與無關內容保留，執行 installer 回歸。

## 2. 文件與交付驗證

依賴第 1 組；交付可直接使用的說明及真實封裝證據。

- [x] 2.1 更新中英文 README、架構與待發布 release note，獨立推演部分完成、受限 profile、阻礙情境並修正問題。
- [x] 2.2 完成 typecheck、tests、build、snapshots、pack check/smoke、strict OpenSpec 與 Standards/Spec review，記錄範圍及未驗證界線。

## Verification

- `0.4.4` checkout，Node `24.20.0`、npm `12.0.2`；新增 CLI 期望先因仍為兩個 Skills 而失敗，再完成修正。installer 21 tests 與全套 56 tests 通過；新增的升級失敗移除 goal-loop 斷言另以原 rollback 測試通過。
- `typecheck`、`build`、`snapshots`、`pack:check`、`pack:smoke` 通過。實際封裝經 junction 路徑執行 CLI，安裝並驗證七個角色、三個 Skills；僅操作隔離暫存目錄。
- Skill 官方 `quick_validate.py` 通過；PyYAML 解析 UI metadata 並核對 description 長度與 prompt 入口。獨立 reader 推演五種情境：部分完成、受限 profile、三次失敗、部署授權界線、壓縮後恢復，無待修正發現。
- Standards：以本次開始時的工作樹快照為基線，僅新增 Skill、清單及必要測試／文件，未新增 runtime 或依賴。Spec：逐項核對新 capability 的角色邊界、持續驗收與封裝情境，無缺漏。UTF-8/LF、scoped diff check 與先前修改保留檢查通過；全部五個 OpenSpec 項目 strict 驗證通過。
- 限制：情境推演與封裝驗證不代表已實測長時間 Council／Orchestrator 協作、模型權限、宿主中止或壓縮恢復；自動喚醒不在此 Skill 的能力範圍。

## Release preparation

- 2026-09-19：遠端 `main` 與本機基底同為 `453857f`，最後正式發布為 `v0.4.0`，`v0.4.4` 尚未存在。Release note 已涵蓋累積修正並使用有效的 `v0.4.0...v0.4.4` 比較範圍。
- 最新候選重新通過 56 tests、typecheck、build、snapshots；實際 `0.4.4.tgz` 以 linked CLI 通過 pack smoke，驗證七個角色及三個 Skills。候選 SHA-256：`4659e0a43536e7fc284307e87d2a733c264259e4339eba51c6b4ab26c188aa6f`；正式發布封裝由 tag workflow 另外建置及驗證。
- 發布提交只涵蓋本次上游適配、goal-loop 與文件；保留使用者既有 `AGENTS.md`、`openspec/config.yaml` 及 `docs/agents/delivery-workflow.md` 修改。
