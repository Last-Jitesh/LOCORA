import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '30d';
const REFRESH_TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

// ── Access Token ─────────────────────────────────────────────────────────────

/** Create a short-lived JWT access token (15 min) */
export const createAccessToken = (userId: string, email: string): string => {
  return jwt.sign({ id: userId, email }, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

// ── Refresh Token ─────────────────────────────────────────────────────────────

/** Create a long-lived refresh JWT (30 days) — stored only in HttpOnly cookie */
export const createRefreshToken = (userId: string): string => {
  return jwt.sign({ id: userId }, env.REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
};

/** Verify a refresh token. Returns the payload or null if invalid/expired. */
export const verifyRefreshToken = (token: string): { id: string } | null => {
  try {
    return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as { id: string };
  } catch {
    return null;
  }
};

/** Cookie options for the HttpOnly refresh token cookie */
export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: REFRESH_TOKEN_EXPIRY_MS,
};
