import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Badge,
  Tooltip,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  VolumeUp as VolumeIcon,
  VolumeOff as MuteIcon,
  Accessibility as AccessibilityIcon,
} from "@mui/icons-material";
import { useTheme } from "../../contexts/ThemeContext";
import AccessibleButton from "./AccessibleButton";
import AccessibleTextField from "./AccessibleTextField";

// Message interface
interface ChatMessage {
  id: string;
  content: string;
  sender: {
    id: string;
    username: string;
    avatar?: string;
  };
  timestamp: Date;
  type: "text" | "system" | "reaction";
  reactions?: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
}

// Chat props interface
interface AccessibleChatProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  currentUser: {
    id: string;
    username: string;
    avatar?: string;
  };
  roomName: string;
  participants: Array<{
    id: string;
    username: string;
    avatar?: string;
    online: boolean;
  }>;
  loading?: boolean;
  error?: string;
  readAloud?: boolean;
  onToggleReadAloud?: () => void;
}

const AccessibleChat: React.FC<AccessibleChatProps> = ({
  messages,
  onSendMessage,
  onReaction,
  currentUser,
  roomName,
  participants,
  loading = false,
  error,
  readAloud = false,
  onToggleReadAloud,
}) => {
  const { actualTheme } = useTheme();
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Announce new messages to screen readers
  useEffect(() => {
    if (messages.length > 0 && liveRegionRef.current) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender.id !== currentUser.id) {
        const announcement = `${lastMessage.sender.username} says: ${lastMessage.content}`;
        liveRegionRef.current.textContent = announcement;

        // Clear announcement after a delay
        setTimeout(() => {
          if (liveRegionRef.current) {
            liveRegionRef.current.textContent = "";
          }
        }, 3000);
      }
    }
  }, [messages, currentUser.id]);

  // Handle message submission
  const handleSendMessage = () => {
    if (newMessage.trim() && !loading) {
      onSendMessage(newMessage.trim());
      setNewMessage("");
      setIsTyping(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle typing indicator
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Check if message is from current user
  const isOwnMessage = (message: ChatMessage) => {
    return message.sender.id === currentUser.id;
  };

  // Render message
  const renderMessage = (message: ChatMessage) => {
    const isOwn = isOwnMessage(message);

    return (
      <ListItem
        key={message.id}
        sx={{
          flexDirection: "column",
          alignItems: isOwn ? "flex-end" : "flex-start",
          px: 2,
          py: 1,
        }}
        aria-label={`Message from ${message.sender.username} at ${formatTime(
          message.timestamp
        )}`}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1,
            maxWidth: "70%",
            flexDirection: isOwn ? "row-reverse" : "row",
          }}
        >
          {/* Avatar */}
          <Avatar
            src={message.sender.avatar}
            alt={`${message.sender.username}'s avatar`}
            sx={{ width: 32, height: 32, flexShrink: 0 }}
          >
            {message.sender.username.charAt(0).toUpperCase()}
          </Avatar>

          {/* Message content */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: isOwn ? "flex-end" : "flex-start",
              gap: 0.5,
            }}
          >
            {/* Sender name and time */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexDirection: isOwn ? "row-reverse" : "row",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                {message.sender.username}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                aria-label={`Sent at ${formatTime(message.timestamp)}`}
              >
                {formatTime(message.timestamp)}
              </Typography>
            </Box>

            {/* Message bubble */}
            <Paper
              elevation={1}
              sx={{
                p: 1.5,
                backgroundColor: isOwn
                  ? "primary.main"
                  : actualTheme === "dark"
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.04)",
                color: isOwn ? "primary.contrastText" : "text.primary",
                borderRadius: 2,
                maxWidth: "100%",
                wordBreak: "break-word",
                position: "relative",
              }}
              role="article"
              aria-label={`Message content: ${message.content}`}
            >
              <Typography variant="body2" component="div">
                {message.content}
              </Typography>

              {/* Reactions */}
              {message.reactions && message.reactions.length > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    gap: 0.5,
                    mt: 1,
                    flexWrap: "wrap",
                  }}
                >
                  {message.reactions.map((reaction, index) => (
                    <Chip
                      key={index}
                      label={`${reaction.emoji} ${reaction.count}`}
                      size="small"
                      variant="outlined"
                      onClick={() => onReaction?.(message.id, reaction.emoji)}
                      sx={{
                        fontSize: "0.75rem",
                        height: 24,
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "rgba(0,0,0,0.04)",
                        },
                      }}
                      aria-label={`${reaction.count} people reacted with ${reaction.emoji}`}
                    />
                  ))}
                </Box>
              )}
            </Paper>
          </Box>
        </Box>
      </ListItem>
    );
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.default",
      }}
    >
      {/* Chat header */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          borderRadius: 0,
          borderBottom: `1px solid ${
            actualTheme === "dark"
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.08)"
          }`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
              {roomName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {participants.length} participant
              {participants.length !== 1 ? "s" : ""}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Accessibility toggle */}
            {onToggleReadAloud && (
              <Tooltip
                title={readAloud ? "Disable read aloud" : "Enable read aloud"}
              >
                <IconButton
                  onClick={onToggleReadAloud}
                  color={readAloud ? "primary" : "default"}
                  aria-label={
                    readAloud ? "Disable read aloud" : "Enable read aloud"
                  }
                >
                  {readAloud ? <VolumeIcon /> : <MuteIcon />}
                </IconButton>
              </Tooltip>
            )}

            {/* Accessibility info */}
            <Tooltip title="Accessibility features enabled">
              <IconButton
                color="primary"
                aria-label="Accessibility features enabled"
              >
                <AccessibilityIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Messages container */}
      <Box
        ref={chatContainerRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 1,
          scrollBehavior: "smooth",
        }}
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        aria-atomic="false"
      >
        {loading && messages.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Loading messages...
            </Typography>
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No messages yet. Start the conversation!
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>{messages.map(renderMessage)}</List>
        )}

        {/* Auto-scroll target */}
        <div ref={messagesEndRef} />
      </Box>

      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ m: 1 }}>
          {error}
        </Alert>
      )}

      {/* Message input */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          borderRadius: 0,
          borderTop: `1px solid ${
            actualTheme === "dark"
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.08)"
          }`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
          <AccessibleTextField
            fullWidth
            multiline
            maxRows={4}
            value={newMessage}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            ariaLabel="Message input"
            disabled={loading}
            startIcon={<EmojiIcon />}
            endIcon={<AttachFileIcon />}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />

          <AccessibleButton
            variant="contained"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || loading}
            ariaLabel="Send message"
            loading={loading}
            sx={{
              minWidth: "auto",
              px: 2,
              py: 1.5,
              borderRadius: 2,
            }}
          >
            <SendIcon />
          </AccessibleButton>
        </Box>

        {/* Typing indicator */}
        {isTyping && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
            aria-live="polite"
          >
            You are typing...
          </Typography>
        )}
      </Paper>

      {/* Screen reader live region */}
      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "absolute",
          left: "-10000px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
      />
    </Box>
  );
};

export default AccessibleChat;
