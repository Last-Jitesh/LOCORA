import { Request, Response } from 'express';
import Activity from '../models/Activity';
import User from '../models/User';
import ActivityInterest from '../models/ActivityInterest';
import ActivityMessage from '../models/ActivityMessage';
import HostBlock from '../models/HostBlock';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { kmToMeters, parseRadius, parseCoords } from '../utils/geo';
import { Server } from 'socket.io';

// Attach io to the controller via module-level variable set at startup
let _io: Server | null = null;
export const setIo = (io: Server) => { _io = io; };

// ── Haversine helper ────────────────────────────────────────────────────────
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const createActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, category, address, lat, lng, startTime, endTime, maxParticipants } = req.body;

    if (!title || !description || !address || !startTime || !maxParticipants) {
      sendError(res, 'title, description, address, startTime and maxParticipants are required.', 400);
      return;
    }

    const parsedMax = Number(maxParticipants);
    if (isNaN(parsedMax) || parsedMax < 2) {
      sendError(res, 'maxParticipants must be at least 2.', 400);
      return;
    }    const user = await User.findById(req.user!.id);
    let coords: [number, number] = [Number(lng) || 0, Number(lat) || 0];
    if (coords[0] === 0 && coords[1] === 0 && user?.longitude !== undefined && user?.latitude !== undefined) {
      coords = [user.longitude, user.latitude];
    }

    const activity = await Activity.create({
      title,
      description,
      category: category || 'other',
      address,
      location: { type: 'Point', coordinates: coords },
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : undefined,
      createdBy: req.user!.id,
      maxParticipants: parsedMax,
      currentParticipants: 0,
      participants: [],
    });

    const populated = await Activity.findById(activity._id).populate('createdBy', 'name avatarUrl email');
    sendSuccess(res, populated, 'Activity created.', 201);
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};

export const getActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng, radius, category, page = 1, limit = 20 } = req.query;
    const coords = parseCoords(lat, lng);
    const radiusMeters = kmToMeters(parseRadius(radius));
    const skip = (Number(page) - 1) * Number(limit);

    const query: Record<string, unknown> = {};
    if (category) query.category = category;

    let activities: any[] = [];
    if (coords) {
      activities = await Activity.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [coords.lng, coords.lat] },
            distanceField: 'distance',
            maxDistance: radiusMeters,
            spherical: true,
            query,
          },
        },
        { $sort: { distance: 1, startTime: 1 } },
        { $skip: skip },
        { $limit: Number(limit) },
        {
          $lookup: {
            from: 'users',
            localField: 'createdBy',
            foreignField: '_id',
            as: 'createdBy',
            pipeline: [{ $project: { name: 1, avatarUrl: 1, email: 1 } }],
          },
        },
        { $unwind: '$createdBy' },
      ]);
    }

    // Fallback: If no geo coordinates were passed OR if geo filter returned 0 items, fetch all activities
    if (activities.length === 0) {
      activities = await Activity.find(query)
        .sort({ startTime: 1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('createdBy', 'name avatarUrl email')
        .lean();
    }

    const total = await Activity.countDocuments(query);
    sendSuccess(res, activities, 'Activities fetched.', 200, {
      page: Number(page), limit: Number(limit), total,
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};

export const getActivityById = async (req: Request, res: Response): Promise<void> => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('createdBy', 'name avatarUrl email department bio')
      .populate('participants', 'name avatarUrl email department bio');
    if (!activity)   { sendError(res, 'Activity not found.', 404); return; }
    sendSuccess(res, activity);
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};

export const joinActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const activity = await Activity.findById(req.params.id);
    if (!activity) { sendError(res, 'Activity not found.', 404); return; }

    // Host cannot join their own activity as participant
    if (activity.createdBy.toString() === userId) {
      sendError(res, 'You are the host of this activity.', 400);
      return;
    }

    // Check if blocked by host
    const blocked = await HostBlock.findOne({ hostId: activity.createdBy, blockedUserId: userId });
    if (blocked) {
      sendError(res, 'You have been blocked by this activity host and cannot join their activities.', 403);
      return;
    }

    // Check already joined
    const alreadyJoined = activity.participants.some(p => p.toString() === userId);
    if (alreadyJoined) {
      sendError(res, 'You have already joined this activity.', 400);
      return;
    }

    // Check capacity
    if (activity.currentParticipants >= activity.maxParticipants) {
      sendError(res, 'This activity is full. No slots remaining.', 400);
      return;
    }

    // Join
    activity.participants.push(new (require('mongoose').Types.ObjectId)(userId));
    activity.currentParticipants += 1;
    await activity.save();

    const updated = await Activity.findById(activity._id).populate('createdBy', 'name avatarUrl');

    // Real-time update
    if (_io) {
      _io.to(`activity:${req.params.id}`).emit('participant:update', {
        activityId: req.params.id,
        currentParticipants: activity.currentParticipants,
        maxParticipants: activity.maxParticipants,
        isFull: activity.currentParticipants >= activity.maxParticipants,
      });
    }

    sendSuccess(res, updated, 'Joined activity successfully.');
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};

export const leaveActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const activity = await Activity.findById(req.params.id);
    if (!activity) { sendError(res, 'Activity not found.', 404); return; }

    const participantIndex = activity.participants.findIndex(p => p.toString() === userId);
    if (participantIndex === -1) {
      sendError(res, 'You are not a participant of this activity.', 400);
      return;
    }

    activity.participants.splice(participantIndex, 1);
    activity.currentParticipants = Math.max(0, activity.currentParticipants - 1);
    await activity.save();

    // Real-time update
    if (_io) {
      _io.to(`activity:${req.params.id}`).emit('participant:update', {
        activityId: req.params.id,
        currentParticipants: activity.currentParticipants,
        maxParticipants: activity.maxParticipants,
        isFull: activity.currentParticipants >= activity.maxParticipants,
      });
    }

    sendSuccess(res, null, 'Left activity successfully.');
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};

