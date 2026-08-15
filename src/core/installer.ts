import { copyFile, cp, mkdir, readFile, readdir, realpath, rename, rm, stat, unlink, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { isDeepStrictEqual } from "node:util";
import { fileURLToPath } from "node:url";
import { parse } from "smol-toml";
import { generatePreset, managedRoleNames } from "./presets.js";

export const managedSkillNames = ["slim-council", "slim-orchestration"] as const;
export const packagedSkillsHome = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", ".agents", "skills");

export interface InstallRequest { codexHome: string; preset: string; mode?: "install" | "switch"; skillsHome?: string }
export interface InstalledPresetValidationRequest { codexHome: string; skillsHome: string; preset: string }
export type RollbackStatus = "complete" | "incomplete";
export type RollbackFailurePhase = "restore" | "verify" | "cleanup";
export type RollbackFailureCategory = "config" | "agents" | "skills" | "temporary" | "recovery";
export interface InstallRollbackFailure {
  category: RollbackFailureCategory;
  phase: RollbackFailurePhase;
  reason: string;
  error: unknown;
}

export class InstallRollbackError extends Error {
  readonly reason: string;

  constructor(
    readonly originalError: unknown,
    readonly rollback: RollbackStatus,
    readonly recoveryArtifacts: string[],
    readonly unresolved: string[] = [],
    readonly rollbackFailures: InstallRollbackFailure[] = [],
  ) {
    super(originalError instanceof Error ? originalError.message : String(originalError));
    this.name = "InstallRollbackError";
    this.reason = controlledInstallFailureReason(originalError);
  }
}

function controlledInstallFailureReason(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message.startsWith("Preview drift:")) return "managed state changed after preview";
  if (/managed roles|Role semantic|config_file|Skill/i.test(message)) return "installed preset validation failed";
  return "filesystem apply failed";
}

function controlledRollbackFailureReason(category: RollbackFailureCategory, phase: RollbackFailurePhase): string {
  const subject = {
    config: "config",
    agents: "managed agents",
    skills: "managed Skills",
    temporary: "temporary state",
    recovery: "recovery artifacts",
  }[category];
  if (phase === "restore") return `${subject} could not be restored`;
  if (phase === "cleanup") return `${subject} could not be cleaned`;
  return `${subject} could not be verified`;
}

export interface InstallPreview {
  request: InstallRequest;
  configPath: string;
  configBefore?: Buffer;
  temporaryPath: string;
  temporaryPathExisted: boolean;
  temporaryPathBefore?: Buffer;
  backupPath?: string;
  archivePath: string;
  updated: Buffer;
  files: Record<string, string>;
  managedFileContents: Record<string, Buffer>;
  existingManagedFiles: string[];
  inactiveManagedFiles: string[];
  skillsHome: string;
  managedSkillFiles: Record<string, Record<string, Buffer>>;
  existingManagedSkills: string[];
  installSkills: boolean;
  resolvedPreset: string;
}

function configuredManagedRoles(text: string): string[] {
  return managedRoleNames.filter((name) => new RegExp(`^\\[agents\\.${name}\\]$`, "m").test(text));
}

function stripManagedRoleSections(text: string, newline: string): string {
  const managed = new Set(managedRoleNames);
  const output: string[] = [];
  let skipping = false;
  for (const line of text.split(newline)) {
    const header = line.match(/^\s*\[([^\]]+)\]\s*$/);
    if (header) {
      const role = header[1].match(/^agents\.([^.]+)$/);
      skipping = Boolean(role && managed.has(role[1]));
    }
    if (!skipping) output.push(line);
  }
  return output.join(newline);
}

