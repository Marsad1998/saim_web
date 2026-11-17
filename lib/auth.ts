import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "ots_taxi_secure_jwt_secret_key_2026_xyz";
export const SESSION_COOKIE_NAME = "ots_session";

export interface UserSessionPayload {
  userId: string;
  email: string;
  name: string;
  role: "customer" | "admin" | "driver";
}

/**
 * Hash a plain-text password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

/**
 * Verify a plain-text password against a hashed password
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  // If the stored password was legacy unhashed plain text, handle graceful migration
  if (!hash.startsWith("$2a$") && !hash.startsWith("$2b$") && !hash.startsWith("$2y$")) {
    return password === hash;
  }
  return await bcrypt.compare(password, hash);
}

/**
 * Sign a JWT token valid for 7 days
 */
export function signJwtToken(payload: UserSessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Verify and decode a JWT session token
 */
export function verifyJwtToken(token: string): UserSessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSessionPayload;
  } catch (error) {
    return null;
  }
}
