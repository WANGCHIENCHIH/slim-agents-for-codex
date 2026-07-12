# slim-agents-for-codex

Deterministic, reviewed Codex agent presets adapted from `oh-my-opencode-slim`. This community project is not affiliated with OpenAI or the upstream project.

## Quick start

```bash
npx slim-agents-for-codex list-presets
npx slim-agents-for-codex convert --preset openai-5.6 --output generated
npx slim-agents-for-codex install --preset openai-5.6
```

`install` previews the resolved immutable preset, config path, and backup path before asking for confirmation. Use `--yes` only for explicit non-interactive installation. Override the target with `--codex-home PATH`.

## Manual installation

Every npm package and source checkout includes ready-to-copy files under `presets/<id>/agents/` and `config.snippet.toml`. Copy the nine TOMLs under your `CODEX_HOME/agents/slim-agents-for-codex/<preset-id>/` directory, then merge the snippet into `config.toml`. Preserve its UTF-8 encoding, BOM state, and line endings, and make a backup first.

Do not place inactive legacy presets under `CODEX_HOME/agents/`: Codex recursively discovers TOML roles there. Store inactive copies under `CODEX_HOME/agent-presets/` instead.

## Preset lifecycle

Preset IDs are immutable. `openai-5.5` and `openai-5.6` remain available when newer presets are added. `latest` and `recommended` are movable aliases defined in `presets/aliases.json`; the CLI always displays the resolved immutable ID before writing. There is no automatic model fallback.

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
