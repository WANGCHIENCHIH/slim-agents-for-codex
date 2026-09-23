# Spec Delta

## MODIFIED Requirements

### Requirement: Preset IDs identify model generations
The package SHALL expose one unsuffixed Preset ID for each supported OpenAI model generation and SHALL NOT use the Preset ID to identify prompt, policy, mapping, or snapshot revisions within that generation.

#### Scenario: Supported model generations are listed
- **WHEN** a user lists the presets in the latest package
- **THEN** CLI 列出 `openai-5.5`、`openai-5.6` 與 `openai-6` 三個受支援 Preset IDs

#### Scenario: Same-generation maintenance is released
- **WHEN** a maintainer changes a role description, instruction, policy, model mapping, or effort mapping without adopting a new OpenAI model generation
- **THEN** the change uses a new Package Version without adding a suffixed Preset ID

#### Scenario: New model generation is adopted
- **WHEN** a maintainer intentionally supports a new OpenAI model generation
- **THEN** the package introduces one new unsuffixed Preset ID for that generation

### Requirement: Supported presets share the Current Role Contract
Every supported Preset ID in a Package Version SHALL generate the same Current Role Contract of exactly seven managed roles. Role names, descriptions, instructions, sandbox policy, role order, lifecycle supervision policy, and other role-specific policy SHALL be identical across supported model generations; only model and effort mappings MAY differ.

#### Scenario: GPT-5.5 and GPT-5.6 outputs are compared
- **WHEN** 從相同 Package Version 產生 `openai-5.5`、`openai-5.6` 與 `openai-6`
- **THEN** 三者包含相同七個受管理角色與 Current Role Contract，只有 model 與 effort 映射可以不同

#### Scenario: Current policy is rendered
- **WHEN** any supported Preset ID is generated
- **THEN** role-specific MCP guidance, optional Skill routing, and lifecycle supervision policy come from the Current Role Contract without behavior selected by a suffix Preset ID

#### Scenario: Existing eight-role installation is switched
- **WHEN** a user switches an existing managed eight-role installation to a supported unsuffixed Preset ID
- **THEN** the retired managed Observer role is archived and removed from the active config and agent discovery path while unrelated custom roles remain unchanged

#### Scenario: Same-generation lifecycle maintenance is released
- **WHEN** the Current Role Contract prevents redispatch of a terminal-but-unreconciled objective without changing model generations
- **THEN** all supported unsuffixed Preset IDs receive the same lifecycle policy under a new Package Version

### Requirement: Coordinators preserve configured models unless an override is authorized

Council 與 Orchestrator 的生成提示及受管理 Skills SHALL 在初次派送時預設省略 `model` 與 `reasoning_effort`，使用所選角色的既有設定。只有使用者明確指定，或上位宿主指示要求時，才 SHALL 使用宿主工具已揭露且該角色支援的精確模型與 effort；子協調者 SHALL 由 Root 的任務指派取得此授權。無法確認指定值或覆寫能力時，協調者 SHALL 向 Root 回報限制，不猜測 ID、不自動替換模型，也不改變角色、權限、專家名單或深度限制。

#### Scenario: No model override is requested
- **WHEN** 協調者初次派送已選定的專家，且沒有明確模型或 effort 指定
- **THEN** 派送省略 `model` 與 `reasoning_effort`，保留該角色的既有設定

#### Scenario: An authorized supported override is requested
- **WHEN** Root 傳達使用者指定的模型或 effort，或上位宿主指示要求覆寫，且目前工具與所選角色支援該指定
- **THEN** 協調者使用宿主揭露的精確值，同時保留 agent type、sandbox、instructions、roster、depth 與 Root 決策邊界

#### Scenario: The requested override cannot be verified or applied
- **WHEN** 指定模型／effort 未出現在宿主可用資訊中，或所選角色／工具不允許覆寫
- **THEN** 協調者回報限制，不猜測模型 ID、不套用 OpenCode 的 provider／variant 語法，也不自動使用替代模型

