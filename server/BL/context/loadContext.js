import fs from 'fs';
import path from 'path';

const CONTEXT_DIR = path.join(process.cwd(), 'server/BL/context');

let businessCache = null;
let writingStyleCache = null;

function readMarkdown(filename) {
  const filePath = path.join(CONTEXT_DIR, filename);
  return fs.readFileSync(filePath, 'utf8').trim();
}

/**
 * Business + audience context for Gemini prompts.
 * Edit server/BL/context/business.md to update.
 */
export function getBusinessContextPromptBlock() {
  if (!businessCache) {
    businessCache = readMarkdown('business.md');
  }
  return businessCache;
}

/**
 * Writing style + guardrails for Gemini prompts.
 * Edit server/BL/context/writingStyle.md to update.
 */
export function getWritingStylePromptBlock() {
  if (!writingStyleCache) {
    writingStyleCache = readMarkdown('writingStyle.md');
  }
  return writingStyleCache;
}

/** Clear cache after file edits in dev (optional). */
export function clearContextCache() {
  businessCache = null;
  writingStyleCache = null;
}
