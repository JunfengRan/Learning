#!/usr/bin/env node
/**
 * Extract ```mermaid blocks from markdown and validate GitHub-compatible syntax.
 * - Always: static lint rules for known GitHub parse failures
 * - CI (--render): render via @mermaid-js/mermaid-cli (mmdc + headless Chrome)
 */
import { readFileSync, readdirSync, statSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { execSync } from "node:child_process";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(SCRIPT_DIR, "..");
const SCAN_DIRS = ["frontier-apps", "papers", "model-training", "personal-blogs", "company-blogs"];
const RENDER = process.argv.includes("--render") || process.env.CI === "true";

const MMDC = join(ROOT, "node_modules", ".bin", process.platform === "win32" ? "mmdc.cmd" : "mmdc");

function collectMarkdownFiles(dir) {
  const abs = join(ROOT, dir);
  const files = [];
  for (const entry of readdirSync(abs)) {
    const path = join(abs, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      files.push(...collectMarkdownFiles(relative(ROOT, path)));
    } else if (entry.endsWith(".md")) {
      files.push(path);
    }
  }
  return files;
}

function extractMermaidBlocks(content, filePath) {
  const blocks = [];
  const regex = /```mermaid\r?\n([\s\S]*?)```/g;
  let match;
  let index = 0;
  while ((match = regex.exec(content)) !== null) {
    index += 1;
    const line = content.slice(0, match.index).split(/\r?\n/).length;
    blocks.push({
      file: relative(ROOT, filePath),
      index,
      line,
      source: match[1].trimEnd(),
    });
  }
  return blocks;
}

function lintBlock(block) {
  const issues = [];
  const lines = block.source.split(/\r?\n/);
  const isSequence = block.source.includes("sequenceDiagram");
  const hasLoopBlock = /^\s*loop\s/m.test(block.source);

  for (const line of lines) {
    const trimmed = line.trim();

    // Unquoted @ in flowchart node labels
    if (/^\s*\w+\[[^"\]]*@[^"\]]*\]/.test(trimmed) && !trimmed.includes('["')) {
      issues.push("flowchart node label contains unquoted '@'; use AI[\"@scope/pkg label\"]");
    }

    if (isSequence) {
      const participant = trimmed.match(/^participant\s+(\w+)\s+as\s+(.+)$/);
      if (participant) {
        const alias = participant[2].trim();
        const bareAlias = alias.replace(/^"|"$/g, "");
        if (!alias.startsWith('"') && bareAlias.split(/\s+/).length >= 3) {
          issues.push('participant alias with 3+ words must be quoted: as "AI SDK streamText"');
        }
        if (hasLoopBlock && bareAlias.toLowerCase() === "loop") {
          issues.push('participant alias "loop" conflicts with loop/end block; use as "main loop"');
        }
        if (hasLoopBlock && participant[1] === "Loop") {
          issues.push('participant ID "Loop" conflicts with loop/end block; rename to MainLoop');
        }
      }
    }
  }

  return issues;
}

function renderBlock(block, tempDir) {
  const input = join(tempDir, `diagram-${block.index}.mmd`);
  const output = join(tempDir, `diagram-${block.index}.svg`);
  writeFileSync(input, block.source, "utf8");

  try {
    const cmd = `"${MMDC}" -i "${input}" -o "${output}" -q`;
    execSync(cmd, {
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 120_000,
      shell: true,
    });
    return null;
  } catch (err) {
    const stderr = err.stderr?.toString().trim() ?? "";
    const stdout = err.stdout?.toString().trim() ?? "";
    return stderr || stdout || err.message;
  }
}

function main() {
  const files = SCAN_DIRS.flatMap((dir) => {
    try {
      return collectMarkdownFiles(dir);
    } catch {
      return [];
    }
  });

  const blocks = files.flatMap((file) =>
    extractMermaidBlocks(readFileSync(file, "utf8"), file),
  );

  if (blocks.length === 0) {
    console.log("No mermaid diagrams found.");
    return;
  }

  const tempDir = RENDER ? mkdtempSync(join(tmpdir(), "mermaid-validate-")) : null;
  const errors = [];

  try {
    for (const block of blocks) {
      const lintIssues = lintBlock(block);
      if (lintIssues.length > 0) {
        errors.push(`${block.file}:${block.line} (diagram #${block.index})\n${lintIssues.join("\n")}`);
        continue;
      }

      if (RENDER && tempDir) {
        const renderError = renderBlock(block, tempDir);
        if (renderError) {
          errors.push(`${block.file}:${block.line} (diagram #${block.index})\n${renderError}`);
        }
      }
    }
  } finally {
    if (tempDir) rmSync(tempDir, { recursive: true, force: true });
  }

  const mode = RENDER ? "lint + render" : "lint only";
  console.log(`Validated ${blocks.length} mermaid diagram(s) in ${files.length} file(s) [${mode}].`);

  if (errors.length > 0) {
    console.error("\nMermaid validation failed:\n");
    for (const error of errors) {
      console.error(`---\n${error}\n`);
    }
    process.exit(1);
  }

  console.log("All mermaid diagrams are valid.");
}

main();
