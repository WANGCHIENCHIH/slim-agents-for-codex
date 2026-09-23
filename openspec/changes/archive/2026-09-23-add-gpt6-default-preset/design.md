# Design

## Context

動機與範圍見 [proposal.md](proposal.md)。CLI 的產生、安裝、切換與驗證都透過同一 preset resolver；既有測試已涵蓋 snapshots 與 installer rollback。

## Goals / Non-Goals

沿用既有資料映射與產生流程，透過 public CLI 驗收。此變更不重裝現有 agents，也不更改發布版本或其已發布檔案。

## Decisions

- 在 `src/core/presets.ts` 新增明確的 `openai-6` 映射並移動兩個 aliases；不改寫 GPT-5.6 映射，符合一世代一 ID 的既有規則。
- 保留 GPT-5.6 effort，包括 Council Root profile 的 `medium`。模型名稱嚴格使用使用者指定值。
- 保留 README 的 `0.4.4` 套件安裝指令，另更新原始碼入口並說明 GPT-6 尚未隨該歷史版本發布。

## Risks / Trade-offs

- 改變 aliases 會影響未指定 preset 的新操作 → 透過 CLI 的預覽、生成、安裝、切換及驗證測試確認結果。
- 套件 smoke 不證明帳號模型權限或 live 模型行為 → 驗收限於生成設定與實際封裝安裝，不宣稱外部模型驗收。
