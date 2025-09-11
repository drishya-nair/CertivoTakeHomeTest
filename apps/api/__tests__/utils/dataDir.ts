import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function ensureDataDirForTests(): string {
  // Resolve to the app's data directory by default; tests can override via DATA_DIR
  const dataDir = process.env.DATA_DIR
    ? path.resolve(process.env.DATA_DIR)
    : path.resolve(__dirname, "..", "..", "src", "..", "data");
  return dataDir;
}


