import jwt from 'jsonwebtoken';
import { Request } from 'express';
import Session from '../models/Session';
import { env } from '../config/env';

// ── Token lifetimes ──────────────────────────────────────────────────────────
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '30d'; // used in jwt.sign
const REFRESH_TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

// ── Access Token ─────────────────────────────────────────────────────────────

/** Create a short-lived JWT access token (15 min) */
export const createAccessToken = (userId: string, email: string): string => {
  return jwt.sign({ id: userId, email }, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

// ── Refresh Token ─────────────────────────────────────────────────────────────

/**
 * Issue a refresh JWT and persist it in MongoDB for rotation / revocation.
 * Returns the signed refresh token string.
 */
export const createRefreshToken = async (
  userId: string,
  req: Request
): Promise<{ refreshToken: string; expiresAt: Date }> => {
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

  const refreshToken = jwt.sign(
    { id: userId },
    env.REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  await Session.create({
    userId,
    refreshToken,
    userAgent: req.headers['user-agent'] || '',
    ipAddress: req.ip || '',
    expiresAt,
  });

  return { refreshToken, expiresAt };
};

/**
 * Verify, rotate, and reissue a refresh token.
 * The old token is deleted and a new one is stored (token rotation).
 */
export const rotateRefreshToken = async (
  incomingToken: string,
  req: Request
): Promise<{ userId: string; refreshToken: string; expiresAt: Date } | null> => {
  // 1. Verify the JWT signature first (fast, no DB hit on invalid tokens)
  let payload: { id: string };
  try {
    payload = jwt.verify(incomingToken, env.REFRESH_TOKEN_SECRET) as { id: string };
  } catch {
    return null; // expired or tampered
  }

  // 2. Find the exact token in the DB (revocation check)
  const session = await Session.findOne({
    userId: payload.id,
    refreshToken: incomingToken,
    expiresAt: { $gt: new Date() },
  });

  if (!session) return null; // already rotated or revoked

  const userId = session.userId.toString();

  // 3. Delete the old record (rotation — one-time use)
  await Session.deleteOne({ _id: session._id });

  // 4. Issue a new refresh token and persist it
  const { refreshToken, expiresAt } = await createRefreshToken(userId, req);

  return { userId, refreshToken, expiresAt };
};

/**
 * Revoke a specific refresh token (logout from one device).
 */
export const revokeRefreshToken = async (refreshToken: string): Promise<void> => {
  await Session.deleteOne({ refreshToken });
};

/**
 * Revoke ALL refresh tokens for a user (logout everywhere).
 */
export const revokeAllUserTokens = async (userId: string): Promise<void> => {
  await Session.deleteMany({ userId });
};

/** Cookie options for the HttpOnly refresh token cookie */
export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: REFRESH_TOKEN_EXPIRY_MS,
};
