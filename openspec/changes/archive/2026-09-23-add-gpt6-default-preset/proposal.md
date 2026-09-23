# Proposal

## Why

使用者已指定 GPT-5.6 到 GPT-6 的模型映射，並要求新增 GPT-6 preset、設為預設。現有已安裝 agents 已完成模型更新，套件仍只提供 GPT-5.5／GPT-5.6，需要讓新生成與安裝流程也能選用 GPT-6。

## What Changes

- 新增 `openai-6`，沿用七角色 Current Role Contract 與 GPT-5.6 的 effort，以 `gpt-6-astra`、`gpt-6-sol`、`gpt-6-luna` 對應原有 Sol、Terra、Luna。
- 將 `latest`、`recommended` 與未指定 `--preset` 的 CLI 預設指向 `openai-6`。
- 保留 `openai-5.5`、`openai-5.6`，同步 generated snapshots、驗證與使用文件。

## Capabilities

### New Capabilities

無。

### Modified Capabilities

- `model-generation-presets`：新增 GPT-6 世代、明確模型／effort 映射與新的預設選擇。

## Impact

影響 `src/core/presets.ts`、`presets/`、既有 CLI 測試與 README／preset 文件。沿用既有產生器與 installer，不新增依賴，不重裝或覆寫使用者已安裝 agents，不變更 package version、commit、push 或發布。
