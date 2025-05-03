import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { roomsAPI } from "../services/api";
import { Room, RoomState, CreateRoomFormData, RoomType } from "../types";
import { useAuth } from "./AuthContext";
import socketService from "../services/socket";

interface RoomContextType extends RoomState {
  createRoom: (formData: CreateRoomFormData) => Promise<Room>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: (roomId: string) => Promise<void>;
  fetchPublicRooms: () => Promise<void>;
  fetchUserRooms: () => Promise<void>;
  fetchRoomById: (roomId: string) => Promise<Room>;
  inviteUsers: (roomId: string, usernames: string[]) => Promise<void>;
  clearError: () => void;
  setCurrentRoom: (room: Room | null) => void;
}

const initialState: RoomState = {
  rooms: {
    upcoming: [],
    live: [],
    past: [],
    invites: [],
  },
  publicRooms: [],
  currentRoom: null,
  loading: false,
  error: null,
};

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<RoomState>(initialState);
  const { isAuthenticated } = useAuth();

  // Fetch user rooms - defined with useCallback to avoid recreating on each render
  const fetchUserRooms = useCallback(async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await roomsAPI.getUserRooms();

      setState((prev) => ({
        ...prev,
        rooms: response.data.rooms,
        loading: false,
        error: null,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || "Failed to fetch user rooms",
      }));
    }
  }, []);

  // Fetch user rooms when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserRooms();
    } else {
      setState(initialState);
    }
  }, [isAuthenticated, fetchUserRooms]);

  // Create a new room
  const createRoom = async (formData: CreateRoomFormData): Promise<Room> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await roomsAPI.createRoom(formData);

      // Update state with new room
      await fetchUserRooms();

      setState((prevState) => ({
        ...prevState,
        loading: false,
        error: null,
      }));

      return response.data.room;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || "Failed to create room",
      }));
      throw error;
    }
  };

  // Join a room
  const joinRoom = useCallback(
    async (roomId: string): Promise<void> => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        await roomsAPI.joinRoom(roomId);

        // Connect to room via socket
        socketService.joinRoom(roomId);

        // Update room lists
        await fetchUserRooms();

        setState((prevState) => ({
          ...prevState,
          loading: false,
          error: null,
        }));
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.response?.data?.message || "Failed to join room",
        }));
        throw error;
      }
    },
    [fetchUserRooms]
  );

  // Leave a room (for the socket connection)
  const leaveRoom = useCallback(async (roomId: string): Promise<void> => {
    if (!roomId) return;

    // Only emit socket event without setting state if this is called from component cleanup
    socketService.leaveRoom(roomId);

    // Only update currentRoom if it matches the roomId being left
    setState((prev) => {
      if (prev.currentRoom && prev.currentRoom._id === roomId) {
        return { ...prev, currentRoom: null };
      }
      return prev;
    });
  }, []);

  // Fetch public rooms
  const fetchPublicRooms = useCallback(async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await roomsAPI.getPublicRooms();

      setState((prev) => ({
        ...prev,
        publicRooms: response.data.rooms,
        loading: false,
        error: null,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || "Failed to fetch public rooms",
      }));
    }
  }, []);

  // Fetch a single room by ID
  const fetchRoomById = async (roomId: string): Promise<Room> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await roomsAPI.getRoomById(roomId);
      const room = response.data.room;

      setState((prev) => ({
        ...prev,
        currentRoom: room,
        loading: false,
        error: null,
      }));

      return room;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || "Failed to fetch room",
      }));
      throw error;
    }
  };

  // Invite users to a room
  const inviteUsers = async (
    roomId: string,
    usernames: string[]
  ): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      await roomsAPI.inviteUsers(roomId, usernames);

      setState((prev) => ({
        ...prev,
        loading: false,
        error: null,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || "Failed to invite users",
      }));
      throw error;
    }
  };

  // Set current room
  const setCurrentRoom = (room: Room | null) => {
    setState((prev) => ({ ...prev, currentRoom: room }));
  };

  // Clear error
  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  return (
    <RoomContext.Provider
      value={{
        ...state,
        createRoom,
        joinRoom,
        leaveRoom,
        fetchPublicRooms,
        fetchUserRooms,
        fetchRoomById,
        inviteUsers,
        clearError,
        setCurrentRoom,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

// Custom hook to use room context
export const useRoom = (): RoomContextType => {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error("useRoom must be used within a RoomProvider");
  }
  return context;
};
