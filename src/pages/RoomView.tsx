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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  Send as SendIcon,
  ThumbUp as ThumbUpIcon,
  Share as ShareIcon,
  PersonAdd as PersonAddIcon,
  EmojiEmotions as EmojiIcon,
  Favorite as HeartIcon,
  ThumbDown as ThumbDownIcon,
  SentimentVerySatisfied as SmileIcon,
  Celebration as CelebrationIcon,
  Info as InfoIcon,
  ErrorOutline as ErrorOutlineIcon,
} from "@mui/icons-material";
import { useRoom } from "../contexts/RoomContext";
import { useChat } from "../contexts/ChatContext";
import { Message, Room, RoomStatus, RoomType } from "../types";
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
    inviteUsers,
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
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteUsernames, setInviteUsernames] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Emoji menu state
  const [emojiMenuAnchor, setEmojiMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const emojiMenuOpen = Boolean(emojiMenuAnchor);

  // Common emoji reactions
  const commonEmojis = [
    { emoji: "👍", label: "Thumbs Up", icon: <ThumbUpIcon fontSize="small" /> },
    {
      emoji: "❤️",
      label: "Heart",
      icon: <HeartIcon fontSize="small" color="error" />,
    },
    {
      emoji: "👎",
      label: "Thumbs Down",
      icon: <ThumbDownIcon fontSize="small" />,
    },
    {
      emoji: "😊",
      label: "Smile",
      icon: <SmileIcon fontSize="small" color="warning" />,
    },
    {
      emoji: "🎉",
      label: "Celebration",
      icon: <CelebrationIcon fontSize="small" color="success" />,
    },
  ];

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
      setSendingMessage(true);
      sendMessage(roomId, messageText)
        .then(() => {
          setMessageText("");
        })
        .catch((error) => {
          console.error("Error sending message:", error);
        })
        .finally(() => {
          setSendingMessage(false);
        });
    }
  };

  const handleSendReaction = () => {
    if (roomId) {
      sendReaction(roomId, "👍");
    }
  };

  // Handle opening emoji menu
  const handleOpenEmojiMenu = (event: React.MouseEvent<HTMLElement>) => {
    setEmojiMenuAnchor(event.currentTarget);
  };

  // Handle closing emoji menu
  const handleCloseEmojiMenu = () => {
    setEmojiMenuAnchor(null);
  };

  // Handle selecting an emoji
  const handleSelectEmoji = (emoji: string) => {
    if (roomId) {
      sendReaction(roomId, emoji);
      handleCloseEmojiMenu();
    }
  };

  // Handle inserting emoji into text
  const handleInsertEmoji = (emoji: string) => {
    setMessageText((prevText) => prevText + emoji);
    handleCloseEmojiMenu();
  };

  const handleOpenInviteDialog = () => {
    setInviteDialogOpen(true);
    setInviteUsernames("");
    setInviteError("");
  };

  const handleCloseInviteDialog = () => {
    setInviteDialogOpen(false);
  };

  const handleInviteUsers = async () => {
    if (!roomId || !inviteUsernames.trim()) return;

    setInviteLoading(true);
    setInviteError("");

    try {
      // Split by commas, then trim each username and filter out empty strings
      const usernameArray = inviteUsernames
        .split(",")
        .map((username) => username.trim())
        .filter((username) => username.length > 0);

      if (usernameArray.length === 0) {
        setInviteError("Please enter at least one valid username");
        setInviteLoading(false);
        return;
      }

      // Check if host is trying to invite themselves
      if (user && usernameArray.includes(user.username)) {
        setInviteError(
          "You cannot invite yourself as you are already the host of this room"
        );
        setInviteLoading(false);
        return;
      }

      await inviteUsers(roomId, usernameArray);
      setInviteDialogOpen(false);

      // Refresh room data to show newly invited users
      await fetchRoomById(roomId);
    } catch (error: any) {
      setInviteError(
        error.response?.data?.message ||
          error.message ||
          "Failed to invite users"
      );
    } finally {
      setInviteLoading(false);
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
  const isPrivate = currentRoom.roomType === RoomType.PRIVATE;
  const isCreator =
    user &&
    typeof currentRoom.creator === "object" &&
    (currentRoom.creator as any)._id === user.id;
  const creatorName =
    typeof currentRoom.creator === "object"
      ? currentRoom.creator.username
      : "Unknown Host";
  // Only show invite button if it's a private room and user is the creator
  const showInviteButton = isPrivate && isCreator && !isPast;
  // console.log(
  //   showInviteButton,
  //   isPrivate,
  //   isCreator,
  //   !isPast,
  //   "ffffffffffff showInviteButton"
  // );

  return (
    <Box sx={{ mb: 4 }}>
      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box
          sx={{
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: "text.primary",
              }}
            >
              {currentRoom.title}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1,
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mr: 1,
                  fontWeight: "medium",
                }}
              >
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    bgcolor: "primary.main",
                    fontSize: "0.8rem",
                    mr: 1,
                  }}
                >
                  {creatorName.charAt(0).toUpperCase()}
                </Avatar>
                Hosted by {creatorName}
              </Typography>
              <Chip
                label={currentRoom.status.toUpperCase()}
                color={isLive ? "success" : isPast ? "default" : "primary"}
                size="small"
                sx={{ fontWeight: "medium" }}
              />
              {isCreator && (
                <Chip
                  label="YOU ARE HOST"
                  color="secondary"
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: "medium", fontSize: "0.7rem" }}
                />
              )}
            </Box>
          </Box>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate(-1)}
            sx={{ borderRadius: "8px" }}
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
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Details
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  backgroundColor: "rgba(0, 0, 0, 0.02)",
                  borderRadius: 2,
                }}
              >
                <Grid container spacing={2}>
                  <GridItem xs={6}>
                    <Typography
                      variant="body2"
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <Box
                        component="span"
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "primary.main",
                          display: "inline-block",
                          mr: 1,
                        }}
                      />
                      <strong>Start Time:</strong>{" "}
                      {formatDateTime(currentRoom.startTime)}
                    </Typography>
                  </GridItem>
                  <GridItem xs={6}>
                    <Typography
                      variant="body2"
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <Box
                        component="span"
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "error.main",
                          display: "inline-block",
                          mr: 1,
                        }}
                      />
                      <strong>End Time:</strong>{" "}
                      {formatDateTime(currentRoom.endTime)}
                    </Typography>
                  </GridItem>
                  <GridItem xs={6}>
                    <Typography
                      variant="body2"
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <Box
                        component="span"
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "info.main",
                          display: "inline-block",
                          mr: 1,
                        }}
                      />
                      <strong>Room Type:</strong>{" "}
                      <Chip
                        label={currentRoom.roomType}
                        size="small"
                        color={isPrivate ? "secondary" : "default"}
                        sx={{ ml: 1, height: 20, fontSize: "0.7rem" }}
                      />
                    </Typography>
                  </GridItem>
                  <GridItem xs={6}>
                    <Typography
                      variant="body2"
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <Box
                        component="span"
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "success.main",
                          display: "inline-block",
                          mr: 1,
                        }}
                      />
                      <strong>Room Code:</strong>{" "}
                      <Chip
                        label={currentRoom.code}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ ml: 1, height: 20, fontSize: "0.7rem" }}
                      />
                    </Typography>
                  </GridItem>
                </Grid>
              </Paper>
            </Box>

            {currentRoom.tags.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight="medium"
                  gutterBottom
                >
                  Tags
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    backgroundColor: "rgba(0, 0, 0, 0.02)",
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                    {currentRoom.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{
                          borderRadius: "12px",
                          fontSize: "0.75rem",
                          transition: "all 0.2s",
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Paper>
              </Box>
            )}

            <Box sx={{ mt: 3, display: "flex", gap: 1 }}>
              {isLive && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<ThumbUpIcon />}
                  onClick={handleSendReaction}
                  sx={{
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    "&:hover": {
                      boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  React
                </Button>
              )}
              {showInviteButton && (
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<PersonAddIcon />}
                  onClick={handleOpenInviteDialog}
                  sx={{
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    "&:hover": {
                      boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  Invite Users
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                sx={{
                  borderRadius: "8px",
                }}
              >
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
                borderRadius: 2,
                border: "1px solid rgba(0, 0, 0, 0.05)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                  Participants
                </Typography>
                <Chip
                  label={currentRoom.participants.length}
                  color="primary"
                  size="small"
                  sx={{ borderRadius: "12px", fontWeight: "bold" }}
                />
              </Box>
              <Divider sx={{ mb: 2 }} />

              <List sx={{ overflow: "auto", flex: 1, maxHeight: 200 }}>
                {currentRoom.participants.length > 0 ? (
                  currentRoom.participants.map((participant, index) => {
                    const username =
                      typeof participant === "object"
                        ? participant.username
                        : "Unknown";
                    const isRoomCreator =
                      typeof currentRoom.creator === "object" &&
                      currentRoom.creator.username === username;
                    return (
                      <ListItem
                        key={index}
                        sx={{
                          borderRadius: 1,
                          mb: 0.5,
                          backgroundColor: isRoomCreator
                            ? "rgba(0, 0, 0, 0.03)"
                            : "transparent",
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: isRoomCreator
                                ? "primary.main"
                                : "grey.400",
                              color: "#fff",
                            }}
                          >
                            {username.charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box
                              component="span"
                              sx={{ display: "flex", alignItems: "center" }}
                            >
                              {username}
                              {isRoomCreator && (
                                <Chip
                                  label="Host"
                                  size="small"
                                  color="primary"
                                  sx={{ ml: 1, height: 18, fontSize: "0.6rem" }}
                                />
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    );
                  })
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      py: 4,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No participants yet
                    </Typography>
                  </Box>
                )}
              </List>
              {/* Show invited users for private rooms */}
              {isPrivate && currentRoom.invitedUsers.length > 0 && (
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    mt: 2,
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 2,
                    border: "1px solid rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                      Invited
                    </Typography>
                    <Chip
                      label={currentRoom.invitedUsers.length}
                      color="secondary"
                      size="small"
                      sx={{ borderRadius: "12px", fontWeight: "bold" }}
                    />
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  <List sx={{ overflow: "auto", maxHeight: 150 }}>
                    {currentRoom.invitedUsers.map((invitedUser, index) => {
                      const username =
                        typeof invitedUser === "object"
                          ? invitedUser.username
                          : "Unknown";
                      return (
                        <ListItem
                          key={index}
                          sx={{
                            borderRadius: 1,
                            mb: 0.5,
                            backgroundColor: "rgba(0, 0, 0, 0.01)",
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: "grey.300" }}>
                              {username.charAt(0).toUpperCase()}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={username}
                            secondary={
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  fontSize: "0.7rem",
                                }}
                              >
                                Awaiting response
                              </Typography>
                            }
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </Paper>
              )}
            </Paper>
          </GridItem>
        </Grid>
      </Paper>

      {/* Invite Users Dialog */}
      <Dialog
        open={inviteDialogOpen}
        onClose={handleCloseInviteDialog}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 400,
            maxWidth: "90vw",
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <PersonAddIcon
            sx={{ mr: 1, color: "secondary.main" }}
            fontSize="small"
          />
          Invite Users to Room
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Enter usernames separated by commas to invite users to "
            {currentRoom.title}".
          </Typography>
          <TextField
            fullWidth
            label="Usernames"
            placeholder="e.g., user1, user2, user3"
            value={inviteUsernames}
            onChange={(e) => setInviteUsernames(e.target.value)}
            error={!!inviteError}
            helperText={
              inviteError ||
              "Make sure to enter existing usernames. You cannot invite yourself."
            }
            disabled={inviteLoading}
            multiline
            rows={2}
            InputProps={{
              sx: {
                borderRadius: 1,
              },
            }}
            sx={{ mb: 1 }}
          />
          {inviteError && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                p: 1.5,
                borderRadius: 1,
                bgcolor: "error.light",
                color: "error.dark",
                mb: 2,
              }}
            >
              <ErrorOutlineIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">{inviteError}</Typography>
            </Box>
          )}
          {isPrivate ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                p: 1,
                borderRadius: 1,
                bgcolor: "secondary.light",
                color: "secondary.dark",
                mb: 1,
                opacity: 0.8,
              }}
            >
              <InfoIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="caption">
                This is a private room. Only invited users can join.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                p: 1,
                borderRadius: 1,
                bgcolor: "info.light",
                color: "info.dark",
                mb: 1,
                opacity: 0.8,
              }}
            >
              <Typography variant="caption">
                This is a public room. Anyone with the link can join, but
                invitations help users find it.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{ px: 3, py: 2, borderTop: "1px solid rgba(0, 0, 0, 0.05)" }}
        >
          <Button
            onClick={handleCloseInviteDialog}
            disabled={inviteLoading}
            sx={{ borderRadius: "8px" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleInviteUsers}
            color="primary"
            variant="contained"
            disabled={inviteLoading || !inviteUsernames.trim()}
            sx={{
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              px: 3,
            }}
          >
            {inviteLoading ? "Sending Invites..." : "Invite"}
          </Button>
        </DialogActions>
      </Dialog>

      {isLive && (
        <Paper
          elevation={1}
          sx={{
            p: 0,
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
          }}
        >
          {/* WhatsApp Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              p: 1.5,
              bgcolor: "primary.main", // WhatsApp green color
              color: "white",
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                mr: 1.5,
                bgcolor: "rgba(255,255,255,0.2)",
              }}
            >
              <PersonAddIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "medium", lineHeight: 1.2 }}
              >
                Live Chat
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  component="span"
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "#4CAF50",
                    display: "inline-block",
                    mr: 0.5,
                  }}
                />
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  online
                </Typography>
              </Box>
            </Box>
          </Box>

          {chatError && (
            <Box sx={{ p: 2, bgcolor: "error.light", borderRadius: 1 }}>
              <Typography color="error">{chatError}</Typography>
            </Box>
          )}

          <Box
            sx={{
              height: 350,
              overflow: "auto",
              py: 2,
              px: 1,
              bgcolor: "#e5ddd5", // WhatsApp chat background color

              backgroundRepeat: "repeat",
              borderRadius: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {messages.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  borderRadius: 4,
                  padding: 3,
                  margin: "auto",
                  maxWidth: "70%",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
                }}
              >
                <Typography
                  align="center"
                  color="text.secondary"
                  fontWeight="medium"
                >
                  No messages yet. Start the conversation!
                </Typography>
                {isLive && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Be the first to send a message
                  </Typography>
                )}
              </Box>
            ) : (
              <>
                {messages.map((message: Message, index: number) => {
                  const isCurrentUser =
                    typeof message.sender === "object" &&
                    user &&
                    (message.sender as any)._id === user.id;
                  // Check if this is a new sender or if there's a significant time gap
                  const showSenderInfo =
                    index === 0 ||
                    (typeof message.sender === "object" &&
                      typeof messages[index - 1].sender === "object" &&
                      (message.sender as any)._id !==
                        (messages[index - 1].sender as any)._id);

                  // Check if this is the last message from this sender
                  const isLastInGroup =
                    index === messages.length - 1 ||
                    (typeof message.sender === "object" &&
                      typeof messages[index + 1]?.sender === "object" &&
                      (message.sender as any)._id !==
                        (messages[index + 1].sender as any)._id);
                  return (
                    <Box
                      key={`${message._id}-${index}`}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isCurrentUser ? "flex-end" : "flex-start",
                        mb: 0.7,
                        width: "100%",
                        px: 1,
                      }}
                    >
                      {!isCurrentUser && showSenderInfo && (
                        <Typography
                          variant="caption"
                          sx={{
                            ml: 1.5,
                            mb: 0.5,
                            color: "text.secondary",
                            fontSize: "0.7rem",
                            fontWeight: "medium",
                          }}
                        >
                          {typeof message.sender === "object"
                            ? message.sender.username
                            : "Unknown"}
                        </Typography>
                      )}
                      <Box
                        sx={{
                          display: "flex",
                          position: "relative",
                          maxWidth: "70%",
                        }}
                      >
                        <Box
                          sx={{
                            p: 1.5,
                            pt: 1,
                            pb: 1,
                            borderRadius: 2,
                            borderTopLeftRadius:
                              !isCurrentUser && !showSenderInfo ? 0.5 : 2,
                            borderTopRightRadius:
                              isCurrentUser && !showSenderInfo ? 0.5 : 2,
                            borderBottomLeftRadius:
                              !isCurrentUser && !isLastInGroup ? 0.5 : 2,
                            borderBottomRightRadius:
                              isCurrentUser && !isLastInGroup ? 0.5 : 2,
                            backgroundColor: isCurrentUser
                              ? "#e3f2fd" // Light blue color for sent messages
                              : "#ffffff", // WhatsApp received message color
                            color: "#303030",
                            boxShadow: "0 1px 0.5px rgba(0, 0, 0, 0.13)",
                            // position: "relative",
                            // Chat bubble triangle for first message in a group
                            "&::after": showSenderInfo
                              ? {
                                  content: '""',
                                  position: "absolute",
                                  top: 0,
                                  ...(isCurrentUser
                                    ? {
                                        right: "-8px",
                                        borderRight: 0,
                                        borderTopColor: "#dcf8c6",
                                      }
                                    : {
                                        left: "-8px",
                                        borderLeft: 0,
                                        borderTopColor: "#ffffff",
                                      }),

                                  height: 0,
                                  border: "8px solid transparent",
                                }
                              : {},
                          }}
                        >
                          {sendingMessage &&
                          index === messages.length - 1 &&
                          isCurrentUser ? (
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                minHeight: 24,
                                minWidth: 40,
                                p: 0.5,
                              }}
                            >
                              <CircularProgress
                                size={16}
                                thickness={5}
                                sx={{ color: "primary.main" }}
                              />
                            </Box>
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{
                                wordBreak: "break-word",
                              }}
                            >
                              {message.content}
                            </Typography>
                          )}
                          <Typography
                            variant="caption"
                            sx={{
                              // position: "absolute",

                              fontSize: "0.65rem",
                              color: "rgba(0, 0, 0, 0.45)",
                              display: "flex",
                              alignItems: "center",
                              minWidth: "100%",

                              ml: 0.5,
                            }}
                          >
                            {formatChatTime(message.createdAt)}
                            {isCurrentUser && (
                              <Box
                                component="span"
                                sx={{
                                  ml: 0.5,
                                  display: "inline-flex",
                                  "& svg": {
                                    fontSize: "0.8rem",
                                    color: "#4fc3f7",
                                  },
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 18 18"
                                  width="12"
                                  height="12"
                                >
                                  <path
                                    fill="currentColor"
                                    d="M17.394 5.035l-.57-.444a.434.434 0 0 0-.609.076l-6.39 8.198a.38.38 0 0 1-.577.039l-.427-.388a.381.381 0 0 0-.578.038l-.451.576a.497.497 0 0 0 .043.645l1.575 1.51a.38.38 0 0 0 .577-.039l7.483-9.602a.436.436 0 0 0-.076-.609zm-4.892 0l-.57-.444a.434.434 0 0 0-.609.076l-6.39 8.198a.38.38 0 0 1-.577.039l-2.614-2.556a.435.435 0 0 0-.614.007l-.505.516a.435.435 0 0 0 .007.614l3.887 3.8a.38.38 0 0 0 .577-.039l7.483-9.602a.435.435 0 0 0-.075-.609z"
                                  ></path>
                                </svg>
                              </Box>
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </>
            )}
          </Box>

          {/* Input area */}
          <Box
            component="form"
            onSubmit={handleSendMessage}
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#f0f2f5", // WhatsApp input background
              padding: "8px 12px",
              borderTop: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <Tooltip title="Add Emoji">
              <IconButton
                color="primary"
                onClick={handleOpenEmojiMenu}
                disabled={!isLive}
                sx={{
                  mr: 1,
                  color: "#919191",
                  "&:hover": {
                    color: "#00a884", // WhatsApp active color
                  },
                }}
              >
                <EmojiIcon />
              </IconButton>
            </Tooltip>
            <TextField
              fullWidth
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              disabled={!isLive}
              variant="outlined"
              size="small"
              autoComplete="off"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 10, // More rounded for WhatsApp style
                  backgroundColor: "white",
                  "&.Mui-focused": {
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#00a884", // WhatsApp green
                    },
                  },
                },
              }}
            />
            <IconButton
              type="submit"
              color="primary"
              disabled={!isLive || !messageText.trim()}
              sx={{
                ml: 1,
                backgroundColor: "#00a884", // WhatsApp send button color
                color: "white",
                "&:hover": {
                  backgroundColor: "#009670",
                },
                "&.Mui-disabled": {
                  backgroundColor: "#e9edef",
                  color: "#919191",
                },
              }}
            >
              <SendIcon />
            </IconButton>

            {/* Emoji Menu */}
            <Menu
              anchorEl={emojiMenuAnchor}
              open={emojiMenuOpen}
              onClose={handleCloseEmojiMenu}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: 2,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                },
              }}
            >
              <Box sx={{ p: 1, pb: 0.5 }}>
                <Typography
                  variant="caption"
                  sx={{ p: 1, color: "text.secondary", display: "block" }}
                >
                  Insert in message
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 0.5,
                    p: 1,
                    pb: 0,
                  }}
                >
                  {["😊", "👍", "❤️", "🎉", "😂", "🤔", "👏", "🙏", "🔥"].map(
                    (emoji) => (
                      <Chip
                        key={emoji}
                        label={emoji}
                        onClick={() => handleInsertEmoji(emoji)}
                        sx={{
                          fontSize: "1.2rem",
                          height: 32,
                          cursor: "pointer",
                          "&:hover": {
                            bgcolor: "rgba(0,0,0,0.05)",
                          },
                        }}
                      />
                    )
                  )}
                </Box>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ p: 1, pt: 0 }}>
                <Typography
                  variant="caption"
                  sx={{ p: 1, color: "text.secondary", display: "block" }}
                >
                  Send as reaction
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  {commonEmojis.map(({ emoji, label, icon }) => (
                    <MenuItem
                      key={emoji}
                      onClick={() => handleSelectEmoji(emoji)}
                      sx={{
                        py: 1,
                        borderRadius: 1,
                        my: 0.2,
                        gap: 1,
                      }}
                    >
                      <Box sx={{ fontSize: "1.2rem", mr: 1 }}>{emoji}</Box>
                      {icon}
                      <Typography variant="body2">{label}</Typography>
                    </MenuItem>
                  ))}
                </Box>
              </Box>
            </Menu>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default RoomView;
