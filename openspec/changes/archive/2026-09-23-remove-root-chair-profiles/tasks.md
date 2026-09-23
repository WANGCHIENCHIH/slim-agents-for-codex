# Tasks

目前狀態：實作、文件、審查、規格同步與封存完成；`v0.4.5` 已從提交 `f4b1b6cd477c8f1e9d5f2e6a484210527e7eba0f` 發布，下載封裝的 checksum 與安裝驗證通過。基準 `a5e6fdc`，保留既有 AGENTS.md、openspec/config.yaml、docs/agents/delivery-workflow.md 修改。

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

- [Release v0.4.5](https://github.com/WANGCHIENCHIH/slim-agents-for-codex/releases/tag/v0.4.5) 已於 2026-09-23 發布；遠端 annotated tag 解參照為 `f4b1b6cd477c8f1e9d5f2e6a484210527e7eba0f`，與受審查提交一致。
- [main CI](https://github.com/WANGCHIENCHIH/slim-agents-for-codex/actions/runs/35805258471)、[tag CI](https://github.com/WANGCHIENCHIH/slim-agents-for-codex/actions/runs/35805367305) 與 [Release workflow](https://github.com/WANGCHIENCHIH/slim-agents-for-codex/actions/runs/35805367455) 均成功；CI 涵蓋 Windows、Ubuntu、macOS 與 Node 20／22。
- Release body 與已提交的 `docs/releases/v0.4.5.md` 相同，assets 為 `.tgz` 與對應 `.sha256`。下載封裝的 SHA-256：`80426027645f6658e6acb382e27e3d90d64fcd5f38a9dd5372d5d61dfcc7d546`，與發布 checksum 相同。
- 對下載的 `slim-agents-for-codex-0.4.5.tgz` 執行 `npm run pack:smoke -- <archive>` 成功：確認所有 presets 無兩個 Root profiles，`openai-6` 七個 agents 與三個 Skills 實際安裝及公開驗證成功。
