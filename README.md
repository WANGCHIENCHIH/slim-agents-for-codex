# slim-agents-for-codex

[繁體中文](README.zh-TW.md) | English

Deterministic, reviewed Codex agent presets adapted from [alvinunreal/oh-my-opencode-slim](https://github.com/alvinunreal/oh-my-opencode-slim). The original role concepts and behavior are the work of that project; this repository provides a Codex-specific adaptation. This community project is not affiliated with OpenAI or the upstream project.

For official guidance on subagent workflows, custom agent TOML files, model and reasoning settings, and global `[agents]` controls, see [Subagents | ChatGPT Learn](https://learn.chatgpt.com/docs/agent-configuration/subagents).

## Quick start

This project is distributed through GitHub rather than the npm registry.

### Install a GitHub Release package

Download [slim-agents-for-codex-0.4.5.tgz](https://github.com/WANGCHIENCHIH/slim-agents-for-codex/releases/download/v0.4.5/slim-agents-for-codex-0.4.5.tgz) from the matching GitHub Release, then run:

```bash
npm install --global ./slim-agents-for-codex-0.4.5.tgz
slim-agents-codex list-presets
slim-agents-codex install --preset openai-6 --scope global
```

If a previous release is already installed, use `slim-agents-codex switch-preset --preset openai-6 --scope global` instead. The switch archives the managed agents and Skills it replaces before post-validating the new installation.

### Run from a source checkout

The `0.4.5` release and this checkout support GPT-6 through `openai-6`.

```bash
npm ci
npm run build
node dist/cli.js list-presets
node dist/cli.js convert --preset openai-6 --output generated
node dist/cli.js install --preset openai-6
```

For an existing installation, use `node dist/cli.js switch-preset --preset openai-6` instead of `install` to archive and replace its managed agents and Skills.

`install` previews the resolved Preset ID, config path, Skill path, and backup path before asking for confirmation. It installs both the selected agent preset and the three managed Slim Skills. Use `--scope global` for `CODEX_HOME` (or `~/.codex`) plus `$HOME/.agents/skills`, and `--scope project` for the current project's `.codex` plus `.agents/skills`. Explicit `--codex-home PATH` and `--skills-home PATH` options override those targets. Use `--yes` only for explicit non-interactive installation.

## Manual installation

Every release package and source checkout includes ready-to-copy files under `presets/<id>/agents/`, `config.snippet.toml`, and `.agents/skills/`. Copy every agent TOML from the selected preset into `CODEX_HOME/agents/` for a global installation or `<project>/.codex/agents/` for a project installation, then merge the snippet into the matching `config.toml`. Copy `slim-council`, `slim-goal-loop`, and `slim-orchestration` into `$HOME/.agents/skills/` globally or `<project>/.agents/skills/` for one repository. All supported presets contain the package's Current Role Contract of seven roles. Exact historical configurations belong to their historical package version or Git tag. In both scopes, `config_file = "agents/<role>.toml"` resolves relative to the config file that declares the role, as specified by the [Codex Configuration Reference](https://learn.chatgpt.com/docs/config-file/config-reference). Preserve UTF-8 encoding, BOM state, and line endings, and make backups first.

The CLI follows the same layout. Use `--scope global` for the global location or `--scope project` from a project root; use `--codex-home DIR` only when an explicit location is needed.

Do not place inactive legacy presets under `CODEX_HOME/agents/`: Codex recursively discovers TOML roles there. Store inactive copies under `CODEX_HOME/agent-presets/` instead.

## Preset lifecycle

The current source supports `openai-5.5`, `openai-5.6`, and `openai-6`, each naming an OpenAI model generation. All generate the same seven-role Current Role Contract; only model and effort mappings differ. `latest`, `recommended`, and commands without `--preset` use `openai-6`. See [Preset lifecycle](docs/preset-lifecycle.md) for the GPT-6 role mappings.

The exact output identity is `(Package Version, Preset ID)`. Same-generation prompt, policy, role, model, or effort maintenance changes the Package Version without adding a suffix ID. Retired IDs `openai-5.5.1` and `openai-5.6.1` through `openai-5.6.4` fail before writes and direct users to the unsuffixed ID or the corresponding historical package/tag. There is no automatic model fallback.

## Coordination model

Use a general Root Codex agent with `$slim-goal-loop` for goal work. Root owns the user request and final verification; the Skill coordinates Council and Orchestrator as peer child agents when their workflows are useful:

- `council` identifies the expertise needed, selects matching installed custom agents by description, and asks those direct child experts for independent feasibility, risk, and solution perspectives.
- `orchestrator` receives an agreed approach and implements it through the five fixed Slim specialists: `oracle`, `librarian`, `explorer`, `designer`, and `fixer`.

Council and Orchestrator never spawn each other. With `agents.max_depth = 2`, their selected experts are grandchildren of the root and cannot delegate again. Additional domain experts such as backend, security, database, Docker, CI/CD, or UI/UX agents can be installed as normal TOMLs under `.codex/agents/` or `CODEX_HOME/agents/`; Council selects only Root-approved advisory agents from the available descriptions. Council-member TOMLs should use `sandbox_mode = "read-only"`, and hard read-only deliberation also requires the parent turn to run with read-only permissions because Codex reapplies live permission overrides to subagents.

Some project-scoped expert agent configurations under `.codex/agents/` are adapted from [VoltAgent/awesome-codex-subagents](https://github.com/VoltAgent/awesome-codex-subagents). They remain subject to the upstream MIT License; see the bundled [license notice](.codex/agents/awesome-codex-subagents.LICENSE).

See [Slim Codex architecture](docs/slim-codex-architecture.md) for the runtime graph, Current Role Contract, Package Version boundary, and skill boundary.

See [Council expert agents](docs/council-expert-agents.md) for the minimal read-only custom-agent TOML, model inheritance policy, bulk model-update script, and parent-permission limitation.

The source checkout exposes three workflows: `.agents/skills/slim-orchestration/` for five-specialist execution, `.agents/skills/slim-council/` for task-specific expert deliberation, and `.agents/skills/slim-goal-loop/` for Root to coordinate a goal through acceptance. Release packages include all three directories, and `install` or `switch-preset` deploys them to the selected Skill scope. Manual copying remains supported. Start a new Codex task after installation.

### Use Slim Goal Loop

1. Use the [source checkout](#run-from-a-source-checkout), or a release package that contains `slim-goal-loop`, to install or update the agents and all three Skills. Older packages without this Skill must be updated; the source checkout includes it at `.agents/skills/slim-goal-loop/`.
2. Open a new Codex task in the target project with a general Root agent. Keep the installed child roles available.
3. Paste the following into the **Codex message input**, fill in the goal and observable acceptance criteria, and send it. This is a Skill invocation, not a terminal command. Scope constraints are optional.

```text
$slim-goal-loop
Goal: [the outcome you want]
Acceptance criteria:
1. [a result that can be checked in a file, command output, or user flow]
2. [another required result]
Scope constraints: [files to change, exclusions, or actions requiring approval]
```

For example, to improve this project's usage documentation:

```text
$slim-goal-loop
Goal: Add instructions for using this Skill to the English and Traditional Chinese READMEs.
Acceptance criteria:
1. Both READMEs explain prerequisites, where to paste the invocation, and how to write acceptance criteria.
2. Both include a copyable example and describe the same behavior and limitations.
Scope constraints: Update README.md and README.zh-TW.md only; preserve existing changes. Do not commit or publish.
```

Root checks the delivered work against each criterion and continues authorized work when gaps remain. Council provides advice when a material decision or risk needs review; Orchestrator handles execution that needs coordination. Routine documentation or small fixes can stay with Root under the existing orchestration rules, so every invocation does not necessarily call both coordinators.

If the Skill is unavailable, check that its folder is installed in the selected project or global Skill location, then open a new Codex task. If work pauses for a decision or permission, provide the requested input in the same task. To resume interrupted work, ask it to continue the same goal from the existing task record and recheck unfinished criteria. The Skill cannot wake a stopped host automatically or grant permission to commit, publish, or deploy.

To add another model generation, follow the [Adding a model preset maintenance guide](docs/adding-a-preset.md).

## Commands

- `list-presets`
- `convert --preset ID --output DIR`
- `convert --all --output DIR`
- `convert --all --output DIR --check`
- `validate --path DIR [--preset ID]`
- `validate --codex-home DIR --skills-home DIR [--preset ID]`
- `install --preset ID [--scope global|project] [--codex-home DIR] [--skills-home DIR] [--yes]`
- `switch-preset --preset ID [--scope global|project] [--codex-home DIR] [--skills-home DIR] [--yes]`

`convert --check` is non-mutating and fails when generated agent TOMLs, `config.snippet.toml`, manifests, or aliases differ from the committed snapshots. `validate --preset ID` compares parsed role semantics with the selected generator source; `validate --codex-home DIR` also resolves installed `agents/<role>.toml` paths from that directory's `config.toml` and requires `--skills-home DIR` so the exact packaged managed Skills cannot be skipped silently. Portable role files keep reviewed MCP denylists in `developer_instructions` and emit no partial `mcp_servers` tables, because standalone parsing and parent transport merging make partial or dummy transports invalid. `switch-preset` backs up the config before changing live agents or Skills, archives existing managed role files and managed Skills under `agent-presets/slim-agents-for-codex/`, removes inactive managed roles such as Observer, replaces only the three managed Slim Skills, preserves unrelated custom roles and Skills, and post-validates the installation. These checks do not prove model entitlement or hard MCP isolation. Start a new Codex task after changing agent configuration.

## Development

```bash
npm install
npm test
npm run typecheck
npm run build
npm pack --dry-run
npm run pack:smoke
```

Requires Node.js 20 or newer. After building, `pack:smoke` packs the checkout, installs it into a temporary directory, and validates the recommended preset and all three managed Skills. CI runs it on pushes and pull requests; release validation uses the same command with `-- path/to/package.tgz` to check the exact release archive. This does not verify live Codex model access or agent behavior.

## Maintenance status

This is a community, experimental project maintained on an as-needed basis. It does not promise immediate support for every new Codex model or configuration change. Preset IDs remain stable for a model generation. Same-generation contract or mapping maintenance ships as a new Package Version; adopting a new model generation adds one new unsuffixed Preset ID.

The package is intentionally marked private to prevent accidental publication to the npm registry. `npm pack` and installation from the resulting `.tgz` remain supported.