function updateConfig(text: string, newline: string, generated: ReturnType<typeof generatePreset>, mode: "install" | "switch"): string {
  const configured = configuredManagedRoles(text);
  if (mode === "install" && configured.length > 0) throw new Error(`Existing role conflict: ${configured[0]}`);
  const editable = mode === "switch" ? stripManagedRoleSections(text, newline) : text;
  const headers = [...editable.matchAll(/^\[agents\]\s*$/gm)];
  if (headers.length !== 1 || headers[0].index === undefined) throw new Error("Expected one [agents] table");
  const sectionStart = headers[0].index + headers[0][0].length;
  const nextHeader = editable.slice(sectionStart).search(/^\[.+\]\s*$/m);
  const sectionEnd = nextHeader < 0 ? editable.length : sectionStart + nextHeader;
  const section = editable.slice(sectionStart, sectionEnd);
  if (!/^max_threads\s*=\s*6\s*$/m.test(section)) throw new Error("Expected max_threads = 6");
  if (!/^max_depth\s*=\s*[12]\s*$/m.test(section)) throw new Error("Expected max_depth = 1 or 2");
  const snippet = generated.snippet.replaceAll("\n", newline);
  const roleStart = snippet.indexOf(`[agents.`);
  if (roleStart < 0) throw new Error("Generated config snippet has no agent roles");
  const roles = snippet.slice(roleStart).replace(/[\r\n]+$/, "");
  const updated = editable.replace(/^max_depth\s*=\s*[12]\s*$/m, "max_depth = 2").replace(/[\r\n]+$/, "");
  return updated + newline.repeat(2) + roles + newline;
}

async function existingManagedAgentFiles(codexHome: string): Promise<string[]> {
  try {
    const files = await readdir(join(codexHome, "agents"));
    const managedFiles = new Set(managedRoleNames.map((name) => `${name}.toml`));
    return files.filter((name) => managedFiles.has(name)).sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

async function canonicalPath(path: string): Promise<string> {
  try {
    path = await realpath(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    path = resolve(path);
  }
  return process.platform === "win32" ? path.toLowerCase() : path;
}

async function sameLocation(left: string, right: string): Promise<boolean> {
  return await canonicalPath(left) === await canonicalPath(right);
}

async function existingManagedSkillDirectories(skillsHome: string): Promise<string[]> {
  const existing: string[] = [];
  for (const name of managedSkillNames) if (await pathExists(join(skillsHome, name))) existing.push(name);
  return existing;
}

async function filesBelow(root: string, directory = root): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesBelow(root, path));
    else files.push(relative(root, path));
  }
  return files.sort();
}

async function managedAgentContents(codexHome: string, files: string[]): Promise<Record<string, Buffer>> {
  const contents: Record<string, Buffer> = {};
  for (const file of files) contents[file] = await readFile(join(codexHome, "agents", file));
  return contents;
}

async function managedSkillContents(skillsHome: string, names: string[]): Promise<Record<string, Record<string, Buffer>>> {
  const contents: Record<string, Record<string, Buffer>> = {};
  for (const name of names) {
    const files = await filesBelow(join(skillsHome, name));
    contents[name] = {};
    for (const file of files) contents[name][file] = await readFile(join(skillsHome, name, file));
  }
  return contents;
}

async function temporaryPathSnapshot(path: string): Promise<{ existed: boolean; content?: Buffer }> {
  try {
    const info = await stat(path);
    return info.isFile() ? { existed: true, content: await readFile(path) } : { existed: true };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { existed: false };
    throw error;
  }
}

