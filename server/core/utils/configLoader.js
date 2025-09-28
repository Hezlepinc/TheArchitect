import fs from "fs";
import path from "path";

export function loadAssistantConfig(brand, region, persona) {
  const configPath = path.resolve(
    "server/config/assistants",
    brand,
    region,
    `${persona}.json`
  );
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config not found: ${configPath}`);
  }
  const raw = fs.readFileSync(configPath, "utf-8");
  const withoutBom = raw.replace(/^\uFEFF/, "");
  return JSON.parse(withoutBom);
}
