import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Request } from 'express';
import Session from '../models/Session';
import { env } from '../config/env';

const ACCESS_TOKEN_EXPIRY = '15m';
const SESSION_EXPIRY_DAYS = 30;

/** Create a short-lived JWT access token */
export const createAccessToken = (userId: string, email: string): string => {
  return jwt.sign({ id: userId, email }, env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

/** Create a new server-side session (opaque refresh token) */
export const createSession = async (
  userId: string,
  req: Request
): Promise<{ rawToken: string; expiresAt: Date }> => {
  const rawToken = crypto.randomBytes(48).toString('hex');
  const salt = await bcrypt.genSalt(10);
  const tokenHash = await bcrypt.hash(rawToken, salt);

  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await Session.create({
    userId,
    tokenHash,
    userAgent: req.headers['user-agent'] || '',
    ipAddress: req.ip || '',
    expiresAt,
  });

  return { rawToken, expiresAt };
};

/** Rotate a session: find session by raw token, delete it, create a new one */
export const rotateSession = async (
  rawToken: string,
  req: Request
): Promise<{ userId: string; rawToken: string; expiresAt: Date } | null> => {
  // Find all non-expired sessions and check hash match
  const sessions = await Session.find({
    userId: { $exists: true },
    expiresAt: { $gt: new Date() },
  }).limit(500);

  let matchedSession: (typeof sessions)[number] | null = null;
  for (const session of sessions) {
    const isMatch = await bcrypt.compare(rawToken, session.tokenHash);
    if (isMatch) {
      matchedSession = session;
      break;
    }
  }

  if (!matchedSession) return null;

  const userId = matchedSession.userId.toString();

  // Delete old session (rotation)
  await Session.deleteOne({ _id: matchedSession._id });

  // Issue new session
  const { rawToken: newRawToken, expiresAt } = await createSession(userId, req);

  return { userId, rawToken: newRawToken, expiresAt };
};

/** Delete a specific session by raw token (logout) */
export const deleteSessionByToken = async (rawToken: string): Promise<void> => {
  const sessions = await Session.find({ expiresAt: { $gt: new Date() } }).limit(500);
  for (const session of sessions) {
    const isMatch = await bcrypt.compare(rawToken, session.tokenHash);
    if (isMatch) {
      await Session.deleteOne({ _id: session._id });
      return;
    }
  }
};

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
};