async function assertConfigUnchanged(preview: InstallPreview): Promise<void> {
  let config: Buffer | undefined;
  try {
    config = await readFile(preview.configPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  if (preview.configBefore === undefined ? config !== undefined : config === undefined || !config.equals(preview.configBefore)) {
    throw new Error("Preview drift: config changed after preview");
  }
}

async function assertManagedAgentsUnchanged(preview: InstallPreview): Promise<void> {
  const currentManagedFiles = await existingManagedAgentFiles(preview.request.codexHome);
  if (JSON.stringify(currentManagedFiles) !== JSON.stringify(preview.existingManagedFiles)) {
    throw new Error("Preview drift: managed agent paths changed after preview");
  }
  const currentManagedFileContents = await managedAgentContents(preview.request.codexHome, currentManagedFiles);
  for (const file of currentManagedFiles) {
    if (!currentManagedFileContents[file].equals(preview.managedFileContents[file])) {
      throw new Error(`Preview drift: managed agent changed after preview: ${file}`);
    }
  }
}

async function assertManagedSkillsUnchanged(preview: InstallPreview): Promise<void> {
  const currentManagedSkills = await existingManagedSkillDirectories(preview.skillsHome);
  if (JSON.stringify(currentManagedSkills) !== JSON.stringify(preview.existingManagedSkills)) {
    throw new Error("Preview drift: managed Skill paths changed after preview");
  }
  const currentManagedSkillFiles = await managedSkillContents(preview.skillsHome, currentManagedSkills);
  for (const name of currentManagedSkills) {
    const expectedFiles = Object.keys(preview.managedSkillFiles[name] ?? {}).sort();
    const actualFiles = Object.keys(currentManagedSkillFiles[name]).sort();
    if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) {
      throw new Error(`Preview drift: managed Skill paths changed after preview: ${name}`);
    }
    for (const file of actualFiles) {
      if (!currentManagedSkillFiles[name][file].equals(preview.managedSkillFiles[name][file])) {
        throw new Error(`Preview drift: managed Skill changed after preview: ${name}/${file.replaceAll("\\", "/")}`);
      }
    }
  }
}

async function assertPreviewUnchanged(preview: InstallPreview): Promise<void> {
  await assertConfigUnchanged(preview);
  await assertManagedAgentsUnchanged(preview);
  if (preview.installSkills) await assertManagedSkillsUnchanged(preview);
}

export async function validateInstalledSkills(skillsHome: string): Promise<void> {
  for (const name of managedSkillNames) {
    const source = join(packagedSkillsHome, name);
    const target = join(skillsHome, name);
    let expectedFiles: string[];
    let actualFiles: string[];
    try {
      expectedFiles = await filesBelow(source);
      actualFiles = await filesBelow(target);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") throw new Error(`Missing installed Skill: ${name}`);
      throw error;
    }
    if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) throw new Error(`Skill file drift: ${name}`);
    for (const file of expectedFiles) {
      const expected = await readFile(join(source, file));
      const actual = await readFile(join(target, file));
      if (!actual.equals(expected)) throw new Error(`Skill content drift: ${name}/${file.replaceAll("\\", "/")}`);
    }
  }
}

async function assertRoleDocument(name: string, expectedToml: string, actualTomlPath: string) {
  const actual = parse(await readFile(actualTomlPath, "utf8"));
  const expected = parse(expectedToml);
  if (!isDeepStrictEqual(actual, expected)) throw new Error(`Role semantic drift: ${name}`);
}

export async function validateInstalledPreset({ codexHome, skillsHome, preset }: InstalledPresetValidationRequest): Promise<void> {
  const generated = generatePreset(preset);
  const configPath = join(codexHome, "config.toml");
  const config = parse(await readFile(configPath, "utf8")) as Record<string, unknown>;
  const agents = config.agents as Record<string, unknown> | undefined;
  const configuredManagedRoles = managedRoleNames.filter((name) => agents?.[name] !== undefined).sort();
  const expectedManagedRoles = [...generated.roleOrder].sort();
  if (JSON.stringify(configuredManagedRoles) !== JSON.stringify(expectedManagedRoles)) throw new Error(`Installed managed roles do not match preset: ${generated.preset.id}`);
  for (const name of generated.roleOrder) {
    const role = agents?.[name] as Record<string, unknown> | undefined;
    const configFile = role?.config_file;
    if (typeof configFile !== "string") throw new Error(`Missing config_file for role: ${name}`);
    if (configFile.replaceAll("\\", "/") !== `agents/${name}.toml`) throw new Error(`Invalid config_file for role: ${name}`);
    await assertRoleDocument(name, generated.agents[name], resolve(dirname(configPath), configFile));
  }
  await validateInstalledSkills(skillsHome);
}

