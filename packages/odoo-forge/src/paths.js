import os from "node:os";
import path from "node:path";

export function getCodexConfigPath({ homeDir = os.homedir() } = {}) {
  return path.join(homeDir, ".codex", "config.toml");
}

export function getClaudeConfigPath({ homeDir = os.homedir() } = {}) {
  return path.join(homeDir, ".claude.json");
}

export function getAgentsSkillsRoot({ homeDir = os.homedir() } = {}) {
  return path.join(homeDir, ".agents", "skills");
}

export function getInstalledSkillsPath({ homeDir = os.homedir() } = {}) {
  return getAgentsSkillsRoot({ homeDir });
}

export function getLegacyInstalledSkillsPath({ homeDir = os.homedir() } = {}) {
  return path.join(homeDir, ".agents", "skills", "odoo-forge");
}
