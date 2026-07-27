import { coreSpecialists } from "./core-specialists.js";
import { council } from "./council.js";
import { orchestrator } from "./orchestrator.js";
import type { RoleSource } from "../types.js";

// Reviewed from alvinunreal/oh-my-opencode-slim v2.2.8 at
// commit 1c0e1f4abe217b6965997201c37ff1de6720c13d.
export const slimCodexUpstream228RoleSource: RoleSource = {
  id: "slim-codex-upstream-2.2.8",
  roleOrder: ["orchestrator", "oracle", "librarian", "explorer", "designer", "fixer", "council"],
  roles: { orchestrator, ...coreSpecialists, council },
};
