# Preset lifecycle

Published model mappings and manifests are immutable. Add a new directory for a new model generation; never rewrite or delete historical model mappings silently. Intentional prompt, role-list, or behavior changes from a newer upstream release require versioned role sources and a new preset.

A correction to this project's existing Codex translation, such as a wrong role name, config path, or shared MCP restriction, may update the shared generator and regenerate affected historical agent TOMLs. Ship that correction only in a new package version, and never move an existing Git tag or replace an existing GitHub Release asset. Aliases may move, but installation always records and displays the resolved preset ID.
