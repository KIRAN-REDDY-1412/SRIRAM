import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export const useSocket = (
  onEvent?: (event: string, data: any) => void
) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('⚡ Connected to ResQAI Socket server:', socket.id);
    });

    const events = [
      'emergency:created',
      'emergency:updated',
      'volunteer:available',
      'volunteer:assigned',
      'volunteer:location',
      'emergency:resolved',
      'notification:new'
    ];

    events.forEach((eventName) => {
      socket.on(eventName, (data) => {
        if (onEvent) {
          onEvent(eventName, data);
        }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return socketRef.current;
};
