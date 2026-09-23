# Spec Delta

## ADDED Requirements

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
- **WHEN** 檢查兩個支援 Presets 的 Council、Orchestrator 生成提示及對應受管理 Skills
- **THEN** 四個來源入口均表達相同的預設、覆寫授權、宿主能力確認與既有生命週期邊界

## MODIFIED Requirements

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
- **WHEN** the `openai-5.5` and `openai-5.6` manifests are compared within the same Package Version
- **THEN** their upstream version and commit are identical and neither value changes the selected model mapping
