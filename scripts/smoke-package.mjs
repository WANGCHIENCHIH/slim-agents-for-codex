#!/usr/bin/env node
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
assert(process.env.npm_execpath, "Run with npm run pack:smoke [-- package.tgz]");
assert(process.argv.length <= 3, "Expected at most one package path");
const smokeRoot = mkdtempSync(join(resolve(tmpdir()), "slim package smoke-"));
const run = (args, options = {}) => execFileSync(process.execPath, args, {
  cwd: root, encoding: "utf8", stdio: "inherit", ...options,
});
const npm = (args, options) => run([process.env.npm_execpath, ...args], options);

try {
  const archive = process.argv[2] ? resolve(process.argv[2]) : join(smokeRoot,
    Object.values(JSON.parse(npm(["pack", "--json", "--pack-destination", smokeRoot], { stdio: ["ignore", "pipe", "inherit"] })))[0].filename);
  const prefix = join(smokeRoot, "npm");
  npm(["install", "--prefix", prefix, "--ignore-scripts", "--no-audit", "--no-fund", "--package-lock=false", archive]);
  const installed = join(prefix, "node_modules", "slim-agents-for-codex");
  const cli = join(installed, "dist", "cli.js");
  const { recommended } = JSON.parse(readFileSync(join(installed, "presets", "aliases.json"), "utf8"));
  assert.equal(typeof recommended, "string");
  const listed = run([cli, "list-presets"], { stdio: ["ignore", "pipe", "inherit"] });
  assert(listed.split(/\r?\n/).includes(`recommended -> ${recommended}`));
  const targets = ["--preset", recommended, "--codex-home", join(smokeRoot, "codex"), "--skills-home", join(smokeRoot, "skills")];
  run([cli, "install", ...targets, "--yes"]);
  run([cli, "validate", ...targets]);
  for (const skill of ["slim-council", "slim-orchestration"]) {
    assert.equal(readFileSync(join(smokeRoot, "skills", skill, "SKILL.md"), "utf8"),
      readFileSync(join(installed, ".agents", "skills", skill, "SKILL.md"), "utf8"));
  }
  console.log(`Packed installation verified: ${recommended}, agents and both Skills`);
} finally {
  assert.equal(dirname(smokeRoot), resolve(tmpdir()));
  rmSync(smokeRoot, { recursive: true, force: true });
}
