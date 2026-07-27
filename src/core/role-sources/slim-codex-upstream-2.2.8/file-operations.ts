export const writableFileOperations = `## File Operations Rules

- Prefer dedicated discovery and editing tools for normal code work: \`rg --files\` and \`rg\` for discovery, direct file reading for contents, and \`apply_patch\` for targeted source changes.
- Use the shell for execution and automation: Git, package managers, tests, builds, scripts, diagnostics, and shell-native filesystem operations.
- Shell-native bulk or mechanical filesystem changes are acceptable when they are clearer or safer than many individual edits.
- Before destructive or broad filesystem operations, resolve and verify the exact target set, quote paths, and use a dry run or listing when practical.
- Do not use shell pipelines merely to read code when direct reading or \`rg\` is clearer.`;

export const readOnlyFileOperations = `## File Operations Rules

- READ-ONLY: inspect and report; do not modify files.
- Prefer \`rg --files\` and \`rg\` for discovery and direct file reading for contents.
- Non-mutating shell diagnostics and shell-native inspection are allowed when they are the clearest tool, but never use them to modify files.
- Do not use shell pipelines merely to read code when direct reading or \`rg\` is clearer.`;
