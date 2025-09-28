import { promises as fs } from "fs";
import path from "path";

async function ensureDir(p){ await fs.mkdir(p, { recursive: true }); }
async function copyDir(src, dest){
  await ensureDir(dest);
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const e of entries) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) await copyDir(s, d); else await fs.copyFile(s, d);
  }
}

async function run(){
  const root = process.cwd();
  const out = path.join(root, "build");
  await ensureDir(out);
  // copy demo and public
  const demoSrc = path.join(root, "demo");
  const publicSrc = path.join(root, "public");
  try { await copyDir(demoSrc, path.join(out, "demo")); } catch {}
  try { await copyDir(publicSrc, path.join(out, "public")); } catch {}
  // copy dist bundle
  const distSrc = path.join(root, "dist", "widget.iife.js");
  await ensureDir(path.join(out, "dist"));
  await fs.copyFile(distSrc, path.join(out, "dist", "widget.iife.js"));
}

run().catch((e)=>{ console.error(e); process.exit(1); });
