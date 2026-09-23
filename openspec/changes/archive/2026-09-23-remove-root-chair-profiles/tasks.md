# Tasks

目前狀態：實作、文件、審查與規格同步完成；待提交、推送與發布 `v0.4.5`。基準 `a5e6fdc`，保留既有 AGENTS.md、openspec/config.yaml、docs/agents/delivery-workflow.md 修改。

## 1. Implementation

- [x] 1.1 移除 generator 的 Root profiles 與三組舊產物，公開 CLI 測試確認七個 agents 仍存在。
- [x] 1.2 更新 convert 清理與唯讀檢查，以測試驗證只移除兩個舊檔名且保留無關檔案。
- [x] 1.3 同步 README、生命週期、架構、goal-loop Skill 與 release notes，核對引用及 UTF-8。

## 2. Verification and delivery

- [x] 2.1 完成測試、typecheck、build、snapshots、封裝安裝與 Standards／Spec 審查，再以 strict validation 驗證並同步規格。

## Verification

- 公開 CLI 的新產物測試先因兩個額外 profiles 失敗，再通過；升級測試先因 `--check` 未拒絕兩個舊檔案失敗，實作後兩案例通過且保留自訂設定。
- `npm test -- --exclude '.tmp/**'`：61 passed／3 files。排除已確認存在的歷史暫存 checkout 測試副本；CI 使用乾淨 checkout 的原始 `npm test`。
- `npm run typecheck`、`build`、`snapshots`、`pack:check`、`pack:smoke` 全部通過；封裝包含 62 個檔案，不含 root chairs，實際安裝及驗證七個 roles、三個 Skills。
- 12 個變更檔案通過 UTF-8／無 BOM／LF 檢查，16 個本機連結與 anchors 有效；scoped `git diff --check` 通過。
- 獨立 `code-review`：Standards PASS、Spec PASS，無剩餘 actionable findings。五份主規格與本 change strict validation 通過，四個 requirement blocks 已同步。
- 使用者回報 `slim-goal-loop` 已成功呼叫兩個代理；本次自動驗證涵蓋 CLI 與封裝，不宣稱重新驗證 live host model entitlement 或 model overrides。先前已報告的五項依賴弱點未納入本次移除範圍，相依版本保持不變。

## Release tracking

本紀錄的提交完成實作與封存後，依使用者授權發布 v0.4.5。遠端 CI、Release workflow、下載封裝 checksum 與安裝驗證尚待完成；發布證據於完成後補入本紀錄。
