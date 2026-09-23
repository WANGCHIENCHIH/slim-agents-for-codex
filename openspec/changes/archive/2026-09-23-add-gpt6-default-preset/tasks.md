# Tasks

GPT-6 preset、預設選擇、文件與主規格同步已完成；所有實作驗證及審查通過。OpenSpec 已封存為 `2026-09-23-add-gpt6-default-preset`。使用者已確認將 GPT-6、既有 `v2.2.22／0.4.5` 更新與 main 上兩個角色重構 commit 一併提交並推送至 `origin/main`；治理文件修改保留。交付版本以本紀錄所在 commit 識別，遠端 CI 以該 commit 的 GitHub Actions 結果為準；此授權不包含 tag 或 Release 發布。

## 1. GPT-6 preset

- [x] 1.1 先透過 public CLI 測試確認新 preset 尚不存在，再新增模型映射與 aliases；驗證七角色、Root profiles、舊世代映射及產生的 snapshots。
- [x] 1.2 驗證未指定 preset 的 CLI 安裝、切換與 validate 都使用 `openai-6`，並保留既有 rollback 與舊世代回歸測試。

## 2. Delivery

- [x] 2.1 更新雙語 README、preset lifecycle 與架構說明；核對來源 checkout 與歷史 release 指令、連結及 UTF-8／換行格式。
- [x] 2.2 完成測試、typecheck、build、snapshots、pack dry-run、實際封裝安裝 smoke、Standards／Spec review 與 OpenSpec strict validation，同步規格並記錄驗證和未發布狀態。

## Verification

- Public CLI 的初始 RED：`Unknown preset: openai-6`；加入映射後該測試通過。`npm test -- --exclude '.tmp/**'` 共 60 passed；已確認 `.tmp/coordinator-commit-check` 存在舊測試副本，因此排除暫存 checkout。Vitest 子程序受沙箱 EPERM 限制，改由核准的沙箱外執行完成驗證。
- `npm run typecheck`、`npm run build`、`npm run snapshots` 通過；compiled CLI 的 `list-presets` 顯示兩個 aliases 指向 `openai-6`，省略 preset 的 `validate` 通過七角色驗證。
- `npm run pack:check` 與 `npm run pack:smoke` 通過；實際封裝後的套件已在暫存位置成功安裝、驗證 `openai-6` 七角色及三個 managed Skills。首次 npm cache 寫入受沙箱 EPERM 限制，核准的沙箱外重跑成功。README 的升級指令於審查後補充，未改變已驗證的封裝程式與設定內容。
- 獨立 Standards／Spec review 無阻擋項目；兩語系 README 補上既有安裝使用 `switch-preset`，主規格與 delta 亦釐清只有 install／switch 有確認前預覽。16 個本機 Markdown 連結／anchors、UTF-8、BOM、換行與 scoped `git diff --check` 通過。與本次開始前工作樹相比，259 個範圍外檔案及 Git index 保持原樣，包含舊 presets 與既有專案 agents。
- OpenSpec change strict validation 與全部 5 個 main specs strict validation 通過；6 個 delta requirement blocks 已同步。此證據不包含 live Codex 模型權限或代理執行行為，亦不包含遠端 CI 或已發布套件驗證。

## Commit and push verification

- 使用者確認完整交付範圍後，以 204 個明確路徑暫存；`AGENTS.md`、`openspec/config.yaml`、`docs/agents/delivery-workflow.md` 保留在提交之外。推送目標為 `origin/main`，包含既有的 `ecde19c` 與 `d87f26c`；不建立 tag 或 Release。
- 從 Git index 匯出的獨立副本執行 `npm ci`、未加排除參數的 `npm test`（60 passed）、typecheck、build、snapshots、pack dry-run、packed installation smoke 及全部 5 個 main specs strict validation，全部通過。
- 針對完整 staged diff 的獨立 Standards／Spec review 通過；157 個專案 agent 檔案均只有一行模型替換，沒有更動 effort、權限或提示詞。既有 presets 映射保留，`0.4.5／v2.2.22` 來源與生成內容一致。
- `npm ci`／`npm audit` 回報 5 個有已知弱點的依賴（3 high、2 moderate），其中 `smol-toml` 是 runtime 依賴，其餘為 dev dependencies。依賴版本不是本次變更；此交付未執行 dependency upgrade，不能宣稱 dependency audit clean。遠端 CI 結果以此交付 commit 的 GitHub Actions 紀錄為準。
