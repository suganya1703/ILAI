/**
 * Edge-compatible Admin Session Management using Web Crypto HMAC-SHA256
 * Works in Next.js Middleware (Edge Runtime) and Node.js API Routes
 */

export const ADMIN_COOKIE_NAME = "ilai_admin_session_token";

const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.ADMIN_PASSWORD_HASH ||
  "ilai-admin-session-auth-secret-key-2026";

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Helper to convert ArrayBuffer to hex string
function bufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Helper to import the secret as an HMAC CryptoKey
async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

// Universal Edge & Node-compatible base64url helpers
function toBase64Url(str: string): string {
  try {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(str, "utf8")
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    }
  } catch (e) {}

  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(base64url: string): string {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  try {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(base64, "base64").toString("utf8");
    }
  } catch (e) {}

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Sign an admin session payload into a tamper-proof token: <base64UrlPayload>.<hexSignature>
 */
export async function createAdminToken(email: string): Promise<string> {
  const now = Date.now();
  const payload = {
    email: email.trim().toLowerCase(),
    iat: now,
    exp: now + SESSION_DURATION_MS,
  };

  const payloadStr = JSON.stringify(payload);
  const base64Payload = toBase64Url(payloadStr);

  const key = await getCryptoKey();
  const enc = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(base64Payload)
  );
  const signatureHex = bufferToHex(signatureBuffer);

  return `${base64Payload}.${signatureHex}`;
}

/**
 * Verify an admin session token
 */
export async function verifyAdminToken(
  token: string | null | undefined
): Promise<{ valid: boolean; email?: string }> {
  if (!token || typeof token !== "string") {
    return { valid: false };
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false };
  }

  const [base64Payload, signatureHex] = parts;

  try {
    const key = await getCryptoKey();
    const enc = new TextEncoder();
    const expectedSigBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      enc.encode(base64Payload)
    );
    const expectedHex = bufferToHex(expectedSigBuffer);

    // Constant-time length comparison
    if (signatureHex.length !== expectedHex.length) {
      return { valid: false };
    }

    // Constant-time character comparison
    let mismatch = 0;
    for (let i = 0; i < signatureHex.length; i++) {
      mismatch |= signatureHex.charCodeAt(i) ^ expectedHex.charCodeAt(i);
    }
    if (mismatch !== 0) {
      return { valid: false };
    }

    // Decode and verify expiration
    const jsonStr = fromBase64Url(base64Payload);
    const payload = JSON.parse(jsonStr);

    if (!payload || typeof payload !== "object") {
      return { valid: false };
    }

    if (!payload.exp || Date.now() > payload.exp) {
      return { valid: false };
    }

    return { valid: true, email: payload.email };
  } catch (err) {
    return { valid: false };
  }
}
