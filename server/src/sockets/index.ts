import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import Activity from '../models/Activity';
import ActivityMessage from '../models/ActivityMessage';
import LostFoundChat from '../models/LostFoundChat';

interface AuthSocket {
  userId: string;
  email: string;
}

// Extend socket data type
declare module 'socket.io' {
  interface Socket {
    user?: AuthSocket;
  }
}

export const registerSocketHandlers = (io: Server) => {
  // ── Authentication Middleware ─────────────────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication error: No token'));
    }
    try {
      // Verify the ACCESS token (short-lived JWT, 15 min)
      const decoded = jwt.verify(token as string, env.JWT_SECRET) as { id: string; email: string };
      socket.user = { userId: decoded.id, email: decoded.email };
      next();
    } catch {
      next(new Error('Authentication error: Invalid or expired access token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user!.userId;
    console.log(`🔌 Socket connected: ${userId}`);

    // ── Activity Room Management ──────────────────────────────────────────────

    // Join activity socket room (for real-time counter & chat events)
    socket.on('joinActivityRoom', async ({ activityId }: { activityId: string }) => {
      try {
        const activity = await Activity.findById(activityId);
        if (!activity) return socket.emit('error', { message: 'Activity not found.' });

        socket.join(`activity:${activityId}`);
        socket.emit('joinedActivityRoom', { activityId });
      } catch (err) {
        socket.emit('error', { message: 'Failed to join activity room.' });
      }
    });

    socket.on('leaveActivityRoom', ({ activityId }: { activityId: string }) => {
      socket.leave(`activity:${activityId}`);
    });

    // ── Activity Chat Messages ────────────────────────────────────────────────

    socket.on('sendActivityMessage', async ({ activityId, message }: { activityId: string; message: string }) => {
      try {
        if (!message || !message.trim()) return;

        const activity = await Activity.findById(activityId);
        if (!activity) return socket.emit('error', { message: 'Activity not found.' });

        const isHost = activity.createdBy.toString() === userId;
        const isParticipant = activity.participants.some(p => p.toString() === userId);

        if (!isHost && !isParticipant) {
          return socket.emit('error', { message: 'You are not a participant of this activity.' });
        }

        const saved = await ActivityMessage.create({
          activityId,
          senderId: userId,
          message: message.trim(),
        });

        // Populate sender info for broadcast
        const populated = await ActivityMessage.findById(saved._id).populate('senderId', 'name avatarUrl');

        // Broadcast to all in the room
        io.to(`activity:${activityId}`).emit('activityMessage', populated);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message.' });
      }
    });

    // ── Lost & Found Chat ─────────────────────────────────────────────────────

    socket.on('joinLostFoundChat', async ({ chatId }: { chatId: string }) => {
      try {
        const chat = await LostFoundChat.findById(chatId);
        if (!chat) return socket.emit('error', { message: 'Chat not found.' });

        const isAllowed =
          chat.ownerId.toString() === userId ||
          chat.claimantId.toString() === userId;

        if (!isAllowed) {
          return socket.emit('error', { message: 'Access denied to this chat.' });
        }

        socket.join(`lostfound:${chatId}`);
        socket.emit('joinedLostFoundChat', { chatId });
      } catch (err) {
        socket.emit('error', { message: 'Failed to join chat.' });
      }
    });

    socket.on('sendLostFoundMessage', async ({ chatId, text }: { chatId: string; text: string }) => {
      try {
        if (!text || !text.trim()) return;

        const chat = await LostFoundChat.findById(chatId);
        if (!chat) return socket.emit('error', { message: 'Chat not found.' });

        const isAllowed =
          chat.ownerId.toString() === userId ||
          chat.claimantId.toString() === userId;

        if (!isAllowed) {
          return socket.emit('error', { message: 'Access denied.' });
        }

        const newMsg = {
          senderId: new (require('mongoose').Types.ObjectId)(userId),
          text: text.trim(),
          createdAt: new Date(),
        };

        chat.messages.push(newMsg as any);
        await chat.save();

        const lastMsg = chat.messages[chat.messages.length - 1];

        io.to(`lostfound:${chatId}`).emit('lostFoundMessage', {
          _id: (lastMsg as any)._id,
          senderId: userId,
          text: lastMsg.text,
          createdAt: lastMsg.createdAt,
        });
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message.' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${userId}`);
    });
  });
};
