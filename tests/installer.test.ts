import { access, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { installPreset, packagedSkillsHome, previewInstall } from "../src/core/installer.js";
import { runCli } from "../src/cli.js";

const fsFault = vi.hoisted(() => ({
  failWritePaths: [] as string[],
  validationConfigPath: undefined as string | undefined,
  writeAttempts: [] as string[],
  rmAttempts: [] as string[],
  failureInjectedPaths: [] as string[],
}));

vi.mock("node:fs/promises", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs/promises")>();
  const pathOf = (value: unknown): string => typeof value === "string" ? value : String(value);
  return {
    ...actual,
    readFile: async (...args: any[]) => {
      const path = pathOf(args[0]);
      const result = await (actual.readFile as (...inner: any[]) => Promise<any>)(...args);
      if (path !== fsFault.validationConfigPath) return result;
      const text = typeof result === "string" ? result : result.toString("utf8");
      if (!text.includes("[agents.orchestrator]")) return result;
      const drifted = text.replace('config_file = "agents/orchestrator.toml"', 'config_file = "agents/unrelated.toml"');
      return typeof result === "string" ? drifted : Buffer.from(drifted);
    },
    writeFile: async (...args: any[]) => {
      const path = pathOf(args[0]);
      fsFault.writeAttempts.push(path);
      if (fsFault.failWritePaths.includes(path) && !fsFault.failureInjectedPaths.includes(path)) {
        fsFault.failureInjectedPaths.push(path);
        throw new Error("injected write failure");
      }
      return (actual.writeFile as (...inner: any[]) => Promise<any>)(...args);
    },
    rm: async (...args: any[]) => {
      const path = pathOf(args[0]);
      fsFault.rmAttempts.push(path);
      return (actual.rm as (...inner: any[]) => Promise<any>)(...args);
    },
  };
});