export async function previewInstall(request: InstallRequest): Promise<InstallPreview> {
  const configPath = join(request.codexHome, "config.toml");
  let configExisted = true;
  let original: Buffer;
  try {
    original = await readFile(configPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    configExisted = false;
    original = Buffer.from("[agents]\nmax_threads = 6\nmax_depth = 1\n", "utf8");
  }
  const bom = original.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf]));
  const body = original.subarray(bom ? 3 : 0).toString("utf8");
  if (body.includes("\uFFFD")) throw new Error("Invalid UTF-8 replacement character");
  const newline = body.includes("\r\n") ? "\r\n" : "\n";
  const generated = generatePreset(request.preset);
  const mode = request.mode ?? "install";
  const updatedText = updateConfig(body, newline, generated, mode);
  const updated = Buffer.concat([bom ? Buffer.from([0xef, 0xbb, 0xbf]) : Buffer.alloc(0), Buffer.from(updatedText)]);
  const temporaryPath = `${configPath}.tmp-${process.pid}`;
  const temporary = await temporaryPathSnapshot(temporaryPath);
  const timestamp = Date.now();
  const existingManagedFiles = await existingManagedAgentFiles(request.codexHome);
  const managedFileContents = await managedAgentContents(request.codexHome, existingManagedFiles);
  const activeFiles = new Set(Object.keys(generated.agents).map((name) => `${name}.toml`));
  const inactiveManagedFiles = existingManagedFiles.filter((name) => !activeFiles.has(name));
  const skillsHome = resolve(request.skillsHome ?? join(request.codexHome, "skills"));
  const installSkills = !await sameLocation(skillsHome, packagedSkillsHome);
  for (const name of managedSkillNames) await readFile(join(packagedSkillsHome, name, "SKILL.md"));
  const existingManagedSkills = installSkills ? await existingManagedSkillDirectories(skillsHome) : [];
  const managedSkillFiles = installSkills ? await managedSkillContents(skillsHome, existingManagedSkills) : {};
  return {
    request,
    configPath,
    configBefore: configExisted ? original : undefined,
    temporaryPath,
    temporaryPathExisted: temporary.existed,
    temporaryPathBefore: temporary.content,
    backupPath: configExisted ? `${configPath}.backup-${timestamp}` : undefined,
    archivePath: join(request.codexHome, "agent-presets", "slim-agents-for-codex", `backup-${timestamp}`),
    updated,
    files: generated.agents,
    managedFileContents,
    existingManagedFiles,
    inactiveManagedFiles,
    skillsHome,
    managedSkillFiles,
    existingManagedSkills,
    installSkills,
    resolvedPreset: generated.preset.id,
  };
}

async function attemptRollback(
  failures: InstallRollbackFailure[],
  category: RollbackFailureCategory,
  phase: RollbackFailurePhase,
  operation: () => Promise<unknown>,
): Promise<void> {
  try {
    await operation();
  } catch (error) {
    failures.push({ category, phase, reason: controlledRollbackFailureReason(category, phase), error });
  }
}

async function restoreManagedAgents(preview: InstallPreview, failures: InstallRollbackFailure[]): Promise<void> {
  const target = join(preview.request.codexHome, "agents");
  const expected = new Set(preview.existingManagedFiles);
  for (const file of await existingManagedAgentFiles(preview.request.codexHome)) {
    if (!expected.has(file)) await attemptRollback(failures, "agents", "restore", () => unlink(join(target, file)));
  }
  if (preview.existingManagedFiles.length === 0) return;
  await attemptRollback(failures, "agents", "restore", () => mkdir(target, { recursive: true }));
  for (const file of preview.existingManagedFiles) {
    await attemptRollback(failures, "agents", "restore", () => writeFile(join(target, file), preview.managedFileContents[file]));
  }
}

async function restoreManagedSkills(preview: InstallPreview, failures: InstallRollbackFailure[]): Promise<void> {
  if (!preview.installSkills) return;
  const expected = new Set(preview.existingManagedSkills);
  for (const name of managedSkillNames) {
    const target = join(preview.skillsHome, name);
    if (!expected.has(name)) {
      await attemptRollback(failures, "skills", "restore", () => rm(target, { recursive: true, force: true }));
      continue;
    }
    await attemptRollback(failures, "skills", "restore", () => rm(target, { recursive: true, force: true }));
    await attemptRollback(failures, "skills", "restore", () => mkdir(target, { recursive: true }));
    for (const [file, content] of Object.entries(preview.managedSkillFiles[name] ?? {})) {
      const destination = join(target, file);
      await attemptRollback(failures, "skills", "restore", () => mkdir(dirname(destination), { recursive: true }));
      await attemptRollback(failures, "skills", "restore", () => writeFile(destination, content));
    }
  }
}

async function restoreConfig(preview: InstallPreview): Promise<void> {
  if (preview.configBefore === undefined) await rm(preview.configPath, { force: true });
  else await writeFile(preview.configPath, preview.configBefore);
}

async function restoreTemporaryPath(preview: InstallPreview): Promise<void> {
  if (preview.temporaryPathExisted) {
    if (preview.temporaryPathBefore !== undefined) await writeFile(preview.temporaryPath, preview.temporaryPathBefore);
    return;
  }
  await rm(preview.temporaryPath, { force: true });
}

