## Why

目前 Orchestrator 明確禁止對仍在執行或狀態不明的 specialist 重複派工，但沒有明確涵蓋「任務已進入 terminal 狀態、結果尚未完成 reconciliation」的短暫區間。oh-my-opencode-slim 2.2.17 已針對這個重複啟動風險補上防護；Codex adapter 應以原生 collaboration tool 語意補齊相同契約，而不移植 OpenCode runtime。

## What Changes

- 要求 Orchestrator 在相同 objective 的 terminal result 尚未完成 reconciliation 前，不得重新派出相同工作。
- 保留結果完成 reconciliation 後的合理 retry／replacement 路徑，不把一次 terminal 狀態永久視為禁止重試。
- 同步 Current Role Contract、managed `slim-orchestration` Skill 與可驗收的 lifecycle scenarios。
- 將 reviewed upstream provenance 更新為 oh-my-opencode-slim `2.2.17` commit `7ea8f3ef95ec9c6be565446932c8ad8ee353e9d1`，並以新的 Package Version 重產既有兩個 unsuffixed preset snapshots。
- 不移植 OpenCode Background Job Board、task hooks、tool-loop guard、TUI、tmux、smartfetch 或 provider preset 實作。

## Capabilities

### New Capabilities

無。

### Modified Capabilities

- `agent-lifecycle-orchestration`: 將防重複派工契約延伸到 terminal 但尚未完成 reconciliation 的 specialist lane，並保留 reconciliation 後的合理 retry。
- `model-generation-presets`: 讓兩個 supported presets 共同輸出更新後的 Current Role Contract 與 `2.2.17` reviewed provenance，不改 Preset ID 或 model／effort mapping。

## Impact

- Current Role Contract 的 Orchestrator instructions。
- Packaged `slim-orchestration` Skill。
- Lifecycle 與 preset generation 的 contract tests。
- Package Version、generator provenance，以及 `openai-5.5`／`openai-5.6` committed snapshots。
- 不新增 dependency、role、Preset ID、runtime service 或 OpenCode compatibility layer。
