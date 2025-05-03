import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  IconButton,
} from "@mui/material";
import {
  Send as SendIcon,
  ThumbUp as ThumbUpIcon,
  Share as ShareIcon,
} from "@mui/icons-material";
import { useRoom } from "../contexts/RoomContext";
import { useChat } from "../contexts/ChatContext";
import { Message, Room, RoomStatus } from "../types";
import Loading from "../components/common/Loading";
import ErrorMessage from "../components/common/ErrorMessage";
import GridItem from "../components/common/GridItem";
import { useAuth } from "../contexts/AuthContext";

const RoomView: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const {
    currentRoom,
    loading: roomLoading,
    error: roomError,
    fetchRoomById,
    leaveRoom,
  } = useRoom();
  const {
    messages,
    messageLoading,
    error: chatError,
    sendMessage,
    fetchMessages,
    sendReaction,
  } = useChat();
  const { user } = useAuth();
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    // Store roomId in a local variable to avoid stale closure issues
    const currentRoomId = roomId;

    if (currentRoomId) {
      let isMounted = true;

      const loadRoomData = async () => {
        try {
          if (isMounted) {
            // First fetch the room details
            await fetchRoomById(currentRoomId);

            // Then fetch messages if we're still mounted
            if (isMounted) {
              await fetchMessages(currentRoomId);
            }
          }
        } catch (error) {
          if (isMounted) {
            navigate("/dashboard");
          }
        }
      };

      loadRoomData();

      // Clean up function to leave the room and handle unmounting
      return () => {
        isMounted = false;
        if (currentRoomId) {
          leaveRoom(currentRoomId);
        }
      };
    }
  }, [roomId]); // Only re-run when roomId changes

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim() && roomId) {
      sendMessage(roomId, messageText);
      setMessageText("");
    }
  };

  const handleSendReaction = () => {
    if (roomId) {
      sendReaction(roomId, "👍");
    }
  };

  const formatDateTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatChatTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (roomLoading) return <Loading message="Loading room details..." />;
  if (!currentRoom) return <ErrorMessage message="Room not found" />;

  const isLive = currentRoom.status === RoomStatus.LIVE;
  const isPast = currentRoom.status === RoomStatus.CLOSED;
  const creatorName =
    typeof currentRoom.creator === "object"
      ? currentRoom.creator.username
      : "Unknown Host";

  return (
    <Box sx={{ mb: 4 }}>
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {currentRoom.title}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                Hosted by {creatorName}
              </Typography>
              <Chip
                label={currentRoom.status.toUpperCase()}
                color={isLive ? "success" : isPast ? "default" : "primary"}
                size="small"
              />
            </Box>
          </Box>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={3}>
          <GridItem xs={12} md={7}>
            <Typography variant="body1" paragraph>
              {currentRoom.description}
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Details
              </Typography>
              <Grid container spacing={2}>
                <GridItem xs={6}>
                  <Typography variant="body2">
                    <strong>Start Time:</strong>{" "}
                    {formatDateTime(currentRoom.startTime)}
                  </Typography>
                </GridItem>
                <GridItem xs={6}>
                  <Typography variant="body2">
                    <strong>End Time:</strong>{" "}
                    {formatDateTime(currentRoom.endTime)}
                  </Typography>
                </GridItem>
                <GridItem xs={6}>
                  <Typography variant="body2">
                    <strong>Room Type:</strong> {currentRoom.roomType}
                  </Typography>
                </GridItem>
                <GridItem xs={6}>
                  <Typography variant="body2">
                    <strong>Room Code:</strong> {currentRoom.code}
                  </Typography>
                </GridItem>
              </Grid>
            </Box>

            {currentRoom.tags.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {currentRoom.tags.map((tag, index) => (
                    <Chip key={index} label={tag} size="small" />
                  ))}
                </Box>
              </Box>
            )}

            <Box sx={{ mt: 3, display: "flex", gap: 1 }}>
              {isLive && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<ThumbUpIcon />}
                  onClick={handleSendReaction}
                >
                  React
                </Button>
              )}
              <Button variant="outlined" startIcon={<ShareIcon />}>
                Share
              </Button>
            </Box>
          </GridItem>

          <GridItem xs={12} md={5}>
            <Paper
              elevation={2}
              sx={{
                p: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Participants ({currentRoom.participants.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <List sx={{ overflow: "auto", flex: 1, maxHeight: 200 }}>
                {currentRoom.participants.map((participant, index) => {
                  const username =
                    typeof participant === "object"
                      ? participant.username
                      : "Unknown";
                  return (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Avatar>{username.charAt(0).toUpperCase()}</Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={username} />
                    </ListItem>
                  );
                })}
              </List>
            </Paper>
          </GridItem>
        </Grid>
      </Paper>

      {isLive && (
        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Chat
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {messageLoading && <Typography>Loading messages...</Typography>}
          {chatError && <Typography color="error">{chatError}</Typography>}

          <Box
            sx={{
              height: 300,
              overflow: "auto",
              mb: 2,
              p: 2,
              bgcolor: "background.default",
            }}
          >
            {messages.length === 0 ? (
              <Typography align="center" color="text.secondary" sx={{ mt: 10 }}>
                No messages yet. Start the conversation!
              </Typography>
            ) : (
              messages.map((message: Message) => {
                const isCurrentUser =
                  typeof message.sender === "object" &&
                  user &&
                  message.sender.id === user.id;
                return (
                  <Box
                    key={message._id}
                    sx={{
                      display: "flex",
                      justifyContent: isCurrentUser ? "flex-end" : "flex-start",
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: "70%",
                        p: 1,
                        borderRadius: 2,
                        bgcolor: isCurrentUser ? "primary.light" : "grey.100",
                        color: isCurrentUser ? "white" : "text.primary",
                      }}
                    >
                      {!isCurrentUser && (
                        <Typography variant="caption" fontWeight="bold">
                          {typeof message.sender === "object"
                            ? message.sender.username
                            : "Unknown"}
                        </Typography>
                      )}
                      <Typography variant="body2">{message.content}</Typography>
                      <Typography
                        variant="caption"
                        sx={{ display: "block", textAlign: "right" }}
                      >
                        {formatChatTime(message.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>

          <Box
            component="form"
            onSubmit={handleSendMessage}
            sx={{ display: "flex" }}
          >
            <TextField
              fullWidth
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              disabled={!isLive}
              variant="outlined"
              size="small"
            />
            <IconButton
              type="submit"
              color="primary"
              disabled={!isLive || !messageText.trim()}
              sx={{ ml: 1 }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default RoomView;
