import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

import { installClaudeWiring, readClaudeManagedToken } from "./claude.js";
import { installCodexWiring, readCodexManagedToken } from "./codex.js";
import {
  getAgentsSkillsRoot,
  getClaudeConfigPath,
  getCodexConfigPath,
  getInstalledSkillsPath,
  getLegacyInstalledSkillsPath,
} from "./paths.js";

function printHelp() {
  console.log(`Odoo Forge CLI

Usage:
  odoo-forge install
  odoo-forge update
  odoo-forge doctor
  odoo-forge login flowus
  odoo-forge mcp flowus`);
}

async function resolveBundleRoot(bundleRootOverride) {
  if (bundleRootOverride) {
    return bundleRootOverride;
  }

  try {
    const bundle = await import("odoo-forge-bundle");
    return bundle.getBundleRoot();
  } catch {
    return path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "../../odoo-forge-bundle/payload",
    );
  }
}

async function defaultPromptForSecret(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    return await rl.question(message);
  } finally {
    rl.close();
  }
}

async function defaultSpawnProcess(command, args, options = {}) {
  return await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      ...options,
    });
    child.on("close", (code) => resolve(code ?? 0));
    child.on("error", reject);
  });
}

function installSkills({ bundleRoot, homeDir }) {
  const sourceSkillsDir = path.join(bundleRoot, "skills");
  const targetSkillsDir = getInstalledSkillsPath({ homeDir });
  const legacySkillsDir = getLegacyInstalledSkillsPath({ homeDir });

  fs.mkdirSync(getAgentsSkillsRoot({ homeDir }), { recursive: true });
  fs.rmSync(legacySkillsDir, { recursive: true, force: true });

  for (const entry of fs.readdirSync(sourceSkillsDir, { withFileTypes: true })) {
    const sourceEntryPath = path.join(sourceSkillsDir, entry.name);
    const targetEntryPath = path.join(targetSkillsDir, entry.name);

    fs.rmSync(targetEntryPath, { recursive: true, force: true });
    fs.cpSync(sourceEntryPath, targetEntryPath, { recursive: true });
  }

  return targetSkillsDir;
}

async function ensureFlowusToken({ ctx }) {
  const envToken = ctx.env.ODOO_FORGE_FLOWUS_TOKEN ?? ctx.env.FLOWUS_TOKEN;
  const currentToken =
    envToken ??
    readCodexManagedToken({ homeDir: ctx.homeDir }) ??
    readClaudeManagedToken({ homeDir: ctx.homeDir });

  if (currentToken) {
    return currentToken;
  }

  const prompted = await ctx.promptForSecret("FlowUS token is required.\nPaste your FlowUS token: ");
  const token = prompted.trim();
  if (!token) {
    throw new Error("FlowUS token is required.");
  }
  return token;
}

function runDoctor(ctx) {
  const skillsPath = getInstalledSkillsPath({ homeDir: ctx.homeDir });
  const codexConfigPath = getCodexConfigPath({ homeDir: ctx.homeDir });
  const claudeConfigPath = getClaudeConfigPath({ homeDir: ctx.homeDir });
  const codexToken = readCodexManagedToken({ homeDir: ctx.homeDir });
  const claudeToken = readClaudeManagedToken({ homeDir: ctx.homeDir });

  ctx.output.log("Odoo Forge doctor");
  ctx.output.log(`Skills root: ${skillsPath}`);
  ctx.output.log(`Skills installed: ${fs.existsSync(skillsPath) ? "yes" : "no"}`);
  ctx.output.log(`Codex config exists: ${fs.existsSync(codexConfigPath) ? "yes" : "no"}`);
  ctx.output.log(`Codex FlowUS MCP exists: ${codexToken ? "yes" : "no"}`);
  ctx.output.log(`Claude config exists: ${fs.existsSync(claudeConfigPath) ? "yes" : "no"}`);
  ctx.output.log(`Claude FlowUS MCP exists: ${claudeToken ? "yes" : "no"}`);
  ctx.output.log(`FlowUS token synchronized: ${codexToken && claudeToken && codexToken === claudeToken ? "yes" : "no"}`);
}

async function runInstallLike(ctx, mode) {
  const bundleRoot = await resolveBundleRoot(ctx.bundleRoot);
  const token = await ensureFlowusToken({ ctx });
  const skillsPath = installSkills({
    bundleRoot,
    homeDir: ctx.homeDir,
  });

  const codexResult = installCodexWiring({
    homeDir: ctx.homeDir,
    token,
  });
  const claudeResult = installClaudeWiring({
    homeDir: ctx.homeDir,
    token,
  });

  ctx.output.log(`${mode} complete.`);
  ctx.output.log(`Skills root: ${skillsPath}`);
  ctx.output.log(`Codex config: ${codexResult.configPath}`);
  ctx.output.log(`Claude config: ${claudeResult.configPath}`);
}

async function runLogin(ctx, provider) {
  if (provider !== "flowus") {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  const token =
    ctx.env.ODOO_FORGE_FLOWUS_TOKEN ??
    ctx.env.FLOWUS_TOKEN ??
    (await ctx.promptForSecret("Paste your FlowUS token: ")).trim();

  if (!token) {
    throw new Error("FlowUS token is required.");
  }

  const codexResult = installCodexWiring({
    homeDir: ctx.homeDir,
    token,
  });
  const claudeResult = installClaudeWiring({
    homeDir: ctx.homeDir,
    token,
  });

  ctx.output.log(`Saved FlowUS token to ${codexResult.configPath}`);
  ctx.output.log(`Saved FlowUS token to ${claudeResult.configPath}`);
}

async function runMcp(ctx, provider) {
  if (provider !== "flowus") {
    throw new Error(`Unsupported MCP provider: ${provider}`);
  }

  const token = ctx.env.FLOWUS_TOKEN ?? ctx.env.ODOO_FORGE_FLOWUS_TOKEN;

  if (!token) {
    throw new Error("Missing FlowUS token. Set FLOWUS_TOKEN before running `odoo-forge mcp flowus`.");
  }

  return await ctx.spawnProcess("npx", ["-y", "flowus-mcp-server@latest"], {
    env: {
      ...ctx.env,
      FLOWUS_TOKEN: token,
    },
  });
}

function normalizeContext(overrides = {}) {
  return {
    homeDir: overrides.homeDir ?? os.homedir(),
    platform: overrides.platform ?? process.platform,
    env: overrides.env ?? process.env,
    bundleRoot: overrides.bundleRoot,
    output: overrides.output ?? console,
    promptForSecret: overrides.promptForSecret ?? defaultPromptForSecret,
    spawnProcess: overrides.spawnProcess ?? defaultSpawnProcess,
  };
}

export async function main(argv, overrides = {}) {
  const ctx = normalizeContext(overrides);
  const command = argv[0] ?? "help";

  switch (command) {
    case "install":
      await runInstallLike(ctx, "install");
      break;
    case "update":
      await runInstallLike(ctx, "update");
      break;
    case "doctor":
      runDoctor(ctx);
      break;
    case "login":
      await runLogin(ctx, argv[1]);
      break;
    case "mcp":
      await runMcp(ctx, argv[1]);
      break;
    case "help":
    case "--help":
    case "-h":
      printHelp();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exitCode = 1;
  }
}
