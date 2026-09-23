# Design

## Context

見 [proposal.md](proposal.md)。本專案交付的是 Codex 角色提示、Skills 與可安裝套件；不持有上游 OpenCode 的 task/session runtime。既有 `agent-lifecycle-orchestration` 規格已涵蓋未終止、未核對及空白回報等情況。

上游模型覆寫規則來自 [commit 6be515d](https://github.com/alvinunreal/oh-my-opencode-slim/commit/6be515d9fb8b8427a9152341ccb8cdefa5396eab) 的 `src/agents/orchestrator.ts` 與 `src/agents/index.ts`。其 `providerID/modelID` 與 models tool 用語必須改成 Codex 宿主實際揭露的工具契約。

## Goals / Non-Goals

**Goals:** 將已授權覆寫規則放在 Council／Orchestrator 初次派送處，讓生成角色與獨立載入的 Skills 行為一致。

**Non-Goals:** 不新增 runtime、模型解析器、fallback、模型清單快取或另一套生命週期實作；不修改 Root goal-loop 的既有協調方式。

## Decisions

1. 沿用 `current-role-contract/council.ts`、`orchestrator.ts` 與對應 Skills，加入精簡派送規則。角色提示在 Skill 缺席時仍須可用，所以兩入口都要表達完整條件；不為幾句規則新增共用模組。
2. 依目前宿主的 `spawn_agent` schema，預設省略 `model`／`reasoning_effort`。只有明確授權且工具、角色均支援時覆寫；固定模型角色若無法覆寫，回報限制。不能改用另一種角色來繞過限制。
3. 使用既有公開 CLI `convert` 產物與封裝 Skill 文字作為回歸測試接點，檢查兩個 Presets／兩個協調者。這驗證交付契約，不代表模型每次都會遵守。
4. Package Version 升為 `0.4.5`，使用既有 generator 重建 snapshots。保留兩個 unsuffixed Preset IDs、全部七個角色及現有模型／effort 映射。release 文件標示尚未發布；README 保留已發布的 `0.4.4` 安裝範例。

## Risks / Trade-offs

- 提示規則不是 runtime 強制 → 使用公開生成、packaged install 與獨立審查確認文字及打包契約，明列未驗證 live Codex 模型覆寫。
- 各宿主與固定角色的覆寫能力不同 → 依當前工具與角色能力核對，無法滿足時回報 Root；不硬編碼模型目錄或 OpenCode 語法。
- 套件測試僅在當前 Windows／Node 24 執行 → 保留既有 CI matrix，未實際執行的跨平台版本不宣稱通過。

## Migration Plan

本次只完成工作目錄內移植、檢查與規格同步／封存。未來發布後，使用者可循既有 `switch-preset` 流程更新；現有備份／還原機制不變。本次不操作全域安裝、不 commit、不 push、不建立 Release。
