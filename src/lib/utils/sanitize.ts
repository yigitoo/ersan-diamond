/**
 * Simple server-side HTML sanitizer that strips dangerous tags.
 * For lightweight use cases where DOMPurify is not needed.
 */

/** Tags considered dangerous and removed entirely (including their content) */
const DANGEROUS_TAGS = ["script", "iframe", "object", "embed", "form"];

/**
 * Strip dangerous HTML tags and their content from a string.
 *
 * @param input - The raw HTML string to sanitize
 * @returns The sanitized string with dangerous tags removed
 */
export function sanitizeHtml(input: string): string {
  if (!input) return "";

  let sanitized = input;

  for (const tag of DANGEROUS_TAGS) {
    // Remove opening + content + closing tags (including nested content)
    // Using RegExp constructor for dynamic tag names; 'gi' for global, case-insensitive
    // 's' (dotAll) flag ensures '.' matches newlines inside tag content
    const pairedRegex = new RegExp(
      `<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`,
      "gi"
    );
    sanitized = sanitized.replace(pairedRegex, "");

    // Remove any remaining self-closing or unclosed tags
    const singleRegex = new RegExp(`<${tag}\\b[^>]*\\/?>`, "gi");
    sanitized = sanitized.replace(singleRegex, "");
  }

  // Also strip on* event handler attributes from any remaining tags
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  return sanitized;
}
