import { Request, Response } from 'express';
import ServiceAlert from '../models/ServiceAlert';
import ServiceAlertInterest from '../models/ServiceAlertInterest';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { parseRadius, parseCoords, kmToMeters } from '../utils/geo';

export const createServiceAlert = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { serviceType, customServiceType, providerName, description, address, lat, lng, scheduledTime } = req.body;

    if (!serviceType || !description || !address || !lat || !lng || !scheduledTime) {
      sendError(res, 'serviceType, description, address, lat, lng and scheduledTime are required.', 400);
      return;
    }

    const scheduled = new Date(scheduledTime);
    // Alert expires 2 hours after scheduled time
    const expiresAt = new Date(scheduled.getTime() + 2 * 60 * 60 * 1000);

    const alert = await ServiceAlert.create({
      serviceType,
      customServiceType: serviceType === 'other' ? customServiceType : undefined,
      providerName,
      description,
      address,
      location: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
      scheduledTime: scheduled,
      expiresAt,
      createdBy: req.user!.id,
    });

    const populated = await ServiceAlert.findById(alert._id).populate('createdBy', 'name avatarUrl');
    sendSuccess(res, populated, 'Service alert created.', 201);
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};

export const getServiceAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng, radius, serviceType, page = 1, limit = 20 } = req.query;
    const coords = parseCoords(lat, lng);
    const radiusMeters = kmToMeters(parseRadius(radius));
    const skip = (Number(page) - 1) * Number(limit);

    // Auto-expire alerts past expiresAt
    await ServiceAlert.updateMany(
      { status: 'open', expiresAt: { $lt: new Date() } },
      { $set: { status: 'expired' } }
    );

    const query: Record<string, unknown> = { status: 'open' };
    if (serviceType) query.serviceType = serviceType;

    let alerts;
    if (coords) {
      alerts = await ServiceAlert.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [coords.lng, coords.lat] },
            distanceField: 'distance',
            maxDistance: radiusMeters,
            spherical: true,
            query,
          },
        },
        { $sort: { distance: 1, scheduledTime: 1 } },
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
      alerts = await ServiceAlert.find(query)
        .sort({ scheduledTime: 1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('createdBy', 'name avatarUrl');
    }

    const total = await ServiceAlert.countDocuments(query);
    sendSuccess(res, alerts, 'Service alerts fetched.', 200, {
      page: Number(page), limit: Number(limit), total,
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};

export const getServiceAlertById = async (req: Request, res: Response): Promise<void> => {
  try {
    const alert = await ServiceAlert.findById(req.params.id).populate('createdBy', 'name avatarUrl email');
    if (!alert) { sendError(res, 'Alert not found.', 404); return; }
    sendSuccess(res, alert);
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};

export const expressInterest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const alert = await ServiceAlert.findById(req.params.id);
    if (!alert) { sendError(res, 'Alert not found.', 404); return; }
    if (alert.status !== 'open') { sendError(res, 'This alert is no longer open.', 400); return; }
    if (alert.createdBy.toString() === req.user!.id) {
      sendError(res, 'You cannot express interest in your own alert.', 400);
      return;
    }

    const existing = await ServiceAlertInterest.findOne({ serviceAlertId: req.params.id, userId: req.user!.id });
    if (existing) {
      sendError(res, 'You have already expressed interest.', 400);
      return;
    }

    const { message } = req.body;
    const interest = await ServiceAlertInterest.create({
      serviceAlertId: req.params.id,
      userId: req.user!.id,
      message: message || '',
    });

    const populated = await ServiceAlertInterest.findById(interest._id).populate('userId', 'name avatarUrl');
    sendSuccess(res, populated, 'Interest expressed.', 201);
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};

export const getInterested = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const alert = await ServiceAlert.findById(req.params.id);
    if (!alert) { sendError(res, 'Alert not found.', 404); return; }

    // Only creator can see full list
    if (alert.createdBy.toString() !== req.user!.id) {
      sendError(res, 'Only the alert creator can view interested users.', 403);
      return;
    }

    const interests = await ServiceAlertInterest.find({ serviceAlertId: req.params.id })
      .populate('userId', 'name avatarUrl email')
      .sort({ createdAt: -1 });

    sendSuccess(res, interests);
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};

export const updateInterestStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const alert = await ServiceAlert.findById(req.params.id);
    if (!alert) { sendError(res, 'Alert not found.', 404); return; }
    if (alert.createdBy.toString() !== req.user!.id) {
      sendError(res, 'Only the alert creator can accept/decline interests.', 403);
      return;
    }

    const { status } = req.body;
    if (!['accepted', 'declined'].includes(status)) {
      sendError(res, 'status must be "accepted" or "declined".', 400);
      return;
    }

    const interest = await ServiceAlertInterest.findOneAndUpdate(
      { _id: req.params.interestId, serviceAlertId: req.params.id },
      { status },
      { new: true }
    ).populate('userId', 'name avatarUrl');

    if (!interest) { sendError(res, 'Interest not found.', 404); return; }
    sendSuccess(res, interest, `Interest ${status}.`);
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};

export const closeAlert = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const alert = await ServiceAlert.findById(req.params.id);
    if (!alert) { sendError(res, 'Alert not found.', 404); return; }
    if (alert.createdBy.toString() !== req.user!.id) {
      sendError(res, 'Only the creator can close this alert.', 403);
      return;
    }
    alert.status = 'closed';
    await alert.save();
    sendSuccess(res, alert, 'Alert closed.');
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};
