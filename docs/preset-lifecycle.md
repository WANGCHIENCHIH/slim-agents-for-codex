# Preset lifecycle

A Preset ID identifies one supported OpenAI model generation. The current package exposes only `openai-5.5` and `openai-5.6`; `latest` and `recommended` resolve to `openai-5.6`.

The exact generated configuration is identified by `(Package Version, Preset ID)`. Prompt, policy, role, model, or effort maintenance within an existing model generation changes only the Package Version. A new unsuffixed Preset ID is added only when the project adopts a new model generation.

Historical outputs are reproduced from their historical package version or Git tag. Retired suffix IDs are not aliases in the latest package and fail before mutation. Never move a published Git tag or replace a published Release asset.
