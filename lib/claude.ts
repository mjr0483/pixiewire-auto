import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function generateTweet(prompt: string, model: string): Promise<string> {
  const message = await anthropic.messages.create({
    model,
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  return textBlock.text.trim();
}

export async function polishTweet(draft: string, contentType: string, maxChars: number): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    messages: [{
      role: "user",
      content: `Polish this tweet draft for @PixieWireNews (Disney/Universal theme park brand).

Content type: ${contentType}
Max characters: ${maxChars}

Draft:
${draft}

Rules:
- Keep the core message, improve the voice and flow
- Sound like a knowledgeable Disney fan, not a press release
- No URLs in the text
- Stay under ${maxChars} characters
- If the draft is already good, return it as-is

Return ONLY the polished tweet text. Nothing else.`,
    }],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") return draft;
  return textBlock.text.trim();
}
