import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Message, MessageState, Reaction, ReactionState } from "../types";
import { roomsAPI } from "../services/api";
import socketService from "../services/socket";
import { useAuth } from "./AuthContext";
import { useRoom } from "./RoomContext";

interface ChatContextType {
  messages: Message[];
  reactions: Reaction[];
  messageLoading: boolean;
  reactionLoading: boolean;
  error: string | null;
  fetchMessages: (roomId: string) => Promise<void>;
  fetchReactions: (roomId: string) => Promise<void>;
  sendMessage: (roomId: string, content: string) => Promise<void>;
  sendReaction: (roomId: string, emoji: string) => Promise<void>;
  clearError: () => void;
}

const initialMessageState: MessageState = {
  messages: [],
  loading: false,
  error: null,
};

const initialReactionState: ReactionState = {
  reactions: [],
  loading: false,
  error: null,
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [messageState, setMessageState] =
    useState<MessageState>(initialMessageState);
  const [reactionState, setReactionState] =
    useState<ReactionState>(initialReactionState);
  const { user } = useAuth();
  const { currentRoom } = useRoom();

  // Keep track of the active room ID
  const activeRoomRef = useRef<string | null>(null);

  // Create a ref to hold message state to avoid stale closures in event handlers
  const messagesRef = useRef<Message[]>([]);

  // Update the ref whenever messageState changes
  useEffect(() => {
    messagesRef.current = messageState.messages;
  }, [messageState.messages]);

  // Fetch messages for a room - declare this before any effect that uses it
  const fetchMessages = useCallback(async (roomId: string): Promise<void> => {
    if (!roomId) return;

    try {
      setMessageState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await roomsAPI.getRoomMessages(roomId);

      setMessageState((prev) => ({
        messages: response.data.messages || [],
        loading: false,
        error: null,
      }));
    } catch (error: any) {
      setMessageState((prev) => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || "Failed to fetch messages",
      }));
    }
  }, []);

  // Fetch reactions for a room
  const fetchReactions = useCallback(async (roomId: string): Promise<void> => {
    if (!roomId) return;

    try {
      setReactionState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await roomsAPI.getRoomReactions(roomId);

      setReactionState((prev) => ({
        reactions: response.data.reactions || [],
        loading: false,
        error: null,
      }));
    } catch (error: any) {
      setReactionState((prev) => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || "Failed to fetch reactions",
      }));
    }
  }, []);

  // Initialize socket connection once on component mount
  useEffect(() => {
    // Initialize the socket
    const socket = socketService.initSocket();

    // We'll remove the global receive_message handler since it causes duplicates
    // Only handle global socket cleanup

    return () => {
      // Clean up all listeners on unmount
      console.log("Cleaning up global socket listeners");
      if (socket) {
        socket.off("receive_reaction");
      }
    };
  }, []);

  // Set up socket listeners for new room selection
  useEffect(() => {
    if (!currentRoom) {
      // Clear messages when no room is selected
      setMessageState(initialMessageState);
      setReactionState(initialReactionState);
      activeRoomRef.current = null;
      return;
    }

    // Update the active room reference
    activeRoomRef.current = currentRoom._id;
    console.log("Active room updated to:", currentRoom._id);

    // Get the socket instance
    const socket = socketService.initSocket();

    // Room-specific socket event handlers for reactions
    const handleReceiveReaction = (data: Reaction) => {
      console.log("Received reaction:", data);
      // Only update if the reaction is for the current room
      if (data.room === activeRoomRef.current) {
        setReactionState((prevState) => ({
          ...prevState,
          reactions: [...prevState.reactions, data],
        }));
      }
    };

    // Room-specific socket event handlers for messages
    const handleReceiveRoomMessage = (data: any) => {
      console.log("Socket: received message in room:", data);

      const incomingMessage = data.message || data;
      const roomId =
        data.roomId ||
        (incomingMessage.room &&
          (typeof incomingMessage.room === "string"
            ? incomingMessage.room
            : incomingMessage.room._id));

      // Explicitly check if the message belongs to the current active room
      if (roomId === currentRoom._id) {
        console.log("Adding message to current room:", incomingMessage);

        // Check if this message already exists in our state to avoid duplicates
        const messageExists = messagesRef.current.some(
          (msg) => msg._id === incomingMessage._id
        );

        if (!messageExists) {
          setMessageState((prevState) => ({
            ...prevState,
            messages: [...prevState.messages, incomingMessage],
          }));
        }
      }
    };

    // Set up room-specific event handlers
    socket.on("receive_reaction", handleReceiveReaction);
    socket.on("receive_message", handleReceiveRoomMessage);

    console.log(
      `Joined room ${currentRoom._id} and set up room-specific handlers`
    );

    // Make sure we've joined the room
    socketService.joinRoom(currentRoom._id);

    // Fetch messages for this room
    fetchMessages(currentRoom._id);

    // Clean up function
    return () => {
      console.log(`Cleaning up listeners for room ${currentRoom._id}`);
      socket.off("receive_reaction", handleReceiveReaction);
      socket.off("receive_message", handleReceiveRoomMessage);
      // We don't leave the room here anymore - that's handled by RoomContext
    };
  }, [currentRoom, fetchMessages]);

  // Send a message
  const sendMessage = async (
    roomId: string,
    content: string
  ): Promise<void> => {
    if (!roomId || !content.trim()) return;

    try {
      setMessageState((prev) => ({ ...prev, loading: true, error: null }));

      // Ensure we're connected to the room via socket
      socketService.joinRoom(roomId);

      // Send through API
      const response = await roomsAPI.sendMessage(roomId, content);
      const newMessage = response.data.message;

      // Also emit via socket for real-time updates
      socketService.sendMessage({
        roomId,
        message: newMessage,
      });

      // Add to local state
      setMessageState((prevState) => ({
        ...prevState,
        messages: [...prevState.messages, newMessage],
        loading: false,
        error: null,
      }));
    } catch (error: any) {
      console.error("Send message error:", error);
      setMessageState((prev) => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || "Failed to send message",
      }));
    }
  };

  // Send a reaction
  const sendReaction = async (roomId: string, emoji: string): Promise<void> => {
    if (!roomId || !emoji) return;

    try {
      setReactionState((prev) => ({ ...prev, loading: true, error: null }));

      // Ensure we're connected to the room via socket
      socketService.joinRoom(roomId);

      // Send through API
      const response = await roomsAPI.sendReaction(roomId, emoji);
      const newReaction = response.data.reaction;

      // Also emit via socket for real-time updates
      socketService.sendReaction({
        roomId,
        emoji,
        userId: user?.id || "",
      });

      // Add to local state
      setReactionState((prevState) => ({
        ...prevState,
        reactions: [...prevState.reactions, newReaction],
        loading: false,
        error: null,
      }));
    } catch (error: any) {
      console.error("Send reaction error:", error);
      setReactionState((prev) => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || "Failed to send reaction",
      }));
    }
  };

  // Clear error
  const clearError = () => {
    setMessageState((prev) => ({ ...prev, error: null }));
    setReactionState((prev) => ({ ...prev, error: null }));
  };

  return (
    <ChatContext.Provider
      value={{
        messages: messageState.messages,
        reactions: reactionState.reactions,
        messageLoading: messageState.loading,
        reactionLoading: reactionState.loading,
        error: messageState.error || reactionState.error,
        fetchMessages,
        fetchReactions,
        sendMessage,
        sendReaction,
        clearError,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use chat context
export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
