# Tasks

## Current status

模型覆寫規則與 `0.4.5` 產物已完成，Standards／Spec 獨立審查及完整套件驗證通過，所有審查發現已修正。main spec 已同步，strict 驗證通過；change 已封存為 `2026-09-20-port-omos-2-2-22`，4/4 tasks 完成，無剩餘本次移植工作。使用者已於 2026-09-23 確認隨 [GPT-6 交付](../2026-09-23-add-gpt6-default-preset/tasks.md) 一併提交並推送至 `origin/main`；交付版本以該紀錄所在 commit 識別，尚未發布 Release。下列兩個 Presets 與 57 tests 是當時的驗證快照；後續 GPT-6 變更擴充為三個 Presets，主規格已相應更新。

## 1. Implementation

- [x] 1.1 以公開 CLI 生成提示及封裝 Skill 為接點，先取得一個模型覆寫契約的預期失敗，再更新兩個協調者與對應 Skills；測試須通過且涵蓋兩個 Presets。
- [x] 1.2 更新 Package Version `0.4.5` 與固定 upstream provenance，重建 snapshots，撰寫尚未發布的 release 文件；既有映射測試與 snapshots 檢查須通過。

## 2. Acceptance

- [x] 2.1 完成 Standards／Spec 獨立審查，處理必要修正；執行 npm test、typecheck、build、snapshots、pack:check、pack:smoke，並檢查 UTF-8/BOM/newline、whitespace、文件連結及原有修改保留。
- [x] 2.2 逐項比對產物與規格，記錄實際驗證版本及限制；strict OpenSpec 驗證後同步 main spec、確認 delta 一致並通過封存前檢查。

## Evidence and decisions

- 基準：`79cb9a588f422185abccd7bb6fd7ace4844cdefc`；本次 review 使用此基準對照限縮的 working-tree diff。
- 上游：`v2.2.21` → `v2.2.22`，102 commits／117 files；annotated tag `ec13bc7cbf853c55828847999a4b717879a050c4` 指向 `3685293ae6896deca1d85a14a38ba47510a50add`。
- Council：`/root/portability_council`；Explorer 與 Oracle 兩個獨立視角完成，認定只移植模型覆寫規則；Root 採納兩協調者與兩 Skills 同步方案。其餘候選為既有涵蓋或 OpenCode 專屬，並非未完成需求。
- 原始測試：Windows、Node `v24.20.0`、npm `12.0.2`，`npm test` 通過 56 tests／3 files。
- TDD RED：`npm.cmd test -- --run tests/core.test.ts -t "carries authorized child model override rules through both presets and managed Skills"` 因生成的 Orchestrator 尚無 `initial child dispatch` 規則而失敗；Fixer 回報 `AssertionError: expected 'name = "orchestrator"...' to match /initial child dispatch.../is`。GREEN：模型覆寫、provenance 與 snapshots 三項重點測試全部通過。
- Root 整合檢查：最後一次 `npm test` 57/57（2026-09-20 13:35 Asia/Taipei）、`npm run typecheck`、`npm run build` 與 `npm run snapshots` 通過；原有 3 份使用者修改的 SHA-256 相同。
- Root 審查發現兩份受管理 Skill 被改為 CRLF，以及未發布的 release 文件含尚不存在的 tag 連結與僅重建 snapshots 的安裝說明；原 Fixer 已還原 Skill 為 UTF-8/no-BOM/LF 並修正說明，Root 補上已驗證的 upstream comparison 連結。
- Oracle 首次審查指出模型授權與延後要求的測試斷言不足；原 Fixer 加強同一測試，Oracle 再審確認 Standards PASS、Spec PASS，無剩餘發現。
- `npm run pack:check` 通過：`0.4.5`、57 entries、三個受管理 Skills。`npm run pack:smoke` 實際打包、隔離安裝並經 linked CLI 驗證 7 roles／3 Skills 通過。先前 npm 預設 cache 發生 EPERM、registry 連線被 sandbox 阻擋；改用專案 `.npm-cache` 及限定用途的提權後完成，未修改產品腳本。
- UTF-8/no-BOM/LF、replacement character、檔尾換行、local Markdown links、README source-checkout anchor 與 scoped `git diff --check` 通過。一次性文字檢查起初錯誤串接絕對路徑，修正檢查命令後通過；並非產物缺陷。
- `openspec validate port-omos-2-2-22 --strict` 與五份 main specs 的 strict 驗證通過；模型覆寫及 upstream provenance 兩個完整 requirement blocks 已同步，保留既有 scenarios，且 main spec 不含 delta operation headings。
- 同步核對完成後，以 `openspec archive port-omos-2-2-22 --skip-specs --yes` 封存；`--skip-specs` 僅避免重複套用已核對的 main spec。封存前確認來源與目標均位於 changes 目錄、目標不存在，封存後確認來源已移走且 `.openspec.yaml` 保留。
- `openspec new change` 已建立 change，但 telemetry 網路遭 sandbox 阻擋；核對實際目錄後，依安裝版 CLI 支援設定於後續命令停用 telemetry／update check，未重建或繞過必要檢查。
- 原有 `AGENTS.md`、`openspec/config.yaml`、`docs/agents/delivery-workflow.md` 的 SHA-256 已留於忽略的暫存紀錄，供交付前核對。

## Verification limits

文字契約、生成／封裝／安裝驗證不等同 live Codex 模型行為或 entitlement 驗證。本次無 Linux/macOS、Node 20/22 CI 或長時間 Codex 模型覆寫證據；既有 CI matrix 保留。
