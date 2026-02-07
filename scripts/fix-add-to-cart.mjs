import fs from "fs";
import path from "path";

const ROOT = process.cwd();

const CANDIDATES = [
  "app/product/[id]/page.tsx",
  "app/product/[productId]/page.tsx",
  "app/product/[slug]/page.tsx",
  "app/products/[id]/page.tsx",
];

function exists(p) {
  return fs.existsSync(path.join(ROOT, p));
}

function read(p) {
  return fs.readFileSync(path.join(ROOT, p), "utf8");
}

function write(p, content) {
  fs.writeFileSync(path.join(ROOT, p), content, "utf8");
}

function backup(p, content) {
  const out = path.join(ROOT, p + ".bak");
  fs.writeFileSync(out, content, "utf8");
}

function ensureImport(code) {
  const importLine = `import { useStore } from "@/store/useStore";`;

  if (code.includes(importLine)) return code;

  // Place after existing imports (best-effort)
  const lines = code.split("\n");
  let lastImportIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("import ")) lastImportIdx = i;
  }
  if (lastImportIdx >= 0) {
    lines.splice(lastImportIdx + 1, 0, importLine);
    return lines.join("\n");
  }
  // fallback
  return importLine + "\n" + code;
}

function ensureHook(code) {
  // we insert inside the main component function body
  // common patterns:
  // export default function ProductPage() {
  // function ProductPage() {
  const hookLine = `  const addToCart = useStore((s) => s.addToCart);`;

  if (code.includes(hookLine)) return code;

  const fnRegex =
    /(export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{\s*\n)/m;

  const match = code.match(fnRegex);
  if (!match) {
    throw new Error(
      "Could not find the main component function. Add hook manually."
    );
  }

  return code.replace(fnRegex, (m) => m + hookLine + "\n");
}

function patchButton(code) {
  // Replace the onClick of the button that contains "Add to Cart"
  // Best-effort regex: find <button ...> ... Add to Cart ... </button>
  const btnRegex =
    /<button([\s\S]*?)>([\s\S]*?Add\s*to\s*Cart[\s\S]*?)<\/button>/im;

  const m = code.match(btnRegex);
  if (!m) {
    throw new Error(
      'Could not find an "Add to Cart" button in the product page.'
    );
  }

  const fullBtn = m[0];

  // Replace or add onClick prop
  const onClickRegex = /onClick=\{[\s\S]*?\}/im;

  const newOnClick = `onClick={() => addToCart(product, { size: selectedSize, color: selectedColor })}`;

  let newBtn = fullBtn;

  if (onClickRegex.test(fullBtn)) {
    newBtn = fullBtn.replace(onClickRegex, newOnClick);
  } else {
    // insert onClick after <button
    newBtn = fullBtn.replace("<button", `<button ${newOnClick} `);
  }

  // Optional: prevent silent no-op if size/color empty (keeps UX clean)
  // But we assume you already have selectedSize/selectedColor in your product page.
  // If you don't, this will be a compile error and you'll paste your product page for me to fix fully.

  return code.replace(fullBtn, newBtn);
}

function main() {
  const target = CANDIDATES.find(exists);

  if (!target) {
    console.log("❌ Could not find product page. Checked:");
    CANDIDATES.forEach((c) => console.log(" - " + c));
    console.log(
      "\nIf your path is different, tell me the exact file path and I’ll update the script."
    );
    process.exit(1);
  }

  let code = read(target);
  backup(target, code);

  code = ensureImport(code);
  code = ensureHook(code);
  code = patchButton(code);

  write(target, code);

  console.log("✅ Updated:", target);
  console.log("🧾 Backup saved:", target + ".bak");
  console.log("\nNow restart your dev server:");
  console.log("  rm -rf .next && npm run dev");
}

main();
