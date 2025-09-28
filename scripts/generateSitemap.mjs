#!/usr/bin/env node
import { promises as fs } from "fs";
import path from "path";

function parseArgs(argv) {
  const args = {};
  for (const raw of argv) {
    if (raw.startsWith("--")) {
      const [key, ...rest] = raw.slice(2).split("=");
      args[key] = rest.length ? rest.join("=") : true;
    } else if (!args._) {
      args._ = [raw];
    } else {
      args._.push(raw);
    }
  }
  return args;
}

async function* walkDirectory(directoryPath) {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      yield* walkDirectory(fullPath);
    } else if (entry.isFile()) {
      yield fullPath;
    }
  }
}

function toRouteFromDocs(fileAbsolutePath, docsRootAbsolutePath) {
  const relative = path.relative(docsRootAbsolutePath, fileAbsolutePath);
  const parsed = path.parse(relative);
  const isMarkdown = [".md", ".markdown", ".mdx"].includes(parsed.ext.toLowerCase());
  if (!isMarkdown) return null;
  if (parsed.name.toLowerCase() === "readme") {
    return "/docs";
  }
  const segments = path.join(parsed.dir, parsed.name).split(path.sep).filter(Boolean);
  return "/docs/" + segments.join("/");
}

function xmlEscape(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function generateSitemap({ baseUrl, docsDir, outputFile, changefreq = "weekly", defaultPriority = 0.5 }) {
  const urls = [];
  for await (const filePath of walkDirectory(docsDir)) {
    const route = toRouteFromDocs(filePath, docsDir);
    if (!route) continue;
    const stat = await fs.stat(filePath);
    const lastmod = new Date(stat.mtime).toISOString();
    const loc = new URL(route.replace(/\\/g, "/"), baseUrl).toString();
    urls.push({ loc, lastmod, changefreq, priority: defaultPriority });
  }
  urls.sort((a, b) => a.loc.localeCompare(b.loc));

  const xmlParts = [];
  xmlParts.push('<?xml version="1.0" encoding="UTF-8"?>');
  xmlParts.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  for (const { loc, lastmod, changefreq, priority } of urls) {
    xmlParts.push("  <url>");
    xmlParts.push(`    <loc>${xmlEscape(loc)}</loc>`);
    xmlParts.push(`    <lastmod>${lastmod}</lastmod>`);
    if (changefreq) xmlParts.push(`    <changefreq>${changefreq}</changefreq>`);
    if (priority != null) xmlParts.push(`    <priority>${priority}</priority>`);
    xmlParts.push("  </url>");
  }
  xmlParts.push("</urlset>");
  const xml = xmlParts.join("\n") + "\n";
  await fs.writeFile(outputFile, xml, "utf8");
  return { count: urls.length, outputFile };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const baseUrl = (args.base || process.env.SITEMAP_BASE_URL || "http://localhost").toString();
  const cwd = process.cwd();
  const docsDir = path.resolve(cwd, "docs");
  const outputFile = path.resolve(cwd, "sitemap.xml");
  try {
    await fs.access(docsDir);
  } catch {
    console.error(`Docs directory not found: ${docsDir}`);
    process.exit(1);
  }
  const result = await generateSitemap({ baseUrl, docsDir, outputFile });
  console.log(`Sitemap generated: ${result.outputFile} (entries: ${result.count})`);
}

if (import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
