import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

const candidatePaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "server", ".env"),
  path.resolve(process.cwd(), "server", "src", ".env"),
  path.resolve(process.cwd(), "src", ".env"),
];

const uniqueCandidates = [...new Set(candidatePaths)];

for (const filePath of uniqueCandidates) {
  if (fs.existsSync(filePath)) {
    dotenv.config({ path: filePath });
    break;
  }
}
