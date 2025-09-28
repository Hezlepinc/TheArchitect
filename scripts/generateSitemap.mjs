// scripts/generateSitemap.mjs
import fs from "fs";
import path from "path";

// Generates both a human-readable project tree and an SEO sitemap.xml

function generateTree(dir, depth = 0, maxDepth = 4, ignore = []) {
  if (depth > maxDepth) return "";
  const files = fs.readdirSync(dir, { withFileTypes: true });

  return files
    .filter(f => !ignore.includes(f.name))
    .map(f => {
      const prefix = "  ".repeat(depth) + "- ";
      if (f.isDirectory()) {
        return (
          prefix +
          f.name +
          "\n" +
          generateTree(path.join(dir, f.name), depth + 1, maxDepth, ignore)
        );
      } else {
        return prefix + f.name;
      }
    })
    .join("\n");
}

const ignoreList = [
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".vercel",
  ".cache",
  ".vite"
];

// 1) Project tree
const tree = generateTree(process.cwd(), 0, 4, ignoreList);
fs.writeFileSync("PROJECT_SITEMAP.md", "# 📂 Project Sitemap\n\n" + tree);
console.log("✅ PROJECT_SITEMAP.md generated!");

// 2) SEO sitemap
const urls = [
  { loc: "https://playground.incharge-ai.com/", priority: 0.6 },
  { loc: "https://widget.incharge-ai.com/", priority: 0.6 },
  { loc: "https://staging-playground.incharge-ai.com/", priority: 0.3 },
  { loc: "https://staging-widget.incharge-ai.com/", priority: 0.3 },
];

function isoNow(){ return new Date().toISOString(); }

const items = urls.map(u => {
  return `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${isoNow()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`;
}).join("\n");
const xml = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n${items}\n</urlset>\n`;
fs.writeFileSync("sitemap.xml", xml, "utf8");
console.log("✅ sitemap.xml generated!");