import { reviewed202607RoleSource } from "./role-sources/reviewed-2026-07.js";
import { slimCodex202607RoleSource } from "./role-sources/slim-codex-2026-07/index.js";
import type { Effort, Role, RoleSource } from "./role-sources/types.js";

export type { Effort, Role } from "./role-sources/types.js";

export interface Preset {
  id: string;
  adapter: "oh-my-opencode-slim";
  adapterSchemaVersion: 1 | 2;
  source: "alvinunreal/oh-my-opencode-slim";
  sourceVersion: string;
  created: string;
  status: "supported" | "deprecated";
  snapshotFormatVersion: 1;
  models: Record<string, { model: string; effort: Effort }>;
}

const roleSources: Record<string, RoleSource> = {
  [reviewed202607RoleSource.id]: reviewed202607RoleSource,
  [slimCodex202607RoleSource.id]: slimCodex202607RoleSource,
};

const mapping = (pairs: Record<string, [string, Effort]>): Preset["models"] => Object.fromEntries(Object.entries(pairs).map(([name, [model, effort]]) => [name, { model, effort }]));

export const presets: Record<string, Preset> = {
  "openai-5.5": { id: "openai-5.5", adapter: "oh-my-opencode-slim", adapterSchemaVersion: 1, source: "alvinunreal/oh-my-opencode-slim", sourceVersion: "reviewed-2026-07", created: "2026-07-12", status: "supported", snapshotFormatVersion: 1, models: mapping({ orchestrator: ["gpt-5.5", "medium"], oracle: ["gpt-5.5", "high"], librarian: ["gpt-5.4-mini", "low"], explorer: ["gpt-5.4-mini", "low"], designer: ["gpt-5.4-mini", "medium"], fixer: ["gpt-5.5", "low"], council: ["gpt-5.5", "high"], observer: ["gpt-5.4-mini", "low"] }) },
  "openai-5.6": { id: "openai-5.6", adapter: "oh-my-opencode-slim", adapterSchemaVersion: 1, source: "alvinunreal/oh-my-opencode-slim", sourceVersion: "reviewed-2026-07", created: "2026-07-12", status: "supported", snapshotFormatVersion: 1, models: mapping({ orchestrator: ["gpt-5.6-terra", "medium"], oracle: ["gpt-5.6-sol", "high"], librarian: ["gpt-5.6-luna", "low"], explorer: ["gpt-5.6-luna", "low"], designer: ["gpt-5.6-luna", "medium"], fixer: ["gpt-5.6-luna", "medium"], council: ["gpt-5.6-sol", "high"], observer: ["gpt-5.6-luna", "low"] }) },
  "openai-5.5.1": { id: "openai-5.5.1", adapter: "oh-my-opencode-slim", adapterSchemaVersion: 2, source: "alvinunreal/oh-my-opencode-slim", sourceVersion: "slim-codex-2026-07", created: "2026-07-14", status: "supported", snapshotFormatVersion: 1, models: mapping({ orchestrator: ["gpt-5.5", "medium"], oracle: ["gpt-5.5", "high"], librarian: ["gpt-5.4-mini", "low"], explorer: ["gpt-5.4-mini", "low"], designer: ["gpt-5.4-mini", "medium"], fixer: ["gpt-5.5", "low"], council: ["gpt-5.5", "high"] }) },
  "openai-5.6.1": { id: "openai-5.6.1", adapter: "oh-my-opencode-slim", adapterSchemaVersion: 2, source: "alvinunreal/oh-my-opencode-slim", sourceVersion: "slim-codex-2026-07", created: "2026-07-14", status: "supported", snapshotFormatVersion: 1, models: mapping({ orchestrator: ["gpt-5.6-terra", "medium"], oracle: ["gpt-5.6-sol", "high"], librarian: ["gpt-5.6-luna", "low"], explorer: ["gpt-5.6-luna", "low"], designer: ["gpt-5.6-luna", "medium"], fixer: ["gpt-5.6-luna", "medium"], council: ["gpt-5.6-sol", "high"] }) },
};

export const aliases = { latest: "openai-5.6.1", recommended: "openai-5.6.1" } as const;
export const roles = slimCodex202607RoleSource.roles;
export const roleOrder = [...slimCodex202607RoleSource.roleOrder];
export const managedRoleNames = [...new Set(Object.values(roleSources).flatMap((source) => source.roleOrder))];

const disabledMcpsByRole: Record<string, readonly string[]> = {
  librarian: ["codegraph"],
  orchestrator: ["exa", "context7", "grep", "codegraph"],
  explorer: ["exa", "context7", "grep"],
  designer: ["exa", "context7", "grep"],
  oracle: ["context7", "grep"],
  fixer: ["context7", "grep"],
};

function sourceFor(preset: Preset): RoleSource {
  const source = roleSources[preset.sourceVersion];
  if (!source) throw new Error(`Unknown role source: ${preset.sourceVersion}`);
  return source;
}

export function resolvePreset(idOrAlias: string): Preset {
  const id = (aliases as Record<string, string>)[idOrAlias] ?? idOrAlias;
  const preset = presets[id];
  if (!preset) throw new Error(`Unknown preset: ${idOrAlias}`);
  const expected = [...sourceFor(preset).roleOrder].sort();
  const actual = Object.keys(preset.models).sort();
  if (actual.length !== expected.length || actual.some((name, index) => name !== expected[index])) throw new Error(`Preset ${id} must map exactly ${expected.length} roles from ${preset.sourceVersion}`);
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
  const source = sourceFor(preset);
  const agents: Record<string, string> = {};
  for (const name of source.roleOrder) {
    const current = source.roles[name] as Role;
    const model = preset.models[name];
    const deniedMcps = [...(disabledMcpsByRole[name] ?? [])].sort();
    const mcpPolicy = deniedMcps.length > 0 ? `\n\nMCP denylist: ${deniedMcps.join(", ")}. Do not use these MCP servers in this role.` : "";
    agents[name] = `name = ${quote(current.name)}\ndescription = ${quote(current.description)}\nmodel = ${quote(model.model)}\nmodel_reasoning_effort = ${quote(model.effort)}\nsandbox_mode = ${quote(current.sandbox)}\ndeveloper_instructions = ${multiline(current.instructions + mcpPolicy)}\n`;
  }
  const snippet = `[agents]\nmax_threads = 6\nmax_depth = 2\n\n` + source.roleOrder.map((name) => `[agents.${name}]\ndescription = ${quote(source.roles[name].description)}\nconfig_file = ${quote(`agents/${name}.toml`)}\n`).join("\n");
  const manifest = renderJson({
    id: preset.id,
    adapter: preset.adapter,
    adapterSchemaVersion: preset.adapterSchemaVersion,
    source: preset.source,
    sourceVersion: preset.sourceVersion,
    created: preset.created,
    status: preset.status,
    snapshotFormatVersion: preset.snapshotFormatVersion,
  });
  return { preset, roles: source.roles, roleOrder: [...source.roleOrder], agents, snippet, manifest };
}
