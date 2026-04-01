export interface ContentType {
  id: string;
  label: string;
  maxChars: number;
  description: string;
  urlStrategy: string;
  bestTimeSlots: string[];
}

export const DEFAULT_CONTENT_TYPES: ContentType[] = [
  { id: "news", label: "Breaking News", maxChars: 240, description: "Breaking or top story, linked to original source", urlStrategy: "Source URL", bestTimeSlots: ["Morning", "Midday"] },
  { id: "news_pixiewire", label: "PixieWire Daily", maxChars: 240, description: "Same story routed through pixiewire.com/daily", urlStrategy: "pixiewire.com/daily", bestTimeSlots: ["Morning", "Evening"] },
  { id: "curator", label: "Curated Roundup", maxChars: 240, description: "\"Here's what everyone's talking about\" — multiple stories", urlStrategy: "pixiewire.com/daily", bestTimeSlots: ["Midday"] },
  { id: "opinionator", label: "Hot Take", maxChars: 400, description: "Confident editorial stance on a Disney topic, no URL", urlStrategy: "None", bestTimeSlots: ["Afternoon", "Evening"] },
  { id: "tracker", label: "Tracker Promo", maxChars: 200, description: "Promotes a PixieWire planning tool contextually", urlStrategy: "Tool URL", bestTimeSlots: ["Morning", "Weekend"] },
  { id: "trending", label: "Trending React", maxChars: 280, description: "Reacts to what's trending on X/Disney Twitter right now", urlStrategy: "Optional source", bestTimeSlots: ["Midday", "Evening"] },
  { id: "article_tease", label: "Article Tease", maxChars: 180, description: "Teases a deeper PixieWire article (sparingly)", urlStrategy: "pixiewire.com article", bestTimeSlots: ["As needed"] },
];

export function resolveContentTypes(dbTypes: ContentType[] | null): ContentType[] {
  return dbTypes && dbTypes.length > 0 ? dbTypes : DEFAULT_CONTENT_TYPES;
}

export function getContentType(id: string, types?: ContentType[]): ContentType | undefined {
  const list = types || DEFAULT_CONTENT_TYPES;
  return list.find((ct) => ct.id === id);
}

export function buildPrompt(masterPrompt: string, contentType: ContentType, currentTime: string): string {
  return masterPrompt.replace(/\{\{CONTENT_TYPE\}\}/g, contentType.id);
}
