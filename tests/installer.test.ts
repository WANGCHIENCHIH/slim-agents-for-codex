import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { installPreset, previewInstall } from "../src/core/installer.js";
import { runCli } from "../src/cli.js";

describe("safe installation", () => {
  it("previews without writing and preserves unrelated config on apply", async () => {
    const home = await mkdtemp(join(tmpdir(), "slim-codex-"));
    await writeFile(join(home, "config.toml"), 'model = "existing"\r\n\r\n[agents]\r\nmax_threads = 6\r\nmax_depth = 1\r\n', "utf8");
    const preview = await previewInstall({ codexHome: home, preset: "openai-5.6" });
    expect(await readFile(join(home, "config.toml"), "utf8")).not.toContain("agents.explorer");
    await installPreset(preview);
    const installed = await readFile(join(home, "config.toml"), "utf8");
    expect(installed).toContain('model = "existing"');
    expect(installed).toContain("max_depth = 2");
    expect(installed.match(/^\[agents\]$/gm)).toHaveLength(1);
    expect(installed).toContain("[agents.explorer]");
    expect(installed).toContain('config_file = "agents/explorer.toml"');
    expect(await readFile(join(home, "agents", "explorer.toml"), "utf8")).toContain('name = "explorer"');
    expect(installed).toContain("\r\n");
  });

  it("validates installed agent paths relative to config.toml", async () => {
    const home = await mkdtemp(join(tmpdir(), "slim-codex-"));
    await writeFile(join(home, "config.toml"), "[agents]\nmax_threads = 6\nmax_depth = 1\n", "utf8");
    const preview = await previewInstall({ codexHome: home, preset: "openai-5.6" });
    await installPreset(preview);
    const output: string[] = [];

    const code = await runCli(["validate", "--codex-home", home], {
      log: (line) => output.push(line),
      confirm: async () => false,
    });

    expect(code).toBe(0);
    expect(output).toContain(`valid installation: ${home} (8 roles)`);
  });

  it("targets the current project's .codex directory with project scope", async () => {
    const project = await mkdtemp(join(tmpdir(), "slim-project-"));
    const codexHome = join(project, ".codex");
    await mkdir(codexHome);
    await writeFile(join(codexHome, "config.toml"), "[agents]\nmax_threads = 6\nmax_depth = 1\n", "utf8");
    const previousDirectory = process.cwd();
    const output: string[] = [];

    try {
      process.chdir(project);
      const code = await runCli(["install", "--scope", "project"], {
        log: (line) => output.push(line),
        confirm: async () => false,
      });
      expect(code).toBe(2);
    } finally {
      process.chdir(previousDirectory);
    }

    expect(output).toContain(`config: ${join(codexHome, "config.toml")}`);
  });
});
