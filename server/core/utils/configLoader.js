import fs from "fs";
import path from "path";
import { z } from "zod";

const AssistantConfigSchema = z.object({
  assistantName: z.string().min(1),
  brand: z.string().min(1),
  region: z.string().min(1),
  persona: z.string().min(1),
  greeting: z.string().min(1),
  themeColor: z.string().min(1),
  // optional fields commonly used by the widget
  logoUrl: z.string().url().optional(),
  scheduleUrl: z.string().url().optional(),
  ctaUrl: z.string().url().optional(),
  reviewUrl: z.string().url().optional(),
  textUrl: z.string().optional(),
  contactInfo: z
    .object({
      phone: z.string().optional(),
      altPhone: z.string().optional(),
      textPhone: z.string().optional(),
      email: z.string().email().optional()
    })
    .optional()
});

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
  const parsed = JSON.parse(withoutBom);
  const result = AssistantConfigSchema.safeParse(parsed);
  if (!result.success) {
    const issue = result.error.issues?.[0];
    throw new Error(`Invalid assistant config: ${issue?.path?.join(".") || "root"} ${issue?.message || "schema error"}`);
  }
  return result.data;
}