async function assertTemporaryRestored(preview: InstallPreview): Promise<void> {
  if (preview.temporaryPathExisted) {
    if (!await pathExists(preview.temporaryPath)) throw new Error("Temporary commit path was not restored");
    if (preview.temporaryPathBefore !== undefined && !(await readFile(preview.temporaryPath)).equals(preview.temporaryPathBefore)) {
      throw new Error("Temporary commit path changed during rollback");
    }
  } else if (await pathExists(preview.temporaryPath)) {
    throw new Error("Temporary commit path remains after rollback");
  }
}

async function rollbackInstall(preview: InstallPreview): Promise<InstallRollbackFailure[]> {
  const failures: InstallRollbackFailure[] = [];

  await attemptRollback(failures, "config", "restore", () => restoreConfig(preview));
  await attemptRollback(failures, "agents", "restore", () => restoreManagedAgents(preview, failures));
  await attemptRollback(failures, "skills", "restore", () => restoreManagedSkills(preview, failures));
  await attemptRollback(failures, "temporary", "cleanup", () => restoreTemporaryPath(preview));
  await attemptRollback(failures, "config", "verify", () => assertConfigUnchanged(preview));
  await attemptRollback(failures, "agents", "verify", () => assertManagedAgentsUnchanged(preview));
  if (preview.installSkills) await attemptRollback(failures, "skills", "verify", () => assertManagedSkillsUnchanged(preview));
  await attemptRollback(failures, "temporary", "verify", () => assertTemporaryRestored(preview));
  return failures;
}

async function recoveryArtifacts(preview: InstallPreview): Promise<string[]> {
  const artifacts: string[] = [];
  for (const path of [preview.backupPath, preview.archivePath]) {
    if (path && await pathExists(path)) artifacts.push(path);
  }
  return artifacts;
}

export async function installPreset(preview: InstallPreview) {
  try {
    await assertPreviewUnchanged(preview);
  } catch (error) {
    throw new InstallRollbackError(error, "complete", []);
  }
  try {
    if (preview.backupPath) await copyFile(preview.configPath, preview.backupPath);
    const target = join(preview.request.codexHome, "agents");
    await mkdir(target, { recursive: true });
    if (preview.existingManagedFiles.length > 0) {
      await mkdir(preview.archivePath, { recursive: true });
      for (const file of preview.existingManagedFiles) await copyFile(join(target, file), join(preview.archivePath, file));
    }
    if (preview.existingManagedSkills.length > 0) {
      const archive = join(preview.archivePath, "skills");
      await mkdir(archive, { recursive: true });
      for (const name of preview.existingManagedSkills) await cp(join(preview.skillsHome, name), join(archive, name), { recursive: true });
    }
    for (const [name, content] of Object.entries(preview.files)) await writeFile(join(target, `${name}.toml`), content, "utf8");
    if (preview.installSkills) {
      await mkdir(preview.skillsHome, { recursive: true });
      for (const name of managedSkillNames) {
        await rm(join(preview.skillsHome, name), { recursive: true, force: true });
        await cp(join(packagedSkillsHome, name), join(preview.skillsHome, name), { recursive: true });
      }
    }
    await writeFile(preview.temporaryPath, preview.updated);
    await rename(preview.temporaryPath, preview.configPath);
    for (const file of preview.inactiveManagedFiles) await unlink(join(target, file));
    if (preview.backupPath) await stat(preview.backupPath);
    await validateInstalledPreset({ codexHome: preview.request.codexHome, skillsHome: preview.skillsHome, preset: preview.resolvedPreset });
    return { target, skillsHome: preview.skillsHome, backupPath: preview.backupPath, archivePath: preview.archivePath, preset: preview.resolvedPreset };
  } catch (error) {
    const rollbackFailures = await rollbackInstall(preview);
    let recovery: string[] = [];
    try {
      recovery = await recoveryArtifacts(preview);
    } catch (recoveryError) {
      rollbackFailures.push({
        category: "recovery",
        phase: "verify",
        reason: controlledRollbackFailureReason("recovery", "verify"),
        error: recoveryError,
      });
    }
    const rollback: RollbackStatus = rollbackFailures.length === 0 ? "complete" : "incomplete";
    const unresolved = [...new Set(rollbackFailures.map(({ category }) => category))];
    throw new InstallRollbackError(error, rollback, recovery, unresolved, rollbackFailures);
  }
}
