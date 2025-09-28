import fs from "fs";
import path from "path";
import { z } from "zod";

const AssistantConfigSchema = z.object({
  assistantName: z.string().min(1),
  brand: z.string().min(1),
  region: z.string().min(1).optional(),
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

function resolveConfigPath(brand, region, persona) {
  const root = path.resolve("server/config/assistants", brand);
  if (region) {
    return path.join(root, region, `${persona}.json`);
  }
  // Fallback: brand/persona.json (no region) OR first region folder that contains persona.json
  const direct = path.join(root, `${persona}.json`);
  if (fs.existsSync(direct)) return direct;
  const entries = fs.existsSync(root) ? fs.readdirSync(root, { withFileTypes: true }) : [];
  for (const e of entries) {
    if (e.isDirectory()) {
      const p = path.join(root, e.name, `${persona}.json`);
      if (fs.existsSync(p)) return p;
    }
  }
  return path.join(root, "__not_found__", `${persona}.json`);
}

export function loadAssistantConfig(brand, regionOrPersona, maybePersona) {
  // Support both signatures: (brand, region, persona) and (brand, persona)
  const hasRegion = typeof maybePersona === "string";
  const brandId = String(brand);
  const region = hasRegion ? String(regionOrPersona) : undefined;
  const persona = hasRegion ? String(maybePersona) : String(regionOrPersona);
  const configPath = resolveConfigPath(brandId, region, persona);
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
