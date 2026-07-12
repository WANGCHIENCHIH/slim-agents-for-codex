# slim-agents-for-codex

繁體中文 | [English](README.md)

這是一組經過整理、可重現的 Codex 代理預設，改編自 [alvinunreal/oh-my-opencode-slim](https://github.com/alvinunreal/oh-my-opencode-slim)。原始代理角色概念與行為設計是該專案的工作成果；本 Repository 提供針對 Codex 的轉換版本。本社群專案與 OpenAI 及原始上游專案沒有隸屬關係。

關於 subagent workflow、自訂代理 TOML、模型與 reasoning 設定，以及 `[agents]` 全域控制的官方說明，請參考 [Subagents｜ChatGPT Learn](https://learn.chatgpt.com/docs/agent-configuration/subagents)。

## 快速開始

本專案透過 GitHub 發布，不會上架 npm Registry。

### 安裝 GitHub Release 套件

從對應的 GitHub Release 下載 `slim-agents-for-codex-0.1.6.tgz`，然後執行：

```bash
npm install --global ./slim-agents-for-codex-0.1.6.tgz
slim-agents-codex list-presets
```

### 從原始碼執行

```bash
npm ci
npm run build
node dist/cli.js list-presets
node dist/cli.js convert --preset openai-5.6 --output generated
node dist/cli.js install --preset openai-5.6
```

`install` 寫入前會顯示實際解析出的固定版本、設定檔路徑與備份路徑，並要求確認。`--scope global` 使用 `CODEX_HOME`（或 `~/.codex`），`--scope project` 使用目前專案的 `.codex` 目錄；明確提供的 `--codex-home PATH` 會覆寫 scope 的目標。只有在明確需要非互動式安裝時才使用 `--yes`。

## 手動安裝

GitHub 原始碼與 `.tgz` 套件都包含 `presets/<id>/agents/` 與 `config.snippet.toml`，因此不一定要使用 CLI。

1. 全域安裝時，將選定版本的八個 TOML 直接複製到 `CODEX_HOME/agents/`；專案安裝時，複製到 `<project>/.codex/agents/`。
2. 備份對應的 `CODEX_HOME/config.toml` 或 `<project>/.codex/config.toml`。
3. 將該版本的 `config.snippet.toml` 合併進對應的 `config.toml`。兩種 scope 都使用 `config_file = "agents/<role>.toml"`，並依 [Codex Configuration Reference](https://learn.chatgpt.com/docs/config-file/config-reference) 的規則，由宣告角色的 config 檔所在位置解析。
4. 保留原始 UTF-8 編碼、BOM 狀態與換行格式。
5. 重新開啟 Codex 工作。

CLI 也使用相同布局。全域位置使用 `--scope global`，在專案根目錄使用 `--scope project`；只有需要明確指定其他位置時才使用 `--codex-home DIR`。

不要把未啟用的舊版預設放在 `CODEX_HOME/agents/` 下，因為 Codex 會遞迴探索其中的 TOML 角色。請將非作用中的版本存放於 `CODEX_HOME/agent-presets/`。

## 預設版本生命週期

預設 ID 不會被覆寫。未來加入新版本時，`openai-5.5` 與 `openai-5.6` 仍會保留。`latest` 和 `recommended` 是定義在 `presets/aliases.json` 的可移動別名；CLI 在寫入前會顯示解析後的固定版本。本專案不會自動替換或降級模型。

需要新增 `openai-5.7` 或後續版本時，請參考[新增模型預設維護指南](docs/adding-a-preset.zh-TW.md)。

## 指令

- `list-presets`
- `convert --preset ID --output DIR`
- `convert --all --output DIR`
- `validate --path DIR`
- `validate --codex-home DIR`
- `install --preset ID [--scope global|project] [--codex-home DIR] [--yes]`
- `switch-preset --preset ID [--scope global|project] [--codex-home DIR] [--yes]`

`validate --path DIR` 用於檢查預設的代理 TOML；`validate --codex-home DIR` 會解析該目錄下的 `config.toml`，以它為基準解析各個 `agents/<role>.toml` 路徑，並驗證已安裝的角色檔案。結構驗證成功不代表使用者帳號一定具備指定模型的使用權限。變更全域設定後，請開啟新的 Codex 工作。

## 開發

```bash
npm install
npm test
npm run typecheck
npm run build
npm pack --dry-run
```

需要 Node.js 20 或更新版本。

## 維護狀態

這是採按需維護的社群實驗性專案，不承諾立即支援每一個新 Codex 模型或設定格式變更。新增模型映射時，應建立新的預設版本目錄，不應修改既有的歷史預設。

套件已刻意設定為 private，以防止意外發布到 npm Registry；這不影響 `npm pack` 或安裝產生的 `.tgz`。
