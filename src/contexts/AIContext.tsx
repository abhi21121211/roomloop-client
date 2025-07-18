import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api, aiAPI } from "../services/api";

interface AIState {
  isAvailable: boolean;
  features: string[];
  isLoading: boolean;
  error: string | null;
}

interface AIContextType extends AIState {
  // Chat Assistant
  sendMessage: (
    message: string,
    roomId: string,
    conversationHistory?: any[]
  ) => Promise<any>;

  // Content Moderation
  moderateContent: (content: string) => Promise<any>;

  // Room Suggestions
  getRoomSuggestions: () => Promise<any>;

  // Room Summary
  generateRoomSummary: (roomId: string) => Promise<any>;

  // Smart Notifications
  generateSmartNotification: (event: string, context: any) => Promise<any>;

  // Utility
  checkStatus: () => Promise<void>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error("useAI must be used within an AIProvider");
  }
  return context;
};

interface AIProviderProps {
  children: ReactNode;
}

export const AIProvider: React.FC<AIProviderProps> = ({ children }) => {
  const [state, setState] = useState<AIState>({
    isAvailable: false,
    features: [],
    isLoading: true,
    error: null,
  });

  const checkStatus = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const response = await aiAPI.getStatus();

      if (response.data.success) {
        setState({
          isAvailable: response.data.data.available,
          features: response.data.data.features || [],
          isLoading: false,
          error: null,
        });
      } else {
        setState((prev) => ({
          ...prev,
          isAvailable: false,
          isLoading: false,
          error: response.data.error || "Failed to check AI status",
        }));
      }
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isAvailable: false,
        isLoading: false,
        error: error.message || "Failed to connect to AI service",
      }));
    }
  };

  const sendMessage = async (
    message: string,
    roomId: string,
    conversationHistory: any[] = []
  ) => {
    try {
      const response = await aiAPI.chatAssistant({
        message,
        roomId,
        conversationHistory,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message);
    }
  };

  const moderateContent = async (content: string) => {
    try {
      const response = await aiAPI.moderateContent(content);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message);
    }
  };

  const getRoomSuggestions = async () => {
    try {
      const response = await aiAPI.getRoomSuggestions();
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message);
    }
  };

  const generateRoomSummary = async (roomId: string) => {
    try {
      const response = await aiAPI.generateRoomSummary(roomId);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message);
    }
  };

  const generateSmartNotification = async (event: string, context: any) => {
    try {
      const response = await aiAPI.generateSmartNotification({
        event,
        context,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const value: AIContextType = {
    ...state,
    sendMessage,
    moderateContent,
    getRoomSuggestions,
    generateRoomSummary,
    generateSmartNotification,
    checkStatus,
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};
