import { describe, expect, it } from "vitest";
import { generatePreset, resolvePreset } from "../src/core/presets.js";
import { runCli } from "../src/cli.js";

describe("preset generation", () => {
  it("keeps immutable presets and resolves latest to 5.6", () => {
    expect(resolvePreset("latest").id).toBe("openai-5.6");
    expect(resolvePreset("openai-5.5").id).toBe("openai-5.5");
  });

  it("generates the eight upstream agents without inventing a councillor agent", () => {
    const first = generatePreset("openai-5.6");
    const second = generatePreset("openai-5.6");
    expect(first).toEqual(second);
    expect(Object.keys(first.agents)).toHaveLength(8);
    expect(first.agents).not.toHaveProperty("councillor");
    expect(first.snippet).not.toContain("[agents.councillor]");
    expect(JSON.stringify(first)).not.toMatch(/councillor/i);
    expect(first.snippet).toContain("[agents.explorer]");
    expect(first.snippet).toContain('config_file = "agents/explorer.toml"');
    expect(first.agents.explorer).toContain('name = "explorer"');
    expect(first.agents.explorer).toContain('model = "gpt-5.6-luna"');
    expect(first.agents.explorer).not.toMatch(/task_id|council_session|Background Job Board/);
  });

  it("changes models but preserves prompts across 5.5 and 5.6", () => {
    const oldPreset = generatePreset("openai-5.5");
    const newPreset = generatePreset("openai-5.6");
    expect(oldPreset.agents.oracle).toContain('model = "gpt-5.5"');
    expect(newPreset.agents.oracle).toContain('model = "gpt-5.6-sol"');
    expect(oldPreset.roles.oracle.instructions).toBe(newPreset.roles.oracle.instructions);
  });

  it("disables context7 only for the orchestrator in every preset", () => {
    for (const id of ["openai-5.5", "openai-5.6"]) {
      const generated = generatePreset(id);
      expect(generated.agents.orchestrator).toContain("[mcp_servers.context7]\nenabled = false");
      for (const [name, toml] of Object.entries(generated.agents)) {
        if (name !== "orchestrator") expect(toml).not.toContain("[mcp_servers.context7]");
      }
      expect(generated.snippet).not.toContain("[mcp_servers.context7]");
    }
  });
});

describe("CLI", () => {
  it("lists immutable presets and aliases", async () => {
    const output: string[] = [];
    const code = await runCli(["list-presets"], { log: (line) => output.push(line), confirm: async () => false });
    expect(code).toBe(0);
    expect(output.join("\n")).toContain("openai-5.5");
    expect(output.join("\n")).toContain("latest -> openai-5.6");
  });
});
