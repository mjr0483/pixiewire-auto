/**
 * Strip citation markers, URLs, and other artifacts from generated tweet text.
 * This is the final safety net before display or publishing.
 */
export function sanitizeTweet(text: string): string {
  let clean = text;
  // Citation links: [[1]](url), [1](url)
  clean = clean.replace(/\[\[?\d+\]?\]\([^)]*\)/g, "");
  // Standalone citations: [[1]], [1], [2]
  clean = clean.replace(/\[\[\d+\]\]/g, "");
  clean = clean.replace(/\[\d+\]/g, "");
  // Superscript numbers
  clean = clean.replace(/[¹²³⁴⁵⁶⁷⁸⁹⁰]+/g, "");
  // Markdown links
  clean = clean.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
  // Bare URLs — but keep pixiewire.com links (they're intentional CTAs)
  clean = clean.replace(/https?:\/\/(?!pixiewire\.com)\S+/g, "");
  // Empty parens left after stripping
  clean = clean.replace(/\(\s*\)/g, "");
  // Leading/trailing quotes wrapping entire tweet
  clean = clean.replace(/^["']|["']$/g, "");
  // Double spaces
  clean = clean.replace(/  +/g, " ").trim();
  return clean;
}
