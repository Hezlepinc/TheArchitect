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
  return JSON.parse(fs.readFileSync(configPath, "utf-8"));
}
