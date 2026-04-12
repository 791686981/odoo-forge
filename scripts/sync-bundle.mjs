import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const payloadRoot = path.join(repoRoot, "packages", "odoo-forge-bundle", "payload");

function resetTarget(targetPath) {
  fs.rmSync(targetPath, { force: true, recursive: true });
}

function copyDirectory(sourcePath, targetPath) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.cpSync(sourcePath, targetPath, { recursive: true });
}

function copyFile(sourcePath, targetPath) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.copyFileSync(sourcePath, targetPath);
}

resetTarget(path.join(payloadRoot, "skills"));
resetTarget(path.join(payloadRoot, "platforms"));
resetTarget(path.join(payloadRoot, "config"));

copyDirectory(path.join(repoRoot, "skills"), path.join(payloadRoot, "skills"));
copyDirectory(path.join(repoRoot, "platforms"), path.join(payloadRoot, "platforms"));
copyFile(path.join(repoRoot, "config", "product.json"), path.join(payloadRoot, "config", "product.json"));

console.log(`Synced bundle payload to ${payloadRoot}`);
