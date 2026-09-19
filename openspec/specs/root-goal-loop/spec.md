# Root Goal Loop Specification

## Purpose

提供可重用的 Root 目標協調 Skill，讓使用者給定目標與驗收條件後，透過既有 Council 與 Orchestrator 分工持續推進，並明確區分驗收證據、阻礙與宿主執行限制。

## Requirements

### Requirement: General Root coordinates the goal

`slim-goal-loop` SHALL 由一般 Root 整理目標、驗收條件、範圍與既有授權，保有決策與最終驗收權。Council SHALL 僅於重大不確定性或風險需要審議時提供建議；Orchestrator SHALL 依既有 Skill 執行已授權方案。兩者 MUST 保持同層，不互相呼叫。

#### Scenario: Goal requires deliberation and execution
- **WHEN** 一般 Root 收到需要先審議方案再執行的目標
- **THEN** Root 給 Council 有界限的審議題目與核可專家名單，再將已決定方案交給 Orchestrator，沿用各自的角色與深度限制

#### Scenario: Restricted profile or unavailable coordinator
- **WHEN** 當前 Root profile 禁止此協調方式，或必要角色、Skill、工具不可用
- **THEN** Skill 說明限制與可行入口，不覆寫角色限制，也不宣稱已完成該協作

### Requirement: Evidence drives continuation and completion

Root SHALL 逐項核對實際產物與驗收證據，重用既有任務紀錄和代理；批次完成、部分測試通過或狀態問題 MUST NOT 被當成全部完成。未達標且仍可執行的授權工作 SHALL 繼續；遇到使用者暫停、取消、需決定的重大選擇、缺少授權或執行限制時 SHALL 保留進度與下一步。

#### Scenario: Partial success needs another pass
- **WHEN** Orchestrator 回報部分測試通過，但仍有可執行的驗收缺口
- **THEN** Root 將具體缺口與證據交回既有 Orchestrator 繼續，直到全部驗收有證據或有具體阻礙

#### Scenario: Repeated failure or host interruption
- **WHEN** 同一失敗已嘗試三次仍無法修復，或宿主停止執行
- **THEN** Root 不重複相同嘗試，記錄可疑假設、已試方法、剩餘工作及恢復步驟；Skill 不宣稱可自行喚醒或無限制重試

#### Scenario: Completion and authority
- **WHEN** 工作符合所有驗收條件
- **THEN** Root 回報產物、驗證與限制；Skill 不額外授權 commit、push、發布或其他原先未授權的外部動作

### Requirement: Goal loop is a managed packaged Skill

套件 SHALL 包含 `slim-goal-loop` 的 Skill 與 UI metadata，既有安裝、切換、驗證、封存和失敗還原 SHALL 涵蓋全部三個受管 Skills 並保留無關資料。

#### Scenario: Fresh installation
- **WHEN** 從封裝執行 CLI 安裝至隔離目錄
- **THEN** 三個受管 Skills 的內容與封裝一致，包含可使用的 goal-loop 入口

#### Scenario: Upgrade from two Skills
- **WHEN** 使用者對只有原先兩個 Slim Skills 的安裝執行切換
- **THEN** 新 Skill 被加入，原有受管內容被封存，無關 Skill 保持不變，公開驗證指令成功
