# Council expert agents

Council dynamically selects installed agents by their descriptions, but only Root-curated advisory agents are eligible. Keep Council advisors separate from write-capable implementation agents.

## Minimal project agent

Create a project-scoped file such as `.codex/agents/backend-advisor.toml`:

```toml
name = "backend-advisor"
description = "Council-safe read-only backend advisor for API architecture, service boundaries, reliability, and implementation risk."
sandbox_mode = "read-only"
developer_instructions = """
You are an independent Council advisor. Inspect the assigned evidence, distinguish facts from assumptions, evaluate feasible approaches and risks, and return concise advice with uncertainties. Do not edit files, execute implementation, deploy, or delegate.
"""
```

Register it in the project `.codex/config.toml` that will load the role:

```toml
[agents.backend-advisor]
description = "Council-safe read-only backend advisor for API architecture, service boundaries, reliability, and implementation risk."
config_file = "agents/backend-advisor.toml"
```

The `config_file` path is relative to that `config.toml`. Use the same pattern under `CODEX_HOME/agents/` for a global advisor.

## Model and skill policy

- Omit `model` and `model_reasoning_effort` when the advisor should inherit the active Council session's GPT model settings. Set them explicitly only when Root intentionally wants a different reviewed mapping.
- Do not add `skills.config` merely to make the agent eligible. Council's preferred methods are optional and discovered in the active task.
- Put `Council-safe read-only` and the actual professional domain in the description. Council uses descriptions for routing, while Root remains responsible for verifying the TOML.

## Permission limitation

[Codex subagents inherit the parent turn's live permission mode](https://learn.chatgpt.com/docs/agent-configuration/subagents.md). A read-only custom agent file is therefore necessary but may not override a broader live permission choice. For enforced read-only deliberation, start the Council turn under read-only permissions. In a workspace-write turn, advisory behavior is an instruction boundary rather than guaranteed privilege reduction.

After adding or changing custom agent files or config, start a new Codex task before testing the role.
