import { execFile } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const script = join(process.cwd(), "scripts", "update-agent-models.mjs");

it("updates mapped models idempotently without changing BOM or line endings", async () => {
  const directory = await mkdtemp(join(tmpdir(), "agent-models-"));
  const path = join(directory, "expert.toml");
  const original = '\uFEFFname = "expert"\r\nmodel = "gpt-5.4"\r\ndescription = "test"\r\n';
  await writeFile(path, original, "utf8");

  const preview = await execFileAsync(process.execPath, [script, "--directory", directory, "--dry-run"]);
  expect(preview.stdout).toContain("Matched 1 agent file(s). No files changed.");
  expect(await readFile(path, "utf8")).toBe(original);

  await execFileAsync(process.execPath, [script, "--directory", directory]);
  const updated = await readFile(path, "utf8");
  expect(updated).toContain('model = "gpt-5.6-terra"');
  expect(updated.startsWith("\uFEFF")).toBe(true);
  expect(updated).toContain("\r\n");

  const repeated = await execFileAsync(process.execPath, [script, "--directory", directory, "--dry-run"]);
  expect(repeated.stdout).toContain("Matched 0 agent file(s). No files changed.");
});
