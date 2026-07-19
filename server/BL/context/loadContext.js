/**
 * Context is imported as bundled strings (not read from disk).
 * This is required for Vercel/serverless — fs paths like /var/task/... omit .md files.
 *
 * Edit the sibling .md files, then keep them in sync by importing below.
 * Webpack `asset/source` inlines the .md contents at build time.
 */
import businessMd from './business.md';
import writingStyleMd from './writingStyle.md';

let businessCache = null;
let writingStyleCache = null;

/**
 * Business + audience context for Gemini prompts.
 * Edit server/BL/context/business.md to update.
 */
export function getBusinessContextPromptBlock() {
  if (!businessCache) {
    businessCache = String(businessMd).trim();
  }
  return businessCache;
}

/**
 * Writing style + guardrails for Gemini prompts.
 * Edit server/BL/context/writingStyle.md to update.
 */
export function getWritingStylePromptBlock() {
  if (!writingStyleCache) {
    writingStyleCache = String(writingStyleMd).trim();
  }
  return writingStyleCache;
}

/** Clear cache after file edits in dev (optional). */
export function clearContextCache() {
  businessCache = null;
  writingStyleCache = null;
}
