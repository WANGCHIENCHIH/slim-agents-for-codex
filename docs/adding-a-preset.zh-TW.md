# 新增模型世代 Preset

## 邊界

- **Preset ID** 代表 OpenAI 模型世代，例如 `openai-5.7`。
- **Package Version** 與 Preset ID 的組合識別精確產生檔案。
- **Current Role Contract** 是套件唯一的七角色行為定義。

同一受支援世代內的 prompt、policy、角色、model 或 effort 維護，不得新增 suffix ID；應發布新的 Package Version。只有採用新模型世代時，才新增一個 unsuffixed Preset ID。

## 新增模型世代

1. 確認新模型世代，以及七個角色完整的 model／effort mapping。
2. 在 `src/core/presets.ts` 新增 unsuffixed mapping。
3. 只有當新世代成為建議預設時，才移動 `latest` 與 `recommended`。
4. 透過 public CLI seam 新增 listing、generation、alias resolution 與 deterministic snapshot 驗收。
5. 建置並產生 committed snapshots：

```bash
npm run build
node dist/cli.js convert --all --output presets
```

最新 source/package 只能包含受支援的 unsuffixed Preset ID snapshot 目錄；不要把歷史 role contract 或 suffix snapshot 複製進來。

## 維護 Current Role Contract

直接修改 `src/core/role-sources/current-role-contract/`。所有受支援 Preset ID 必須共享相同的角色名稱、順序、description、instructions、sandbox、MCP guidance 與 optional Skill routing。只保留精簡的現行上游審核 provenance；歷史實作留在對應 package/tag。

Observer 不是現行角色。它只保留在 retired managed-role cleanup data，讓既有八角色安裝可在 `switch-preset` 時安全封存。

## 退休 ID

退休 ID 必須在共同 preset resolver、且任何 config、agent、Skill、backup、archive 或暫存檔寫入前失敗。錯誤需指出替代的 unsuffixed ID，並提醒精確歷史設定應使用歷史 Package Version 或 Git tag。不得把退休 suffix 保留為 alias。

## 發布檢查

```bash
npm test
npm run typecheck
npm run build
npm run snapshots
npm run pack:check
openspec validate <change-name> --strict
```

檢查 package dry-run，確認只包含受支援 snapshots、現行 compiled contract 與 current documentation。不得移動既有 Git tag 或替換既有 Release asset。
