export type Effort = "low" | "medium" | "high" | "xhigh";
export type Sandbox = "read-only" | "workspace-write";

export interface Role {
  name: string;
  description: string;
  sandbox: Sandbox;
  instructions: string;
  disabledMcps?: readonly string[];
}

export interface RoleSource {
  id: string;
  roleOrder: readonly string[];
  roles: Record<string, Role>;
}

export const role = (name: string, description: string, sandbox: Sandbox, instructions: string): Role => ({ name, description, sandbox, instructions });
