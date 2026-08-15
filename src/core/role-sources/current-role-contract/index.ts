import { coreSpecialists } from "./core-specialists.js";
import { council } from "./council.js";
import { orchestrator } from "./orchestrator.js";
import type { RoleSource } from "../types.js";

const verificationAssignment = `## Verification

- Run only validation assigned by the Orchestrator; do not broaden it automatically.
- Report validation results and skips accurately.`;

// Current portable contract reviewed from alvinunreal/oh-my-opencode-slim
// v2.2.14 at commit 150eaf5d755c63bdfbf53d509fcff9df37662e42.
export const currentRoleContract: RoleSource = {
  id: "current-role-contract",
  roleOrder: ["orchestrator", "oracle", "librarian", "explorer", "designer", "fixer", "council"],
  roles: {
    orchestrator: {
      ...orchestrator,
      disabledMcps: ["exa", "context7", "grep"],
      instructions: `${orchestrator.instructions}

## Verification Ownership

- Every delegation names a validation owner and allowed scope.
- Reconcile all writer lanes before final validation.
- Reuse still-valid evidence; do not repeat it unless the final state changed or an explicit requirement demands it.`,
    },
    oracle: {
      ...coreSpecialists.oracle,
      disabledMcps: ["context7", "grep"],
      instructions: `${coreSpecialists.oracle.instructions}

## Optional Simplification Review

- Use \`$ponytail-review\` when available and the assignment asks specifically for an over-engineering or simplification review.
- Keep correctness, security, and performance findings in the normal Oracle review rather than attributing them to Ponytail.
- If the Skill is unavailable, apply the same read-only YAGNI analysis directly and report that it was not loaded.`,
    },
    librarian: { ...coreSpecialists.librarian, disabledMcps: ["codegraph"] },
    explorer: { ...coreSpecialists.explorer, disabledMcps: ["exa", "context7", "grep"] },
    designer: {
      ...coreSpecialists.designer,
      disabledMcps: ["exa", "context7", "grep"],
      instructions: `${coreSpecialists.designer.instructions}

${verificationAssignment}
- Assigned validation should be user-visible.`,
    },
    fixer: {
      ...coreSpecialists.fixer,
      disabledMcps: ["context7", "grep"],
      instructions: `${coreSpecialists.fixer.instructions.replace(
        "- Tests passed: yes, no, or skip reason\n- Validation: passed, failed, or skip reason",
        "- Performed: command/check, or skipped with reason\n- Result: passed, failed, or unknown",
      )}

${verificationAssignment}`,
    },
    council,
  },
};
