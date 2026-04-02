import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function generateTweet(prompt: string, model: string, maxChars?: number): Promise<string> {
  const charLimit = maxChars || 280;
  const tokenLimit = charLimit > 300 ? 250 : 150;

  const message = await anthropic.messages.create({
    model,
    max_tokens: tokenLimit,
    system: `You write single tweets. Return ONLY the tweet text. Never return JSON, markdown headers, bulleted lists, briefings, or multiple tweets. One tweet, plain text, under ${charLimit} characters.`,
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
    max_tokens: maxChars > 300 ? 250 : 150,
    system: "You polish tweets. Return ONLY the polished tweet text. Nothing else. No labels, no quotes, no explanation.",
    messages: [{
      role: "user",
      content: `Polish this tweet for @PixieWireNews. Content type: ${contentType}. Max ${maxChars} chars. Keep the core message, improve voice. No URLs unless the original has one. Return ONLY the tweet.\n\n${draft}`,
    }],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") return draft;
  return textBlock.text.trim();
}
