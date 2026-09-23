const AUTH_SECRET = process.env.AUTH_SECRET || "beres-in-super-secret-auth-key-2026-secure";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  exp?: number;
}

export const SESSION_COOKIE_NAME = "beres_session";

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function stringToBase64Url(str: string): string {
  return arrayBufferToBase64Url(encoder.encode(str).buffer);
}

function base64UrlToString(base64url: string): string {
  const buffer = base64UrlToArrayBuffer(base64url);
  return decoder.decode(buffer);
}

async function getCryptoKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(AUTH_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Creates a signed JWT-like session token
 */
export async function createSessionToken(
  payload: Omit<SessionPayload, "exp">
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 days expiration
  const data: SessionPayload = { ...payload, exp };
  const dataB64 = stringToBase64Url(JSON.stringify(data));

  const key = await getCryptoKey();
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(dataB64)
  );
  const sigB64 = arrayBufferToBase64Url(signatureBuffer);

  return `${dataB64}.${sigB64}`;
}

/**
 * Verifies and decodes a session token. Returns null if invalid or expired.
 */
export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [dataB64, sigB64] = parts;
    const key = await getCryptoKey();
    const sigBuffer = base64UrlToArrayBuffer(sigB64);

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBuffer,
      encoder.encode(dataB64)
    );

    if (!isValid) return null;

    const jsonStr = base64UrlToString(dataB64);
    const payload = JSON.parse(jsonStr) as SessionPayload;

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
