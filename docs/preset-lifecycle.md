# Preset lifecycle

A Preset ID identifies one supported OpenAI model generation. The current source exposes `openai-5.5`, `openai-5.6`, and `openai-6`; `latest`, `recommended`, and commands without `--preset` use `openai-6`. Explicit older IDs retain their existing model and effort mappings.

## GPT-6 mapping

| Role | Model | Reasoning effort |
| --- | --- | --- |
| orchestrator | gpt-6-sol | high |
| oracle | gpt-6-astra | high |
| librarian | gpt-6-luna | low |
| explorer | gpt-6-luna | low |
| designer | gpt-6-luna | medium |
| fixer | gpt-6-luna | high |
| council | gpt-6-astra | high |

The generated Root profiles use `gpt-6-sol/high` for Orchestrator and `gpt-6-astra/medium` for Council. Role instructions and permissions remain shared across model generations. Adding a preset does not reinstall or modify existing agents; `install` and `switch-preset` apply a selected preset to an installation.

## Version history

The exact generated configuration is identified by `(Package Version, Preset ID)`. Prompt, policy, role, model, or effort maintenance within an existing model generation changes only the Package Version. A new unsuffixed Preset ID is added only when the project adopts a new model generation.

Historical outputs are reproduced from their historical package version or Git tag. Retired suffix IDs are not aliases in the latest package and fail before mutation. Never move a published Git tag or replace a published Release asset.
