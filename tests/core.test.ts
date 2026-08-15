import { cp, mkdir, mkdtemp, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "smol-toml";
import { packagedSkillsHome } from "../src/core/installer.js";
import { generatePreset, presets, renderAliases, resolvePreset, roles } from "../src/core/presets.js";
import { runCli } from "../src/cli.js";

async function copyPresetSnapshot(id: string, targetRoot: string) {
  await cp(join(process.cwd(), "presets", id), join(targetRoot, id), { recursive: true });
}

async function createCodexHomeFromPreset(id: string) {
  const home = await mkdtemp(join(tmpdir(), "slim-codex-home-"));
  const generated = generatePreset(id);
  await mkdir(join(home, "agents"), { recursive: true });
  const config = "[agents]\nmax_threads = 6\nmax_depth = 2\n\n" + generated.roleOrder.map((name) => `[agents.${name}]\ndescription = ${JSON.stringify(generated.roles[name].description)}\nconfig_file = ${JSON.stringify(`agents/${name}.toml`)}\n`).join("\n");
  await writeFile(join(home, "config.toml"), config, "utf8");
  for (const name of generated.roleOrder) await writeFile(join(home, "agents", `${name}.toml`), generated.agents[name], "utf8");
  return { home, generated };
}

describe("preset generation", () => {
  it("keeps immutable presets and resolves latest to the reviewed 5.6.4 role contract", () => {
    expect(resolvePreset("latest").id).toBe("openai-5.6.4");
    expect(resolvePreset("recommended").id).toBe("openai-5.6.4");
    expect(roles).toBe(generatePreset("latest").roles);
    expect(resolvePreset("openai-5.6.4").models).toEqual(resolvePreset("openai-5.6.3").models);
    expect(resolvePreset("openai-5.6.2").models).toEqual(resolvePreset("openai-5.6.1").models);
    expect(resolvePreset("openai-5.6.3").models).toEqual({
      orchestrator: { model: "gpt-5.6-terra", effort: "high" },
      oracle: { model: "gpt-5.6-sol", effort: "high" },
      librarian: { model: "gpt-5.6-luna", effort: "low" },
      explorer: { model: "gpt-5.6-luna", effort: "low" },
      designer: { model: "gpt-5.6-luna", effort: "medium" },
      fixer: { model: "gpt-5.6-luna", effort: "high" },
      council: { model: "gpt-5.6-sol", effort: "high" },
    });
    expect(resolvePreset("openai-5.5").id).toBe("openai-5.5");
    expect(resolvePreset("openai-5.6").id).toBe("openai-5.6");
  });

  it("preserves the immutable eight-role presets", () => {
    const generated = generatePreset("openai-5.6");
    expect(Object.keys(generated.agents)).toHaveLength(8);
    expect(generated.agents).toHaveProperty("observer");
  });

  it("generates seven Codex-native roles without observer or councillor", () => {
    const first = generatePreset("openai-5.6.1");
    const second = generatePreset("openai-5.6.1");
    expect(first).toEqual(second);
    expect(Object.keys(first.agents)).toHaveLength(7);
    expect(first.agents).not.toHaveProperty("observer");
    expect(first.agents).not.toHaveProperty("councillor");
    expect(first.snippet).not.toContain("[agents.observer]");
    expect(first.snippet).not.toContain("[agents.councillor]");
    expect(JSON.stringify(first)).not.toMatch(/councillor/i);
    expect(first.snippet).toContain("[agents.explorer]");
    expect(first.snippet).toContain('config_file = "agents/explorer.toml"');
    expect(first.agents.explorer).toContain('name = "explorer"');
    expect(first.agents.explorer).toContain('model = "gpt-5.6-luna"');
    expect(first.agents.explorer).not.toMatch(/task_id|council_session|Background Job Board/);
  });

  it("generates primary orchestrator and council profiles with their Root defaults", () => {
    const generated = generatePreset("openai-5.6.2");
    const orchestrator = parse(generated.rootProfiles.orchestrator) as Record<string, unknown>;
    const council = parse(generated.rootProfiles.council) as Record<string, unknown>;

    expect(orchestrator).toMatchObject({
      model: "gpt-5.6-terra",
      model_reasoning_effort: "xhigh",
      sandbox_mode: "workspace-write",
    });
    expect(orchestrator.developer_instructions).toMatch(/primary Root Orchestrator.*\$slim-orchestration.*Do not spawn another orchestrator or council/is);
    expect(council).toMatchObject({
      model: "gpt-5.6-sol",
      model_reasoning_effort: "medium",
      sandbox_mode: "read-only",
    });
    expect(council.developer_instructions).toMatch(/primary Root Council chair.*\$slim-council.*advisory-only/is);
  });

  it("keeps every retained GPT-5.5 model and effort mapping unchanged", () => {
    const retained = ["orchestrator", "oracle", "librarian", "explorer", "designer", "fixer", "council"];
    const legacy = resolvePreset("openai-5.5");
    const revision = resolvePreset("openai-5.5.1");
    for (const name of retained) expect(revision.models[name]).toEqual(legacy.models[name]);
    expect(revision.models).not.toHaveProperty("observer");
  });

  it("uses the requested GPT-5.6.1 model and effort mappings", () => {
    expect(resolvePreset("openai-5.6.1").models).toEqual({
      orchestrator: { model: "gpt-5.6-terra", effort: "xhigh" },
      oracle: { model: "gpt-5.6-sol", effort: "xhigh" },
      librarian: { model: "gpt-5.6-luna", effort: "low" },
      explorer: { model: "gpt-5.6-luna", effort: "low" },
      designer: { model: "gpt-5.6-luna", effort: "medium" },
      fixer: { model: "gpt-5.6-luna", effort: "xhigh" },
      council: { model: "gpt-5.6-sol", effort: "high" },
    });
  });

  it("ports the reviewed upstream specialist prompts into generated developer instructions", () => {
    const generated = generatePreset("openai-5.6.2");
    const instructions = Object.fromEntries(
      Object.entries(generated.agents).map(([name, toml]) => [
        name,
        (parse(toml) as { developer_instructions: string }).developer_instructions,
      ]),
    );

    expect(instructions.oracle).toMatch(/identify root causes.*architectural solutions with trade-?offs.*YAGNI/is);
    expect(instructions.librarian).toMatch(/external repositories.*official documentation.*implementation examples.*library internals/is);
    expect(instructions.librarian).toMatch(/evidence-based answers with sources.*official docs.*official and community patterns/is);
    expect(instructions.librarian).not.toMatch(/prefer.*CodeGraph/i);
    expect(instructions.explorer).toMatch(/text\/regex patterns.*structural patterns.*file discovery/is);
    expect(instructions.explorer).toMatch(/line numbers/is);
    expect(instructions.explorer).toMatch(/<results>\s*<files>.*<\/files>\s*<answer>/is);
    for (const section of ["Typography", "Color & Theme", "Motion & Interaction", "Spatial Composition", "Visual Depth", "Styling Approach", "Match Vision to Execution"]) {
      expect(instructions.designer).toContain(section);
    }
    expect(instructions.designer).toMatch(/distinctive, characterful fonts.*cohesive aesthetic.*one well-timed animation/is);
    expect(instructions.fixer).toMatch(/implement, not plan or research.*no external research.*no design work/is);
    expect(instructions.fixer).toMatch(/<summary>.*<changes>.*<verification>.*skip reason/is);
    for (const name of ["designer", "fixer"]) expect(instructions[name]).toMatch(/apply_patch.*destructive.*target/is);
    for (const name of ["oracle", "librarian", "explorer"]) expect(instructions[name]).toMatch(/READ-ONLY.*do not modify files/is);
  });

  it("ports the 2.2.14 verification ownership contract without OpenCode runtime instructions", () => {
    const generated = generatePreset("openai-5.6.3");
    const instructions = Object.fromEntries(
      Object.entries(generated.agents).map(([name, toml]) => [
        name,
        (parse(toml) as { developer_instructions: string }).developer_instructions,
      ]),
    );

    expect(instructions.orchestrator).toMatch(/every delegation names a validation owner and allowed scope/i);
    expect(instructions.orchestrator).toMatch(/reconcile all writer lanes before final validation/i);
    expect(instructions.orchestrator).toMatch(/reuse still-valid evidence.*final state changed/is);
    for (const name of ["designer", "fixer"]) {
      expect(instructions[name]).toMatch(/run only validation assigned by the Orchestrator/i);
      expect(instructions[name]).toMatch(/report validation results and skips accurately/i);
    }
    expect(instructions.designer).toMatch(/assigned validation should be user-visible/i);
    expect(instructions.fixer).toMatch(/Performed:.*Result:/is);
    expect(JSON.stringify(instructions)).not.toMatch(/task_result|Background Job Board|wait_for_user|wake scheduler|restart recovery|multiplexer/i);
  });

  it("lets the latest orchestrator use CodeGraph and Oracle use ponytail-review when installed", () => {
    const generated = generatePreset("latest");
    const orchestrator = (parse(generated.agents.orchestrator) as { developer_instructions: string }).developer_instructions;
    const oracle = (parse(generated.agents.oracle) as { developer_instructions: string }).developer_instructions;

    expect(orchestrator).not.toMatch(/MCP denylist:.*codegraph/i);
    expect(oracle).toMatch(/\$ponytail-review.*when available/is);
  });

  it("adapts upstream routing and synthesis contracts without weakening Codex coordinator boundaries", () => {
    const generated = generatePreset("openai-5.6.2");
    const orchestrator = (parse(generated.agents.orchestrator) as { developer_instructions: string }).developer_instructions;
    const council = (parse(generated.agents.council) as { developer_instructions: string }).developer_instructions;

    for (const name of ["explorer", "librarian", "oracle", "designer", "fixer"]) {
      expect(orchestrator).toMatch(new RegExp(`\\b${name}\\b[\\s\\S]*?Delegate when[\\s\\S]*?Do not delegate when`, "i"));
    }
    expect(orchestrator).toMatch(/routing threshold.*plan and parallelize.*design handoff.*verify/is);
    expect(orchestrator).toMatch(/root-approved.*only.*five Slim specialists/is);
    expect(orchestrator).toMatch(/do not (?:spawn|delegate to).*(?:orchestrator|council)/i);
    expect(orchestrator).not.toMatch(/observer|councillor|task_id|Background Job Board/i);

    expect(council).toMatch(/Synthesis Process.*review each.*individually.*agreements.*contradictions.*resolve.*reasoning/is);
    expect(council).toMatch(/Perspective Details.*key insight.*confidence.*agreement.*disagreement/is);
    expect(council).toMatch(/Root.*pre-approved.*Council-safe.*read-only/is);
    expect(council).toMatch(/unanimous.*majority.*split.*insufficient evidence/is);
    expect(council).toMatch(/do not spawn.*(?:orchestrator|council)/i);
  });

  it("encodes bounded recursive orchestration for the five Slim specialists", () => {
    const prompt = generatePreset("openai-5.6.1").roles.orchestrator.instructions;
    for (const name of ["explorer", "librarian", "oracle", "designer", "fixer"]) expect(prompt).toContain(`\`${name}\``);
    expect(prompt).toMatch(/child|subagent/i);
    expect(prompt).toMatch(/wait|reconcile/i);
    expect(prompt).toMatch(/do not.*delegate|must not.*delegate/i);
    expect(prompt).toMatch(/fork_turns\s*=\s*["']none["']/i);
    expect(prompt).not.toMatch(/observer|councillor|task_id|council_session|Background Job Board/i);
  });

  it("lets council assemble installed experts without recursive council fan-out", () => {
    const prompt = generatePreset("openai-5.6.1").roles.council.instructions;
    expect(prompt).toMatch(/available|installed/i);
    expect(prompt).toMatch(/specialist|expert/i);
    expect(prompt).toMatch(/spawn|delegate/i);
    expect(prompt).toMatch(/do not.*council|never.*council/i);
    expect(prompt).toContain("Council Response");
    expect(prompt).toContain("Perspective Details");
    expect(prompt).toContain("Council Summary");
    expect(prompt).toMatch(/untrusted data.*not instructions/is);
    expect(prompt).toMatch(/advisory.*do not edit|do not edit.*advisory/is);
    expect(prompt).toMatch(/Root.*pre-approved.*Council-safe.*read-only/is);
    expect(prompt).toMatch(/do not assume.*read-only.*child.*privilege/is);
    expect(prompt).toMatch(/fork_turns\s*=\s*["']none["']/i);
    expect(prompt).not.toMatch(/provider diversity|council_session|councillor/i);
  });

  it("gives council portable preferred methods without hard-coded skill paths", () => {
    const prompt = generatePreset("openai-5.6.1").roles.council.instructions;
    for (const skill of ["grilling", "grill-with-docs", "deep-research", "brainstorming", "doc-coauthoring"]) expect(prompt).toContain(`$${skill}`);
    expect(prompt).toMatch(/when available|if available/i);
    expect(prompt).toMatch(/do not claim|never claim/i);
    expect(generatePreset("openai-5.6.1").agents.council).not.toMatch(/\[\[skills\.config\]\]|SKILL\.md/i);
  });

  it("keeps orchestration execution and council deliberation in separate skills", async () => {
    const orchestration = await readFile(join(process.cwd(), ".agents", "skills", "slim-orchestration", "SKILL.md"), "utf8");
    const council = await readFile(join(process.cwd(), ".agents", "skills", "slim-council", "SKILL.md"), "utf8");

    for (const role of ["explorer", "librarian", "oracle", "designer", "fixer"]) expect(orchestration).toContain(`\`${role}\``);
    expect(orchestration).toMatch(/scheduler/i);
    expect(orchestration).toMatch(/critical path/i);
    expect(orchestration).toMatch(/single.writer/i);
    expect(orchestration).toMatch(/phase gate/i);
    expect(orchestration).toMatch(/complete when/i);
    expect(orchestration).toMatch(/\.slim\/deepwork\//i);
    expect(orchestration).toMatch(/oracle.*review|review.*oracle/is);
    expect(orchestration).toMatch(/at most two re-reviews/i);
    expect(orchestration).toMatch(/review attempt.*re-review remaining/is);
    expect(orchestration).toMatch(/designer.*handoff|handoff.*designer/is);
    expect(orchestration).toMatch(/wait for every required lane/i);
    expect(orchestration).toMatch(/fork_turns\s*=\s*["']none["']/i);
    expect(orchestration).not.toMatch(/\.ignore|council_session|task_id|Background Job Board/i);
    expect(orchestration).not.toMatch(/\$grilling|\$deep-research|select.*installed.*agent/is);

    for (const method of ["grilling", "grill-with-docs", "deep-research", "brainstorming", "doc-coauthoring"]) expect(council).toContain(`$${method}`);
    expect(council).toMatch(/installed agents.*descriptions|descriptions.*installed agents/is);
    expect(council).toMatch(/feasibility|viable/i);
    expect(council).toMatch(/risk/i);
    expect(council).toMatch(/quorum/i);
    expect(council).toMatch(/blind/i);
    expect(council).toMatch(/complete when/i);
    expect(council).toMatch(/root.*approv|root.*authoriz/i);
    expect(council).toMatch(/independent/i);
    expect(council).toMatch(/advisory.*must not edit|must not edit.*advisory/is);
    expect(council).toMatch(/descriptions?.*data.*not instructions|untrusted.*descriptions?/is);
    expect(council).toMatch(/sandbox_mode = "read-only"/i);
    expect(council).toMatch(/parent turn.*read-only permissions/is);
    expect(council).toMatch(/fork_turns\s*=\s*["']none["']/i);
    expect(council).toMatch(/unverified custom agents/is);
    expect(council).toMatch(/some members fail|failed.*remaining valid responses/is);
    expect(council).toMatch(/all members fail|critical required domain/is);
    expect(council).toMatch(/unanimous.*majority.*split.*insufficient evidence/is);
    expect(council).not.toMatch(/council_session|provider preset|hidden `councillor` role/i);
    expect(council).not.toMatch(/\.slim\/deepwork\//i);
  });

  it("moves visual inspection into retained specialists", () => {
    const generated = generatePreset("openai-5.6.1");
    expect(generated.roles.explorer.instructions).toMatch(/visual/i);
    expect(generated.roles.designer.instructions).toMatch(/screenshots|visual files/i);
    expect(generated.roles.oracle.instructions).toMatch(/diagrams|screenshots/i);
  });

  it("changes models but preserves prompts across 5.5 and 5.6", () => {
    const oldPreset = generatePreset("openai-5.5");
    const newPreset = generatePreset("openai-5.6");
    expect(oldPreset.agents.oracle).toContain('model = "gpt-5.5"');
    expect(newPreset.agents.oracle).toContain('model = "gpt-5.6-sol"');
    expect(oldPreset.roles.oracle.instructions).toBe(newPreset.roles.oracle.instructions);
  });

  it("generates the exact behavioral MCP denylist for every role and preset", () => {
    const expected: Record<string, string[]> = {
      orchestrator: ["codegraph", "context7", "exa", "grep"],
      oracle: ["context7", "grep"],
      librarian: ["codegraph"],
      explorer: ["context7", "exa", "grep"],
      designer: ["context7", "exa", "grep"],
      fixer: ["context7", "grep"],
      council: [],
      observer: [],
    };
    for (const id of Object.keys(presets)) {
      const generated = generatePreset(id);
      for (const [name, toml] of Object.entries(generated.agents)) {
        const document = parse(toml) as { developer_instructions: string; mcp_servers?: Record<string, unknown> };
        expect(Object.keys(document.mcp_servers ?? {})).toEqual([]);
        const deniedMcps = name === "orchestrator" && id === "openai-5.6.4" ? ["context7", "exa", "grep"] : expected[name];
        if (deniedMcps.length > 0) expect(document.developer_instructions).toContain(`MCP denylist: ${deniedMcps.join(", ")}.`);
        else expect(document.developer_instructions).not.toContain("MCP denylist:");
      }
      expect(generated.snippet).not.toContain("[mcp_servers.");
    }
  });

  it("omits transport-dependent MCP fragments from standalone role files", () => {
    for (const id of Object.keys(presets)) {
      const generated = generatePreset(id);
      for (const toml of Object.values(generated.agents)) {
        expect(toml).not.toContain("[mcp_servers.");
        expect(toml).not.toContain("slim-agents-disabled-mcp");
      }
    }
  });

  it("keeps committed snapshots byte-equal to every generated preset", async () => {
    for (const id of Object.keys(presets)) {
      const generated = generatePreset(id);
      const root = join(process.cwd(), "presets", id);
      const files = (await readdir(join(root, "agents"))).sort();
      expect(files).toEqual(generated.roleOrder.map((name) => `${name}.toml`).sort());
      for (const [name, content] of Object.entries(generated.rootProfiles)) expect(await readFile(join(root, `${name}.config.toml`), "utf8")).toBe(content);
      expect(await readFile(join(root, "config.snippet.toml"), "utf8")).toBe(generated.snippet);
      expect(await readFile(join(root, "manifest.json"), "utf8")).toBe(generated.manifest);
      for (const name of generated.roleOrder) expect(await readFile(join(root, "agents", `${name}.toml`), "utf8")).toBe(generated.agents[name]);
    }
  });

  it("keeps the committed aliases synchronized with the generator", async () => {
    expect(await readFile(join(process.cwd(), "presets", "aliases.json"), "utf8")).toBe(renderAliases());
  });
});

describe("CLI", () => {
  it("lists immutable presets and aliases", async () => {
    const output: string[] = [];
    const code = await runCli(["list-presets"], { log: (line) => output.push(line), confirm: async () => false });
    expect(code).toBe(0);
    expect(output.join("\n")).toContain("openai-5.5");
    expect(output.join("\n")).toContain("latest -> openai-5.6.4");
  });

  it("validates both legacy and current role sets against their selected preset", async () => {
    for (const id of ["openai-5.6", "openai-5.6.1"]) {
      const output: string[] = [];
      const code = await runCli(["validate", "--preset", id, "--path", join(process.cwd(), "presets", id, "agents")], { log: (line) => output.push(line), confirm: async () => false });
      expect(code).toBe(0);
      expect(output).toContain(`valid: ${join(process.cwd(), "presets", id, "agents")} (${id.endsWith(".1") ? 7 : 8} roles)`);
    }
  });

  it("convert --check rejects a missing selected manifest without mutating files", async () => {
    const outputRoot = await mkdtemp(join(tmpdir(), "slim-convert-check-"));
    await copyPresetSnapshot("openai-5.6.1", outputRoot);
    await unlink(join(outputRoot, "openai-5.6.1", "manifest.json"));
    const drifted = 'name = "explorer"\n# drift stays drifted when check fails\n';
    await writeFile(join(outputRoot, "openai-5.6.1", "agents", "explorer.toml"), drifted, "utf8");

    await expect(runCli(["convert", "--preset", "openai-5.6.1", "--output", outputRoot, "--check"], { log: () => undefined, confirm: async () => false })).rejects.toThrow(/manifest|drift|snapshot/i);
    await expect(readFile(join(outputRoot, "openai-5.6.1", "manifest.json"), "utf8")).rejects.toThrow();
    expect(await readFile(join(outputRoot, "openai-5.6.1", "agents", "explorer.toml"), "utf8")).toBe(drifted);
  });

  it("convert --check with --all also covers aliases.json without recreating it", async () => {
    const outputRoot = await mkdtemp(join(tmpdir(), "slim-convert-all-check-"));
    for (const id of Object.keys(presets)) await copyPresetSnapshot(id, outputRoot);

    await expect(runCli(["convert", "--all", "--output", outputRoot, "--check"], { log: () => undefined, confirm: async () => false })).rejects.toThrow(/aliases|snapshot|drift/i);
    await expect(readFile(join(outputRoot, "aliases.json"), "utf8")).rejects.toThrow();
  });

  it("convert --check rejects extra stale managed agent files without deleting them", async () => {
    const outputRoot = await mkdtemp(join(tmpdir(), "slim-convert-extra-agent-"));
    await copyPresetSnapshot("openai-5.6.1", outputRoot);
    const staleObserver = join(outputRoot, "openai-5.6.1", "agents", "observer.toml");
    await writeFile(staleObserver, 'name = "observer"\n', "utf8");

    await expect(runCli(["convert", "--preset", "openai-5.6.1", "--output", outputRoot, "--check"], { log: () => undefined, confirm: async () => false })).rejects.toThrow(/agent files|observer|snapshot/i);
    expect(await readFile(staleObserver, "utf8")).toBe('name = "observer"\n');
  });

  it("convert generation removes stale managed roles but preserves unrelated TOMLs", async () => {
    const outputRoot = await mkdtemp(join(tmpdir(), "slim-convert-clean-"));
    await copyPresetSnapshot("openai-5.6.1", outputRoot);
    const agentsPath = join(outputRoot, "openai-5.6.1", "agents");
    const staleObserver = join(agentsPath, "observer.toml");
    const unrelated = join(agentsPath, "local-note.toml");
    await writeFile(staleObserver, 'name = "observer"\n', "utf8");
    await writeFile(unrelated, 'note = "preserve"\n', "utf8");

    expect(await runCli(["convert", "--preset", "openai-5.6.1", "--output", outputRoot], { log: () => undefined, confirm: async () => false })).toBe(0);

    await expect(readFile(staleObserver, "utf8")).rejects.toThrow();
    expect(await readFile(unrelated, "utf8")).toBe('note = "preserve"\n');
  });

  it("validate --path rejects semantic role drift beyond truthy fields", async () => {
    const outputRoot = await mkdtemp(join(tmpdir(), "slim-validate-path-"));
    await copyPresetSnapshot("openai-5.6.1", outputRoot);
    const agentsPath = join(outputRoot, "openai-5.6.1", "agents");
    const original = await readFile(join(agentsPath, "explorer.toml"), "utf8");
    const drifted = original.replace('sandbox_mode = "read-only"', 'sandbox_mode = "danger-full-access"');
    expect(drifted).not.toBe(original);
    await writeFile(
      join(agentsPath, "explorer.toml"),
      drifted,
      "utf8",
    );

    await expect(runCli(["validate", "--preset", "openai-5.6.1", "--path", agentsPath], { log: () => undefined, confirm: async () => false })).rejects.toThrow(/explorer|invalid|drift|sandbox/i);
  });

  it("validate --codex-home rejects drifted installed role semantics", async () => {
    const { home } = await createCodexHomeFromPreset("openai-5.6.1");
    const original = await readFile(join(home, "agents", "oracle.toml"), "utf8");
    const drifted = original.replace('description = "Read-only strategic advisor for architecture, difficult debugging, risk, simplification, and code review."', 'description = "Drifted oracle description"');
    expect(drifted).not.toBe(original);
    await writeFile(
      join(home, "agents", "oracle.toml"),
      drifted,
      "utf8",
    );

    await expect(runCli(["validate", "--preset", "openai-5.6.1", "--codex-home", home, "--skills-home", packagedSkillsHome], { log: () => undefined, confirm: async () => false })).rejects.toThrow(/oracle|invalid|drift|description/i);
  });
});
