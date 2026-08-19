## 1. 移植 Codex-native specialist lifecycle 契約

**Blocked by:** None — can start immediately.

**What it delivers:** Generated Orchestrator 與 packaged `slim-orchestration` 同時具備可驗收的 non-polling wait、保守訊息確認、有限制的 interruption、retained-context resume，以及取消後仍須完成 review／validation 的行為。

- [x] 1.1 在 public preset generation seam 新增失敗中的 lifecycle contract assertions，涵蓋 status／wait、不重複 dispatch、message acknowledgement、interruption reconciliation、resume 與 surviving obligations。
- [x] 1.2 在 packaged managed Skill seam 新增失敗中的 lifecycle workflow assertions，且不新增 test-only interface。
- [x] 1.3 以最小變更更新 Current Role Contract 與 `slim-orchestration`，使用 Codex native collaboration tool 語意並排除 OpenCode runtime vocabulary。
- [x] 1.4 執行兩個 focused seams，確認 lifecycle assertions 通過、既有 routing／single-writer／phase-gate 行為未退化，並記錄精確結果。

## 2. 產生可追溯的 2.2.15 maintenance package

**Blocked by:** Ticket 1 — 移植 Codex-native specialist lifecycle 契約。

**What it delivers:** 新 Package Version、2.2.15／完整 commit provenance、兩個 unsuffixed preset snapshots 與 manifests 一致更新，並具備完整 package 級驗證證據。

- [x] 2.1 在 public preset generation seam 新增失敗中的 provenance assertions，驗證兩個 manifests 使用相同的 `2.2.15` 與完整 upstream commit，且 model mappings 不變。
- [x] 2.2 將 same-generation maintenance 發布邊界更新為 Package Version `0.4.1`，同步 generator 與 concise role-source provenance，不新增 Preset ID、角色、模型 mapping 或 dependency。
- [x] 2.3 透過現有 generator 重新產生 `openai-5.5` 與 `openai-5.6` committed snapshots，確認 manifests 與 lifecycle-aware agent outputs 一致且 aliases 不變。
- [x] 2.4 執行 focused contract tests、public CLI snapshot check、完整 tests、build、`git diff --check` 與 strict OpenSpec validation，分開報告每一層結果與任何 skip。
- [x] 2.5 依 originating specs 完成 code review 與 over-engineering review，修正必要 findings，並確認最終 diff 未引入任何列為 out of scope 的 OpenCode runtime 功能。
