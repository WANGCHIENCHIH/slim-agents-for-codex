# slim-agents-for-codex

[繁體中文](README.zh-TW.md) | English

Deterministic, reviewed Codex agent presets adapted from [alvinunreal/oh-my-opencode-slim](https://github.com/alvinunreal/oh-my-opencode-slim). The original role concepts and behavior are the work of that project; this repository provides a Codex-specific adaptation. This community project is not affiliated with OpenAI or the upstream project.

For official guidance on subagent workflows, custom agent TOML files, model and reasoning settings, and global `[agents]` controls, see [Subagents | ChatGPT Learn](https://learn.chatgpt.com/docs/agent-configuration/subagents).

## Quick start

This project is distributed through GitHub rather than the npm registry.

### Install a GitHub Release package

Download `slim-agents-for-codex-0.1.1.tgz` from the matching GitHub Release, then run:

```bash
npm install --global ./slim-agents-for-codex-0.1.1.tgz
slim-agents-codex list-presets
```

### Run from a source checkout

```bash
npm ci
npm run build
node dist/cli.js list-presets
node dist/cli.js convert --preset openai-5.6 --output generated
node dist/cli.js install --preset openai-5.6
```

`install` previews the resolved immutable preset, config path, and backup path before asking for confirmation. Use `--yes` only for explicit non-interactive installation. Override the target with `--codex-home PATH`.

## Manual installation

Every npm package and source checkout includes ready-to-copy files under `presets/<id>/agents/` and `config.snippet.toml`. Copy the nine TOMLs under your `CODEX_HOME/agents/slim-agents-for-codex/<preset-id>/` directory, then merge the snippet into `config.toml`. Preserve its UTF-8 encoding, BOM state, and line endings, and make a backup first.

Do not place inactive legacy presets under `CODEX_HOME/agents/`: Codex recursively discovers TOML roles there. Store inactive copies under `CODEX_HOME/agent-presets/` instead.

## Preset lifecycle

Preset IDs are immutable. `openai-5.5` and `openai-5.6` remain available when newer presets are added. `latest` and `recommended` are movable aliases defined in `presets/aliases.json`; the CLI always displays the resolved immutable ID before writing. There is no automatic model fallback.

To add `openai-5.7` or a later generation, follow the [Adding a model preset maintenance guide](docs/adding-a-preset.md).

## Commands

- `list-presets`
- `convert --preset ID --output DIR`
- `convert --all --output DIR`
- `validate --path DIR`
- `install --preset ID [--codex-home DIR] [--yes]`
- `switch-preset --preset ID [--codex-home DIR] [--yes]`

Structural validation does not prove that an account is entitled to use a model. Start a new Codex task after changing global configuration.

## Development

```bash
npm install
npm test
npm run typecheck
npm run build
npm pack --dry-run
```

Requires Node.js 20 or newer.

## Maintenance status

This is a community, experimental project maintained on an as-needed basis. It does not promise immediate support for every new Codex model or configuration change. Preset IDs remain immutable: future model mappings should be added as new preset directories instead of replacing historical presets.

The package is intentionally marked private to prevent accidental publication to the npm registry. `npm pack` and installation from the resulting `.tgz` remain supported.
