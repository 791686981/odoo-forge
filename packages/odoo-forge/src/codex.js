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

[mcp_servers.flowus.env]
FLOWUS_TOKEN = "${token}"
${CODEX_END_MARKER}`;
}

function stripManagedBlock({
  originalContent,
  startMarker,
  endMarker,
}) {
  const startIndex = originalContent.indexOf(startMarker);
  const endIndex = originalContent.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return originalContent;
  }

  const blockEnd = endIndex + endMarker.length;
  return `${originalContent.slice(0, startIndex)}${originalContent.slice(blockEnd)}`;
}

function isFlowusSectionHeader(headerName) {
  return headerName === "mcp_servers.flowus" || headerName.startsWith("mcp_servers.flowus.");
}

function removeFlowusSections(originalContent) {
  const lines = originalContent.split("\n");
  const keptLines = [];
  let skipCurrentSection = false;

  for (const line of lines) {
    const sectionMatch = line.match(/^\s*\[([^\]]+)\]\s*$/);
    if (sectionMatch) {
      skipCurrentSection = isFlowusSectionHeader(sectionMatch[1]);
    }

    if (!skipCurrentSection) {
      keptLines.push(line);
    }
  }

  return keptLines.join("\n");
}

function readSectionContent({ originalContent, sectionName }) {
  const lines = originalContent.split("\n");
  const collected = [];
  let inSection = false;

  for (const line of lines) {
    const sectionMatch = line.match(/^\s*\[([^\]]+)\]\s*$/);
    if (sectionMatch) {
      if (inSection) {
        break;
      }
      inSection = sectionMatch[1] === sectionName;
      continue;
    }

    if (inSection) {
      collected.push(line);
    }
  }

  return inSection ? collected.join("\n") : null;
}

function extractTokenFromContent(originalContent) {
  const flowusSection = readSectionContent({
    originalContent,
    sectionName: "mcp_servers.flowus",
  });
  const envSection = readSectionContent({
    originalContent,
    sectionName: "mcp_servers.flowus.env",
  });

  const candidates = [envSection, flowusSection, originalContent];
  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    const inlineMatch = candidate.match(/FLOWUS_TOKEN\s*=\s*"([^"]+)"/);
    if (inlineMatch) {
      return inlineMatch[1];
    }
  }

  return null;
}

export function upsertManagedBlock({
  originalContent,
  startMarker,
  endMarker,
  block,
}) {
  const withoutManagedBlock = stripManagedBlock({
    originalContent,
    startMarker,
    endMarker,
  });
  const withoutFlowusSections = removeFlowusSections(withoutManagedBlock);
  const trimmed = withoutFlowusSections.trimEnd();
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
  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    const managedBlock = content.slice(startIndex, endIndex + CODEX_END_MARKER.length);
    return extractTokenFromContent(managedBlock);
  }

  return extractTokenFromContent(content);
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
