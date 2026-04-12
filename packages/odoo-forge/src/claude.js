import fs from "node:fs";

import { getClaudeConfigPath } from "./paths.js";

export function readClaudeConfig({ homeDir }) {
  const configPath = getClaudeConfigPath({ homeDir });
  if (!fs.existsSync(configPath)) {
    return {};
  }

  return JSON.parse(fs.readFileSync(configPath, "utf8"));
}

export function writeClaudeConfig({ homeDir, config }) {
  const configPath = getClaudeConfigPath({ homeDir });
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  return configPath;
}

export function buildClaudeFlowusServer({ token }) {
  return {
    type: "stdio",
    command: "npx",
    args: ["-y", "flowus-mcp-server@latest"],
    env: {
      FLOWUS_TOKEN: token,
    },
  };
}

export function installClaudeWiring({ homeDir, token }) {
  const currentConfig = readClaudeConfig({ homeDir });
  const nextConfig = {
    ...currentConfig,
    mcpServers: {
      ...(currentConfig.mcpServers ?? {}),
      flowus: buildClaudeFlowusServer({ token }),
    },
  };
  const configPath = writeClaudeConfig({ homeDir, config: nextConfig });

  return {
    configPath,
  };
}

export function readClaudeManagedToken({ homeDir }) {
  const config = readClaudeConfig({ homeDir });
  return config?.mcpServers?.flowus?.env?.FLOWUS_TOKEN ?? null;
}
