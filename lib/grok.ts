const XAI_API = "https://api.x.ai/v1/responses";

interface GrokResult {
  text: string;
  sources: string[];
}

export async function grokResearchAndDraft(
  contentType: string,
  maxChars: number,
  headlines: string,
): Promise<GrokResult> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) throw new Error("XAI_API_KEY not set");

  const prompt = `You are writing a tweet for @PixieWireNews, a Disney and Universal theme park news brand.

Content type: ${contentType}
Max characters: ${maxChars}

STEP 1: Search X and the web for the most current Disney/Universal theme park news.
STEP 2: Cross-reference with these headlines from PixieWire's daily feed:
${headlines}

STEP 3: Write ONE tweet. Rules:
- Write like a knowledgeable Disney fan, NOT a press release
- No URLs in the tweet text (handled separately)
- No fabricated numbers
- Under ${maxChars} characters
- No hashtags unless genuinely trending

Return ONLY the tweet text. Nothing else.`;

  const response = await fetch(XAI_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4-1-fast-non-reasoning",
      input: [{ role: "user", content: prompt }],
      tools: [{ type: "web_search" }, { type: "x_search" }],
      max_output_tokens: 300,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Grok API ${response.status}: ${body}`);
  }

  const data = await response.json();

  // Extract text from response
  const msg = data.output?.find((o: any) => o.type === "message");
  const text = msg?.content?.find((c: any) => c.type === "output_text")?.text || "";

  // Extract source URLs from annotations
  const sources: string[] = [];
  const annotations = msg?.content?.find((c: any) => c.annotations)?.annotations || [];
  for (const ann of annotations) {
    if (ann.type === "url_citation" && ann.url) {
      sources.push(ann.url);
    }
  }

  return { text: text.trim(), sources };
}
