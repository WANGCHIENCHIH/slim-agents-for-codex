#!/usr/bin/env node
import { readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const modelMap = new Map([
  ["gpt-5.4", "gpt-5.6-terra"],
  ["gpt-5.4-mini", "gpt-5.6-luna"],
  ["gpt-5.3-codex-spark", "gpt-5.6-terra"],
]);
const modelPattern = /^(\s*model\s*=\s*")([^"]+)("\s*)$/m;

function parseArgs(args) {
  let directory = ".codex/agents";
  let dryRun = false;
  let help = false;
  for (let index = 0; index < args.length; index++) {
    if (args[index] === "--dry-run") dryRun = true;
    else if (args[index] === "--help") help = true;
    else if (args[index] === "--directory" && args[index + 1] && !args[index + 1].startsWith("--")) directory = args[++index];
    else throw new Error(`Unknown or incomplete argument: ${args[index]}`);
  }
  return { directory: resolve(directory), dryRun, help };
}

export async function updateAgentModels({ directory, dryRun = false }) {
  const files = (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".toml"))
    .map((entry) => entry.name)
    .sort();
  let matched = 0;

  for (const name of files) {
    const path = resolve(directory, name);
    const content = await readFile(path, "utf8");
    const match = modelPattern.exec(content);
    const replacement = match && modelMap.get(match[2]);
    if (!match || !replacement) continue;

    matched++;
    if (!dryRun) await writeFile(path, content.replace(modelPattern, `$1${replacement}$3`), "utf8");
  }

  return matched;
}

if (fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
      console.log("Usage: node scripts/update-agent-models.mjs [--directory PATH] [--dry-run]");
      process.exit(0);
    }
    const matched = await updateAgentModels(options);
    console.log(`Matched ${matched} agent file(s).${options.dryRun ? " No files changed." : ""}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
