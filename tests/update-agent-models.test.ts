import { execFile } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const script = join(process.cwd(), "scripts", "update-agent-models.mjs");

it.each([
  ["gpt-5.6-sol", "gpt-6-astra"],
  ["gpt-5.6-terra", "gpt-6-sol"],
  ["gpt-5.6-luna", "gpt-6-luna"],
])("updates %s to %s idempotently without changing other bytes", async (previous, next) => {
  const directory = await mkdtemp(join(tmpdir(), "agent-models-"));
  const path = join(directory, "expert.toml");
  const original = `\uFEFFname = "expert"\r\nmodel = "${previous}"\r\nmodel_reasoning_effort = "high"\r\nsandbox_mode = "read-only"\r\ndescription = "Keep ${previous} in prose"\r\n`;
  await writeFile(path, original, "utf8");

  const preview = await execFileAsync(process.execPath, [script, "--directory", directory, "--dry-run"]);
  expect(preview.stdout).toContain("Matched 1 agent file(s). No files changed.");
  expect(await readFile(path, "utf8")).toBe(original);

  await execFileAsync(process.execPath, [script, "--directory", directory]);
  const updated = await readFile(path, "utf8");
  expect(updated).toBe(original.replace(`model = "${previous}"`, `model = "${next}"`));

  const repeated = await execFileAsync(process.execPath, [script, "--directory", directory, "--dry-run"]);
  expect(repeated.stdout).toContain("Matched 0 agent file(s). No files changed.");
});
