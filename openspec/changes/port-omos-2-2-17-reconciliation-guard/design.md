## Context

動機見 `proposal.md`。目前 Current Role Contract 與 managed `slim-orchestration` Skill 已要求等待 non-terminal lane、保守解讀 message delivery、有限制地 interruption，以及在完成前 reconciliation 所有 required lanes；缺口只存在於 terminal result 已產生但尚未被 Root subtree 整合的短暫區間。

兩個 supported Preset ID 共用同一份 Current Role Contract，Package Version 才是 exact generated configuration 的歷史邊界。Codex 已提供 native collaboration controls，因此設計必須維持 prompt／Skill policy adapter，不建立 OpenCode task runtime 的本地複製品。

## Problem Statement

從使用者角度看，specialist 顯示 terminal 不代表其 findings、partial edits 或 validation evidence 已被 Orchestrator 讀取並整合。若 Orchestrator 在 reconciliation 前再次派出相同 objective，會重複工作、產生 overlapping writer 風險，並讓後續 completion claim 難以追溯。

## Solution

讓 generated Orchestrator 與 managed orchestration Skill 明確把 terminal-but-unreconciled lane 視為仍未解決：在結果完成 reconciliation 前不得重新派出相同 objective；完成 reconciliation 後，若 approved work 仍未完成，才可依既有 retained-context 與 replacement 規則繼續。

## User Stories

1. As a Codex user, I want a terminal specialist result reconciled before the same work is dispatched again, so that I do not pay for duplicate work.
2. As a Codex user, I want terminal status separated from integrated completion, so that progress reports remain truthful.
3. As a maintainer, I want partial shared-worktree effects inspected before redispatch, so that overlapping writers do not compound inconsistent edits.
4. As an Orchestrator, I want an unreconciled objective to remain unresolved, so that terminal transport state does not erase pending integration work.
5. As an Orchestrator, I want legitimate retry preserved after reconciliation, so that a failed or incomplete specialist result does not permanently block progress.
6. As an Orchestrator, I want retained specialist context preferred when suitable, so that continuation does not restart discovery unnecessarily.
7. As a reviewer, I want required validation and review evidence reconciled before completion, so that redispatch cannot conceal a missing gate.
8. As a preset user, I want GPT-5.5 and GPT-5.6 presets to apply the same lifecycle policy, so that switching model generations does not change coordination safety.
9. As a package consumer, I want the Package Version to identify this policy revision, so that exact generated output remains reproducible.
10. As a maintainer, I want manifests to identify the reviewed 2.2.17 source commit, so that the portable policy has auditable provenance.
11. As a maintainer, I want OpenCode-only runtime changes excluded, so that the Codex adapter stays small and host-native.
12. As a tester, I want the policy verified at public generation and packaged Skill seams, so that internal prose organization can change without weakening the contract.

## Goals / Non-Goals

**Goals:**

- 補齊 terminal-but-unreconciled 防重複派工語意。
- 保留 reconciliation 後的 bounded retry／continuation。
- 讓兩個 generated presets 與 packaged Skill 使用一致政策。
- 以新 Package Version 與 2.2.17 full commit 記錄 exact output provenance。

**Non-Goals:**

- 實作 objective fingerprint、persistent job board、lease、generation fencing 或 scheduler。
- 改動 role set、Preset ID、model mapping、effort mapping 或 sandbox policy。
- 移植 tool-loop guard、TUI、tmux、smartfetch、OpenCode v2 adapter 或 provider preset。
- 把同分支上的 BOM installer one-shot 修正納入本 lifecycle capability 的 acceptance contract。

## Implementation Decisions

- 在既有 Current Role Contract 與 managed orchestration Skill 各補一條相同的行為規則。兩者責任不同且都會獨立安裝；不為兩段 prose 建立共用 renderer 或新 module。
- 以「相同 approved objective」描述防重複派工，不新增文字 normalization、hash 或 task identity 演算法。Codex native agent identity 與 Orchestrator 的 execution ledger 已是既有協調邊界。
- Reconciliation 包含 terminal result、findings、validation evidence，以及 shared-worktree effects；terminal status 本身只是必要條件，不是 completion 或 redispatch authorization。
- Reconciliation 後沿用既有 `followup_task`／replacement 規則。新契約只關閉未整合結果前的重複派工窗口，不創造永久 tombstone。
- 保持 OpenCode runtime vocabulary 不進入 generated instructions。2.2.17 僅作 portable behavior 與 audit provenance 的來源。
- 以 Package Version `0.4.2` 發布 same-generation policy maintenance；保留 `openai-5.5`、`openai-5.6`、`latest` 與 `recommended` 的既有 selector 行為。

替代方案是移植上游 Background Job Board 與 objective comparison。此方案能在 runtime 強制阻擋，但 Codex 已有 native lifecycle controls，而且本 package 不擁有 agent scheduler；增加 runtime state 只會形成第二套不可靠的協調系統，因此不採用。

## Testing Decisions

- 第一個 seam 是 public preset generation。驗證兩個 supported presets 產生相同的 terminal-before-reconciliation guard、保留 reconciliation 後 retry，且不含 OpenCode runtime vocabulary。
- 第二個 seam 是 packaged managed `slim-orchestration` Skill。直接讀取 package artifact，驗證同一 guard 與 retry boundary 存在。
- Provenance 與 unchanged model mappings 沿用既有 generator contract tests；expected version／full commit 使用 release tag 的固定 literal，不從 implementation 重新計算。
- Committed snapshot check 證明 generator 與 package artifacts 一致，但不把 snapshot 本身當作第三個行為 seam。
- 測試只斷言必要行為與禁止語意，不做整份 prompt snapshot，以免純文字重排造成無關失敗。

## Risks / Trade-offs

- [Risk] Prompt policy 無法像 runtime hook 一樣強制阻擋每次 dispatch。→ Mitigation：同時覆蓋 generated role 與 managed Skill，並在 public seams 鎖定必要語意。
- [Risk] 兩個 prose surfaces 可能漂移。→ Mitigation：同一組 contract tests 分別驗證兩個 packaged surfaces。
- [Risk] 「相同 objective」需要 Orchestrator 判斷。→ Mitigation：沿用 approved objective 與 execution ledger 語意，不引入容易誤判的字串演算法。
- [Trade-off] 更新 provenance 會改動兩個 committed manifests，即使 model mappings 不變。→ Mitigation：以 Package Version `0.4.2` 作 exact output 邊界並執行 deterministic snapshot check。

## Migration Plan

1. 先在兩個既有 public seams 加入失敗中的 reconciliation guard assertions。
2. 最小更新 Current Role Contract 與 managed Skill，讓 focused tests 通過。
3. 更新 Package Version 與 2.2.17 provenance，重產兩個 supported preset snapshots。
4. 執行 focused tests、完整 tests、typecheck、build、snapshot check、package dry run、`git diff --check` 與 strict OpenSpec validation。
5. 依既有 preview、backup、post-validation installer 流程安裝或切換新 package。

Rollback 使用上一個 Package Version 或 Git tag，恢復原本的 generated role contract 與 manifests；沒有資料或 runtime migration。

## Out of Scope

OpenCode Background Job Board、task hooks、tool result transport、wait-for-user guard、wake scheduler、tool-loop guard、TUI、tmux、smartfetch、provider presets、objective normalization，以及任何新的 Codex runtime integration。

## Further Notes

這個 OpenSpec change 是 `$to-spec` synthesis 的 institutional record。Tasks 仍須依 `to-tickets` 拆成可獨立驗證的 vertical slices 並另行核准，不能由 planning artifacts 推定 implementation 已完成。
