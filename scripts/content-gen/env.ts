import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { REPO_ROOT } from "./paths";

let loaded = false;

/** Load `.env.local` from repo root into process.env (does not override existing non-empty values). */
export function loadEnvLocal(): void {
  if (loaded) return;
  loaded = true;

  const envPath = `${REPO_ROOT}/.env.local`;
  if (!fs.existsSync(envPath)) return;

  for (const rawLine of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key] || process.env[key] === "") {
      process.env[key] = value;
    }
  }
}

type DataseoMcpServer = { command?: string; env?: Record<string, string> };

function loadEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) return {};
  const out: Record<string, string> = {};
  for (const rawLine of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    out[line.slice(0, eq).trim()] = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

function pythonBeside(command: string): string | null {
  const dir = path.dirname(command);
  const win = path.join(dir, "python.exe");
  const unix = path.join(dir, "python");
  if (fs.existsSync(win)) return win;
  if (fs.existsSync(unix)) return unix;
  return null;
}

/** Python executable + captcha env for the DataSEO bridge (same keys Cursor MCP uses). */
export function resolveDataseoRuntime(): { python: string; env: NodeJS.ProcessEnv } {
  const dataseoEnv = loadEnvFile(path.join(os.homedir(), "dataseo-mcp", ".env"));
  const mcpPath = path.join(os.homedir(), ".cursor", "mcp.json");
  let mcpEnv: Record<string, string> = {};
  let mcpCommand: string | undefined;

  if (fs.existsSync(mcpPath)) {
    try {
      const mcp = JSON.parse(fs.readFileSync(mcpPath, "utf8")) as {
        mcpServers?: { dataseo?: DataseoMcpServer };
      };
      mcpEnv = mcp.mcpServers?.dataseo?.env ?? {};
      mcpCommand = mcp.mcpServers?.dataseo?.command;
    } catch {
      /* optional */
    }
  }

  const captchaEnv = { ...dataseoEnv, ...mcpEnv };
  const mergedEnv = { ...process.env, ...captchaEnv };

  if (process.env.DATASEO_PYTHON) {
    return { python: process.env.DATASEO_PYTHON, env: mergedEnv };
  }

  if (mcpCommand) {
    const python = pythonBeside(mcpCommand);
    if (python) return { python, env: mergedEnv };
  }

  return {
    python: process.platform === "win32" ? "python" : "python3",
    env: mergedEnv,
  };
}

/** Some models (e.g. gpt-5, o-series) only accept the default temperature. */
export function openAiTemperature(defaultValue: number): number | undefined {
  const override = process.env.OPENAI_TEMPERATURE;
  if (override !== undefined && override !== "") {
    return Number(override);
  }
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  if (/^(gpt-5|o\d)/i.test(model)) return undefined;
  return defaultValue;
}
