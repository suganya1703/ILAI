import crypto from "crypto";
import { supabaseAdmin } from "./supabase/admin";

export const DEFAULT_ADMIN_EMAIL = "info.ilaiofficial@gmail.com";

/**
 * Hash a password using PBKDF2 with SHA-512 and a random salt
 */
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, actualSalt, 100000, 64, "sha512").toString("hex");
  return { hash, salt: actualSalt };
}

/**
 * Verify a plain text password against a stored PBKDF2 hash & salt
 * Uses timingSafeEqual to protect against timing attacks
 */
export function verifyPassword(password: string, storedHash: string, storedSalt: string): boolean {
  try {
    const computedHash = crypto.pbkdf2Sync(password, storedSalt, 100000, 64, "sha512").toString("hex");
    const hashBuffer = Buffer.from(storedHash, "hex");
    const computedBuffer = Buffer.from(computedHash, "hex");
    if (hashBuffer.length !== computedBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(hashBuffer, computedBuffer);
  } catch (err) {
    console.error("Password verification error:", err);
    return false;
  }
}

/**
 * Authenticate admin credentials securely on the server
 */
export async function authenticateAdmin(
  emailInput: string,
  passwordInput: string
): Promise<{ success: boolean; email?: string; error?: string }> {
  const normalizedEmail = (emailInput || "").trim().toLowerCase();
  const configuredEmail = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase();

  // 1. Strictly verify the single allowed admin email
  if (normalizedEmail !== configuredEmail) {
    return { success: false, error: "Invalid admin email or password" };
  }

  // 2. Check Database (Supabase) if table exists
  try {
    const { data: dbUser, error } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .eq("email", normalizedEmail)
      .single();

    if (!error && dbUser && dbUser.password_hash && dbUser.salt) {
      const isValid = verifyPassword(passwordInput, dbUser.password_hash, dbUser.salt);
      if (isValid) {
        return { success: true, email: dbUser.email };
      }
      return { success: false, error: "Invalid admin email or password" };
    }
  } catch (dbErr) {
    // Database table may not be migrated yet or offline in dev
  }

  // 3. Verify against direct ADMIN_PASSWORD or hashed credentials in environment
  if (process.env.ADMIN_PASSWORD && passwordInput === process.env.ADMIN_PASSWORD) {
    return { success: true, email: configuredEmail };
  }

  const activeSalt = process.env.ADMIN_PASSWORD_SALT;
  const activeHash = process.env.ADMIN_PASSWORD_HASH;

  if (activeSalt && activeHash) {
    const isValid = verifyPassword(passwordInput, activeHash, activeSalt);
    if (isValid) {
      return { success: true, email: configuredEmail };
    }
  }

  return { success: false, error: "Invalid admin email or password" };
}
