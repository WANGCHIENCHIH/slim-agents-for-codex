## 1. 補齊 terminal result reconciliation 防重複派工契約

**Blocked by:** None — can start immediately.

**What it delivers:** Generated Orchestrator 與 packaged `slim-orchestration` 都會把 terminal-but-unreconciled objective 視為尚未完成；完成 reconciliation 前不得重新派工，完成後仍保留 bounded retry／continuation。

- [x] 1.1 在 public preset generation seam 新增失敗中的 contract assertions，驗證 terminal-but-unreconciled objective 不得重複派工、reconciliation 後仍可 bounded retry，並以 focused test 證明 assertions 在 implementation 前會失敗。
- [x] 1.2 在 packaged managed Skill seam 新增相同的失敗中 assertions，且不建立新的 test-only interface；以 focused test 證明 Skill 尚未提供完整契約。
- [x] 1.3 最小更新 Current Role Contract 與 managed `slim-orchestration`，保留既有 lifecycle controls 並排除 OpenCode runtime vocabulary；以兩個 focused seams 全數通過驗證完成。
- [x] 1.4 檢查兩個 packaged surfaces 的最終文字與測試 diff，確認沒有 objective normalization、runtime tracker 或其他超出 design 的實作，並以 `git diff --check` 驗證文字與格式。

## 2. 發布可追溯的 2.2.17 maintenance package

**Blocked by:** Ticket 1 — 補齊 terminal result reconciliation 防重複派工契約。

**What it delivers:** Package Version `0.4.2`、2.2.17 full commit provenance、兩個 regenerated unsuffixed preset snapshots，以及完整 package-level verification。

- [x] 2.1 在既有 generator contract seam 新增失敗中的 provenance assertions，驗證兩個 manifests 使用 `2.2.17` commit `7ea8f3ef95ec9c6be565446932c8ad8ee353e9d1`，且 Preset IDs、aliases、roles 與 model／effort mappings 不變。
- [x] 2.2 將 Package Version 更新為 `0.4.2`，同步 generator 與 concise role-source provenance，並以 focused contract tests 驗證 exact output identity 未新增 selector 或 dependency。
- [x] 2.3 透過既有 generator 重產 `openai-5.5` 與 `openai-5.6` committed snapshots，並以 snapshot check 驗證兩個 manifests 與 lifecycle-aware agent outputs 和 generator 一致。
- [x] 2.4 執行完整 tests、typecheck、build、snapshot check、package dry run、`git diff --check` 與 strict OpenSpec validation，逐項記錄 passed、failed 或 skipped evidence。

**Evidence (2026-08-29):**

- `npm.cmd test`: passed — 3 test files, 54 tests。
- `npm.cmd run typecheck`: passed。
- `npm.cmd run build`: passed。
- `npm.cmd run snapshots`: passed — `openai-5.5`、`openai-5.6` 與 `aliases.json` 均符合 generator。
- `npm.cmd run pack:check`: passed — dry-run package `slim-agents-for-codex@0.4.2`，55 entries。
- `git diff --check`: passed。
- `openspec validate "port-omos-2-2-17-reconciliation-guard" --strict`: passed。

- [x] 2.5 依 originating specs 完成 code review 與 over-engineering review，修正必要 findings，並確認最終 diff 未移植 proposal 所列的 OpenCode-only runtime 功能。

**Review evidence (2026-08-29):**

- Standards axis: passed — 無 documented-standard violation 或 baseline smell。
- Spec axis: passed — task 2.4 evidence P2 已修正並通過 targeted re-review，無其他 finding。
- Ponytail review: `Lean already. Ship.`
- OpenCode-only runtime scope search: passed — implementation diff 未包含 task-session、Background Job Board、tool-loop、TUI、tmux、smartfetch、provider 或 objective normalization 實作。
