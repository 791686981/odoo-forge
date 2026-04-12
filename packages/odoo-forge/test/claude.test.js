import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  buildClaudeFlowusServer,
  installClaudeWiring,
  readClaudeManagedToken,
} from "../src/claude.js";

test("buildClaudeFlowusServer 返回直连 npx 配置", () => {
  assert.deepEqual(buildClaudeFlowusServer({ token: "demo-token" }), {
    type: "stdio",
    command: "npx",
    args: ["-y", "flowus-mcp-server@latest"],
    env: {
      FLOWUS_TOKEN: "demo-token",
    },
  });
});

test("installClaudeWiring 会写入 .claude.json 的 mcpServers.flowus", () => {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), "odoo-forge-claude-"));
  fs.writeFileSync(
    path.join(homeDir, ".claude.json"),
    JSON.stringify({ theme: "dark", mcpServers: { other: { type: "http" } } }, null, 2),
  );

  const result = installClaudeWiring({ homeDir, token: "demo-token" });
  const config = JSON.parse(fs.readFileSync(result.configPath, "utf8"));

  assert.equal(config.theme, "dark");
  assert.deepEqual(config.mcpServers.other, { type: "http" });
  assert.deepEqual(config.mcpServers.flowus, buildClaudeFlowusServer({ token: "demo-token" }));
  assert.equal(readClaudeManagedToken({ homeDir }), "demo-token");
});
