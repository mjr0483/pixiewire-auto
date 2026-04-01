export interface ContentType {
  id: string;
  label: string;
  maxChars: number;
  description: string;
}

export const CONTENT_TYPES: ContentType[] = [
  { id: "news", label: "Latest News", maxChars: 240, description: "News tweet linking to pixiewire.com/daily or original source" },
  { id: "curator", label: "Curated Story", maxChars: 240, description: "Curated story with commentary, links to pixiewire.com/daily" },
  { id: "opinionator", label: "Opinion", maxChars: 400, description: "Confident editorial stance, no URL" },
  { id: "tracker", label: "Tracker Promo", maxChars: 200, description: "Promote a PixieWire planning tool" },
  { id: "article_tease", label: "Article Tease", maxChars: 180, description: "Short punchy hook for a major story" },
  { id: "joke-of-the-day", label: "Joke of the Day", maxChars: 280, description: "Pull from existing jokes system" },
];

export function getContentType(id: string): ContentType | undefined {
  return CONTENT_TYPES.find((ct) => ct.id === id);
}

export function buildPrompt(masterPrompt: string, contentType: ContentType, currentTime: string): string {
  return `${masterPrompt}

CONTENT TYPE FOR THIS TWEET: ${contentType.id} — ${contentType.description}
MAX CHARACTERS: ${contentType.maxChars}
CURRENT TIME: ${currentTime} ET

Write one tweet. Max ${contentType.maxChars} characters. Return ONLY the tweet text, nothing else.`;
}
