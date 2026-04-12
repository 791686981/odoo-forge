import path from "node:path";
import { fileURLToPath } from "node:url";

export function getBundleRoot() {
  return path.join(path.dirname(fileURLToPath(import.meta.url)), "payload");
}