describe("safe installation", () => {
  it.runIf(process.platform === "win32")("treats case-only variants of the packaged Skill path as the same location", async () => {
    const home = await mkdtemp(join(tmpdir(), "slim-same-skills-"));

    const preview = await previewInstall({ codexHome: home, skillsHome: packagedSkillsHome.toUpperCase(), preset: "openai-5.6" });

    expect(preview.installSkills).toBe(false);
    expect(preview.existingManagedSkills).toEqual([]);
  });

  it("rejects retired installation IDs before creating any files", async () => {
    const home = await mkdtemp(join(tmpdir(), "slim-retired-install-"));
    const skillsHome = join(home, "skills");

    await expect(runCli(["install", "--preset", "openai-5.6.4", "--codex-home", home, "--skills-home", skillsHome, "--yes"], {
      log: () => undefined,
      confirm: async () => false,
    })).rejects.toThrow(/Retired preset: openai-5\.6\.4.*Use openai-5\.6.*Package Version.*Git tag/i);

    expect(await readdir(home)).toEqual([]);
  });

  it("installs into a fresh Codex home without mutating during preview", async () => {
    const home = await mkdtemp(join(tmpdir(), "slim-codex-fresh-"));
    const configPath = join(home, "config.toml");

    const preview = await previewInstall({ codexHome: home, preset: "openai-5.6" });

    expect(preview.backupPath).toBeUndefined();
    await expect(access(configPath)).rejects.toThrow();

    const result = await installPreset(preview);

    expect(result.backupPath).toBeUndefined();
    expect(await readFile(configPath, "utf8")).toContain("[agents.orchestrator]");
    expect(await readFile(configPath, "utf8")).toContain("max_depth = 2");
    expect(await readFile(join(home, "agents", "council.toml"), "utf8")).toContain('name = "council"');
  });

  it("rejects a direct install whose managed agent output fails installed validation", async () => {
    const home = await mkdtemp(join(tmpdir(), "slim-install-validation-"));
    const skillsHome = join(home, "skills");
    await writeFile(join(home, "config.toml"), "[agents]\nmax_threads = 6\nmax_depth = 1\n", "utf8");

    const preview = await previewInstall({ codexHome: home, skillsHome, preset: "openai-5.6" });
    preview.files.orchestrator = preview.files.orchestrator.replace('name = "orchestrator"', 'name = "drifted"');

    await expect(installPreset(preview)).rejects.toThrow(/Role semantic drift: orchestrator/);
  });

  it("rolls back a fresh install after post-apply validation fails", async () => {
    const home = await mkdtemp(join(tmpdir(), "slim-rollback-validation-"));
    const skillsHome = join(home, "skills");
    const unrelatedAgent = join(home, "agents", "custom.toml");
    const unrelatedSkill = join(skillsHome, "unrelated-skill", "SKILL.md");
    await mkdir(dirname(unrelatedAgent), { recursive: true });
    await mkdir(dirname(unrelatedSkill), { recursive: true });
    await writeFile(unrelatedAgent, 'name = "custom"\n', "utf8");
    await writeFile(unrelatedSkill, "unrelated\n", "utf8");

    const preview = await previewInstall({ codexHome: home, skillsHome, preset: "openai-5.6" });
    preview.files.orchestrator = preview.files.orchestrator.replace('name = "orchestrator"', 'name = "drifted"');

    await expect(installPreset(preview)).rejects.toThrow(/Role semantic drift: orchestrator/);

    await expect(access(join(home, "config.toml"))).rejects.toThrow();
    await expect(access(join(home, "agents", "orchestrator.toml"))).rejects.toThrow();
    await expect(access(join(skillsHome, "slim-council"))).rejects.toThrow();
    expect(await readFile(unrelatedAgent, "utf8")).toBe('name = "custom"\n');
    expect(await readFile(unrelatedSkill, "utf8")).toBe("unrelated\n");
    await expect(access(preview.archivePath)).rejects.toThrow();
    await expect(access(`${preview.configPath}.tmp-${process.pid}`)).rejects.toThrow();
  });

  it("reports complete rollback after a config temp-path collision", async () => {
    const home = await mkdtemp(join(tmpdir(), "slim-rollback-collision-"));
    const skillsHome = join(home, "skills");
    const configPath = join(home, "config.toml");
    const tempPath = `${configPath}.tmp-${process.pid}`;
    const originalConfig = Buffer.from(
      '\uFEFF[agents]\r\nmax_threads = 6\r\nmax_depth = 1\r\n\r\n[agents.observer]\r\ndescription = "Retired managed observer"\r\nconfig_file = "agents/observer.toml"\r\n\r\n[agents.backend-advisor]\r\ndescription = "Unrelated custom advisor"\r\nconfig_file = "agents/backend-advisor.toml"\r\n',
      "utf8",
    );
    const observer = join(home, "agents", "observer.toml");
    const unrelatedAgent = join(home, "agents", "backend-advisor.toml");
    const councilSkill = join(skillsHome, "slim-council", "SKILL.md");
    const orchestrationSkill = join(skillsHome, "slim-orchestration", "SKILL.md");
    const unrelatedSkill = join(skillsHome, "unrelated-skill", "SKILL.md");
    await writeFile(configPath, originalConfig);
    await mkdir(dirname(observer), { recursive: true });
    await writeFile(observer, 'name = "observer"\n', "utf8");
    await writeFile(unrelatedAgent, 'name = "backend-advisor"\n', "utf8");
    await mkdir(dirname(councilSkill), { recursive: true });
    await mkdir(dirname(orchestrationSkill), { recursive: true });
    await mkdir(dirname(unrelatedSkill), { recursive: true });
    await writeFile(councilSkill, "old council\n", "utf8");
    await writeFile(orchestrationSkill, "old orchestration\n", "utf8");
    await writeFile(unrelatedSkill, "unrelated\n", "utf8");
    await mkdir(tempPath);

    const output: string[] = [];
    const code = await runCli(["switch-preset", "--preset", "openai-5.6", "--codex-home", home, "--skills-home", skillsHome, "--yes"], {
      log: (line) => output.push(line),
      confirm: async () => false,
    });

    expect(code).toBe(1);
    expect(output.some((line) => /rollback complete/i.test(line))).toBe(true);
    expect(output.some((line) => line.startsWith("reason: "))).toBe(true);
    expect(output.some((line) => line.startsWith("installed "))).toBe(false);
    const recoveryPaths = output.filter((line) => line.startsWith("recovery: ")).map((line) => line.slice("recovery: ".length));
    expect(recoveryPaths.length).toBeGreaterThan(0);
    for (const path of recoveryPaths) await expect(access(path)).resolves.toBeUndefined();

    expect((await readFile(configPath)).equals(originalConfig)).toBe(true);
    expect(await readFile(observer, "utf8")).toBe('name = "observer"\n');
    expect(await readFile(unrelatedAgent, "utf8")).toBe('name = "backend-advisor"\n');
    expect(await readFile(councilSkill, "utf8")).toBe("old council\n");
    expect(await readFile(orchestrationSkill, "utf8")).toBe("old orchestration\n");
    expect(await readFile(unrelatedSkill, "utf8")).toBe("unrelated\n");
    await expect(access(join(home, "agents", "orchestrator.toml"))).rejects.toThrow();
    await expect(access(join(skillsHome, "slim-council", "SKILL.md"))).resolves.toBeUndefined();
    await expect(access(tempPath)).resolves.toBeUndefined();
  });

  it("reports incomplete rollback after an agent restoration fault and attempts every independent recovery", async () => {
    const home = await mkdtemp(join(tmpdir(), "slim-rollback-incomplete-"));
    const skillsHome = join(home, "skills");
    const configPath = join(home, "config.toml");
    const observer = join(home, "agents", "observer.toml");
    const oracle = join(home, "agents", "oracle.toml");
    const unrelatedAgent = join(home, "agents", "unrelated.toml");
    const unrelatedSkill = join(skillsHome, "unrelated-skill", "SKILL.md");
    const temporaryPath = `${configPath}.tmp-${process.pid}`;
    await writeFile(configPath, '[agents]\nmax_threads = 6\nmax_depth = 1\n\n[agents.observer]\ndescription = "Retired managed observer"\nconfig_file = "agents/observer.toml"\n\n[agents.oracle]\ndescription = "Existing managed oracle"\nconfig_file = "agents/oracle.toml"\n', "utf8");
    await mkdir(dirname(observer), { recursive: true });
    await writeFile(observer, 'name = "observer"\n', "utf8");
    await writeFile(oracle, 'name = "oracle-before-rollback"\n', "utf8");
    await writeFile(unrelatedAgent, 'name = "unrelated"\n', "utf8");
    for (const name of ["slim-council", "slim-orchestration"]) {
      await mkdir(join(skillsHome, name), { recursive: true });
      await writeFile(join(skillsHome, name, "SKILL.md"), `old ${name}\n`, "utf8");
    }
    await mkdir(dirname(unrelatedSkill), { recursive: true });
    await writeFile(unrelatedSkill, "unrelated\n", "utf8");

    fsFault.failWritePaths = [observer, join(skillsHome, "slim-council", "SKILL.md")];
    fsFault.validationConfigPath = configPath;
    fsFault.writeAttempts.length = 0;
    fsFault.rmAttempts.length = 0;
    fsFault.failureInjectedPaths.length = 0;
    const output: string[] = [];

    try {
      const code = await runCli(["switch-preset", "--preset", "openai-5.6", "--codex-home", home, "--skills-home", skillsHome, "--yes"], {
        log: (line) => output.push(line),
        confirm: async () => false,
      });

      expect(code).toBe(1);
      expect(output.some((line) => line === "rollback incomplete")).toBe(true);
      expect(output).toContain("reason: installed preset validation failed");
      expect(output).toContain("rollback failure: managed agents could not be restored");
      expect(output).toContain("rollback failure: managed agents could not be verified");
      expect(output).toContain("rollback failure: managed Skills could not be restored");
      expect(output).toContain("rollback failure: managed Skills could not be verified");
      expect(output.find((line) => line.startsWith("unresolved: "))).toContain("agents");
      expect(output.some((line) => line.startsWith("installed "))).toBe(false);
      expect(output.join("\n")).not.toContain(unrelatedAgent);
      expect(output.join("\n")).not.toContain(unrelatedSkill);
      const recoveryPaths = output.filter((line) => line.startsWith("recovery: ")).map((line) => line.slice("recovery: ".length));
      expect(recoveryPaths.length).toBeGreaterThan(0);
      for (const path of recoveryPaths) await expect(access(path)).resolves.toBeUndefined();
      expect(fsFault.writeAttempts).toContain(configPath);
      expect(fsFault.writeAttempts).toContain(observer);
      expect(fsFault.writeAttempts).toContain(oracle);
      expect(fsFault.writeAttempts).toContain(join(skillsHome, "slim-council", "SKILL.md"));
      expect(fsFault.writeAttempts).toContain(join(skillsHome, "slim-orchestration", "SKILL.md"));
      expect(fsFault.rmAttempts).toContain(temporaryPath);
      expect(await readFile(unrelatedAgent, "utf8")).toBe('name = "unrelated"\n');
      expect(await readFile(unrelatedSkill, "utf8")).toBe("unrelated\n");
      expect(await readFile(oracle, "utf8")).toBe('name = "oracle-before-rollback"\n');
    } finally {
      fsFault.failWritePaths.length = 0;
      fsFault.validationConfigPath = undefined;
      fsFault.failureInjectedPaths.length = 0;
    }
  });

  it("rejects config drift after preview without creating installation paths", async () => {
    const home = await mkdtemp(join(tmpdir(), "slim-preview-config-drift-"));
    const configPath = join(home, "config.toml");
    const skillsHome = join(home, "skills");
    const original = "[agents]\nmax_threads = 6\nmax_depth = 1\n";
    await writeFile(configPath, original, "utf8");

    const preview = await previewInstall({ codexHome: home, skillsHome, preset: "openai-5.6" });
    const drifted = `${original}# changed after preview\n`;
    await writeFile(configPath, drifted, "utf8");

    await expect(installPreset(preview)).rejects.toThrow(/preview.*drift|config.*changed/i);

    expect(await readFile(configPath, "utf8")).toBe(drifted);
    await expect(access(join(home, "agents"))).rejects.toThrow();
    await expect(access(skillsHome)).rejects.toThrow();
    await expect(access(preview.backupPath!)).rejects.toThrow();
    await expect(access(preview.archivePath)).rejects.toThrow();
    await expect(access(`${configPath}.tmp-${process.pid}`)).rejects.toThrow();
  });

  it("reports preview drift through the controlled CLI failure state without writing", async () => {
    const home = await mkdtemp(join(tmpdir(), "slim-preview-cli-drift-"));
    const configPath = join(home, "config.toml");
    const skillsHome = join(home, "skills");
    const original = "[agents]\nmax_threads = 6\nmax_depth = 1\n";
    const drifted = `${original}# changed after preview\n`;
    await writeFile(configPath, original, "utf8");
    const output: string[] = [];

    const code = await runCli(["install", "--preset", "openai-5.6", "--codex-home", home, "--skills-home", skillsHome], {
      log: (line) => output.push(line),
      confirm: async () => {
        await writeFile(configPath, drifted, "utf8");
        return true;
      },
    });

    expect(code).toBe(1);
    expect(output).toContain("reason: managed state changed after preview");
    expect(output).toContain("rollback complete");
    expect(output.some((line) => line.startsWith("installed "))).toBe(false);
    expect(await readFile(configPath, "utf8")).toBe(drifted);
    await expect(access(join(home, "agents"))).rejects.toThrow();
    await expect(access(skillsHome)).rejects.toThrow();
    await expect(access(`${configPath}.tmp-${process.pid}`)).rejects.toThrow();
  });

  it("rejects managed agent drift after preview without changing installation paths", async () => {
    const home = await mkdtemp(join(tmpdir(), "slim-preview-agent-drift-"));
    const configPath = join(home, "config.toml");
    const skillsHome = join(home, "skills");
    const config = '[agents]\nmax_threads = 6\nmax_depth = 1\n\n[agents.observer]\ndescription = "Retired managed observer"\nconfig_file = "agents/observer.toml"\n';
    await writeFile(configPath, config, "utf8");
    await mkdir(join(home, "agents"));
    await writeFile(join(home, "agents", "observer.toml"), 'name = "observer"\n', "utf8");

    const preview = await previewInstall({ codexHome: home, skillsHome, preset: "openai-5.6", mode: "switch" });
    const drifted = 'name = "changed-after-preview"\n';
    await writeFile(join(home, "agents", "observer.toml"), drifted, "utf8");

    await expect(installPreset(preview)).rejects.toThrow(/preview.*drift|agent.*changed/i);

    expect(await readFile(configPath, "utf8")).toBe(config);
    expect(await readFile(join(home, "agents", "observer.toml"), "utf8")).toBe(drifted);
    await expect(access(skillsHome)).rejects.toThrow();
    await expect(access(preview.backupPath!)).rejects.toThrow();
    await expect(access(preview.archivePath)).rejects.toThrow();
    await expect(access(`${configPath}.tmp-${process.pid}`)).rejects.toThrow();
  });

  it("rejects managed Skill drift after preview without changing installation paths", async () => {
    const home = await mkdtemp(join(tmpdir(), "slim-preview-skill-drift-"));
    const configPath = join(home, "config.toml");
    const skillsHome = join(home, "skills");
    const config = '[agents]\nmax_threads = 6\nmax_depth = 1\n\n[agents.observer]\ndescription = "Retired managed observer"\nconfig_file = "agents/observer.toml"\n';
    await writeFile(configPath, config, "utf8");
    await mkdir(join(home, "agents"));
    await writeFile(join(home, "agents", "observer.toml"), 'name = "observer"\n', "utf8");
    await mkdir(join(skillsHome, "slim-council"), { recursive: true });
    await writeFile(join(skillsHome, "slim-council", "SKILL.md"), "before preview\n", "utf8");

    const preview = await previewInstall({ codexHome: home, skillsHome, preset: "openai-5.6", mode: "switch" });
    const drifted = "changed after preview\n";
    await writeFile(join(skillsHome, "slim-council", "SKILL.md"), drifted, "utf8");

    await expect(installPreset(preview)).rejects.toThrow(/preview.*drift|skill.*changed/i);

    expect(await readFile(configPath, "utf8")).toBe(config);
    expect(await readFile(join(home, "agents", "observer.toml"), "utf8")).toBe('name = "observer"\n');
    expect(await readFile(join(skillsHome, "slim-council", "SKILL.md"), "utf8")).toBe(drifted);
    await expect(access(preview.backupPath!)).rejects.toThrow();
    await expect(access(preview.archivePath)).rejects.toThrow();
    await expect(access(`${configPath}.tmp-${process.pid}`)).rejects.toThrow();
  });

  it("installs and post-validates a fresh Codex home through the CLI", async () => {
    const home = await mkdtemp(join(tmpdir(), "slim-codex-fresh-cli-"));
    const skillsHome = join(home, "user-skills");
    const output: string[] = [];

    const code = await runCli(["install", "--preset", "openai-5.6", "--codex-home", home, "--skills-home", skillsHome, "--yes"], {
      log: (line) => output.push(line),
      confirm: async () => false,
    });

    expect(code).toBe(0);
    expect(output).toContain("backup: none (new config)");
    expect(output).toContain(`skills: ${skillsHome}`);
    expect(output).toContain(`valid installation: ${home} (7 roles)`);
    expect(output).toContain(`valid skills: ${skillsHome} (2 skills)`);
    expect(output).toContain(`installed openai-5.6 at ${join(home, "agents")}`);
    expect(await readFile(join(skillsHome, "slim-council", "SKILL.md"), "utf8")).toBe(
      await readFile(join(process.cwd(), ".agents", "skills", "slim-council", "SKILL.md"), "utf8"),
    );
    expect(await readFile(join(skillsHome, "slim-orchestration", "agents", "openai.yaml"), "utf8")).toBe(
      await readFile(join(process.cwd(), ".agents", "skills", "slim-orchestration", "agents", "openai.yaml"), "utf8"),
    );
  });

  it("installs and post-validates a BOM config without changing its line endings", async () => {
    const home = await mkdtemp(join(tmpdir(), "slim-codex-bom-cli-"));
    const skillsHome = join(home, "user-skills");
    const configPath = join(home, "config.toml");
    await writeFile(configPath, "\uFEFF[agents]\r\nmax_threads = 6\r\nmax_depth = 1\r\n", "utf8");

    const code = await runCli(["install", "--preset", "openai-5.6", "--codex-home", home, "--skills-home", skillsHome, "--yes"], {
      log: () => undefined,
      confirm: async () => false,
    });

    expect(code).toBe(0);
    const installed = await readFile(configPath, "utf8");
    expect(installed.startsWith("\uFEFF")).toBe(true);
    expect(installed.replaceAll("\r\n", "")).not.toContain("\n");
  });

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

  it("does not mutate live agents or Skills when the config backup cannot be created", async () => {
    const home = await mkdtemp(join(tmpdir(), "slim-backup-failure-"));
    const skillsHome = join(home, "skills");
    const configPath = join(home, "config.toml");
    await writeFile(configPath, "[agents]\nmax_threads = 6\nmax_depth = 1\n", "utf8");
    const preview = await previewInstall({ codexHome: home, skillsHome, preset: "openai-5.6" });
    await rm(configPath);

    await expect(installPreset(preview)).rejects.toThrow();

    await expect(access(join(home, "agents", "orchestrator.toml"))).rejects.toThrow();
    await expect(access(join(skillsHome, "slim-council", "SKILL.md"))).rejects.toThrow();
  });

  it("validates installed agent paths relative to config.toml", async () => {
    const home = await mkdtemp(join(tmpdir(), "slim-codex-"));
    const skillsHome = join(home, "skills");
    await writeFile(join(home, "config.toml"), "[agents]\nmax_threads = 6\nmax_depth = 1\n", "utf8");
    const preview = await previewInstall({ codexHome: home, skillsHome, preset: "openai-5.6" });
    await installPreset(preview);
    const output: string[] = [];

    await expect(runCli(["validate", "--preset", "openai-5.6", "--codex-home", home], {
      log: () => undefined,
      confirm: async () => false,
    })).rejects.toThrow(/--skills-home/);

    const code = await runCli(["validate", "--preset", "openai-5.6", "--codex-home", home, "--skills-home", skillsHome], {
      log: (line) => output.push(line),
      confirm: async () => false,
    });

    expect(code).toBe(0);
    expect(output).toContain(`valid installation: ${home} (7 roles)`);
    expect(output).toContain(`valid skills: ${skillsHome} (2 skills)`);
    expect(await readFile(join(home, "config.toml"), "utf8")).not.toContain("[agents.observer]");
  });

  it("targets the current project's .codex directory with project scope", async () => {
    const project = await mkdtemp(join(tmpdir(), "slim-project-"));
    const codexHome = join(project, ".codex");
    await mkdir(codexHome);
    await writeFile(join(codexHome, "config.toml"), "[agents]\nmax_threads = 6\nmax_depth = 1\n", "utf8");
    const previousDirectory = process.cwd();
    const output: string[] = [];
    let resolvedCodexHome = codexHome;
    let resolvedSkillsHome = join(project, ".agents", "skills");

    try {
      process.chdir(project);
      resolvedCodexHome = join(process.cwd(), ".codex");
      resolvedSkillsHome = join(process.cwd(), ".agents", "skills");
      const code = await runCli(["install", "--scope", "project"], {
        log: (line) => output.push(line),
        confirm: async () => false,
      });
      expect(code).toBe(2);
    } finally {
      process.chdir(previousDirectory);
    }

    expect(output).toContain(`config: ${join(resolvedCodexHome, "config.toml")}`);
    expect(output).toContain(`skills: ${resolvedSkillsHome}`);
    await expect(access(join(project, ".agents", "skills"))).rejects.toThrow();
  });

  it("rejects an installed managed Skill whose packaged content has drifted", async () => {
    const home = await mkdtemp(join(tmpdir(), "slim-skill-validation-"));
    const skillsHome = join(home, "skills");

    await runCli(["install", "--preset", "openai-5.6", "--codex-home", home, "--skills-home", skillsHome, "--yes"], {
      log: () => undefined,
      confirm: async () => false,
    });
    await writeFile(join(skillsHome, "slim-council", "SKILL.md"), "drifted\n", "utf8");

    await expect(runCli(["validate", "--preset", "openai-5.6", "--codex-home", home, "--skills-home", skillsHome], {
      log: () => undefined,
      confirm: async () => false,
    })).rejects.toThrow(/slim-council|skill.*drift/i);
  });

  it("switches an existing eight-role managed installation and archives Observer", async () => {
    const home = await mkdtemp(join(tmpdir(), "slim-switch-"));
    await mkdir(join(home, "agents"));
    await writeFile(
      join(home, "config.toml"),
      '[agents]\nmax_threads = 6\nmax_depth = 1\n\n[agents.backend-advisor]\ndescription = "Unrelated custom advisor"\nconfig_file = "agents/backend-advisor.toml"\n',
      "utf8",
    );
    await writeFile(join(home, "agents", "backend-advisor.toml"), 'name = "backend-advisor"\ndescription = "Unrelated"\ndeveloper_instructions = "Advise"\n', "utf8");

    await installPreset(await previewInstall({ codexHome: home, preset: "openai-5.6" }));
    const configPath = join(home, "config.toml");
    await writeFile(configPath, `${await readFile(configPath, "utf8")}\n[agents.observer]\ndescription = "Retired managed observer"\nconfig_file = "agents/observer.toml"\n`, "utf8");
    await writeFile(join(home, "agents", "observer.toml"), 'name = "observer"\n', "utf8");

    await expect(previewInstall({ codexHome: home, preset: "openai-5.6" })).rejects.toThrow(/Existing role conflict/);

    const preview = await previewInstall({ codexHome: home, preset: "openai-5.6", mode: "switch" });
    expect(preview.inactiveManagedFiles).toContain("observer.toml");
    expect(preview.archivePath).toContain(join("agent-presets", "slim-agents-for-codex"));
    await installPreset(preview);

    const config = await readFile(join(home, "config.toml"), "utf8");
    expect(config).not.toContain("[agents.observer]");
    expect(config.match(/^\[agents\.orchestrator\]$/gm)).toHaveLength(1);
    expect(config).toContain("[agents.backend-advisor]");
    expect(await readFile(join(home, "agents", "backend-advisor.toml"), "utf8")).toContain('name = "backend-advisor"');
    await expect(access(join(home, "agents", "observer.toml"))).rejects.toThrow();
    expect(await readFile(join(preview.archivePath, "observer.toml"), "utf8")).toContain('name = "observer"');
    expect(await readFile(join(home, "agents", "orchestrator.toml"), "utf8")).toContain('name = "orchestrator"');
  });

  it("routes switch-preset through switch mode and post-validates the selected preset", async () => {
    const home = await mkdtemp(join(tmpdir(), "slim-switch-cli-"));
    const skillsHome = join(home, "skills");
    await writeFile(join(home, "config.toml"), "[agents]\nmax_threads = 6\nmax_depth = 1\n", "utf8");
    await installPreset(await previewInstall({ codexHome: home, preset: "openai-5.6" }));
    const output: string[] = [];

    const code = await runCli(["switch-preset", "--preset", "openai-5.6", "--codex-home", home, "--skills-home", skillsHome, "--yes"], {
      log: (line) => output.push(line),
      confirm: async () => false,
    });

    expect(code).toBe(0);
    expect(output).toContain(`valid installation: ${home} (7 roles)`);
    expect(output.some((line) => line.startsWith("archive: "))).toBe(true);
    expect(await readFile(join(home, "config.toml"), "utf8")).not.toContain("[agents.observer]");
    await expect(access(join(home, "agents", "observer.toml"))).rejects.toThrow();
  });

  it("archives replaced managed Skills and preserves unrelated Skills during a switch", async () => {
    const home = await mkdtemp(join(tmpdir(), "slim-switch-skills-"));
    const skillsHome = join(home, "skills");
    await writeFile(join(home, "config.toml"), "[agents]\nmax_threads = 6\nmax_depth = 1\n", "utf8");
    await runCli(["install", "--preset", "openai-5.6", "--codex-home", home, "--skills-home", skillsHome, "--yes"], {
      log: () => undefined,
      confirm: async () => false,
    });
    await writeFile(join(skillsHome, "slim-council", "local-note.txt"), "preserve in archive\n", "utf8");
    await mkdir(join(skillsHome, "unrelated-skill"));
    await writeFile(join(skillsHome, "unrelated-skill", "SKILL.md"), "unrelated\n", "utf8");

    const preview = await previewInstall({ codexHome: home, skillsHome, preset: "openai-5.6", mode: "switch" });
    expect(preview.existingManagedSkills).toEqual(["slim-council", "slim-orchestration"]);
    await installPreset(preview);

    expect(await readFile(join(preview.archivePath, "skills", "slim-council", "local-note.txt"), "utf8")).toBe("preserve in archive\n");
    await expect(access(join(skillsHome, "slim-council", "local-note.txt"))).rejects.toThrow();
    expect(await readFile(join(skillsHome, "unrelated-skill", "SKILL.md"), "utf8")).toBe("unrelated\n");
    expect(await readFile(join(skillsHome, "slim-council", "SKILL.md"), "utf8")).toBe(
      await readFile(join(process.cwd(), ".agents", "skills", "slim-council", "SKILL.md"), "utf8"),
    );
  });
});
