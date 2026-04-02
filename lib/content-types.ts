export interface ContentType {
  id: string;
  label: string;
  maxChars: number;
  description: string;
  urlStrategy: string;
  bestTimeSlots: string[];
  automated: boolean;
}

export const DEFAULT_CONTENT_TYPES: ContentType[] = [
  { id: "news", label: "Breaking News", maxChars: 240, description: "Breaking or top story, linked to original source", urlStrategy: "Source URL (metadata only)", bestTimeSlots: ["Morning", "Midday"], automated: true },
  { id: "news_pixiewire", label: "PixieWire Daily", maxChars: 240, description: "Same story routed through pixiewire.com/daily", urlStrategy: "pixiewire.com/daily", bestTimeSlots: ["Morning", "Evening"], automated: true },
  { id: "curator", label: "Curated Roundup", maxChars: 240, description: "\"Here's what everyone's talking about\" — multiple stories", urlStrategy: "pixiewire.com/daily", bestTimeSlots: ["Midday"], automated: true },
  { id: "opinionator", label: "Hot Take", maxChars: 400, description: "Confident editorial stance on a Disney topic, no URL", urlStrategy: "None", bestTimeSlots: ["Afternoon", "Evening"], automated: true },
  { id: "trending", label: "Trending React", maxChars: 280, description: "Reacts to what's trending on X/Disney Twitter right now", urlStrategy: "Optional source (metadata)", bestTimeSlots: ["Midday", "Evening"], automated: true },
  { id: "roundup", label: "Daily Roundup", maxChars: 450, description: "ICYMI end-of-day summary — pack in top headlines, drive to pixiewire.com/daily", urlStrategy: "pixiewire.com/daily", bestTimeSlots: ["Evening"], automated: true },
  { id: "breaking", label: "Breaking Alert", maxChars: 240, description: "Breaking news from multiple sources — monitor mode, requires approval", urlStrategy: "Source URL (metadata only)", bestTimeSlots: ["Any"], automated: false },
  { id: "tracker", label: "Tracker Promo", maxChars: 200, description: "Promotes a PixieWire planning tool — manual only from pixiewire.com", urlStrategy: "Tool URL", bestTimeSlots: ["Morning", "Weekend"], automated: false },
  { id: "article_tease", label: "Article Tease", maxChars: 180, description: "Teases a deeper PixieWire article — manual only from pixiewire.com", urlStrategy: "pixiewire.com article", bestTimeSlots: ["As needed"], automated: false },
];

export function resolveContentTypes(dbTypes: ContentType[] | null): ContentType[] {
  return dbTypes && dbTypes.length > 0 ? dbTypes : DEFAULT_CONTENT_TYPES;
}

export function getAutomatedTypes(types: ContentType[]): ContentType[] {
  return types.filter((t) => t.automated);
}

export function getContentType(id: string, types?: ContentType[]): ContentType | undefined {
  const list = types || DEFAULT_CONTENT_TYPES;
  return list.find((ct) => ct.id === id);
}

export function buildPrompt(masterPrompt: string, contentType: ContentType, currentTime: string, headlines?: string): string {
  let prompt = masterPrompt.replace(/\{\{CONTENT_TYPE\}\}/g, contentType.id);

  if (headlines) {
    prompt += `\n\n---\n\nCURRENT TIME: ${currentTime} ET\n\nTODAY'S HEADLINES FROM PIXIEWIRE DAILY (use these as your source material):\n${headlines}`;
  }

  return prompt;
}
