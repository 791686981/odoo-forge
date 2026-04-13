import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  buildCodexManagedBlock,
  installCodexWiring,
  readCodexManagedToken,
  upsertManagedBlock,
} from "../src/codex.js";

test("upsertManagedBlock 会插入并更新受管块", () => {
  const first = upsertManagedBlock({
    originalContent: 'model_reasoning_effort = "high"\n',
    startMarker: "# BEGIN ODOO FORGE FLOWUS",
    endMarker: "# END ODOO FORGE FLOWUS",
    block: buildCodexManagedBlock({ token: "demo-token" }),
  });

  assert.match(first, /BEGIN ODOO FORGE FLOWUS/);
  assert.match(first, /command = "npx"/);
  assert.match(first, /FLOWUS_TOKEN = "demo-token"/);

  const second = upsertManagedBlock({
    originalContent: first,
    startMarker: "# BEGIN ODOO FORGE FLOWUS",
    endMarker: "# END ODOO FORGE FLOWUS",
    block: buildCodexManagedBlock({ token: "next-token" }),
  });

  assert.equal(second.match(/BEGIN ODOO FORGE FLOWUS/g)?.length, 1);
  assert.match(second, /FLOWUS_TOKEN = "next-token"/);
});

test("installCodexWiring 会写入直连 FlowUS MCP", () => {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), "odoo-forge-codex-"));

  const result = installCodexWiring({ homeDir, token: "demo-token" });

  const configToml = fs.readFileSync(result.configPath, "utf8");
  assert.match(configToml, /\[mcp_servers\.flowus\]/);
  assert.match(configToml, /command = "npx"/);
  assert.match(configToml, /args = \["-y", "flowus-mcp-server@latest"\]/);
  assert.match(configToml, /\[mcp_servers\.flowus\.env\]/);
  assert.match(configToml, /FLOWUS_TOKEN = "demo-token"/);
  assert.equal(readCodexManagedToken({ homeDir }), "demo-token");
});

test("readCodexManagedToken 兼容读取 Codex 现有的分节 FlowUS 配置", () => {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), "odoo-forge-codex-"));
  const configPath = path.join(homeDir, ".codex", "config.toml");

  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, `model = "gpt-5.4"

[mcp_servers.flowus]
type = "stdio"
command = "npx"
args = ["-y", "flowus-mcp-server@latest"]

[projects."/tmp/demo"]
trust_level = "trusted"

[mcp_servers.flowus.env]
FLOWUS_TOKEN = "split-token"
`);

  assert.equal(readCodexManagedToken({ homeDir }), "split-token");
});

test("installCodexWiring 会迁移已有 FlowUS 配置而不是追加重复表", () => {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), "odoo-forge-codex-"));
  const configPath = path.join(homeDir, ".codex", "config.toml");

  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, `model = "gpt-5.4"

[mcp_servers.flowus]
type = "stdio"
command = "npx"
args = ["-y", "flowus-mcp-server@latest"]

[projects."/tmp/demo"]
trust_level = "trusted"

[mcp_servers.flowus.env]
FLOWUS_TOKEN = "old-token"
`);

  installCodexWiring({ homeDir, token: "new-token" });

  const configToml = fs.readFileSync(configPath, "utf8");
  assert.equal(configToml.match(/\[mcp_servers\.flowus\]/g)?.length, 1);
  assert.equal(configToml.match(/\[mcp_servers\.flowus\.env\]/g)?.length, 1);
  assert.match(configToml, /FLOWUS_TOKEN = "new-token"/);
  assert.match(configToml, /\[projects\."\/tmp\/demo"\]/);
});
