/**
 * Diff utility for comparing composed instruction files.
 */

export interface DiffResult {
  /** Whether the files differ */
  isDifferent: boolean;
  /** Human-readable summary of differences */
  summary: string;
  /** Existing content (empty string if file doesn't exist) */
  existing: string;
  /** Newly composed content */
  composed: string;
}

/**
 * Compare existing copilot-instructions.md content with newly composed content.
 * Strips the header comment before comparison since timestamps always differ.
 */
export function diffInstructions(existing: string | null, composed: string): DiffResult {
  if (existing === null || existing === undefined) {
    return {
      isDifferent: true,
      summary: 'No existing copilot-instructions.md — file will be created.',
      existing: '',
      composed,
    };
  }

  const normalizedExisting = stripHeader(existing).trim();
  const normalizedComposed = stripHeader(composed).trim();

  if (normalizedExisting === normalizedComposed) {
    return {
      isDifferent: false,
      summary: '✅ Instructions are in sync — no changes needed.',
      existing,
      composed,
    };
  }

  // Build a human-readable diff summary
  const existingLines = normalizedExisting.split('\n');
  const composedLines = normalizedComposed.split('\n');

  const addedCount = composedLines.filter((line) => !existingLines.includes(line)).length;
  const removedCount = existingLines.filter((line) => !composedLines.includes(line)).length;

  const parts: string[] = ['⚠️ Instructions are out of date:'];
  if (addedCount > 0) {parts.push(`  +${addedCount} lines added`);}
  if (removedCount > 0) {parts.push(`  -${removedCount} lines removed`);}
  if (addedCount === 0 && removedCount === 0) {
    parts.push('  Content reordered or whitespace changed');
  }

  return {
    isDifferent: true,
    summary: parts.join('\n'),
    existing,
    composed,
  };
}

/**
 * Strip the auto-generated HTML comment header from composed content.
 * This prevents timestamp-only changes from triggering false diffs.
 */
function stripHeader(content: string): string {
  // Remove consecutive HTML comment lines from the start of the content
  const lines = content.split('\n');
  let startIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('<!--') && trimmed.endsWith('-->')) {
      startIdx = i + 1;
    } else if (trimmed === '') {
      // Skip empty lines between header comments
      continue;
    } else {
      break;
    }
  }
  return lines.slice(startIdx).join('\n');
}
