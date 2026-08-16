# Adding a model-generation preset

## Boundary

- **Preset ID** names an OpenAI model generation, for example `openai-5.7`.
- **Package Version** plus Preset ID identifies the exact generated files.
- **Current Role Contract** is the package's one seven-role behavior definition.

Do not create a suffix ID for prompt, policy, role, model, or effort maintenance within a supported generation. Publish that maintenance as a new Package Version. Add one new unsuffixed Preset ID only when adopting a new model generation.

## Add a generation

1. Confirm the new model generation and exact model/effort mapping for all seven roles.
2. Add the unsuffixed mapping in `src/core/presets.ts`.
3. Move `latest` and `recommended` only when the new generation is the recommended default.
4. Add public CLI acceptance coverage for listing, generation, alias resolution, and deterministic snapshots.
5. Build and generate the committed snapshots:

```bash
npm run build
node dist/cli.js convert --all --output presets
```

The latest source and package must contain snapshot directories only for supported unsuffixed Preset IDs. Do not copy historical role contracts or suffix snapshots forward.

## Maintain the Current Role Contract

Edit `src/core/role-sources/current-role-contract/` directly. Keep role names, order, descriptions, instructions, sandbox choices, MCP guidance, and optional Skill routing identical across every supported Preset ID. Preserve concise current upstream audit provenance; historical implementations belong to their package/tag.

Observer is not a current role. Keep it only in retired managed-role cleanup data so an existing eight-role installation can be archived safely during `switch-preset`.

## Retire an ID

A retired ID must fail at the common preset resolver before config, agent, Skill, backup, archive, or temporary files are written. The error must name the replacement unsuffixed ID and direct exact-history users to the historical Package Version or Git tag. Never retain a retired suffix as an alias.

## Release checks

```bash
npm test
npm run typecheck
npm run build
npm run snapshots
npm run pack:check
openspec validate <change-name> --strict
```

Inspect the package dry-run and confirm it contains only supported snapshots, the current compiled contract, and current documentation. Never move an existing Git tag or replace an existing Release asset.
