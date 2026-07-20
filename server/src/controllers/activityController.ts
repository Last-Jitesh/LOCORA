import { Request, Response } from 'express';
import Activity from '../models/Activity';
import ActivityInterest from '../models/ActivityInterest';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { kmToMeters, parseRadius, parseCoords } from '../utils/geo';

export const createActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, category, address, lat, lng, startTime, endTime } = req.body;

    if (!title || !description || !address || !lat || !lng || !startTime) {
      sendError(res, 'title, description, address, lat, lng and startTime are required.', 400);
      return;
    }

    const activity = await Activity.create({
      title,
      description,
      category: category || 'other',
      address,
      location: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : undefined,
      createdBy: req.user!.id,
    });

    const populated = await Activity.findById(activity._id).populate('createdBy', 'name avatarUrl');
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

    let activities;
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
            pipeline: [{ $project: { name: 1, avatarUrl: 1 } }],
          },
        },
        { $unwind: '$createdBy' },
      ]);
    } else {
      activities = await Activity.find(query)
        .sort({ startTime: 1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('createdBy', 'name avatarUrl');
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
    const activity = await Activity.findById(req.params.id).populate('createdBy', 'name avatarUrl email');
    if (!activity) { sendError(res, 'Activity not found.', 404); return; }
    sendSuccess(res, activity);
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
      // Toggle off
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

export const getInterestedUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const interests = await ActivityInterest.find({ activityId: req.params.id })
      .populate('userId', 'name avatarUrl')
      .sort({ createdAt: -1 });
    sendSuccess(res, interests);
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
    sendSuccess(res, null, 'Activity deleted.');
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};
