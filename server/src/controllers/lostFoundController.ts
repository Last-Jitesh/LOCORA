import { Request, Response } from 'express';
import LostFound from '../models/LostFound';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { parseRadius, parseCoords, kmToMeters } from '../utils/geo';

export const createLostFound = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, title, description, category, address, lat, lng, date, contactPreference } = req.body;

    if (!type || !title || !description || !address || !lat || !lng || !date) {
      sendError(res, 'type, title, description, address, lat, lng and date are required.', 400);
      return;
    }

    const item = await LostFound.create({
      reportedBy: req.user!.id,
      type,
      title,
      description,
      category: category || 'other',
      address,
      location: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
      date: new Date(date),
      contactPreference: contactPreference || '',
    });

    const populated = await LostFound.findById(item._id).populate('reportedBy', 'name avatarUrl');
    sendSuccess(res, populated, 'Post created.', 201);
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};

export const getLostFoundItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng, radius, type, category, status = 'open', page = 1, limit = 20 } = req.query;
    const coords = parseCoords(lat, lng);
    const radiusMeters = kmToMeters(parseRadius(radius));
    const skip = (Number(page) - 1) * Number(limit);

    const query: Record<string, unknown> = { status };
    if (type) query.type = type;
    if (category) query.category = category;

    let items;
    if (coords) {
      items = await LostFound.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [coords.lng, coords.lat] },
            distanceField: 'distance',
            maxDistance: radiusMeters,
            spherical: true,
            query,
          },
        },
        { $sort: { distance: 1 } },
        { $skip: skip },
        { $limit: Number(limit) },
        {
          $lookup: {
            from: 'users',
            localField: 'reportedBy',
            foreignField: '_id',
            as: 'reportedBy',
            pipeline: [{ $project: { name: 1, avatarUrl: 1 } }],
          },
        },
        { $unwind: '$reportedBy' },
      ]);
    } else {
      items = await LostFound.find(query)
        .populate('reportedBy', 'name avatarUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));
    }

    const total = await LostFound.countDocuments(query);
    sendSuccess(res, items, 'Items fetched.', 200, {
      page: Number(page), limit: Number(limit), total,
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};

export const getLostFoundById = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await LostFound.findById(req.params.id).populate('reportedBy', 'name avatarUrl email');
    if (!item) { sendError(res, 'Item not found.', 404); return; }
    sendSuccess(res, item);
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};

export const resolveLostFound = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await LostFound.findById(req.params.id);
    if (!item) { sendError(res, 'Item not found.', 404); return; }
    if (item.reportedBy.toString() !== req.user!.id) {
      sendError(res, 'You can only resolve your own posts.', 403);
      return;
    }
    item.status = 'resolved';
    await item.save();
    sendSuccess(res, item, 'Marked as resolved.');
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};

export const deleteLostFound = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await LostFound.findById(req.params.id);
    if (!item) { sendError(res, 'Item not found.', 404); return; }
    if (item.reportedBy.toString() !== req.user!.id) {
      sendError(res, 'You can only delete your own posts.', 403);
      return;
    }
    await LostFound.deleteOne({ _id: item._id });
    sendSuccess(res, null, 'Post deleted.');
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};
