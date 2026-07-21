import { Request, Response } from 'express';
import Service from '../models/Service';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { parseRadius, parseCoords, kmToMeters } from '../utils/geo';

export const createService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { serviceName, serviceType, phoneNumber } = req.body;

    if (!serviceName || !serviceType || !phoneNumber) {
      sendError(res, 'serviceName, serviceType and phoneNumber are required.', 400);
      return;
    }

    // Get location from the user's stored coordinates
    const user = await User.findById(req.user!.id);
    if (!user) {
      sendError(res, 'User not found.', 404);
      return;
    }

    const hasCoords = user.latitude !== undefined && user.longitude !== undefined;
    const coordinates: [number, number] = hasCoords ? [user.longitude!, user.latitude!] : [0, 0];

    const service = await Service.create({
      serviceName,
      serviceType,
      phoneNumber,
      providerId: req.user!.id,
      address: user.address || '',
      location: { type: 'Point', coordinates },
    });

    sendSuccess(res, service, 'Service provider registered successfully.', 201);
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};

export const getServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng, radius, serviceType, page = 1, limit = 20 } = req.query;
    const coords = parseCoords(lat, lng);
    const radiusMeters = kmToMeters(parseRadius(radius));
    const skip = (Number(page) - 1) * Number(limit);

    const query: Record<string, unknown> = {};
    if (serviceType) query.serviceType = serviceType;

    let services;
    if (coords) {
      services = await Service.aggregate([
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
            localField: 'providerId',
            foreignField: '_id',
            as: 'provider',
            pipeline: [{ $project: { name: 1, avatarUrl: 1, email: 1 } }],
          },
        },
        { $unwind: '$provider' },
      ]);
    } else {
      services = await Service.find(query)
        .populate('providerId', 'name avatarUrl email')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 });
    }

    const total = await Service.countDocuments(query);
    sendSuccess(res, services, 'Services fetched.', 200, {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};

export const getServiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await Service.findById(req.params.id).populate('providerId', 'name avatarUrl email');
    if (!service) {
      sendError(res, 'Service not found.', 404);
      return;
    }
    sendSuccess(res, service);
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};

export const deleteService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      sendError(res, 'Service not found.', 404);
      return;
    }

    if (service.providerId.toString() !== req.user!.id) {
      sendError(res, 'You can only delete your own service listing.', 403);
      return;
    }

    await Service.deleteOne({ _id: service._id });
    sendSuccess(res, null, 'Service listing deleted.');
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};
