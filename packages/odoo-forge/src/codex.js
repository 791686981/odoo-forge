import fs from "node:fs";
import path from "node:path";

import { getCodexConfigPath } from "./paths.js";

export const CODEX_START_MARKER = "# BEGIN ODOO FORGE FLOWUS";
export const CODEX_END_MARKER = "# END ODOO FORGE FLOWUS";

export function buildCodexManagedBlock({ token }) {
  return `${CODEX_START_MARKER}
[mcp_servers.flowus]
type = "stdio"
command = "npx"
args = ["-y", "flowus-mcp-server@latest"]
env = { FLOWUS_TOKEN = "${token}" }
${CODEX_END_MARKER}`;
}

export function upsertManagedBlock({
  originalContent,
  startMarker,
  endMarker,
  block,
}) {
  const startIndex = originalContent.indexOf(startMarker);
  const endIndex = originalContent.indexOf(endMarker);

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    const blockEnd = endIndex + endMarker.length;
    return `${originalContent.slice(0, startIndex)}${block}${originalContent.slice(blockEnd)}`;
  }

  const trimmed = originalContent.trimEnd();
  return trimmed ? `${trimmed}\n\n${block}\n` : `${block}\n`;
}

export function readCodexManagedToken({ homeDir }) {
  const configPath = getCodexConfigPath({ homeDir });
  if (!fs.existsSync(configPath)) {
    return null;
  }

  const content = fs.readFileSync(configPath, "utf8");
  const startIndex = content.indexOf(CODEX_START_MARKER);
  const endIndex = content.indexOf(CODEX_END_MARKER);
  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return null;
  }

  const managedBlock = content.slice(startIndex, endIndex + CODEX_END_MARKER.length);
  const match = managedBlock.match(/FLOWUS_TOKEN\s*=\s*"([^"]+)"/);
  return match?.[1] ?? null;
}

export function installCodexWiring({ homeDir, token }) {
  const configPath = getCodexConfigPath({ homeDir });
  const codexDir = path.dirname(configPath);

  fs.mkdirSync(codexDir, { recursive: true });
  const currentConfig = fs.existsSync(configPath) ? fs.readFileSync(configPath, "utf8") : "";
  const nextConfig = upsertManagedBlock({
    originalContent: currentConfig,
    startMarker: CODEX_START_MARKER,
    endMarker: CODEX_END_MARKER,
    block: buildCodexManagedBlock({ token }),
  });
  fs.writeFileSync(configPath, nextConfig);

  return {
    configPath,
  };
}
