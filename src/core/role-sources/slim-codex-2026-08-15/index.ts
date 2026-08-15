import { slimCodexUpstream2214RoleSource } from "../slim-codex-upstream-2.2.14/index.js";
import type { RoleSource } from "../types.js";

const oracle = slimCodexUpstream2214RoleSource.roles.oracle;

export const slimCodex20260815RoleSource: RoleSource = {
  id: "slim-codex-2026-08-15",
  roleOrder: slimCodexUpstream2214RoleSource.roleOrder,
  roles: {
    ...slimCodexUpstream2214RoleSource.roles,
    oracle: {
      ...oracle,
      instructions: `${oracle.instructions}

## Optional Simplification Review

- Use \`$ponytail-review\` when available and the assignment asks specifically for an over-engineering or simplification review.
- Keep correctness, security, and performance findings in the normal Oracle review rather than attributing them to Ponytail.
- If the Skill is unavailable, apply the same read-only YAGNI analysis directly and report that it was not loaded.`,
    },
  },
};
