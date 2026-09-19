# Design

## Context

見 proposal.md。既有 installer 以受管 Skill 清單共用 preview、複製、驗證、封存與 rollback，無須新安裝流程。Council 與 Orchestrator 的 Root profiles 限制彼此呼叫，因此此入口由一般 Root 使用。

## Goals / Non-Goals

**Goals:** 用薄層 Skill 串接既有流程，交付可安裝且可恢復的目標追蹤方法。

**Non-Goals:** 不新增角色、runtime、排程、狀態資料庫或模型設定；不承諾宿主停止後自行繼續。

## Decisions

- Skill 保留角色邊界、驗收迴圈與停止條件，細部審議／執行方法引用既有 Skills，避免複製造成規則漂移。
- 重用現有任務紀錄與 Orchestrator deepwork ledger，不強制建立另一套記錄。
- 擴充既有 CLI 安裝測試作為穩定公開測試接縫；以封裝 smoke 驗證實際入口。Skill 以原生 validator 與獨立情境推演驗證，不以字串斷言冒充代理行為測試。

## Risks / Trade-offs

- 提示不能保證宿主持續運行 → 清楚標示停止／恢復界線。
- 新 Skill 被限制型 Root profile 使用 → 先檢查當前角色限制，不以 Skill 覆蓋角色政策。
- 三個 Skills 的升級可能影響既有安裝 → 使用既有 rollback 與封存回歸測試，補驗兩個 Skills 升級路徑。

## Migration Plan

隨待發布 `0.4.4` 封裝；使用者日後以 `switch-preset` 更新後開啟新的 Codex 工作。此次僅驗證隔離目錄，不修改全域安裝。
