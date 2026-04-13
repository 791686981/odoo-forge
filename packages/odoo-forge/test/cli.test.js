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

test("install 会安装技能且不再写入任何 MCP 配置", async () => {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), "odoo-forge-home-"));
  const bundleRoot = createBundleFixture();

  await main(["install"], {
    homeDir,
    bundleRoot,
    output: { log() {}, error() {} },
  });

  assert.ok(
    fs.existsSync(path.join(homeDir, ".agents", "skills", "demo", "SKILL.md")),
  );
  assert.equal(fs.existsSync(path.join(homeDir, ".codex", "config.toml")), false);
  assert.equal(fs.existsSync(path.join(homeDir, ".claude.json")), false);
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
    bundleRoot,
    output: { log() {}, error() {} },
  });

  assert.ok(fs.existsSync(path.join(homeDir, ".agents", "skills", "demo", "SKILL.md")));
  assert.ok(fs.existsSync(path.join(homeDir, ".agents", "skills", "custom", "SKILL.md")));
  assert.equal(fs.existsSync(path.join(homeDir, ".agents", "skills", "odoo-forge")), false);
});

test("doctor 只检查 skills 安装状态", async () => {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), "odoo-forge-doctor-"));
  const logs = [];
  fs.mkdirSync(path.join(homeDir, ".agents", "skills", "demo"), { recursive: true });
  fs.writeFileSync(path.join(homeDir, ".agents", "skills", "demo", "SKILL.md"), "# demo");

  await main(["doctor"], {
    homeDir,
    output: {
      log(message) {
        logs.push(message);
      },
      error() {},
    },
  });

  assert.ok(logs.includes("Skills installed: yes"));
  assert.ok(logs.includes("Installed skills count: 1"));
});
