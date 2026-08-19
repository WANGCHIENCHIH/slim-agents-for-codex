# Model Generation Presets Specification

## Purpose

Defines stable OpenAI model-generation selectors while making the package version the exact configuration-history boundary for generated Slim Codex agents.

## Requirements

### Requirement: Preset IDs identify model generations
The package SHALL expose one unsuffixed Preset ID for each supported OpenAI model generation and SHALL NOT use the Preset ID to identify prompt, policy, mapping, or snapshot revisions within that generation.

#### Scenario: Supported model generations are listed
- **WHEN** a user lists the presets in the latest package
- **THEN** the CLI lists `openai-5.5` and `openai-5.6` as the only supported Preset IDs

#### Scenario: Same-generation maintenance is released
- **WHEN** a maintainer changes a role description, instruction, policy, model mapping, or effort mapping without adopting a new OpenAI model generation
- **THEN** the change uses a new Package Version without adding a suffixed Preset ID

#### Scenario: New model generation is adopted
- **WHEN** a maintainer intentionally supports a new OpenAI model generation
- **THEN** the package introduces one new unsuffixed Preset ID for that generation

### Requirement: Package Version identifies the exact configuration
The exact generated configuration SHALL be identified by the combination of Package Version and Preset ID. Historical configurations SHALL remain reproducible from their historical package or Git tag and SHALL NOT be selectable as historical configuration variants in the latest package.

#### Scenario: Exact current configuration is reproduced
- **WHEN** the same Preset ID is generated twice from the same Package Version
- **THEN** the generated agent files, primary profiles, configuration snippet, manifest, and aliases are byte-identical

#### Scenario: Historical configuration is requested
- **WHEN** a user needs the exact output formerly published under a suffix Preset ID
- **THEN** the documented migration directs the user to the corresponding historical Package Version or Git tag

#### Scenario: Latest package contents are inspected
- **WHEN** a release package is built
- **THEN** it contains generated snapshot directories only for the supported unsuffixed Preset IDs

### Requirement: Supported presets share the Current Role Contract
Every supported Preset ID in a Package Version SHALL generate the same Current Role Contract of exactly seven managed roles. Role names, descriptions, instructions, sandbox policy, role order, lifecycle supervision policy, and other role-specific policy SHALL be identical across supported model generations; only model and effort mappings MAY differ.

#### Scenario: GPT-5.5 and GPT-5.6 outputs are compared
- **WHEN** `openai-5.5` and `openai-5.6` are generated from the same Package Version
- **THEN** both outputs contain the same seven managed roles and the same Current Role Contract except for their model and effort mappings

#### Scenario: Current policy is rendered
- **WHEN** either supported Preset ID is generated
- **THEN** role-specific MCP guidance, optional Skill routing, and lifecycle supervision policy come from the Current Role Contract without behavior selected by a suffix Preset ID

#### Scenario: Existing eight-role installation is switched
- **WHEN** a user switches an existing managed eight-role installation to a supported unsuffixed Preset ID
- **THEN** the retired managed Observer role is archived and removed from the active config and agent discovery path while unrelated custom roles remain unchanged

#### Scenario: Same-generation lifecycle maintenance is released
- **WHEN** the Current Role Contract adopts Codex-native specialist lifecycle supervision without changing model generations
- **THEN** both supported unsuffixed Preset IDs receive the same lifecycle policy under a new Package Version

### Requirement: Generated manifests identify reviewed upstream provenance
Every supported preset manifest SHALL identify the same reviewed oh-my-opencode-slim release and full commit used as the audit provenance for the Current Role Contract. Provenance metadata MUST NOT select preset behavior.

#### Scenario: Version 2.2.15 provenance is rendered
- **WHEN** either supported preset is generated for this change
- **THEN** its manifest identifies upstream version `2.2.15` and commit `dafee9849fbae6fecaa51c5f406083cad4dfd08b`

#### Scenario: Supported manifests are compared
- **WHEN** the `openai-5.5` and `openai-5.6` manifests are compared within the same Package Version
- **THEN** their upstream version and commit are identical and neither value changes the selected model mapping

### Requirement: Retired suffix Preset IDs fail before mutation
Commands that accept a Preset ID MUST reject `openai-5.5.1` and `openai-5.6.1` through `openai-5.6.4` before writing files. The error MUST identify the retired ID, recommend the corresponding unsuffixed ID, and explain that an exact historical configuration requires its historical Package Version or Git tag.

#### Scenario: Retired GPT-5.5 ID is used
- **WHEN** a user invokes a command with `openai-5.5.1`
- **THEN** the command fails before mutation and directs the user to `openai-5.5` or the historical package/tag

#### Scenario: Retired GPT-5.6 ID is used
- **WHEN** a user invokes a command with any ID from `openai-5.6.1` through `openai-5.6.4`
- **THEN** the command fails before mutation and directs the user to `openai-5.6` or the historical package/tag

#### Scenario: Retired ID is used for installation
- **WHEN** an installation or preset switch receives a retired suffix Preset ID
- **THEN** no config, agent, Skill, backup, archive, or temporary installation file is created or changed

### Requirement: Aliases resolve to the recommended model generation
The `latest` and `recommended` aliases SHALL resolve to `openai-5.6`, and the CLI SHALL display the resolved unsuffixed Preset ID before an approved write.

#### Scenario: Aliases are listed
- **WHEN** a user lists presets and aliases
- **THEN** both `latest` and `recommended` are shown as resolving to `openai-5.6`

#### Scenario: Alias is used for a write-capable command
- **WHEN** a user invokes a write-capable command with `latest` or `recommended`
- **THEN** the preview identifies `openai-5.6` as the resolved Preset ID before confirmation

### Requirement: Public CLI behavior is the acceptance seam
The change SHALL be accepted through public CLI behavior rather than tests coupled to historical role-source modules or renderer implementation details.

#### Scenario: Complete public contract is verified
- **WHEN** the automated acceptance checks exercise preset listing, generation, retired-ID rejection, and committed snapshot comparison
- **THEN** the checks use the public CLI seam and verify the externally observable requirements of this capability
