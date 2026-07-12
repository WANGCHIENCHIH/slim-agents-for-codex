import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { installPreset, previewInstall } from "../src/core/installer.js";

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
    expect(installed).not.toContain("config_file");
    expect(installed).not.toMatch(/^\[agents\.[^\]]+\]$/m);
    expect(await readFile(join(home, "agents", "slim-agents-for-codex", "openai-5.6", "explorer.toml"), "utf8")).toContain('name = "explorer"');
    expect(installed).toContain("\r\n");
  });
});
