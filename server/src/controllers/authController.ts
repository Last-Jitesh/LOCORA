import { Request, Response } from 'express';
import User from '../models/User';
import Session from '../models/Session';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/apiResponse';
import {
  createAccessToken,
  createRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  REFRESH_COOKIE_OPTIONS,
} from '../services/tokenService';

// ── Sign Up ─────────────────────────────────────────────────────────────────
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      sendError(res, 'Name, email, and password are required.', 400);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      sendError(res, 'Please provide a valid email address.', 400);
      return;
    }

    if (password.length < 6) {
      sendError(res, 'Password must be at least 6 characters.', 400);
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      sendError(res, 'An account with this email already exists.', 409);
      return;
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
    });

    const accessToken = createAccessToken(user.id, user.email);
    const { refreshToken, expiresAt } = await createRefreshToken(user.id, req);

    res.cookie('refreshToken', refreshToken, { ...REFRESH_COOKIE_OPTIONS, expires: expiresAt });

    sendSuccess(res, {
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        address: user.address,
        bio: user.bio,
        department: user.department,
      },
    }, 'Account created successfully.', 201);
  } catch (error: unknown) {
    sendError(res, (error as Error).message || 'Sign up failed.', 500);
  }
};

// ── Sign In ──────────────────────────────────────────────────────────────────
export const signin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      sendError(res, 'Email and password are required.', 400);
      return;
    }

    // Explicitly select password since it's marked select: false
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      sendError(res, 'Invalid email or password.', 401);
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      sendError(res, 'Invalid email or password.', 401);
      return;
    }

    const accessToken = createAccessToken(user.id, user.email);
    const { refreshToken, expiresAt } = await createRefreshToken(user.id, req);

    res.cookie('refreshToken', refreshToken, { ...REFRESH_COOKIE_OPTIONS, expires: expiresAt });

    sendSuccess(res, {
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        address: user.address,
        bio: user.bio,
        department: user.department,
      },
    }, 'Signed in successfully.');
  } catch (error: unknown) {
    sendError(res, (error as Error).message || 'Sign in failed.', 500);
  }
};

// ── Refresh ─────────────────────────────────────────────────────────────────
export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const incomingToken = req.cookies?.refreshToken;
    if (!incomingToken) {
      sendError(res, 'No refresh token.', 401);
      return;
    }

    const result = await rotateRefreshToken(incomingToken, req);
    if (!result) {
      res.clearCookie('refreshToken');
      sendError(res, 'Refresh token expired or invalid. Please sign in again.', 401);
      return;
    }

    const user = await User.findById(result.userId).select('-__v');
    if (!user) {
      res.clearCookie('refreshToken');
      sendError(res, 'User not found.', 401);
      return;
    }

    const accessToken = createAccessToken(result.userId, user.email);

    res.cookie('refreshToken', result.refreshToken, {
      ...REFRESH_COOKIE_OPTIONS,
      expires: result.expiresAt,
    });

    sendSuccess(res, {
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        address: user.address,
        bio: user.bio,
        department: user.department,
      },
    }, 'Token refreshed.');
  } catch (error: unknown) {
    sendError(res, (error as Error).message || 'Token refresh failed.', 401);
  }
};

// ── Logout ──────────────────────────────────────────────────────────────────
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await revokeRefreshToken(token);
    }
    res.clearCookie('refreshToken');
    sendSuccess(res, null, 'Signed out successfully.');
  } catch {
    res.clearCookie('refreshToken');
    sendSuccess(res, null, 'Signed out.');
  }
};

// ── Logout From All Devices ──────────────────────────────────────────────────
export const logoutAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await revokeAllUserTokens(req.user!.id);
    res.clearCookie('refreshToken');
    sendSuccess(res, null, 'Signed out from all devices.');
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
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

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('name avatarUrl department bio createdAt');
    if (!user) {
      sendError(res, 'User not found.', 404);
      return;
    }
    sendSuccess(res, user);
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};

// ── Update Me ────────────────────────────────────────────────────────────────
export const updateMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, address, avatarUrl, bio, department } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user!.id,
      {
        ...(name && { name }),
        ...(address !== undefined && { address }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(bio !== undefined && { bio }),
        ...(department !== undefined && { department })
      },
      { new: true, runValidators: true }
    ).select('-__v');
    if (!user) { sendError(res, 'User not found.', 404); return; }
    sendSuccess(res, {
      id: user._id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      address: user.address,
      bio: user.bio,
      department: user.department,
    });
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

// ── Background Location Update (Haversine 1km guard) ──────────────────────────
export const updateLocation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { latitude, longitude } = req.body;
    if (latitude === undefined || longitude === undefined) {
      sendError(res, 'latitude and longitude are required.', 400);
      return;
    }

    const lat1 = Number(latitude);
    const lon1 = Number(longitude);
    if (isNaN(lat1) || isNaN(lon1)) {
      sendError(res, 'Invalid latitude or longitude.', 400);
      return;
    }

    const user = await User.findById(req.user!.id);
    if (!user) {
      sendError(res, 'User not found.', 404);
      return;
    }

    const hasPrev = user.latitude !== undefined && user.longitude !== undefined;
    let shouldUpdate = true;

    if (hasPrev) {
      const lat2 = user.latitude!;
      const lon2 = user.longitude!;

      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      if (distance < 1.0) {
        shouldUpdate = false;
      }
    }

    if (shouldUpdate) {
      user.latitude = lat1;
      user.longitude = lon1;
      user.location = {
        type: 'Point',
        coordinates: [lon1, lat1],
      };
      user.lastLocationUpdatedAt = new Date();
      await user.save();
      sendSuccess(res, { updated: true, distanceAlert: 'Location updated.' });
    } else {
      sendSuccess(res, { updated: false, distanceAlert: 'Movement less than 1km. Skipped update.' });
    }
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};
