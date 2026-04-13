import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

import {
  getAgentsSkillsRoot,
  getInstalledSkillsPath,
  getLegacyInstalledSkillsPath,
} from "../src/paths.js";

test("技能安装与配置路径都落在用户目录下", () => {
  const homeDir = "/tmp/odoo-forge-home";

  assert.equal(getAgentsSkillsRoot({ homeDir }), path.join(homeDir, ".agents", "skills"));
  assert.equal(getInstalledSkillsPath({ homeDir }), path.join(homeDir, ".agents", "skills"));
  assert.equal(getLegacyInstalledSkillsPath({ homeDir }), path.join(homeDir, ".agents", "skills", "odoo-forge"));
});
