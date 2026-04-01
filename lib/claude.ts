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
