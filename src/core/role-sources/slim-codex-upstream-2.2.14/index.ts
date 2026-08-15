import { slimCodexUpstream228RoleSource } from "../slim-codex-upstream-2.2.8/index.js";
import type { RoleSource } from "../types.js";

const verificationAssignment = `## Verification

- Run only validation assigned by the Orchestrator; do not broaden it automatically.
- Report validation results and skips accurately.`;

const designer = slimCodexUpstream228RoleSource.roles.designer;
const fixer = slimCodexUpstream228RoleSource.roles.fixer;
const orchestrator = slimCodexUpstream228RoleSource.roles.orchestrator;

// Reviewed from alvinunreal/oh-my-opencode-slim v2.2.14 at
// commit 150eaf5d755c63bdfbf53d509fcff9df37662e42. Only portable Codex role
// changes are adapted; OpenCode task, scheduler, and multiplexer behavior is excluded.
export const slimCodexUpstream2214RoleSource: RoleSource = {
  id: "slim-codex-upstream-2.2.14",
  roleOrder: slimCodexUpstream228RoleSource.roleOrder,
  roles: {
    ...slimCodexUpstream228RoleSource.roles,
    orchestrator: {
      ...orchestrator,
      instructions: `${orchestrator.instructions}

## Verification Ownership

- Every delegation names a validation owner and allowed scope.
- Reconcile all writer lanes before final validation.
- Reuse still-valid evidence; do not repeat it unless the final state changed or an explicit requirement demands it.`,
    },
    designer: {
      ...designer,
      instructions: `${designer.instructions}

${verificationAssignment}
- Assigned validation should be user-visible.`,
    },
    fixer: {
      ...fixer,
      instructions: `${fixer.instructions.replace(
        "- Tests passed: yes, no, or skip reason\n- Validation: passed, failed, or skip reason",
        "- Performed: command/check, or skipped with reason\n- Result: passed, failed, or unknown",
      )}

${verificationAssignment}`,
    },
  },
};
