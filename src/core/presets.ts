export type Effort = "low" | "medium" | "high";
export type Sandbox = "read-only" | "workspace-write";

export interface Role {
  name: string;
  description: string;
  sandbox: Sandbox;
  instructions: string;
}

export interface Preset {
  id: string;
  adapter: "oh-my-opencode-slim";
  sourceVersion: string;
  status: "supported" | "deprecated";
  models: Record<string, { model: string; effort: Effort }>;
}

const role = (name: string, description: string, sandbox: Sandbox, instructions: string): Role => ({ name, description, sandbox, instructions });

export const roles: Record<string, Role> = {
  orchestrator: role("orchestrator", "Workflow coordinator for planning, bounded delegation, reconciliation, and verification.", "workspace-write", "Build a short work graph, separate independent and dependent lanes, prevent overlapping writers, delegate bounded work, reconcile every result, and verify observable success. Preserve intentional design decisions and report skipped checks honestly. Do not impersonate the root task agent."),
  oracle: role("oracle", "Read-only strategic advisor for architecture, difficult debugging, risk, simplification, and code review.", "read-only", "Analyze architecture, root causes, correctness, performance, security, data integrity, maintainability, simplification, and YAGNI. Cite files and lines, explain trade-offs, and state assumptions or uncertainty. Advise; do not implement."),
  librarian: role("librarian", "Read-only specialist for current official documentation, authoritative sources, and library research.", "read-only", "Prioritize current primary documentation and authoritative sources. Distinguish official guidance from community practice and inference, provide links and concise evidence, and call out version sensitivity. Do not implement or guess."),
  explorer: role("explorer", "Fast read-only codebase reconnaissance; locates files, symbols, patterns, and relevant lines.", "read-only", "Choose filename, text, or structural search according to the question. Search thoroughly but report concise absolute paths, line numbers, short snippets, and a direct answer. Do not modify files; distinguish evidence from inference."),
  designer: role("designer", "UI/UX design, review, and implementation specialist for user-visible quality and polish.", "workspace-write", "Respect existing design systems, frameworks, component libraries, accessibility, conventions, and scope. Own hierarchy, typography, color, spacing, responsiveness, interaction, motion, affordances, and polish. Use grounded wording and validate what users see."),
  fixer: role("fixer", "Bounded implementation specialist; executes clear specifications without research or architectural expansion.", "workspace-write", "Implement only the supplied bounded specification. Read before editing, match existing patterns, and do not research externally, delegate, redesign architecture, or expand requirements. Run applicable checks and report changes and every skipped check."),
  council: role("council", "Read-only coordinator for multiple independent perspectives on high-stakes decisions.", "read-only", "For high-stakes decisions, gather two or three independent assessments when collaboration allows. Preserve each result, resolve disagreements explicitly, and output Council Response, Perspective Details, Council Summary, and confidence. Never claim provider diversity."),
  observer: role("observer", "Read-only visual specialist for images, screenshots, PDFs, diagrams, and exact visible text.", "read-only", "Analyze specified visual files only. Extract visible error messages, code, labels, and text exactly when possible; compare files when asked; distinguish facts from uncertainty; never guess or modify files."),
};

const mapping = (pairs: Record<string, [string, Effort]>): Preset["models"] => Object.fromEntries(Object.entries(pairs).map(([name, [model, effort]]) => [name, { model, effort }]));

export const presets: Record<string, Preset> = {
  "openai-5.5": { id: "openai-5.5", adapter: "oh-my-opencode-slim", sourceVersion: "reviewed-2026-07", status: "supported", models: mapping({ orchestrator: ["gpt-5.5", "medium"], oracle: ["gpt-5.5", "high"], librarian: ["gpt-5.4-mini", "low"], explorer: ["gpt-5.4-mini", "low"], designer: ["gpt-5.4-mini", "medium"], fixer: ["gpt-5.5", "low"], council: ["gpt-5.5", "high"], observer: ["gpt-5.4-mini", "low"] }) },
  "openai-5.6": { id: "openai-5.6", adapter: "oh-my-opencode-slim", sourceVersion: "reviewed-2026-07", status: "supported", models: mapping({ orchestrator: ["gpt-5.6-terra", "medium"], oracle: ["gpt-5.6-sol", "high"], librarian: ["gpt-5.6-luna", "low"], explorer: ["gpt-5.6-luna", "low"], designer: ["gpt-5.6-luna", "medium"], fixer: ["gpt-5.6-luna", "medium"], council: ["gpt-5.6-sol", "high"], observer: ["gpt-5.6-luna", "low"] }) },
};

export const aliases = { latest: "openai-5.6", recommended: "openai-5.6" } as const;
export const roleOrder = ["orchestrator", "oracle", "librarian", "explorer", "designer", "fixer", "council", "observer"];

export function resolvePreset(idOrAlias: string): Preset {
  const id = (aliases as Record<string, string>)[idOrAlias] ?? idOrAlias;
  const preset = presets[id];
  if (!preset) throw new Error(`Unknown preset: ${idOrAlias}`);
  if (Object.keys(preset.models).length !== roleOrder.length || roleOrder.some((name) => !preset.models[name])) throw new Error(`Preset ${id} must map all eight roles`);
  return preset;
}

const quote = (value: string) => JSON.stringify(value);
const multiline = (value: string) => `"""\n${value.replaceAll('"""', '\\"\\"\\"')}\n"""`;

export function generatePreset(idOrAlias: string) {
  const preset = resolvePreset(idOrAlias);
  const agents: Record<string, string> = {};
  for (const name of roleOrder) {
    const current = roles[name];
    const model = preset.models[name];
    agents[name] = `name = ${quote(current.name)}\ndescription = ${quote(current.description)}\nmodel = ${quote(model.model)}\nmodel_reasoning_effort = ${quote(model.effort)}\nsandbox_mode = ${quote(current.sandbox)}\ndeveloper_instructions = ${multiline(current.instructions)}\n`;
  }
  const snippet = `[agents]\nmax_threads = 6\nmax_depth = 2\n\n` + roleOrder.map((name) => `[agents.${name}]\ndescription = ${quote(roles[name].description)}\nconfig_file = ${quote(`agents/slim-agents-for-codex/${preset.id}/${name}.toml`)}\n`).join("\n");
  return { preset, roles, agents, snippet };
}
