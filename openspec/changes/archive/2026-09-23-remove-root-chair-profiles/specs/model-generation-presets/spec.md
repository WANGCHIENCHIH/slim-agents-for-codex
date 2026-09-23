# Spec Delta

## MODIFIED Requirements

### Requirement: Package Version identifies the exact configuration
The exact generated configuration SHALL be identified by the combination of Package Version and Preset ID. Historical configurations SHALL remain reproducible from their historical package or Git tag and SHALL NOT be selectable as historical configuration variants in the latest package.

#### Scenario: Exact current configuration is reproduced
- **WHEN** the same Preset ID is generated twice from the same Package Version
- **THEN** the generated agent files, configuration snippet, manifest, and aliases are byte-identical

#### Scenario: Historical configuration is requested
- **WHEN** a user needs the exact output formerly published under a suffix Preset ID
- **THEN** the documented migration directs the user to the corresponding historical Package Version or Git tag

#### Scenario: Latest package contents are inspected
- **WHEN** a release package is built
- **THEN** it contains generated snapshot directories only for the supported unsuffixed Preset IDs

### Requirement: GPT-6 preset preserves reviewed role mappings

`openai-6` SHALL 使用以下模型與 effort，保留 GPT-5.6 的角色行為與權限。既有 `openai-5.5`、`openai-5.6` 映射 MUST 保持不變。

| Role | Model | Effort |
| --- | --- | --- |
| orchestrator | gpt-6-sol | high |
| oracle | gpt-6-astra | high |
| librarian | gpt-6-luna | low |
| explorer | gpt-6-luna | low |
| designer | gpt-6-luna | medium |
| fixer | gpt-6-luna | high |
| council | gpt-6-astra | high |

#### Scenario: GPT-6 agents are generated
- **WHEN** 使用者選擇 `openai-6` 產生或安裝 agents
- **THEN** 七個角色採用表列的精確 model 與 effort，不自動替換模型

#### Scenario: GPT-6 Root profiles are generated
- **WHEN** 使用者依舊版流程產生 `openai-6`，期待取得 Root profiles
- **THEN** 新版不再提供兩個 Root profiles；協調工作使用一般 Root 與 `slim-goal-loop`，兩個 child agents 維持表列映射

#### Scenario: Existing model generation is explicitly selected
- **WHEN** 使用者明確選擇 `openai-5.5` 或 `openai-5.6`
- **THEN** 仍能產生、安裝與驗證該世代的既有映射

## ADDED Requirements

### Requirement: Generated presets omit retired Root chairs

所有支援的 presets SHALL 停止產生或封裝 `council.config.toml` 與 `orchestrator.config.toml`，同時保留七個 child agents 及三個受管理 Skills。重新產生所選 preset 時 SHALL 清除該輸出根目錄中的兩個舊檔案並保留無關檔案；唯讀檢查 MUST 拒絕殘留的 Root profiles 而不修改檔案。

#### Scenario: Fresh generation and packaging
- **WHEN** 使用者產生任一支援 preset 或安裝發布的封裝
- **THEN** preset 不含兩個 Root profile 檔案，Council、Orchestrator 代理與三個 Skills 仍可使用

#### Scenario: Existing generated directory is reused
- **WHEN** 使用者重新產生含有舊 Root profile 檔案的所選 preset 目錄
- **THEN** 移除該目錄的兩個舊 profile，保留自訂 TOML 與 child agents

#### Scenario: Read-only check finds a retired profile
- **WHEN** 使用者對含有任一舊 Root profile 的 preset 執行 `convert --check`
- **THEN** CLI 回報錯誤，目錄內容保持不變
