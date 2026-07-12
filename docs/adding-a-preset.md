# Adding a Model Preset

English | [繁體中文](adding-a-preset.zh-TW.md)

This guide explains how to add a new Codex preset when [alvinunreal/oh-my-opencode-slim](https://github.com/alvinunreal/oh-my-opencode-slim) introduces a new OpenAI configuration. It uses `openai-5.7` as an example.

## Determine the type of change

Compare the new upstream version with the previous one before editing this project:

- If only model names and reasoning effort values changed, add a new preset directly.
- If role prompts, the role list, or role behavior changed, do not edit the shared `roles` object directly. Version the role definitions by adapter or preset first.

Published presets such as `openai-5.5` and `openai-5.6` must remain reproducible. Adding a new generation must not rewrite or delete them.

## Current limitations

The CLI does not download or parse upstream configurations automatically. A maintainer must inspect the upstream version, verify its model names, effort values, and role changes, and then add the reviewed mapping to this repository.

The `convert` command currently generates the eight agent TOMLs and `config.snippet.toml`. It does not create `manifest.json` or update aliases.

## 1. Prepare a working copy

```bash
git clone https://github.com/WANGCHIENCHIH/slim-agents-for-codex.git
cd slim-agents-for-codex
npm ci
```

Confirm that the working tree is clean and make the change on a new branch.

## 2. Review the upstream configuration

Inspect the upstream configuration and role sources. Record:

- The upstream commit, tag, or review date.
- The model assigned to each of the eight roles.
- The reasoning effort assigned to each role.
- Whether prompts, the role list, or behavior changed.
- Whether Codex actually supports the mapped model names.

Do not infer `sol`, `terra`, `luna`, or any other model name from the version number. Do not add automatic fallback behavior. Model availability still depends on the user's account and current Codex support.

## 3. Add the preset mapping

Edit `src/core/presets.ts` and add a complete eight-role entry to `presets`:

```ts
"openai-5.7": {
  id: "openai-5.7",
  adapter: "oh-my-opencode-slim",
  sourceVersion: "reviewed-YYYY-MM",
  status: "supported",
  models: mapping({
    orchestrator: ["actual-model-name", "medium"],
    oracle: ["actual-model-name", "high"],
    librarian: ["actual-model-name", "low"],
    explorer: ["actual-model-name", "low"],
    designer: ["actual-model-name", "medium"],
    fixer: ["actual-model-name", "medium"],
    council: ["actual-model-name", "high"],
    observer: ["actual-model-name", "low"],
  }),
},
```

The effort values above illustrate the fields only. Use the reviewed upstream configuration as the source of truth.

Update the aliases in the same file:

```ts
export const aliases = {
  latest: "openai-5.7",
  recommended: "openai-5.7",
} as const;
```

## 4. Synchronize aliases and the manifest

Update `presets/aliases.json`:

```json
{
  "latest": "openai-5.7",
  "recommended": "openai-5.7"
}
```

Create `presets/openai-5.7/manifest.json`. You may use the previous manifest as a reference, but update its preset ID, source version, and review information. Do not modify an existing preset's manifest.

## 5. Generate the TOML snapshot

```bash
npm run build
node dist/cli.js convert --preset openai-5.7 --output presets
```

The result should contain:

```text
presets/openai-5.7/
├── agents/
│   ├── orchestrator.toml
│   ├── oracle.toml
│   ├── librarian.toml
│   ├── explorer.toml
│   ├── designer.toml
│   ├── fixer.toml
│   ├── council.toml
│   └── observer.toml
├── config.snippet.toml
└── manifest.json
```

Inspect the `model`, `model_reasoning_effort`, `sandbox_mode`, and `developer_instructions` fields in every TOML.

## 6. Verify the preset

```bash
node dist/cli.js validate --path presets/openai-5.7/agents
npm test
npm run typecheck
npm run build
npm run snapshots
npm pack --dry-run
```

Verify that:

- The new preset contains all eight roles.
- `openai-5.5`, `openai-5.6`, and every other historical preset remain present.
- `latest` and `recommended` resolve to `openai-5.7`.
- The package includes all new and historical presets.
- Structural validation is not described as proof that an account can use the models.

## 7. Update the project version

Update both `package.json` and `package-lock.json` according to the scope of the change:

- Adding a mapping without breaking an existing interface normally increments the minor version, for example from `0.1.1` to `0.2.0`.
- Do not overwrite a published preset to correct it. Create a new correction preset ID and choose a patch or minor package version according to the impact.

Update the Release package filename in both the English and Traditional Chinese READMEs.

## 8. Commit and release

```bash
git add .
git commit -m "feat: add openai-5.7 preset"
git push origin main
git tag -a v0.2.0 -m "slim-agents-for-codex v0.2.0"
git push origin v0.2.0
```

Pushing a `v*` tag makes GitHub Actions automatically:

1. Install dependencies.
2. Run tests, type checking, the build, and snapshot verification.
3. Run `npm pack`.
4. Generate a SHA-256 checksum.
5. Create or update the GitHub Release.
6. Upload the `.tgz` and `.sha256` files.

After publication, verify the Release asset names and CI result. Install the `.tgz` into an isolated prefix and run `list-presets` and `validate` as a final smoke test.

## When prompts or roles change

The current `roles` object in `src/core/presets.ts` is shared by every preset. Editing it directly when upstream prompts or role behavior changes would make older presets generate different content, which violates the immutable-preset rule.

Version the role sources first, for example:

```text
src/adapters/oh-my-opencode-slim/
├── reviewed-2026-07/
│   └── roles.ts
└── reviewed-YYYY-MM/
    └── roles.ts
```

Each preset manifest should reference a specific role-source version. Add the preset containing the new prompts only after versioning the role definitions and adding regression coverage for historical presets.
