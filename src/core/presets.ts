import packageJson from "../../package.json" with { type: "json" };
import { currentRoleContract } from "./role-sources/current-role-contract/index.js";
import type { Effort, Role } from "./role-sources/types.js";

export type { Effort, Role } from "./role-sources/types.js";

export interface Preset {
  id: string;
  adapter: "oh-my-opencode-slim";
  adapterSchemaVersion: 2;
  source: "alvinunreal/oh-my-opencode-slim";
  created: string;
  status: "supported";
  snapshotFormatVersion: 1;
  models: Record<string, { model: string; effort: Effort }>;
}

const mapping = (pairs: Record<string, [string, Effort]>): Preset["models"] => Object.fromEntries(Object.entries(pairs).map(([name, [model, effort]]) => [name, { model, effort }]));

export const presets: Record<string, Preset> = {
  "openai-5.5": { id: "openai-5.5", adapter: "oh-my-opencode-slim", adapterSchemaVersion: 2, source: "alvinunreal/oh-my-opencode-slim", created: "2026-07-12", status: "supported", snapshotFormatVersion: 1, models: mapping({ orchestrator: ["gpt-5.5", "medium"], oracle: ["gpt-5.5", "high"], librarian: ["gpt-5.4-mini", "low"], explorer: ["gpt-5.4-mini", "low"], designer: ["gpt-5.4-mini", "medium"], fixer: ["gpt-5.5", "low"], council: ["gpt-5.5", "high"] }) },
  "openai-5.6": { id: "openai-5.6", adapter: "oh-my-opencode-slim", adapterSchemaVersion: 2, source: "alvinunreal/oh-my-opencode-slim", created: "2026-07-12", status: "supported", snapshotFormatVersion: 1, models: mapping({ orchestrator: ["gpt-5.6-terra", "high"], oracle: ["gpt-5.6-sol", "high"], librarian: ["gpt-5.6-luna", "low"], explorer: ["gpt-5.6-luna", "low"], designer: ["gpt-5.6-luna", "medium"], fixer: ["gpt-5.6-luna", "high"], council: ["gpt-5.6-sol", "high"] }) },
};

export const aliases = { latest: "openai-5.6", recommended: "openai-5.6" } as const;
export const managedRoleNames = [...currentRoleContract.roleOrder, "observer"];

const retiredPresets: Record<string, string> = {
  "openai-5.5.1": "openai-5.5",
  "openai-5.6.1": "openai-5.6",
  "openai-5.6.2": "openai-5.6",
  "openai-5.6.3": "openai-5.6",
  "openai-5.6.4": "openai-5.6",
};

const rootProfileInstructions = {
  orchestrator: `You are the primary Root Orchestrator.

Always load and follow \`$slim-orchestration\` as the governing workflow.
Interpret references to Root in that skill as the user/owner approval boundary.
Because you are the primary agent, you own the final user response and overall
completion decision, but material product decisions remain with the user.

Do not spawn another orchestrator or council.
For routine work, follow the skill's instruction to execute directly.`,
  council: `You are the primary Root Council chair.

Always load and follow \`$slim-council\` as the governing workflow.
Interpret references to Root in that skill as the user/owner.
Return the Council report directly to the user.

Remain advisory-only: do not edit or implement.
Do not spawn orchestrator, council, or another meta-coordinator.
The user retains every approval and execution decision.`,
} as const;

export function resolvePreset(idOrAlias: string): Preset {
  const id = (aliases as Record<string, string>)[idOrAlias] ?? idOrAlias;
  const replacement = retiredPresets[id];
  if (replacement) throw new Error(`Retired preset: ${id}. Use ${replacement} for the current configuration; use the historical Package Version or Git tag for the exact historical configuration.`);
  const preset = presets[id];
  if (!preset) throw new Error(`Unknown preset: ${idOrAlias}`);
  const expected = [...currentRoleContract.roleOrder].sort();
  const actual = Object.keys(preset.models).sort();
  if (actual.length !== expected.length || actual.some((name, index) => name !== expected[index])) throw new Error(`Preset ${id} must map exactly ${expected.length} roles from the Current Role Contract`);
  return preset;
}

const quote = (value: string) => JSON.stringify(value);
const multiline = (value: string) => `"""\n${value.replaceAll('"""', '\\"\\"\\"')}\n"""`;
const renderJson = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;

export function renderAliases() {
  return renderJson(aliases);
}

export function generatePreset(idOrAlias: string) {
  const preset = resolvePreset(idOrAlias);
  const agents: Record<string, string> = {};
  for (const name of currentRoleContract.roleOrder) {
    const current = currentRoleContract.roles[name] as Role;
    const model = preset.models[name];
    const deniedMcps = [...(current.disabledMcps ?? [])].sort();
    const mcpPolicy = deniedMcps.length > 0 ? `\n\nMCP denylist: ${deniedMcps.join(", ")}. Do not use these MCP servers in this role.` : "";
    agents[name] = `name = ${quote(current.name)}\ndescription = ${quote(current.description)}\nmodel = ${quote(model.model)}\nmodel_reasoning_effort = ${quote(model.effort)}\nsandbox_mode = ${quote(current.sandbox)}\ndeveloper_instructions = ${multiline(current.instructions + mcpPolicy)}\n`;
  }
  const rootProfiles = Object.fromEntries(Object.entries(rootProfileInstructions).map(([name, instructions]) => {
    const model = preset.models[name];
    const effort = name === "council" ? "medium" : model.effort;
    return [name, `model = ${quote(model.model)}\nmodel_reasoning_effort = ${quote(effort)}\nsandbox_mode = ${quote(currentRoleContract.roles[name].sandbox)}\ndeveloper_instructions = ${multiline(instructions)}\n`];
  })) as Record<keyof typeof rootProfileInstructions, string>;
  const snippet = `[agents]\nmax_threads = 6\nmax_depth = 2\n\n` + currentRoleContract.roleOrder.map((name) => `[agents.${name}]\ndescription = ${quote(currentRoleContract.roles[name].description)}\nconfig_file = ${quote(`agents/${name}.toml`)}\n`).join("\n");
  const manifest = renderJson({
    packageVersion: packageJson.version,
    presetId: preset.id,
    adapter: preset.adapter,
    adapterSchemaVersion: preset.adapterSchemaVersion,
    source: preset.source,
    upstreamVersion: "2.2.14",
    upstreamCommit: "150eaf5d755c63bdfbf53d509fcff9df37662e42",
    created: preset.created,
    status: preset.status,
    snapshotFormatVersion: preset.snapshotFormatVersion,
  });
  return { preset, roles: currentRoleContract.roles, roleOrder: [...currentRoleContract.roleOrder], agents, rootProfiles, snippet, manifest };
}