export const getParticipants = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('participants', 'name avatarUrl bio department createdAt')
      .populate('createdBy', 'name avatarUrl bio department createdAt');
    if (!activity) { sendError(res, 'Activity not found.', 404); return; }
    sendSuccess(res, {
      participants: activity.participants,
      host: activity.createdBy,
      currentParticipants: activity.currentParticipants,
      maxParticipants: activity.maxParticipants,
    });
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};

export const getActivityMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const activity = await Activity.findById(req.params.id);
    if (!activity) { sendError(res, 'Activity not found.', 404); return; }

    const isHost = activity.createdBy.toString() === userId;
    const isParticipant = activity.participants.some(p => p.toString() === userId);

    if (!isHost && !isParticipant) {
      sendError(res, 'Only participants can view the chat.', 403);
      return;
    }

    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const messages = await ActivityMessage.find({ activityId: req.params.id })
      .populate('senderId', 'name avatarUrl')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(Number(limit));

    sendSuccess(res, messages);
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};

export const markInterested = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) { sendError(res, 'Activity not found.', 404); return; }

    const existing = await ActivityInterest.findOne({ activityId: req.params.id, userId: req.user!.id });
    if (existing) {
      await ActivityInterest.deleteOne({ _id: existing._id });
      await Activity.findByIdAndUpdate(req.params.id, { $inc: { interestedCount: -1 } });
      sendSuccess(res, null, 'Removed interest.');
    } else {
      await ActivityInterest.create({ activityId: req.params.id, userId: req.user!.id });
      await Activity.findByIdAndUpdate(req.params.id, { $inc: { interestedCount: 1 } });
      sendSuccess(res, null, 'Marked as interested.');
    }
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};

export const getInterestedUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) { sendError(res, 'Activity not found.', 404); return; }

    const interests = await ActivityInterest.find({ activityId: req.params.id })
      .populate('userId', 'name avatarUrl bio department')
      .sort({ createdAt: -1 });

    sendSuccess(res, interests.map(i => i.userId));
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};

export const deleteActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) { sendError(res, 'Activity not found.', 404); return; }
    if (activity.createdBy.toString() !== req.user!.id) {
      sendError(res, 'You can only delete your own activities.', 403);
      return;
    }
    await Activity.deleteOne({ _id: activity._id });
    await ActivityInterest.deleteMany({ activityId: req.params.id });
    await ActivityMessage.deleteMany({ activityId: req.params.id });
    sendSuccess(res, null, 'Activity deleted.');
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};
