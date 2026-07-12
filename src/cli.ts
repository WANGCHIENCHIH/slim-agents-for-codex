#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import { parse } from "smol-toml";
import { installPreset, previewInstall } from "./core/installer.js";
import { aliases, generatePreset, presets, roleOrder } from "./core/presets.js";

export interface CliIo { log(line: string): void; confirm(question: string): Promise<boolean> }

const valueAfter = (args: string[], option: string, fallback?: string) => {
  const index = args.indexOf(option);
  return index >= 0 ? args[index + 1] : fallback;
};

async function writeGenerated(id: string, output: string) {
  const generated = generatePreset(id);
  const root = join(output, generated.preset.id);
  await mkdir(join(root, "agents"), { recursive: true });
  for (const [name, content] of Object.entries(generated.agents)) await writeFile(join(root, "agents", `${name}.toml`), content, "utf8");
  await writeFile(join(root, "config.snippet.toml"), generated.snippet, "utf8");
  return root;
}

export async function runCli(args: string[], io: CliIo): Promise<number> {
  const command = args[0] ?? "help";
  if (command === "help" || command === "--help" || command === "-h") {
    io.log("slim-agents-codex <convert|install|validate|list-presets|switch-preset> [options]");
    return 0;
  }
  if (command === "list-presets") {
    for (const preset of Object.values(presets)) io.log(`${preset.id} (${preset.status})`);
    for (const [alias, id] of Object.entries(aliases)) io.log(`${alias} -> ${id}`);
    return 0;
  }
  if (command === "convert") {
    const output = resolve(valueAfter(args, "--output", "generated")!);
    const ids = args.includes("--all") ? Object.keys(presets) : [valueAfter(args, "--preset", "latest")!];
    for (const id of ids) io.log(`generated ${await writeGenerated(id, output)}`);
    return 0;
  }
  if (command === "validate") {
    const directory = resolve(valueAfter(args, "--path", "presets/openai-5.6/agents")!);
    for (const name of roleOrder) {
      const document = parse(await readFile(join(directory, `${name}.toml`), "utf8"));
      if (document.name !== name || !document.model || !document.developer_instructions) throw new Error(`Invalid role: ${name}`);
    }
    io.log(`valid: ${directory} (${roleOrder.length} roles)`);
    return 0;
  }
  if (command === "install" || command === "switch-preset") {
    const preset = valueAfter(args, "--preset", "latest")!;
    const codexHome = resolve(valueAfter(args, "--codex-home", process.env.CODEX_HOME ?? join(homedir(), ".codex"))!);
    const preview = await previewInstall({ codexHome, preset });
    io.log(`preset: ${preset} -> ${preview.resolvedPreset}`);
    io.log(`config: ${preview.configPath}`);
    io.log(`backup: ${preview.backupPath}`);
    if (!args.includes("--yes") && !(await io.confirm("Apply these changes?"))) {
      io.log("cancelled; no files changed");
      return 2;
    }
    const result = await installPreset(preview);
    io.log(`installed ${result.preset} at ${result.target}`);
    return 0;
  }
  io.log(`unknown command: ${command}`);
  return 1;
}

async function main() {
  const readline = createInterface({ input: process.stdin, output: process.stdout });
  try {
    process.exitCode = await runCli(process.argv.slice(2), {
      log: console.log,
      confirm: async (question) => (await readline.question(`${question} [y/N] `)).trim().toLowerCase() === "y",
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  } finally {
    readline.close();
  }
}

if (resolve(process.argv[1] ?? "") === resolve(fileURLToPath(import.meta.url))) void main();
