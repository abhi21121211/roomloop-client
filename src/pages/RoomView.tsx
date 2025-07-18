import React, { useEffect, useState, useCallback } from "react";
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
  useTheme,
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
  SmartToy as AIIcon,
} from "@mui/icons-material";
import { useRoom } from "../contexts/RoomContext";
import { useChat } from "../contexts/ChatContext";
import { useAI } from "../contexts/AIContext";
import { Message, Room, RoomStatus, RoomType } from "../types";
import Loading from "../components/common/Loading";
import ErrorMessage from "../components/common/ErrorMessage";
import GridItem from "../components/common/GridItem";
import { useAuth } from "../contexts/AuthContext";
import RoomEndAlert from "../components/common/RoomEndAlert";
import { alpha } from "@mui/material/styles";
import { renderTextContent } from "../utils/textProcessing";

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
  const { sendMessage: sendAIMessage, isAvailable: aiAvailable } = useAI();
  const [messageText, setMessageText] = useState("");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteUsernames, setInviteUsernames] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [roomEndDialogOpen, setRoomEndDialogOpen] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [bypassRedirect, setBypassRedirect] = useState(false);
  const [wasInLiveRoom, setWasInLiveRoom] = useState(false);

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

  const theme = useTheme();

  // Check if this is the first time viewing this specific closed room
  useEffect(() => {
    if (roomId && currentRoom?.status === RoomStatus.CLOSED) {
      const viewedClosedRooms = JSON.parse(
        localStorage.getItem("viewedClosedRooms") || "[]"
      );

      if (!viewedClosedRooms.includes(roomId)) {
        // First time viewing this closed room - don't show alert, just mark as viewed
        const updatedViewedRooms = [...viewedClosedRooms, roomId];
        localStorage.setItem(
          "viewedClosedRooms",
          JSON.stringify(updatedViewedRooms)
        );
        setBypassRedirect(true);
      } else {
        // User has previously chosen to view this closed room
        setBypassRedirect(true);
      }
    }
  }, [roomId, currentRoom]);

  // Check if room has ended or if current time is past end time
  const checkRoomEnded = useCallback(() => {
    if (!currentRoom) return false;

    // For closed rooms, don't trigger the end alert - they're already closed
    if (currentRoom.status === RoomStatus.CLOSED) return false;

    // Check if current time is past the end time (only for live/scheduled rooms)
    const now = new Date();
    const endTime = new Date(currentRoom.endTime);
    return now > endTime;
  }, [currentRoom]);

  // Track if user was in a live room
  useEffect(() => {
    if (currentRoom?.status === RoomStatus.LIVE) {
      setWasInLiveRoom(true);
    }
  }, [currentRoom?.status]);

  // Handle room end and redirect
  useEffect(() => {
    // Don't redirect if user has chosen to view this closed room
    if (bypassRedirect) return;

    let countdownInterval: NodeJS.Timeout;

    // If room has ended and user was in it when it was live, show the dialog and start countdown
    if (currentRoom && checkRoomEnded() && wasInLiveRoom) {
      setRoomEndDialogOpen(true);

      countdownInterval = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            navigate("/dashboard");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [currentRoom, checkRoomEnded, navigate, bypassRedirect, wasInLiveRoom]);

  // Continuously check if room has ended (every 10 seconds)
  useEffect(() => {
    // Don't check for room ending if user has chosen to view this closed room
    if (bypassRedirect) return;

    const checkInterval = setInterval(() => {
      if (checkRoomEnded() && !roomEndDialogOpen && wasInLiveRoom) {
        setRoomEndDialogOpen(true);
        setRedirectCountdown(5);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(checkInterval);
  }, [checkRoomEnded, roomEndDialogOpen, bypassRedirect, wasInLiveRoom]);

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
      // Check if this is an AI command
      const isAICommand = messageText.trim().startsWith("@ai");

      if (isAICommand && aiAvailable) {
        // Handle AI command
        setSendingMessage(true);
        const aiQuery = messageText.trim().substring(4).trim(); // Remove '@ai ' prefix

        if (aiQuery) {
          // Send the AI command as a regular message first
          sendMessage(roomId, messageText)
            .then(() => {
              setMessageText("");

              // Then get AI response with better conversation history
              const conversationHistory = messages
                .filter((msg) => !msg.content.startsWith("🤖 **Ted**:")) // Filter out Ted's previous responses
                .map((msg) => ({
                  role:
                    typeof msg.sender === "object" &&
                    msg.sender &&
                    (msg.sender as any)._id === user?.id
                      ? "user"
                      : "assistant",
                  content: msg.content,
                }))
                .slice(-8); // Keep last 8 messages for context

              console.log("Frontend Debug - AI Request:");
              console.log("AI Query:", aiQuery);
              console.log("Room ID:", roomId);
              console.log("Conversation History:", conversationHistory);

              return sendAIMessage(aiQuery, roomId, conversationHistory);
            })
            .then((aiResponse) => {
              if (aiResponse.success) {
                // Send AI response as a system message
                const aiMessage = `🤖 **Ted**: ${aiResponse.data.response}`;
                sendMessage(roomId, aiMessage);
              }
            })
            .catch((error) => {
              console.error("Error with AI command:", error);
              // Send error message to chat with more specific error info
              let errorMessage =
                "🤖 **Ted**: Sorry, I encountered an error. Please try again.";

              if (error.response?.data?.error) {
                if (error.response.data.error.includes("participant")) {
                  errorMessage =
                    "🤖 **Ted**: Sorry, only participants in this room can use AI features.";
                } else if (
                  error.response.data.error.includes("authenticated")
                ) {
                  errorMessage =
                    "🤖 **Ted**: Sorry, you need to be logged in to use AI features.";
                } else {
                  errorMessage = `🤖 **Ted**: ${error.response.data.error}`;
                }
              }

              sendMessage(roomId, errorMessage);
            })
            .finally(() => {
              setSendingMessage(false);
            });
        } else {
          // Empty AI command
          sendMessage(
            roomId,
            "🤖 **Ted**: Hi there! I'm Ted, your AI assistant. How can I help you today? 🤖"
          );
          setMessageText("");
          setSendingMessage(false);
        }
      } else if (isAICommand && !aiAvailable) {
        // AI not available
        sendMessage(
          roomId,
          "🤖 **Ted**: Sorry, I'm having some technical difficulties right now. Please try again later! 🤖"
        );
        setMessageText("");
        setSendingMessage(false);
      } else {
        // Regular message
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

  // Handle user choosing to view the closed room
  const handleViewClosedRoom = useCallback(() => {
    if (roomId) {
      // Store this room ID in local storage to remember user's preference
      const viewedClosedRooms = JSON.parse(
        localStorage.getItem("viewedClosedRooms") || "[]"
      );
      if (!viewedClosedRooms.includes(roomId)) {
        viewedClosedRooms.push(roomId);
        localStorage.setItem(
          "viewedClosedRooms",
          JSON.stringify(viewedClosedRooms)
        );
      }

      setRoomEndDialogOpen(false);
      setBypassRedirect(true);
    }
  }, [roomId]);

  // Handle user choosing to go to dashboard
  const handleGoToDashboard = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  if (roomLoading) return <Loading message="Loading room details..." />;
  if (!currentRoom) return <ErrorMessage message="Room not found" />;
  if (!user) return <ErrorMessage message="Please log in to view this room" />;

  // Additional safety check for room data
  if (!currentRoom.participants) currentRoom.participants = [];
  if (!currentRoom.invitedUsers) currentRoom.invitedUsers = [];

  const isLive = currentRoom.status === RoomStatus.LIVE;
  const isPast = currentRoom.status === RoomStatus.CLOSED;
  const isPrivate = currentRoom.roomType === RoomType.PRIVATE;
  const isCreator =
    user &&
    currentRoom.creator &&
    typeof currentRoom.creator === "object" &&
    (currentRoom.creator as any)._id === user.id;
  const creatorName =
    currentRoom.creator &&
    typeof currentRoom.creator === "object" &&
    currentRoom.creator.username
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
    <Box
      sx={{
        mb: 4,
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.05
        )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        py: 2,
      }}
    >
      {/* Room End Alert */}
      <RoomEndAlert
        open={roomEndDialogOpen && wasInLiveRoom}
        roomTitle={currentRoom?.title || ""}
        redirectCountdown={redirectCountdown}
        onViewRoom={handleViewClosedRoom}
        onGoToDashboard={handleGoToDashboard}
        showViewOption={true}
      />

      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 3,
          borderRadius: 4,
          background: `linear-gradient(145deg, ${
            theme.palette.background.paper
          } 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
          backdropFilter: "blur(10px)",
          transition: "all 0.3s ease-in-out",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.15)}`,
          },
        }}
      >
        <Box
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: "text.primary",
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                mb: 2,
              }}
            >
              {currentRoom.title}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: 1.5,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${alpha(
                    theme.palette.primary.main,
                    0.1
                  )} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  mr: 2,
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    fontSize: "1rem",
                    fontWeight: 600,
                    mr: 1.5,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  {creatorName.charAt(0).toUpperCase()}
                </Avatar>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    color: "text.primary",
                    fontSize: "0.95rem",
                  }}
                >
                  Hosted by {creatorName}
                </Typography>
              </Box>
              <Chip
                label={currentRoom.status.toUpperCase()}
                color={isLive ? "success" : isPast ? "default" : "primary"}
                size="medium"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  px: 2,
                  py: 1,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  "& .MuiChip-label": {
                    px: 1,
                  },
                }}
              />
              {isCreator && (
                <Chip
                  label="YOU ARE HOST"
                  color="secondary"
                  size="medium"
                  variant="outlined"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    px: 2,
                    py: 1,
                    borderWidth: 2,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    "& .MuiChip-label": {
                      px: 1,
                    },
                  }}
                />
              )}
            </Box>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(-1)}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
              },
            }}
          >
            ← Back
          </Button>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={3}>
          <GridItem xs={12} md={7}>
            <Typography variant="body1" paragraph>
              {currentRoom.description}
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                📋 Room Details
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  background: `linear-gradient(145deg, ${alpha(
                    theme.palette.background.paper,
                    0.8
                  )} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  boxShadow: `0 4px 20px ${alpha(
                    theme.palette.common.black,
                    0.08
                  )}`,
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

            <Box sx={{ mt: 4, display: "flex", gap: 2, flexWrap: "wrap" }}>
              {isLive && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<ThumbUpIcon />}
                  onClick={handleSendReaction}
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                    },
                  }}
                >
                  🎉 React
                </Button>
              )}
              {showInviteButton && (
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<PersonAddIcon />}
                  onClick={handleOpenInviteDialog}
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
                    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                    },
                  }}
                >
                  👥 Invite Users
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
                {currentRoom.participants &&
                currentRoom.participants.length > 0 ? (
                  currentRoom.participants.map((participant, index) => {
                    const username =
                      typeof participant === "object" && participant
                        ? participant.username
                        : "Unknown";
                    const isRoomCreator =
                      typeof currentRoom.creator === "object" &&
                      currentRoom.creator &&
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
              {isPrivate &&
                currentRoom.invitedUsers &&
                currentRoom.invitedUsers.length > 0 && (
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
                          typeof invitedUser === "object" && invitedUser
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
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.error.main, 0.1),
                border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                color:
                  theme.palette.mode === "dark"
                    ? theme.palette.error.light
                    : theme.palette.error.dark,
                mb: 2,
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              }}
            >
              <ErrorOutlineIcon
                fontSize="small"
                sx={{ mr: 1, color: "error.main" }}
              />
              <Typography variant="body2" fontWeight="medium">
                {inviteError}
              </Typography>
            </Box>
          )}
          {isPrivate ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                p: 2,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.secondary.main, 0.12),
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                color:
                  theme.palette.mode === "dark"
                    ? theme.palette.secondary.light
                    : theme.palette.secondary.dark,
                mb: 2,
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <InfoIcon
                fontSize="small"
                sx={{ mr: 1.5, color: "secondary.main" }}
              />
              <Typography fontWeight="medium">
                This is a private room. Only invited users can join.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                p: 2,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.info.main, 0.12),
                border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                color:
                  theme.palette.mode === "dark"
                    ? theme.palette.info.light
                    : theme.palette.info.dark,
                mb: 2,
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <InfoIcon fontSize="small" sx={{ mr: 1.5, color: "info.main" }} />
              <Typography fontWeight="medium">
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

      {/* Chat section - Modified to work for both live and closed rooms */}
      <Paper
        elevation={0}
        sx={{
          p: 0,
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          background: `linear-gradient(145deg, ${
            theme.palette.background.paper
          } 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
        }}
      >
        {/* Chat Header - Adjusted to show status for both live and closed rooms */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: 2.5,
            background: isLive
              ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
              : isPast
              ? `linear-gradient(135deg, ${theme.palette.grey[500]} 0%, ${theme.palette.grey[600]} 100%)`
              : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: "white",
            boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.2)}`,
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
              {isPast ? "Chat History" : "Live Chat"}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                component="span"
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: isPast ? "#f44336" : "#4CAF50", // Red for closed, green for live
                  display: "inline-block",
                  mr: 0.5,
                }}
              />
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {isPast ? "closed" : "online"}
              </Typography>
            </Box>
          </Box>

          {/* Add reactions button for both live and closed rooms */}
          <Box sx={{ marginLeft: "auto" }}>
            <IconButton
              size="small"
              onClick={handleOpenEmojiMenu}
              sx={{
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <EmojiIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {chatError && (
          <Box
            sx={{
              p: 3,
              bgcolor: alpha(theme.palette.error.main, 0.1),
              color:
                theme.palette.mode === "dark"
                  ? theme.palette.error.light
                  : theme.palette.error.dark,
              fontWeight: 500,
              borderRadius: 1,
              m: 2,
              display: "flex",
              alignItems: "center",
              border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <ErrorOutlineIcon sx={{ mr: 1, color: "error.main" }} />
            <Typography fontWeight="medium">{chatError}</Typography>
          </Box>
        )}

        <Box
          sx={{
            height: 400,
            overflow: "auto",
            py: 3,
            px: 2,
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,
              0.03
            )} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
            backgroundImage: `radial-gradient(circle at 20% 80%, ${alpha(
              theme.palette.primary.main,
              0.05
            )} 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, ${alpha(
                                theme.palette.secondary.main,
                                0.05
                              )} 0%, transparent 50%)`,
            borderRadius: 0,
            display: "flex",
            flexDirection: "column",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>\')',
              opacity: 0.3,
              pointerEvents: "none",
            },
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
                {isPast
                  ? "No messages were sent in this room."
                  : "No messages yet. Start the conversation!"}
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
              {messages &&
                messages.map((message: Message, index: number) => {
                  const isCurrentUser =
                    typeof message.sender === "object" &&
                    message.sender &&
                    user &&
                    ((message.sender as any)._id === user.id ||
                      (message.sender as any).id === user.id);
                  // Check if this is a new sender or if there's a significant time gap
                  const showSenderInfo =
                    index === 0 ||
                    (typeof message.sender === "object" &&
                      message.sender &&
                      typeof messages[index - 1].sender === "object" &&
                      messages[index - 1].sender &&
                      (message.sender as any)._id !==
                        (messages[index - 1].sender as any)._id);

                  return (
                    <Box
                      key={message._id}
                      sx={{
                        alignSelf: isCurrentUser ? "flex-end" : "flex-start",
                        maxWidth: "70%",
                        mb: 1,
                      }}
                    >
                      {showSenderInfo && !isCurrentUser && (
                        <Typography
                          variant="caption"
                          sx={{
                            ml: 1,
                            fontWeight: "medium",
                            color: "text.secondary",
                          }}
                        >
                          {typeof message.sender === "object" && message.sender
                            ? message.sender.username
                            : "Unknown"}
                        </Typography>
                      )}
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          background: isCurrentUser
                            ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                            : `linear-gradient(145deg, ${
                                theme.palette.background.paper
                              } 0%, ${alpha(
                                theme.palette.primary.main,
                                0.05
                              )} 100%)`,
                          color: isCurrentUser ? "white" : "text.primary",
                          ml: isCurrentUser ? 0 : 1,
                          mr: isCurrentUser ? 1 : 0,
                          position: "relative",
                          boxShadow: `0 4px 12px ${alpha(
                            theme.palette.common.black,
                            0.1
                          )}`,
                          border: isCurrentUser
                            ? "none"
                            : `1px solid ${alpha(
                                theme.palette.primary.main,
                                0.1
                              )}`,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            transform: "translateY(-1px)",
                            boxShadow: `0 6px 16px ${alpha(
                              theme.palette.common.black,
                              0.15
                            )}`,
                          },
                          "&::after": isCurrentUser
                            ? {
                                content: '""',
                                position: "absolute",
                                width: 0,
                                height: 0,
                                top: 0,
                                right: -10,
                                border: "10px solid transparent",
                                borderTopColor: theme.palette.primary.main,
                                borderRight: 0,
                              }
                            : {
                                content: '""',
                                position: "absolute",
                                width: 0,
                                height: 0,
                                top: 0,
                                left: -10,
                                border: "10px solid transparent",
                                borderTopColor: theme.palette.background.paper,
                                borderLeft: 0,
                              },
                        }}
                      >
                        <Typography variant="body2">
                          {renderTextContent(
                            message.content,
                            message.sender === "Ted"
                          )}
                        </Typography>
                        <Typography
                          variant="caption"
                          align="right"
                          display="block"
                          sx={{
                            mt: 0.5,
                            color: "text.secondary",
                            fontSize: "0.7rem",
                          }}
                        >
                          {formatChatTime(message.createdAt)}
                        </Typography>
                      </Paper>
                    </Box>
                  );
                })}
            </>
          )}
        </Box>

        {/* Message input - Only show if room is live */}
        {isLive ? (
          <Box
            component="form"
            onSubmit={handleSendMessage}
            sx={{
              display: "flex",
              alignItems: "center",
              p: 2,
              background: `linear-gradient(145deg, ${
                theme.palette.background.paper
              } 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
              borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              boxShadow: `0 -4px 20px ${alpha(
                theme.palette.common.black,
                0.05
              )}`,
            }}
          >
            <IconButton
              size="small"
              onClick={handleOpenEmojiMenu}
              sx={{ mr: 1 }}
            >
              <EmojiIcon />
            </IconButton>
            {aiAvailable && (
              <Tooltip title="Ted is here! Use @ai for AI assistance">
                <IconButton
                  size="small"
                  sx={{
                    mr: 1,
                    color: theme.palette.secondary.main,
                    "&:hover": {
                      transform: "scale(1.1)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <AIIcon />
                </IconButton>
              </Tooltip>
            )}
            <TextField
              fullWidth
              placeholder={
                aiAvailable
                  ? "💬 Type a message... (Use @ai to chat with Ted)"
                  : "💬 Type a message..."
              }
              variant="outlined"
              size="medium"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              disabled={sendingMessage}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sendingMessage}
                    size="medium"
                    color="primary"
                    type="submit"
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      color: "white",
                      mr: 0.5,
                      "&:hover": {
                        transform: "scale(1.05)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    {sendingMessage ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <SendIcon />
                    )}
                  </IconButton>
                ),
                sx: {
                  borderRadius: 3,
                  "& .MuiOutlinedInput-root": {
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
                },
              }}
              sx={{ flex: 1 }}
            />
          </Box>
        ) : (
          // For closed rooms, show a message that the room is closed
          <Box
            sx={{
              p: 2,
              borderTop: "1px solid rgba(0,0,0,0.1)",
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(0,0,0,0.2)"
                  : "rgba(0,0,0,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              This room is closed. Chat history is available for viewing only.
            </Typography>
          </Box>
        )}

        <Menu
          anchorEl={emojiMenuAnchor}
          open={emojiMenuOpen}
          onClose={handleCloseEmojiMenu}
          sx={{ maxHeight: 300 }}
        >
          <Box sx={{ p: 1, pb: 0.5 }}>
            {isLive && (
              <>
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
                <Divider sx={{ my: 1 }} />
              </>
            )}
            <Typography
              variant="caption"
              sx={{ p: 1, color: "text.secondary", display: "block" }}
            >
              {isLive ? "Send as reaction" : "View reactions"}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              {commonEmojis.map(({ emoji, label, icon }) => (
                <MenuItem
                  key={emoji}
                  onClick={() => (isLive ? handleSelectEmoji(emoji) : null)}
                  disabled={!isLive}
                  sx={{
                    py: 1,
                    borderRadius: 1,
                    my: 0.2,
                    gap: 1,
                    opacity: isLive ? 1 : 0.7,
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
      </Paper>
    </Box>
  );
};

export default RoomView;
