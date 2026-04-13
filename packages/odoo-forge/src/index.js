import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  getAgentsSkillsRoot,
  getInstalledSkillsPath,
  getLegacyInstalledSkillsPath,
} from "./paths.js";

function printHelp() {
  console.log(`Odoo Forge CLI

Usage:
  odoo-forge install
  odoo-forge update
  odoo-forge doctor`);
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

function countInstalledSkills(skillsPath) {
  if (!fs.existsSync(skillsPath)) {
    return 0;
  }

  return fs
    .readdirSync(skillsPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .length;
}

function runDoctor(ctx) {
  const skillsPath = getInstalledSkillsPath({ homeDir: ctx.homeDir });

  ctx.output.log("Odoo Forge doctor");
  ctx.output.log(`Skills root: ${skillsPath}`);
  ctx.output.log(`Skills installed: ${fs.existsSync(skillsPath) ? "yes" : "no"}`);
  ctx.output.log(`Installed skills count: ${countInstalledSkills(skillsPath)}`);
}

async function runInstallLike(ctx, mode) {
  const bundleRoot = await resolveBundleRoot(ctx.bundleRoot);
  const skillsPath = installSkills({
    bundleRoot,
    homeDir: ctx.homeDir,
  });

  ctx.output.log(`${mode} complete.`);
  ctx.output.log(`Skills root: ${skillsPath}`);
  ctx.output.log(`Installed skills count: ${countInstalledSkills(skillsPath)}`);
}

function normalizeContext(overrides = {}) {
  return {
    homeDir: overrides.homeDir ?? os.homedir(),
    bundleRoot: overrides.bundleRoot,
    output: overrides.output ?? console,
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
