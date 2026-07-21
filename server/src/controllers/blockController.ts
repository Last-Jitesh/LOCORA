import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/apiResponse';
import HostBlock from '../models/HostBlock';
import Activity from '../models/Activity';
import ActivityMessage from '../models/ActivityMessage';
import { Server } from 'socket.io';

let _io: Server | null = null;
export const setBlockIo = (io: Server) => { _io = io; };

// Host blocks a participant
export const blockUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const hostId = req.user!.id;
    const { blockedUserId, activityId, reason } = req.body;

    if (!blockedUserId) {
      sendError(res, 'blockedUserId is required.', 400);
      return;
    }

    // Cannot block yourself
    if (hostId === blockedUserId) {
      sendError(res, 'You cannot block yourself.', 400);
      return;
    }

    // Create block record (upsert to avoid duplicates)
    await HostBlock.findOneAndUpdate(
      { hostId, blockedUserId },
      { hostId, blockedUserId, reason: reason || '', blockedAt: new Date() },
      { upsert: true, new: true }
    );

    // If activityId provided, remove from that specific activity
    if (activityId) {
      const activity = await Activity.findById(activityId);
      if (activity && activity.createdBy.toString() === hostId) {
        const idx = activity.participants.findIndex(p => p.toString() === blockedUserId);
        if (idx !== -1) {
          activity.participants.splice(idx, 1);
          activity.currentParticipants = Math.max(0, activity.currentParticipants - 1);
          await activity.save();

          // Notify the room
          if (_io) {
            _io.to(`activity:${activityId}`).emit('participant:update', {
              activityId,
              currentParticipants: activity.currentParticipants,
              maxParticipants: activity.maxParticipants,
              isFull: activity.currentParticipants >= activity.maxParticipants,
            });

            // Tell the blocked user specifically
            _io.to(`activity:${activityId}`).emit('user:blocked', {
              blockedUserId,
              activityId,
              message: 'You have been removed from this activity by the host.',
            });
          }
        }
      }
    }

    sendSuccess(res, null, 'User blocked successfully.');
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};

// Get host's block list
export const getBlockList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const blocks = await HostBlock.find({ hostId: req.user!.id })
      .populate('blockedUserId', 'name avatarUrl email')
      .sort({ blockedAt: -1 });
    sendSuccess(res, blocks);
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};

// Check if a user is blocked by a host
export const checkIfBlocked = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { hostId } = req.query;
    if (!hostId) { sendError(res, 'hostId query param required.', 400); return; }
    const block = await HostBlock.findOne({ hostId: hostId as string, blockedUserId: req.user!.id });
    sendSuccess(res, { isBlocked: !!block });
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};

// Unblock a user
export const unblockUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await HostBlock.deleteOne({ hostId: req.user!.id, blockedUserId: req.params.userId });
    sendSuccess(res, null, 'User unblocked.');
  } catch (error: unknown) {
    sendError(res, (error as Error).message, 500);
  }
};
