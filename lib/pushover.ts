const PUSHOVER_API = "https://api.pushover.net/1/messages.json";

interface PushoverMessage {
  title: string;
  message: string;
  url?: string;
  url_title?: string;
  priority?: number; // -2 to 2
  sound?: string;
}

export async function sendPushover(msg: PushoverMessage): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.PUSHOVER_APP_TOKEN;
  const user = process.env.PUSHOVER_USER_KEY;

  if (!token || !user) {
    return { ok: false, error: "PUSHOVER_APP_TOKEN or PUSHOVER_USER_KEY not set" };
  }

  const body = new URLSearchParams({
    token,
    user,
    title: msg.title,
    message: msg.message,
    ...(msg.url ? { url: msg.url } : {}),
    ...(msg.url_title ? { url_title: msg.url_title } : {}),
    ...(msg.priority !== undefined ? { priority: String(msg.priority) } : {}),
    ...(msg.sound ? { sound: msg.sound } : {}),
  });

  const response = await fetch(PUSHOVER_API, {
    method: "POST",
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    return { ok: false, error: `Pushover ${response.status}: ${text}` };
  }

  return { ok: true };
}
