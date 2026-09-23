# Spec Delta

## MODIFIED Requirements

### Requirement: General Root coordinates the goal

`slim-goal-loop` SHALL 由一般 Root 整理目標、驗收條件、範圍與既有授權，保有決策與最終驗收權。Council SHALL 僅於重大不確定性或風險需要審議時提供建議；Orchestrator SHALL 依既有 Skill 執行已授權方案。兩者 MUST 保持同層，不互相呼叫。

#### Scenario: Goal requires deliberation and execution
- **WHEN** 一般 Root 收到需要先審議方案再執行的目標
- **THEN** Root 給 Council 有界限的審議題目與核可專家名單，再將已決定方案交給 Orchestrator，沿用各自的角色與深度限制

#### Scenario: Restricted profile or unavailable coordinator
- **WHEN** 當前宿主或角色權限禁止此協調方式，或必要角色、Skill、工具不可用
- **THEN** Skill 說明限制與可行入口，不覆寫角色限制，也不宣稱已完成該協作
