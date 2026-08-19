## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Generated manifests identify reviewed upstream provenance
Every supported preset manifest SHALL identify the same reviewed oh-my-opencode-slim release and full commit used as the audit provenance for the Current Role Contract. Provenance metadata MUST NOT select preset behavior.

#### Scenario: Version 2.2.15 provenance is rendered
- **WHEN** either supported preset is generated for this change
- **THEN** its manifest identifies upstream version `2.2.15` and commit `dafee9849fbae6fecaa51c5f406083cad4dfd08b`

#### Scenario: Supported manifests are compared
- **WHEN** the `openai-5.5` and `openai-5.6` manifests are compared within the same Package Version
- **THEN** their upstream version and commit are identical and neither value changes the selected model mapping
