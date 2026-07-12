# 新增模型預設維護指南

[English](adding-a-preset.md) | 繁體中文

本文件說明當 [alvinunreal/oh-my-opencode-slim](https://github.com/alvinunreal/oh-my-opencode-slim) 增加新一代 OpenAI 配置時，如何在本專案建立新的 Codex preset。以下以 `openai-5.7` 為例。

## 先確認變更類型

新增前先比較上游新舊版本：

- 若只有模型名稱與 reasoning effort 改變，可直接新增 preset。
- 若角色 Prompt、角色數量或行為也改變，不要直接修改共用的 `roles`，應先將角色定義改為按 adapter 或 preset 版本保存。
- 若既有 Codex 轉換規則對所有 preset 都有錯誤，應修正共用 generator、重新產生所有受影響 snapshot，並以新的套件版本發布，不得移動舊 tag。

`openai-5.5`、`openai-5.6` 等已發布 preset 的模型映射與 manifest 必須維持可重現，不應因新增版本而被改寫或刪除。

## 目前的限制

CLI 不會自動連線下載或解析上游配置。維護者必須人工檢查上游版本，確認模型名稱、effort 與角色變更，再將審核後的映射加入原始碼。

`convert` 目前只產生八個代理 TOML 與 `config.snippet.toml`，不會建立 `manifest.json`，也不會自動更新 aliases。

## 1. 準備工作目錄

```bash
git clone https://github.com/WANGCHIENCHIH/slim-agents-for-codex.git
cd slim-agents-for-codex
npm ci
```

確認工作目錄乾淨，並從新的分支開始修改。

## 2. 審核上游配置

查看上游的新版本設定與角色來源，記錄：

- 上游 commit、tag 或版本日期。
- 八個角色各自使用的模型名稱。
- 八個角色各自使用的 reasoning effort。
- Prompt、角色清單或行為是否改變。
- Codex 是否實際支援映射後的模型名稱。

不要依版本命名猜測 `sol`、`terra`、`luna` 或其他模型名稱，也不要加入自動 fallback。模型是否可用仍取決於使用者帳號與 Codex 當時支援狀態。

## 3. 新增 preset 映射

編輯 `src/core/presets.ts`，在 `presets` 加入完整的八角色映射：

```ts
"openai-5.7": {
  id: "openai-5.7",
  adapter: "oh-my-opencode-slim",
  sourceVersion: "reviewed-YYYY-MM",
  status: "supported",
  models: mapping({
    orchestrator: ["實際模型名稱", "medium"],
    oracle: ["實際模型名稱", "high"],
    librarian: ["實際模型名稱", "low"],
    explorer: ["實際模型名稱", "low"],
    designer: ["實際模型名稱", "medium"],
    fixer: ["實際模型名稱", "medium"],
    council: ["實際模型名稱", "high"],
    observer: ["實際模型名稱", "low"],
  }),
},
```

範例中的 effort 只是欄位示意；應以審核後的上游配置為準。

同一檔案內，將 aliases 指向新版本：

```ts
export const aliases = {
  latest: "openai-5.7",
  recommended: "openai-5.7",
} as const;
```

## 4. 同步 aliases 與 manifest

修改 `presets/aliases.json`：

```json
{
  "latest": "openai-5.7",
  "recommended": "openai-5.7"
}
```

建立 `presets/openai-5.7/manifest.json`。可參考上一版 manifest，但必須更新 preset ID、來源版本與審核資訊。不要修改既有版本的 manifest。

## 5. 產生 TOML snapshot

```bash
npm run build
node dist/cli.js convert --preset openai-5.7 --output presets
```

完成後應有：

```text
presets/openai-5.7/
├── agents/
│   ├── orchestrator.toml
│   ├── oracle.toml
│   ├── librarian.toml
│   ├── explorer.toml
│   ├── designer.toml
│   ├── fixer.toml
│   ├── council.toml
│   └── observer.toml
├── config.snippet.toml
└── manifest.json
```

逐一檢查 TOML 的 `model`、`model_reasoning_effort`、`sandbox_mode` 與 `developer_instructions`。

## 6. 驗證

```bash
node dist/cli.js validate --path presets/openai-5.7/agents
npm test
npm run typecheck
npm run build
npm run snapshots
npm pack --dry-run
```

驗證重點：

- 新版包含全部八個角色。
- `openai-5.5`、`openai-5.6` 與其他歷史 preset 仍存在。
- `latest`、`recommended` 解析至 `openai-5.7`。
- 打包內容包含新舊所有 preset。
- 結構驗證成功不應被描述為帳號一定具備模型權限。

## 7. 更新專案版本

依變更幅度更新 `package.json` 與 `package-lock.json`：

- 只增加映射且不破壞既有介面，通常增加 minor 版本，例如 `0.1.1` 到 `0.2.0`。
- 模型或 effort 映射修正必須建立新的 preset ID。共用 Codex 轉換規則的修正可以重新產生受影響的歷史角色 TOML，但必須使用新的套件版本，且不得覆寫既有 tag 或 Release 附件。

同步更新英文與繁中 README 中的 Release 套件檔名。

## 8. 提交與發布

```bash
git add .
git commit -m "feat: add openai-5.7 preset"
git push origin main
git tag -a v0.2.0 -m "slim-agents-for-codex v0.2.0"
git push origin v0.2.0
```

`v*` tag 推送後，GitHub Actions 會自動：

1. 安裝相依套件。
2. 執行測試、型別檢查、建置與 snapshot 驗證。
3. 執行 `npm pack`。
4. 產生 SHA-256 校驗檔。
5. 建立或更新 GitHub Release。
6. 上傳 `.tgz` 與 `.sha256`。

發布後請確認 Release 附件名稱、CI 結果，以及從 `.tgz` 隔離安裝後的 `list-presets` 與 `validate` 指令。

## Prompt 或角色有變更時

目前 `src/core/presets.ts` 的 `roles` 是所有 preset 共用。若上游新版本刻意修改 Prompt 或角色行為，直接編輯共用 `roles` 會讓舊版也採用新行為。

此時應先重構為版本化角色來源，例如：

```text
src/adapters/oh-my-opencode-slim/
├── reviewed-2026-07/
│   └── roles.ts
└── reviewed-YYYY-MM/
    └── roles.ts
```

每個 preset manifest 應指向明確的角色來源版本。完成版本化與回歸測試後，才能加入包含新 Prompt 的 preset。

上述版本化要求不妨礙修正既有 Codex 轉換錯誤。只有在已審核規則原本就應套用至這些 preset 時，才可修正共用 generator；必須加入回歸測試、重新產生所有受影響 snapshot，並以新的套件版本發布，不得覆寫既有 tag 或 Release 附件。
