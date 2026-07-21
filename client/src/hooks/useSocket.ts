import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

let socketInstance: Socket | null = null;

export const useSocket = () => {
  const { accessToken, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
      }
      socketRef.current = null;
      return;
    }

    if (!socketInstance) {
      // In production: connect to Render backend directly via VITE_API_URL
      // In development: connect to window.location.origin (Vite proxies /socket.io to port 5000)
      const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;
      socketInstance = io(socketUrl, {
        auth: {
          token: accessToken,
        },
        autoConnect: true,
      });

      socketInstance.on('connect', () => {
        // connected
      });

      socketInstance.on('disconnect', () => {
        // disconnected
      });

      socketInstance.on('error', (err: any) => {
        console.error('Socket error:', err);
      });
    } else {
      // If token changed, update it and reconnect
      socketInstance.auth = { token: accessToken };
      if (socketInstance.disconnected) {
        socketInstance.connect();
      }
    }

    socketRef.current = socketInstance;

    return () => {
      // Don't disconnect globally on simple hook unmount,
      // but clean up any local page listeners.
    };
  }, [accessToken, isAuthenticated]);

  return socketRef.current;
};

export default useSocket;
