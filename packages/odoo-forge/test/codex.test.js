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
  assert.match(configToml, /FLOWUS_TOKEN = "demo-token"/);
  assert.equal(readCodexManagedToken({ homeDir }), "demo-token");
});
