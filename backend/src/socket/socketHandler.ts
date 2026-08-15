import { Server as SocketIOServer, Socket } from 'socket.io';

let ioInstance: SocketIOServer | null = null;

export const initSocket = (io: SocketIOServer) => {
  ioInstance = io;

  io.on('connection', (socket: Socket) => {
    console.log(`⚡ Socket client connected: ${socket.id}`);

    // Join room based on user role or custom user ID
    socket.on('join', (data: { userId?: string; role?: string }) => {
      if (data.role) {
        socket.join(`role:${data.role}`);
      }
      if (data.userId) {
        socket.join(`user:${data.userId}`);
      }
    });

    // Volunteer location update event
    socket.on('volunteer:location_update', (data: { volunteerId: string; lat: number; lng: number }) => {
      io.emit('volunteer:location', data);
    });

    socket.on('disconnect', () => {
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });
};

export const getIO = (): SocketIOServer => {
  if (!ioInstance) {
    throw new Error('Socket.io instance has not been initialized');
  }
  return ioInstance;
};

export const broadcastEvent = (event: string, payload: any) => {
  if (ioInstance) {
    ioInstance.emit(event, payload);
  }
};
