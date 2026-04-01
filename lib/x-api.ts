import crypto from "node:crypto";

interface XCredentials {
  api_key: string;
  api_secret: string;
  access_token: string;
  access_token_secret: string;
}

function percentEncode(str: string): string {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string,
): string {
  const sortedKeys = Object.keys(params).sort();
  const paramString = sortedKeys.map((k) => `${percentEncode(k)}=${percentEncode(params[k])}`).join("&");
  const baseString = `${method.toUpperCase()}&${percentEncode(url)}&${percentEncode(paramString)}`;
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;
  return crypto.createHmac("sha1", signingKey).update(baseString).digest("base64");
}

function buildOAuthHeader(
  method: string,
  url: string,
  credentials: XCredentials,
): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: credentials.api_key,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: credentials.access_token,
    oauth_version: "1.0",
  };

  const signature = generateOAuthSignature(
    method,
    url,
    oauthParams,
    credentials.api_secret,
    credentials.access_token_secret,
  );

  oauthParams.oauth_signature = signature;

  const headerParts = Object.keys(oauthParams)
    .sort()
    .map((k) => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`)
    .join(", ");

  return `OAuth ${headerParts}`;
}

export function signOAuthRequest(
  method: string,
  url: string,
  credentials: XCredentials,
): Record<string, string> {
  const baseUrl = url.split("?")[0];
  const authHeader = buildOAuthHeader(method, baseUrl, credentials);
  return { Authorization: authHeader };
}

export async function postTweet(
  credentials: XCredentials,
  text: string,
): Promise<{ id: string; text: string }> {
  const url = "https://api.twitter.com/2/tweets";
  const authHeader = buildOAuthHeader("POST", url, credentials);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`X API ${response.status}: ${body}`);
  }

  const json = await response.json();
  return json.data as { id: string; text: string };
}

export async function deleteTweet(
  credentials: XCredentials,
  tweetId: string,
): Promise<void> {
  const url = `https://api.twitter.com/2/tweets/${tweetId}`;
  const authHeader = buildOAuthHeader("DELETE", url, credentials);

  const response = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: authHeader },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`X API DELETE ${response.status}: ${body}`);
  }
}

export function getXCredentials(): XCredentials {
  return {
    api_key: process.env.X_API_KEY!,
    api_secret: process.env.X_API_SECRET!,
    access_token: process.env.X_ACCESS_TOKEN!,
    access_token_secret: process.env.X_ACCESS_TOKEN_SECRET!,
  };
}
