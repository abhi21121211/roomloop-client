import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Collapse,
  Chip,
  Avatar,
  alpha,
  useTheme,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  SmartToy as AIIcon,
  Send as SendIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useAI } from "../../contexts/AIContext";

interface AIChatAssistantProps {
  roomId: string;
  roomTitle: string;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const AIChatAssistant: React.FC<AIChatAssistantProps> = ({
  roomId,
  roomTitle,
  isOpen = false,
  onToggle,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, isAvailable, isLoading } = useAI();
  const theme = useTheme();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Add welcome message when AI assistant is first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        role: "assistant",
        content: `Hello! I'm your AI assistant for "${roomTitle}". I can help you with questions about the room, provide information, or assist with discussions. How can I help you today? 🤖`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, roomTitle]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !isAvailable) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Prepare conversation history for AI
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await sendMessage(
        inputMessage,
        roomId,
        conversationHistory
      );

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleClose = () => {
    onToggle?.(false);
  };

  if (!isAvailable) {
    return null;
  }

  return (
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        bottom: 20,
        right: 20,
        width: isExpanded ? 400 : 60,
        height: isExpanded ? 500 : 60,
        borderRadius: 3,
        overflow: "hidden",
        background: `linear-gradient(145deg, ${
          theme.palette.background.paper
        } 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.15)}`,
        backdropFilter: "blur(10px)",
        transition: "all 0.3s ease",
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: "white",
          cursor: "pointer",
        }}
        onClick={toggleExpanded}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AIIcon />
          <Typography variant="subtitle2" fontWeight={600}>
            AI Assistant
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isExpanded && (
            <Tooltip title="Close">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                sx={{ color: "white" }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
        </Box>
      </Box>

      {/* Chat Content */}
      <Collapse in={isExpanded}>
        <Box sx={{ height: 350, display: "flex", flexDirection: "column" }}>
          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: "flex",
                  justifyContent:
                    message.role === "user" ? "flex-end" : "flex-start",
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    maxWidth: "80%",
                    display: "flex",
                    flexDirection:
                      message.role === "user" ? "row-reverse" : "row",
                    alignItems: "flex-start",
                    gap: 1,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      bgcolor:
                        message.role === "user"
                          ? theme.palette.primary.main
                          : theme.palette.secondary.main,
                      fontSize: "0.75rem",
                    }}
                  >
                    {message.role === "user" ? "U" : "🤖"}
                  </Avatar>
                  <Paper
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      background:
                        message.role === "user"
                          ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                          : alpha(theme.palette.grey[100], 0.8),
                      color: message.role === "user" ? "white" : "inherit",
                      maxWidth: "100%",
                      wordBreak: "break-word",
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {message.content}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 0.5,
                        opacity: 0.7,
                        fontSize: "0.65rem",
                      }}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            ))}

            {isTyping && (
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, ml: 1 }}
              >
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    bgcolor: theme.palette.secondary.main,
                    fontSize: "0.75rem",
                  }}
                >
                  🤖
                </Avatar>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <CircularProgress size={12} />
                  <Typography variant="caption" color="text.secondary">
                    AI is typing...
                  </Typography>
                </Box>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box
            sx={{
              p: 2,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Ask me anything..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading || isTyping}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "& fieldset": {
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                    },
                    "&:hover fieldset": {
                      borderColor: alpha(theme.palette.primary.main, 0.4),
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
              <IconButton
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading || isTyping}
                sx={{
                  bgcolor: theme.palette.primary.main,
                  color: "white",
                  "&:hover": {
                    bgcolor: theme.palette.primary.dark,
                  },
                  "&:disabled": {
                    bgcolor: alpha(theme.palette.grey[500], 0.3),
                    color: alpha(theme.palette.grey[500], 0.5),
                  },
                }}
              >
                <SendIcon fontSize="small" />
              </IconButton>
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              Press Enter to send, Shift+Enter for new line
            </Typography>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default AIChatAssistant;
