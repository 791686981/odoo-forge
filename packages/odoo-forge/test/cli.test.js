import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { main } from "../src/index.js";

function createBundleFixture() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "odoo-forge-bundle-"));
  const bundleRoot = path.join(tempDir, "payload");
  fs.mkdirSync(path.join(bundleRoot, "skills", "demo"), { recursive: true });
  fs.mkdirSync(path.join(bundleRoot, "config"), { recursive: true });
  fs.writeFileSync(path.join(bundleRoot, "skills", "demo", "SKILL.md"), "# demo");
  fs.writeFileSync(path.join(bundleRoot, "config", "product.json"), JSON.stringify({
    name: "Odoo Forge",
    slug: "odoo-forge",
    version: "0.1.0",
  }));
  return bundleRoot;
}

test("install 会安装技能并直写 Codex 与 Claude MCP", async () => {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), "odoo-forge-home-"));
  const bundleRoot = createBundleFixture();

  await main(["install"], {
    homeDir,
    env: { ODOO_FORGE_FLOWUS_TOKEN: "demo-token" },
    bundleRoot,
    output: { log() {}, error() {} },
    promptForSecret: async () => {
      throw new Error("should not prompt");
    },
  });

  assert.ok(
    fs.existsSync(path.join(homeDir, ".agents", "skills", "demo", "SKILL.md")),
  );

  const codexConfig = fs.readFileSync(path.join(homeDir, ".codex", "config.toml"), "utf8");
  assert.match(codexConfig, /command = "npx"/);
  assert.match(codexConfig, /FLOWUS_TOKEN = "demo-token"/);

  const claudeConfig = JSON.parse(fs.readFileSync(path.join(homeDir, ".claude.json"), "utf8"));
  assert.equal(claudeConfig.mcpServers.flowus.command, "npx");
  assert.equal(claudeConfig.mcpServers.flowus.env.FLOWUS_TOKEN, "demo-token");
});

test("install 只覆盖 Odoo Forge 自带技能并清理旧命名空间目录", async () => {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), "odoo-forge-home-"));
  const bundleRoot = createBundleFixture();

  fs.mkdirSync(path.join(homeDir, ".agents", "skills", "custom"), { recursive: true });
  fs.writeFileSync(path.join(homeDir, ".agents", "skills", "custom", "SKILL.md"), "# custom");
  fs.mkdirSync(path.join(homeDir, ".agents", "skills", "odoo-forge", "demo"), { recursive: true });
  fs.writeFileSync(path.join(homeDir, ".agents", "skills", "odoo-forge", "demo", "SKILL.md"), "# old");

  await main(["install"], {
    homeDir,
    env: { ODOO_FORGE_FLOWUS_TOKEN: "demo-token" },
    bundleRoot,
    output: { log() {}, error() {} },
    promptForSecret: async () => {
      throw new Error("should not prompt");
    },
  });

  assert.ok(fs.existsSync(path.join(homeDir, ".agents", "skills", "demo", "SKILL.md")));
  assert.ok(fs.existsSync(path.join(homeDir, ".agents", "skills", "custom", "SKILL.md")));
  assert.equal(fs.existsSync(path.join(homeDir, ".agents", "skills", "odoo-forge")), false);
});

test("login flowus 会同步更新 Codex 与 Claude 的 token", async () => {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), "odoo-forge-login-"));

  await main(["login", "flowus"], {
    homeDir,
    env: { ODOO_FORGE_FLOWUS_TOKEN: "next-token" },
    output: { log() {}, error() {} },
  });

  const codexConfig = fs.readFileSync(path.join(homeDir, ".codex", "config.toml"), "utf8");
  const claudeConfig = JSON.parse(fs.readFileSync(path.join(homeDir, ".claude.json"), "utf8"));

  assert.match(codexConfig, /FLOWUS_TOKEN = "next-token"/);
  assert.equal(claudeConfig.mcpServers.flowus.env.FLOWUS_TOKEN, "next-token");
});

test("doctor 能识别 Codex 里现有可用的分节 FlowUS 配置", async () => {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), "odoo-forge-doctor-"));
  const logs = [];

  fs.mkdirSync(path.join(homeDir, ".codex"), { recursive: true });
  fs.writeFileSync(path.join(homeDir, ".codex", "config.toml"), `model = "gpt-5.4"

[mcp_servers.flowus]
type = "stdio"
command = "npx"
args = ["-y", "flowus-mcp-server@latest"]

[mcp_servers.flowus.env]
FLOWUS_TOKEN = "shared-token"
`);

  fs.writeFileSync(path.join(homeDir, ".claude.json"), JSON.stringify({
    mcpServers: {
      flowus: {
        type: "stdio",
        command: "npx",
        args: ["-y", "flowus-mcp-server@latest"],
        env: {
          FLOWUS_TOKEN: "shared-token",
        },
      },
    },
  }));

  await main(["doctor"], {
    homeDir,
    output: {
      log(message) {
        logs.push(message);
      },
      error() {},
    },
  });

  assert.ok(logs.includes("Codex FlowUS MCP exists: yes"));
  assert.ok(logs.includes("Claude FlowUS MCP exists: yes"));
  assert.ok(logs.includes("FlowUS token synchronized: yes"));
});

test("mcp flowus 会优先读取环境变量并启动真实 MCP 进程", async () => {
  let launched = null;
  await main(["mcp", "flowus"], {
    homeDir: fs.mkdtempSync(path.join(os.tmpdir(), "odoo-forge-mcp-")),
    env: { FLOWUS_TOKEN: "demo-token" },
    output: { log() {}, error() {} },
    spawnProcess: async (command, args, options) => {
      launched = { command, args, options };
      return 0;
    },
  });

  assert.equal(launched.command, "npx");
  assert.deepEqual(launched.args, ["-y", "flowus-mcp-server@latest"]);
  assert.equal(launched.options.env.FLOWUS_TOKEN, "demo-token");
});
