import { copyFile, mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { generatePreset, roleOrder } from "./presets.js";

export interface InstallRequest { codexHome: string; preset: string }
export interface InstallPreview { request: InstallRequest; configPath: string; backupPath: string; original: Buffer; updated: Buffer; files: Record<string, string>; resolvedPreset: string }

function updateConfig(text: string, newline: string, preset: string): string {
  for (const name of roleOrder) if (new RegExp(`^\\[agents\\.${name}\\]$`, "m").test(text)) throw new Error(`Existing role conflict: ${name}`);
  const headers = [...text.matchAll(/^\[agents\]\s*$/gm)];
  if (headers.length !== 1 || headers[0].index === undefined) throw new Error("Expected one [agents] table");
  const sectionStart = headers[0].index + headers[0][0].length;
  const nextHeader = text.slice(sectionStart).search(/^\[.+\]\s*$/m);
  const sectionEnd = nextHeader < 0 ? text.length : sectionStart + nextHeader;
  const section = text.slice(sectionStart, sectionEnd);
  if (!/^max_threads\s*=\s*6\s*$/m.test(section)) throw new Error("Expected max_threads = 6");
  if (!/^max_depth\s*=\s*[12]\s*$/m.test(section)) throw new Error("Expected max_depth = 1 or 2");
  text = text.replace(/^max_depth\s*=\s*[12]\s*$/m, "max_depth = 2").replace(/[\r\n]+$/, "");
  return text + newline.repeat(2) + generatePreset(preset).snippet.replaceAll("\n", newline).replace(`[agents]${newline}max_threads = 6${newline}max_depth = 2${newline.repeat(2)}`, "") + newline;
}

export async function previewInstall(request: InstallRequest): Promise<InstallPreview> {
  const configPath = join(request.codexHome, "config.toml");
  const original = await readFile(configPath);
  const bom = original.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf]));
  const body = original.subarray(bom ? 3 : 0).toString("utf8");
  if (body.includes("�")) throw new Error("Invalid UTF-8 replacement character");
  const newline = body.includes("\r\n") ? "\r\n" : "\n";
  const generated = generatePreset(request.preset);
  const updatedText = updateConfig(body, newline, generated.preset.id);
  const updated = Buffer.concat([bom ? Buffer.from([0xef, 0xbb, 0xbf]) : Buffer.alloc(0), Buffer.from(updatedText)]);
  return { request, configPath, backupPath: `${configPath}.backup-${Date.now()}`, original, updated, files: generated.agents, resolvedPreset: generated.preset.id };
}

export async function installPreset(preview: InstallPreview) {
  const target = join(preview.request.codexHome, "agents", "slim-agents-for-codex", preview.resolvedPreset);
  await mkdir(target, { recursive: true });
  for (const [name, content] of Object.entries(preview.files)) await writeFile(join(target, `${name}.toml`), content, "utf8");
  await copyFile(preview.configPath, preview.backupPath);
  const temp = `${preview.configPath}.tmp-${process.pid}`;
  await writeFile(temp, preview.updated);
  await rename(temp, preview.configPath);
  await stat(preview.backupPath);
  return { target, backupPath: preview.backupPath, preset: preview.resolvedPreset };
}
