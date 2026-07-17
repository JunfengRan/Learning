#!/usr/bin/env node
/**
 * Validate inline SVG diagrams in Learning HTML notes.
 * - Structural: viewBox, xmlns, aria-label, unique marker ids
 * - Layout: elements stay inside viewBox; labeled boxes contain their text
 * - Heuristics: minimum box size, text overlap, fan-out line collisions
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(SCRIPT_DIR, "..");
const SCAN_DIRS = ["frontier-apps", "company-blogs"];
const TOLERANCE = 2;

const args = process.argv.slice(2);
const ALL_DIRS = process.argv.includes("--all");
const fileArg = args.find((a) => !a.startsWith("-") && a !== "--all");
const SCAN = fileArg ? [fileArg] : ALL_DIRS ? SCAN_DIRS : ["frontier-apps"];

function collectHtmlFiles(dir) {
  const abs = join(ROOT, dir);
  const files = [];
  for (const entry of readdirSync(abs)) {
    const path = join(abs, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      files.push(...collectHtmlFiles(relative(ROOT, path)));
    } else if (entry.endsWith(".html")) {
      files.push(path);
    }
  }
  return files;
}

function parseViewBox(svgTag) {
  const match = svgTag.match(/viewBox=["']([^"']+)["']/);
  if (!match) return null;
  const parts = match[1].trim().split(/\s+/).map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN)) return null;
  return { x: parts[0], y: parts[1], w: parts[2], h: parts[3] };
}

function parseAriaLabel(svgTag) {
  const match = svgTag.match(/aria-label=["']([^"']+)["']/);
  return match?.[1] ?? null;
}

function numAttr(tag, name, fallback = 0) {
  const match = tag.match(new RegExp(`${name}=["']([^"']+)["']`));
  if (!match) return fallback;
  const n = Number(match[1]);
  return Number.isNaN(n) ? fallback : n;
}

function strAttr(tag, name) {
  const match = tag.match(new RegExp(`${name}=["']([^"']+)["']`));
  return match?.[1] ?? "";
}

function extractSvgs(html, file) {
  const svgs = [];
  const regex = /<svg\b[\s\S]*?<\/svg>/gi;
  let match;
  let index = 0;
  while ((match = regex.exec(html)) !== null) {
    index += 1;
    const line = html.slice(0, match.index).split(/\r?\n/).length;
    const block = match[0];
    const openTag = block.match(/<svg\b[^>]*>/i)?.[0] ?? "";
    svgs.push({ file, index, line, block, openTag });
  }
  return svgs;
}

function inViewBox(x, y, vb, tol = TOLERANCE) {
  return (
    x >= vb.x - tol &&
    y >= vb.y - tol &&
    x <= vb.x + vb.w + tol &&
    y <= vb.y + vb.h + tol
  );
}

function rectFromTag(tag) {
  return {
    x: numAttr(tag, "x"),
    y: numAttr(tag, "y"),
    w: numAttr(tag, "width"),
    h: numAttr(tag, "height"),
    rx: numAttr(tag, "rx"),
  };
}

function rectsOverlap(a, b, gap = 4) {
  return !(
    a.x + a.w + gap <= b.x ||
    b.x + b.w + gap <= a.x ||
    a.y + a.h + gap <= b.y ||
    b.y + b.h + gap <= a.y
  );
}

function pointInRect(px, py, r, pad = 4) {
  return px >= r.x + pad && px <= r.x + r.w - pad && py >= r.y + pad && py <= r.y + r.h - pad;
}

function nearestRect(text, rects) {
  let best = null;
  let bestDist = Infinity;
  for (const r of rects) {
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    const dist = Math.hypot(text.x - cx, text.y - cy);
    if (dist < bestDist) {
      bestDist = dist;
      best = r;
    }
  }
  return best;
}

function validateSvg(svg) {
  const issues = [];
  const { block, openTag, file, index, line } = svg;

  if (!openTag.includes('xmlns="http://www.w3.org/2000/svg"')) {
    issues.push("missing xmlns");
  }
  if (!openTag.includes('role="img"')) {
    issues.push('missing role="img"');
  }
  const label = parseAriaLabel(openTag);
  if (!label) {
    issues.push('missing aria-label');
  }

  const vb = parseViewBox(openTag);
  if (!vb) {
    issues.push("missing or invalid viewBox");
    return issues;
  }

  const rectTags = [...block.matchAll(/<rect\b[^>]*>/gi)].map((m) => m[0]);
  const textTags = [...block.matchAll(/<text\b[^>]*>[\s\S]*?<\/text>/gi)].map((m) => m[0]);
  const lineTags = [...block.matchAll(/<line\b[^>]*>/gi)].map((m) => m[0]);

  const rects = rectTags.map((tag, i) => ({ tag, i, ...rectFromTag(tag) }));

  for (const r of rects) {
    if (r.w < 40 || r.h < 24) {
      issues.push(`rect #${r.i + 1} too small (${r.w}×${r.h})`);
    }
    if (r.x < vb.x - TOLERANCE || r.y < vb.y - TOLERANCE) {
      issues.push(`rect #${r.i + 1} starts outside viewBox`);
    }
    if (r.x + r.w > vb.x + vb.w + TOLERANCE || r.y + r.h > vb.y + vb.h + TOLERANCE) {
      issues.push(`rect #${r.i + 1} extends outside viewBox (${r.x + r.w}×${r.y + r.h} > ${vb.w}×${vb.h})`);
    }
  }

  // Sibling rects on same row should not overlap
  for (let i = 0; i < rects.length; i++) {
    for (let j = i + 1; j < rects.length; j++) {
      const a = rects[i];
      const b = rects[j];
      const sameRow = Math.abs(a.y - b.y) < 20 && Math.abs(a.h - b.h) < 20;
      if (sameRow && rectsOverlap(a, b)) {
        issues.push(`rect #${a.i + 1} overlaps rect #${b.i + 1} on same row`);
      }
    }
  }

  for (const tag of textTags) {
    const x = numAttr(tag, "x");
    const y = numAttr(tag, "y");
    const content = tag.replace(/<[^>]+>/g, "").trim();
    if (!content) {
      issues.push("empty <text> element");
      continue;
    }
    if (!inViewBox(x, y, vb)) {
      issues.push(`text "${content.slice(0, 24)}" outside viewBox at (${x},${y})`);
    }
    const fs = numAttr(tag, "font-size", 12);
    if (fs < 9) {
      issues.push(`text "${content.slice(0, 24)}" font-size ${fs} too small`);
    }

    const parent = nearestRect({ x, y }, rects);
    if (parent && !pointInRect(x, y, parent, 2)) {
      const dx = Math.min(Math.abs(x - parent.x), Math.abs(x - (parent.x + parent.w)));
      const dy = Math.min(Math.abs(y - parent.y), Math.abs(y - (parent.y + parent.h)));
      if (dx > parent.w * 0.6 && dy > parent.h * 0.6) {
        issues.push(`text "${content.slice(0, 24)}" not inside nearest rect #${parent.i + 1}`);
      }
    }
  }

  for (const tag of lineTags) {
    const x1 = numAttr(tag, "x1");
    const y1 = numAttr(tag, "y1");
    const x2 = numAttr(tag, "x2");
    const y2 = numAttr(tag, "y2");
    if (!inViewBox(x1, y1, vb) || !inViewBox(x2, y2, vb)) {
      issues.push(`line (${x1},${y1})→(${x2},${y2}) extends outside viewBox`);
    }
  }

  // Fan-out from one point to multiple targets (common layout bug)
  const starts = new Map();
  for (const tag of lineTags) {
    const key = `${numAttr(tag, "x1")},${numAttr(tag, "y1")}`;
    starts.set(key, (starts.get(key) ?? 0) + 1);
  }
  for (const [key, count] of starts) {
    if (count >= 3) {
      issues.push(`${count} lines share start point ${key}; check tree layout (fan-out)`);
    }
  }

  return issues;
}

function validateMarkerIds(html, file) {
  const issues = [];
  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map((m) => m[1]);
  const seen = new Map();
  for (const id of ids) {
    if (!id.startsWith("arr") && !id.includes("marker")) continue;
    const count = (seen.get(id) ?? 0) + 1;
    seen.set(id, count);
  }
  for (const [id, count] of seen) {
    if (count > 1) {
      issues.push(`duplicate marker id "${id}" in ${file} (${count} times); prefix per <svg>`);
    }
  }
  return issues;
}

function main() {
  const files = SCAN.flatMap((dir) => {
    try {
      const path = join(ROOT, dir);
      const stat = statSync(path);
      if (stat.isFile() && dir.endsWith(".html")) return [path];
      return collectHtmlFiles(dir);
    } catch {
      return [];
    }
  });

  if (files.length === 0) {
    console.log("No HTML files found.");
    return;
  }

  const errors = [];

  for (const file of files) {
    const rel = relative(ROOT, file);
    const html = readFileSync(file, "utf8");
    errors.push(...validateMarkerIds(html, rel).map((msg) => `${rel}\n${msg}`));

    const svgs = extractSvgs(html, rel);
    for (const svg of svgs) {
      const issues = validateSvg(svg);
      if (issues.length > 0) {
        const label = parseAriaLabel(svg.openTag) ?? `diagram #${svg.index}`;
        errors.push(
          `${rel}:${svg.line} (${label})\n${issues.map((i) => `  - ${i}`).join("\n")}`,
        );
      }
    }
  }

  const svgCount = files.reduce((n, f) => n + extractSvgs(readFileSync(f, "utf8"), f).length, 0);
  console.log(`Validated ${svgCount} SVG diagram(s) in ${files.length} HTML file(s).`);

  if (errors.length > 0) {
    console.error("\nHTML SVG validation failed:\n");
    for (const error of errors) {
      console.error(`---\n${error}\n`);
    }
    process.exit(1);
  }

  console.log("All HTML SVG diagrams passed validation.");
}

main();
