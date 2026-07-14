# slim-agents-for-codex

繁體中文 | [English](README.md)

這是一組經過整理、可重現的 Codex 代理預設，改編自 [alvinunreal/oh-my-opencode-slim](https://github.com/alvinunreal/oh-my-opencode-slim)。原始代理角色概念與行為設計是該專案的工作成果；本 Repository 提供針對 Codex 的轉換版本。本社群專案與 OpenAI 及原始上游專案沒有隸屬關係。

關於 subagent workflow、自訂代理 TOML、模型與 reasoning 設定，以及 `[agents]` 全域控制的官方說明，請參考 [Subagents｜ChatGPT Learn](https://learn.chatgpt.com/docs/agent-configuration/subagents)。

## 快速開始

本專案透過 GitHub 發布，不會上架 npm Registry。

### 安裝 GitHub Release 套件

從對應的 GitHub Release 下載 `slim-agents-for-codex-0.2.0.tgz`，然後執行：

```bash
npm install --global ./slim-agents-for-codex-0.2.0.tgz
slim-agents-codex list-presets
slim-agents-codex install --preset openai-5.6.1 --scope global
```

如果已安裝 `0.1.x` preset，請改用 `slim-agents-codex switch-preset --preset openai-5.6.1 --scope global`。切換時會先封存即將被替換的受管 agents 與 Skills，再對新安裝執行 post-validation。

### 從原始碼執行

```bash
npm ci
npm run build
node dist/cli.js list-presets
node dist/cli.js convert --preset openai-5.6.1 --output generated
node dist/cli.js install --preset openai-5.6.1
```

`install` 寫入前會顯示實際解析出的固定版本、設定檔路徑、Skill 路徑與備份路徑，並要求確認；它會同時安裝選定的 agent preset 與兩個受管 Slim Skills。`--scope global` 使用 `CODEX_HOME`（或 `~/.codex`）及 `$HOME/.agents/skills`，`--scope project` 使用目前專案的 `.codex` 及 `.agents/skills`；明確提供的 `--codex-home PATH`、`--skills-home PATH` 會覆寫對應目標。只有在明確需要非互動式安裝時才使用 `--yes`。

## 手動安裝

GitHub 原始碼與 `.tgz` 套件都包含 `presets/<id>/agents/` 與 `config.snippet.toml`，因此不一定要使用 CLI。

1. 全域安裝時，將選定 preset 的全部 TOML 複製到 `CODEX_HOME/agents/`；專案安裝時，複製到 `<project>/.codex/agents/`。歷史 `openai-5.5`、`openai-5.6` 有八個角色，目前 `.1` 修正版有七個角色。
2. 備份對應的 `CODEX_HOME/config.toml` 或 `<project>/.codex/config.toml`。
3. 將該版本的 `config.snippet.toml` 合併進對應的 `config.toml`。兩種 scope 都使用 `config_file = "agents/<role>.toml"`，並依 [Codex Configuration Reference](https://learn.chatgpt.com/docs/config-file/config-reference) 的規則，由宣告角色的 config 檔所在位置解析。
4. 將 `slim-council`、`slim-orchestration` 複製到全域 `$HOME/.agents/skills/` 或專案 `<project>/.agents/skills/`。
5. 保留原始 UTF-8 編碼、BOM 狀態與換行格式。
6. 重新開啟 Codex 工作。

CLI 也使用相同布局。全域位置使用 `--scope global`，在專案根目錄使用 `--scope project`；只有需要明確指定其他位置時才使用 `--codex-home DIR`。

不要把未啟用的舊版預設放在 `CODEX_HOME/agents/` 下，因為 Codex 會遞迴探索其中的 TOML 角色。請將非作用中的版本存放於 `CODEX_HOME/agent-presets/`。

## 預設版本生命週期

預設 ID 不會被覆寫。`openai-5.5` 與 `openai-5.6` 保留為歷史八角色轉換；`openai-5.5.1` 與 `openai-5.6.1` 對七個保留角色使用完全相同的 GPT model／effort，移除 Observer，並加入 Codex 原生巢狀協調。`latest` 和 `recommended` 是定義在 `presets/aliases.json` 的可移動別名；CLI 在寫入前會顯示解析後的固定版本。本專案不會自動替換或降級模型。

## 協調架構

Root Codex agent 負責使用者需求與最終驗證；Council 與 Orchestrator 是同層的子協調代理：

- `council` 判斷需要哪些專業，依已安裝 custom agent 的 description 選出議員，讓這些直接子代理分別研究可行性、風險與解法。
- `orchestrator` 接收已選定方案，透過五個固定 Slim specialist 實作：`oracle`、`librarian`、`explorer`、`designer`、`fixer`。

Council 與 Orchestrator 不會互相呼叫。`agents.max_depth = 2` 時，它們選出的專家是 Root 的孫代理，不能再繼續委派。後端、資安、資料庫、Docker、CI/CD、UI/UX 等額外專家可作為一般 TOML 安裝在 `.codex/agents/` 或 `CODEX_HOME/agents/`，Council 只會從 Root 預先核可的 advisory agent description 中選擇議員。Council 議員 TOML 應設定 `sandbox_mode = "read-only"`；若需要硬性的唯讀隔離，parent turn 也必須使用 read-only 權限，因為 Codex 會把即時 permission override 套用到子代理。

完整 runtime graph、版本化角色來源與 skill 邊界請參考 [Slim Codex architecture](docs/slim-codex-architecture.md)。

Council 專用 read-only custom-agent TOML、model 繼承政策與 parent permission 限制請參考 [Council expert agents](docs/council-expert-agents.md)。

原始碼 checkout 會自動提供兩個 workflow：`.agents/skills/slim-orchestration/` 負責五個 specialist 的執行編排，`.agents/skills/slim-council/` 負責按任務組成專家議會。Release package 會包含兩個目錄，`install`、`switch-preset` 會把它們部署到選定的 Skill scope；仍可選擇手動複製。安裝後請開啟新的 Codex 工作。

需要新增 `openai-5.7` 或後續版本時，請參考[新增模型預設維護指南](docs/adding-a-preset.zh-TW.md)。

## 指令

- `list-presets`
- `convert --preset ID --output DIR`
- `convert --all --output DIR`
- `convert --all --output DIR --check`
- `validate --path DIR [--preset ID]`
- `validate --codex-home DIR --skills-home DIR [--preset ID]`
- `install --preset ID [--scope global|project] [--codex-home DIR] [--skills-home DIR] [--yes]`
- `switch-preset --preset ID [--scope global|project] [--codex-home DIR] [--skills-home DIR] [--yes]`

`convert --check` 不會寫檔；只要產生的 agent TOML、`config.snippet.toml`、manifest 或 aliases 與已提交 snapshot 不同就會失敗。`validate --preset ID` 會把解析後的角色語意與指定 generator source 精確比較；`validate --codex-home DIR` 也會從該目錄的 `config.toml` 解析已安裝的 `agents/<role>.toml`，並要求提供 `--skills-home DIR`，避免靜默跳過套件內受管 Skills 的精確驗證。可攜式角色檔會把經審核的 MCP denylist 放在 `developer_instructions`，不產生局部 `mcp_servers` table，因為 standalone parsing 與 parent transport merge 會讓 partial 或 dummy transport 失效。`switch-preset` 會先備份 config，再變更 live agents 或 Skills；它也會把既有受管角色檔案與受管 Skills 封存到 `agent-presets/slim-agents-for-codex/`，移除 Observer 等已停用受管角色，只替換兩個受管 Slim Skills，保留無關的自訂角色與 Skills，最後再驗證安裝結果。這些檢查不代表使用者帳號一定具備指定模型權限或硬性的 MCP 隔離。變更 agent 設定後，請開啟新的 Codex 工作。

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
