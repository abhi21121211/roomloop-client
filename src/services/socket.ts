import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

let socket: Socket | null = null;
// Track joined rooms to prevent duplicate joins
const joinedRooms = new Set<string>();

// Initialize socket connection
export const initSocket = (): Socket => {
  if (socket && socket.connected) return socket;

  // Close any existing socket before creating a new one
  if (socket) {
    socket.disconnect();
  }

  console.log(`Attempting to connect to socket server at: ${SOCKET_URL}`);

  socket = io(SOCKET_URL, {
    auth: {
      token: localStorage.getItem("token"),
    },
    transports: ["websocket", "polling"], // Try both websocket and polling
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    timeout: 20000, // Increase timeout
  });

  // Log connection status
  socket.on("connect", () => {
    console.log("Socket connected successfully");

    // Rejoin any rooms that were previously joined
    joinedRooms.forEach((roomId) => {
      console.log(`Rejoining room after reconnect: ${roomId}`);
      socket?.emit("join_room", roomId);
    });
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected. Reason:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log(`Socket reconnected after ${attemptNumber} attempts`);
  });

  socket.on("reconnect_attempt", (attemptNumber) => {
    console.log(`Socket reconnection attempt #${attemptNumber}`);
  });

  socket.on("reconnect_error", (error) => {
    console.error("Socket reconnection error:", error.message);
  });

  socket.on("reconnect_failed", () => {
    console.error("Socket reconnection failed after all attempts");
  });

  // Listen for room confirmation
  socket.on("room_joined", (data) => {
    console.log("Room joined confirmation:", data);
  });

  socket.on("room_left", (data) => {
    console.log("Room left confirmation:", data);
  });

  return socket;
};

// Join a room
export const joinRoom = (roomId: string): void => {
  if (!socket || !socket.connected) {
    socket = initSocket();
  }

  // Only join if not already joined
  if (!joinedRooms.has(roomId)) {
    console.log(`Joining room: ${roomId}`);
    socket.emit("join_room", roomId);
    joinedRooms.add(roomId);
  } else {
    console.log(`Already joined room: ${roomId}`);
  }
};

// Leave a room
export const leaveRoom = (roomId: string): void => {
  if (joinedRooms.has(roomId) && socket && socket.connected) {
    console.log(`Leaving room: ${roomId}`);
    socket.emit("leave_room", roomId);
    joinedRooms.delete(roomId);
  } else {
    console.log(`Not in room: ${roomId}`);
  }
};

// Send a message to a room
export const sendMessage = (data: { roomId: string; message: any }): void => {
  if (!socket || !socket.connected) {
    console.log("Socket not connected. Reconnecting...");
    socket = initSocket();
  }

  console.log(`Sending message to room: ${data.roomId}`, data.message);

  // Make sure we're in the room before sending
  if (!joinedRooms.has(data.roomId)) {
    console.log(`Not in room. Joining room: ${data.roomId}`);
    joinRoom(data.roomId);
  }

  socket.emit("send_message", data);
};

// Send a reaction to a room
export const sendReaction = (data: {
  roomId: string;
  emoji: string;
  userId: string;
}): void => {
  if (!socket || !socket.connected) {
    console.log("Socket not connected. Reconnecting...");
    socket = initSocket();
  }

  console.log(`Sending reaction to room: ${data.roomId}`, data);

  // Make sure we're in the room before sending
  if (!joinedRooms.has(data.roomId)) {
    console.log(`Not in room. Joining room: ${data.roomId}`);
    joinRoom(data.roomId);
  }

  socket.emit("send_reaction", data);
};

// Check connection status
export const isConnected = (): boolean => {
  return socket !== null && socket.connected;
};

// Disconnect socket
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    joinedRooms.clear();
    console.log("Socket disconnected manually");
  }
};

// Create a named export
const socketService = {
  initSocket,
  joinRoom,
  leaveRoom,
  sendMessage,
  sendReaction,
  disconnectSocket,
  isConnected,
  socket: () => socket,
};

export default socketService;
