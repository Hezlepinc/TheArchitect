import fs from "fs";
import path from "path";

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

const tree = generateTree(process.cwd(), 0, 4, ignoreList);
fs.writeFileSync("PROJECT_SITEMAP.md", "# 📂 Project Sitemap\n\n" + tree);

console.log("✅ PROJECT_SITEMAP.md generated!");