#### Scenario: A model request arrives after dispatch
- **WHEN** 專家仍在執行或其終止結果尚未核對時收到模型變更要求
- **THEN** 協調者遵守既有 interruption、reconciliation 與 continuation 規則，不僅為套用模型偏好就重複派送、打斷或替換該工作

#### Scenario: Both coordinator entrypoints are inspected
- **WHEN** 檢查所有支援 Presets 的 Council、Orchestrator 生成提示及對應受管理 Skills
- **THEN** 所有生成提示與對應 Skills 均表達相同的預設、覆寫授權、宿主能力確認與既有生命週期邊界

### Requirement: Generated manifests identify reviewed upstream provenance

Every supported preset manifest SHALL identify the same reviewed oh-my-opencode-slim release and full commit used as the audit provenance for the Current Role Contract. Provenance metadata MUST NOT select preset behavior.

#### Scenario: Version 2.2.15 provenance is rendered
- **WHEN** either supported preset is generated from historical Package Version `0.4.1`
- **THEN** its manifest identifies upstream version `2.2.15` and commit `dafee9849fbae6fecaa51c5f406083cad4dfd08b`

#### Scenario: Version 2.2.17 provenance is rendered
- **WHEN** either supported preset is generated from historical Package Version `0.4.2`
- **THEN** its manifest identifies upstream version `2.2.17` and commit `7ea8f3ef95ec9c6be565446932c8ad8ee353e9d1`

#### Scenario: Version 2.2.21 provenance is rendered
- **WHEN** 從 Package Version `0.4.4` 生成任一支援 Preset
- **THEN** manifest 標示已審閱的 upstream version `2.2.21` 與 commit `f34d7ae22af0985bec257d72d0b6213f2aed3e48`，不改變模型與 effort 映射

#### Scenario: Version 2.2.22 provenance is rendered
- **WHEN** 從 Package Version `0.4.5` 生成任一支援 Preset
- **THEN** manifest 標示已審閱的 upstream version `2.2.22` 與 commit `3685293ae6896deca1d85a14a38ba47510a50add`，不改變模型與 effort 映射

#### Scenario: Supported manifests are compared
- **WHEN** 比較相同 Package Version 下的 `openai-5.5`、`openai-5.6` 與 `openai-6` manifests
- **THEN** their upstream version and commit are identical and neither value changes the selected model mapping

### Requirement: Aliases resolve to the recommended model generation
The `latest` and `recommended` aliases SHALL resolve to `openai-6`. The `install` and `switch-preset` commands SHALL display the resolved unsuffixed Preset ID before confirmation.

#### Scenario: Aliases are listed
- **WHEN** a user lists presets and aliases
- **THEN** both `latest` and `recommended` are shown as resolving to `openai-6`

#### Scenario: Alias is used for a write-capable command
- **WHEN** a user invokes `install` or `switch-preset` with `latest` or `recommended`
- **THEN** the preview identifies `openai-6` as the resolved Preset ID before confirmation

#### Scenario: No preset is specified
- **WHEN** 使用者未指定 `--preset` 執行 `convert`、`install`、`switch-preset` 或 `validate`
- **THEN** CLI 使用 `openai-6`；`install` 與 `switch-preset` 在確認前顯示該 Preset ID，`convert` 則在產生檔案後回報輸出位置

## ADDED Requirements

### Requirement: GPT-6 preset preserves reviewed role mappings

`openai-6` SHALL 使用以下模型與 effort，保留 GPT-5.6 的角色行為、權限與 Root profile effort。既有 `openai-5.5`、`openai-5.6` 映射 MUST 保持不變。

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
- **WHEN** 使用者產生 `openai-6` 的 Root profiles
- **THEN** orchestrator 使用 `gpt-6-sol/high`，council 使用 `gpt-6-astra/medium`，並保留原本權限與指示

#### Scenario: Existing model generation is explicitly selected
- **WHEN** 使用者明確選擇 `openai-5.5` 或 `openai-5.6`
- **THEN** 仍能產生、安裝與驗證該世代的既有映射
