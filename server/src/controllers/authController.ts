import { Request, Response } from 'express';
import User from '../models/User';
import Session from '../models/Session';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { generateAndStoreOtp, validateOtp } from '../services/otpService';
import { sendOtpEmail } from '../services/emailService';
import { createAccessToken, createSession, rotateSession, deleteSessionByToken, SESSION_COOKIE_OPTIONS } from '../services/tokenService';

// ── OTP Request ────────────────────────────────────────────────────────────
export const requestOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      sendError(res, 'Please provide a valid email address.', 400);
      return;
    }

    const otp = await generateAndStoreOtp(email.toLowerCase());
    await sendOtpEmail(email.toLowerCase(), otp);

    sendSuccess(res, null, 'OTP sent to your email. Check your inbox.');
  } catch (error: unknown) {
    sendError(res, (error as Error).message || 'Failed to send OTP.', 500);
  }
};

// ── OTP Verify ─────────────────────────────────────────────────────────────
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      sendError(res, 'Email and OTP are required.', 400);
      return;
    }

    await validateOtp(email.toLowerCase(), otp.toString().trim());

    // Find or create user
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
      user = await User.create({ email: email.toLowerCase(), name });
    }

    const accessToken = createAccessToken(user.id, user.email);
    const { rawToken, expiresAt } = await createSession(user.id, req);

    res.cookie('sessionToken', rawToken, { ...SESSION_COOKIE_OPTIONS, expires: expiresAt });

    sendSuccess(res, {
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
    }, 'Signed in successfully.');
  } catch (error: unknown) {
    sendError(res, (error as Error).message || 'OTP verification failed.', 400);
  }
};

// ── Refresh ─────────────────────────────────────────────────────────────────
export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawToken = req.cookies?.sessionToken;
    if (!rawToken) {
      sendError(res, 'No session token.', 401);
      return;
    }

    const result = await rotateSession(rawToken, req);
    if (!result) {
      res.clearCookie('sessionToken');
      sendError(res, 'Session expired or invalid. Please sign in again.', 401);
      return;
    }

    const user = await User.findById(result.userId).select('-__v');
    if (!user) {
      res.clearCookie('sessionToken');
      sendError(res, 'User not found.', 401);
      return;
    }

    const accessToken = createAccessToken(result.userId, user.email);
    res.cookie('sessionToken', result.rawToken, { ...SESSION_COOKIE_OPTIONS, expires: result.expiresAt });

    sendSuccess(res, {
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
    }, 'Token refreshed.');
  } catch (error: unknown) {
    sendError(res, (error as Error).message || 'Token refresh failed.', 401);
  }
};

// ── Logout ──────────────────────────────────────────────────────────────────
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawToken = req.cookies?.sessionToken;
    if (rawToken) {
      await deleteSessionByToken(rawToken);
    }
    res.clearCookie('sessionToken');
    sendSuccess(res, null, 'Signed out successfully.');
  } catch {
    res.clearCookie('sessionToken');
    sendSuccess(res, null, 'Signed out.');
  }
};

// ── Get Me ──────────────────────────────────────────────────────────────────
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id).select('-__v');
    if (!user) { sendError(res, 'User not found.', 404); return; }
    sendSuccess(res, { id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl, address: user.address });
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};

// ── Update Me ────────────────────────────────────────────────────────────────
export const updateMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, address, avatarUrl } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user!.id,
      { ...(name && { name }), ...(address !== undefined && { address }), ...(avatarUrl !== undefined && { avatarUrl }) },
      { new: true, runValidators: true }
    ).select('-__v');
    if (!user) { sendError(res, 'User not found.', 404); return; }
    sendSuccess(res, { id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl, address: user.address });
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};

// ── List Sessions ────────────────────────────────────────────────────────────
export const getSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessions = await Session.find({
      userId: req.user!.id,
      expiresAt: { $gt: new Date() },
    }).select('userAgent ipAddress createdAt expiresAt').sort({ createdAt: -1 });

    sendSuccess(res, sessions);
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};

// ── Revoke Session ───────────────────────────────────────────────────────────
export const revokeSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const session = await Session.findOne({ _id: req.params.id, userId: req.user!.id });
    if (!session) { sendError(res, 'Session not found.', 404); return; }

    await Session.deleteOne({ _id: session._id });
    sendSuccess(res, null, 'Session revoked.');
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};
