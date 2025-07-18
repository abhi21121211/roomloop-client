import React, { useEffect, useState, useCallback } from "react";
import {
  Typography,
  Box,
  CardContent,
  CardActions,
  Chip,
  InputAdornment,
  Grid,
  Divider,
  Stack,
  alpha,
  useTheme as useMuiTheme,
  Tabs,
  Tab,
  Pagination,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useRoom } from "../contexts/RoomContext";
import { Room, RoomStatus, RoomType } from "../types";
import Loading from "../components/common/Loading";
import ErrorMessage from "../components/common/ErrorMessage";
import GridItem from "../components/common/GridItem";
import { useAuth } from "../contexts/AuthContext";
import StyledTextField from "../components/common/StyledTextField";
import StyledCard from "../components/common/StyledCard";
import StyledButton from "../components/common/StyledButton";

/**
 * Explore Component - Browse and join rooms
 */
const Explore = () => {
  const { publicRooms, loading, error, fetchAllRooms, joinRoom } = useRoom();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [roomType, setRoomType] = useState(0); // 0: Public, 1: Private
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useMuiTheme();

  // Fetch all rooms including private ones when component mounts
  useEffect(() => {
    fetchAllRooms();
  }, [fetchAllRooms]); // fetchAllRooms is memoized with useCallback

  // Check if the user is already part of the room
  const isUserInRoom = useCallback(
    (room: Room) => {
      if (!user) return false;

      // Check if user is the creator
      if (room.creator && typeof room.creator === "object") {
        // Handle the case where creator is an object that might have _id or id
        const creatorId = (room.creator as any)._id || room.creator.id;
        if (creatorId === user.id) return true;
      }

      // Check if user is a participant
      return room.participants.some(
        (participant) =>
          typeof participant === "object" && participant.id === user.id
      );
    },
    [user]
  );

  // Filter rooms when publicRooms or searchTerm changes
  useEffect(() => {
    if (publicRooms) {
      // First filter by public/private
      const roomsByType = publicRooms.filter((room) => {
        // For public rooms tab
        if (roomType === 0) return room.roomType === RoomType.PUBLIC;

        // For private rooms tab - include if it's private AND either:
        // 1. You are the creator
        // 2. You are invited/participating
        if (roomType === 1) {
          const isPrivate = room.roomType === RoomType.PRIVATE;

          // Check if you're the creator
          const isCreator =
            user &&
            room.creator &&
            typeof room.creator === "object" &&
            (room.creator as any)._id === user.id;

          // Check if you're a participant or invited
          const isParticipant = isUserInRoom(room);

          return isPrivate && (isCreator || isParticipant);
        }

        return false;
      });

      // Then filter by search term
      const filtered = roomsByType.filter((room) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          room.title.toLowerCase().includes(searchLower) ||
          room.description.toLowerCase().includes(searchLower) ||
          room.tags.some((tag) => tag.toLowerCase().includes(searchLower))
        );
      });

      setFilteredRooms(filtered);
      setPage(1); // Reset to first page whenever filters change
    }
  }, [publicRooms, searchTerm, roomType, user, isUserInRoom]);

  const formatDateTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Memoize the join handler
  const handleJoin = useCallback(
    async (room: Room) => {
      try {
        // For closed rooms, just navigate to view the room details
        if (room.status === RoomStatus.CLOSED) {
          navigate(`/rooms/${room._id}`);
          return;
        }

        // If user is already in the room, just navigate to it
        if (isUserInRoom(room)) {
          navigate(`/rooms/${room._id}`);
        } else {
          // Otherwise, join the room first
          await joinRoom(room._id);
          navigate(`/rooms/${room._id}`);
        }
      } catch (error: any) {
        console.error("Error joining room:", error);
        // If we get an "Already joined" error, just navigate to the room
        if (error.response?.data?.message === "Already joined this room") {
          navigate(`/rooms/${room._id}`);
        }
      }
    },
    [joinRoom, navigate, isUserInRoom]
  );

  const handleRoomTypeChange = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setRoomType(newValue);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  // Calculate pagination
  const paginatedRooms = filteredRooms.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);

  if (loading) return <Loading message="Loading rooms..." />;

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
      {/* Page Header */}
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        sx={{
          fontWeight: 700,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0 2px 4px rgba(0,0,0,0.1)",
          textAlign: "center",
          mb: 3,
        }}
      >
        🔍 Explore Rooms
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Discover and join events and meetups. Only showing live and upcoming
        rooms.
      </Typography>

      <ErrorMessage message={error} />

      {/* Room Type Tabs */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: alpha(theme.palette.primary.main, 0.2),
          mb: 4,
          mt: 4,
          background: `linear-gradient(145deg, ${
            theme.palette.background.paper
          } 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          borderRadius: 3,
          p: 1,
          boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`,
        }}
      >
        <Tabs
          value={roomType}
          onChange={handleRoomTypeChange}
          variant="fullWidth"
          sx={{
            "& .MuiTab-root": {
              fontWeight: 700,
              transition: "all 0.3s ease",
              borderRadius: 2,
              mx: 0.5,
              "&.Mui-selected": {
                color: theme.palette.primary.main,
                background: `linear-gradient(135deg, ${alpha(
                  theme.palette.primary.main,
                  0.1
                )} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                transform: "translateY(-1px)",
                boxShadow: `0 4px 12px ${alpha(
                  theme.palette.primary.main,
                  0.2
                )}`,
              },
              "&:hover": {
                background: alpha(theme.palette.primary.main, 0.05),
                transform: "translateY(-1px)",
              },
            },
            "& .MuiTabs-indicator": {
              height: 4,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
            },
          }}
        >
          <Tab label="🌍 Public Rooms" />
          <Tab label="🔒 Private Rooms" />
        </Tabs>
      </Box>

      {/* Search Bar */}
      <Box
        mb={4}
        mt={2}
        sx={{
          p: 3,
          background: `linear-gradient(145deg, ${
            theme.palette.background.paper
          } 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`,
        }}
      >
        <StyledTextField
          fullWidth
          variant="outlined"
          placeholder="🔍 Search by title, description, or tag..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: theme.palette.primary.main }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
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
      </Box>

      <Divider
        sx={{
          mb: 4,
          borderColor:
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.1)",
        }}
      />

      {/* Results count */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="body2" color="text.secondary">
          Showing {filteredRooms.length}{" "}
          {filteredRooms.length === 1 ? "room" : "rooms"}
        </Typography>

        {totalPages > 1 && (
          <Typography variant="body2" color="text.secondary">
            Page {page} of {totalPages}
          </Typography>
        )}
      </Box>

      {/* Rooms List */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {paginatedRooms.length > 0 ? (
          paginatedRooms.map((room) => (
            <RoomCard
              key={room._id}
              room={room}
              onJoin={handleJoin}
              formatDate={formatDateTime}
              isUserInRoom={isUserInRoom(room)}
            />
          ))
        ) : (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              No {roomType === 0 ? "public" : "private"} rooms found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search or check back later for new events.
            </Typography>
          </Box>
        )}
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box
          display="flex"
          justifyContent="center"
          mt={4}
          sx={{
            p: 2,
            background: `linear-gradient(145deg, ${
              theme.palette.background.paper
            } 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`,
          }}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            variant="outlined"
            shape="rounded"
            size="large"
            sx={{
              "& .MuiPaginationItem-root": {
                fontWeight: 600,
                borderRadius: 2,
                "&.Mui-selected": {
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  color: "white",
                  boxShadow: `0 4px 12px ${alpha(
                    theme.palette.primary.main,
                    0.3
                  )}`,
                },
                "&:hover": {
                  background: alpha(theme.palette.primary.main, 0.1),
                },
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

/**
 * Room Card Component for Explore page
 */
const RoomCard = ({
  room,
  onJoin,
  formatDate,
  isUserInRoom,
}: {
  room: Room;
  onJoin: (room: Room) => void;
  formatDate: (date: string | Date) => string;
  isUserInRoom: boolean;
}) => {
  const theme = useMuiTheme();

  const statusColors = {
    [RoomStatus.SCHEDULED]: {
      bg: theme.palette.info.main,
      text: theme.palette.info.contrastText,
    },
    [RoomStatus.LIVE]: {
      bg: theme.palette.success.main,
      text: theme.palette.success.contrastText,
    },
    [RoomStatus.CLOSED]: {
      bg:
        theme.palette.mode === "dark"
          ? alpha(theme.palette.grey[500], 0.2)
          : alpha(theme.palette.grey[500], 0.1),
      text: theme.palette.text.secondary,
    },
  };

  const statusColor =
    statusColors[room.status] || statusColors[RoomStatus.CLOSED];

  const creatorName =
    room.creator && typeof room.creator === "object" && room.creator.username
      ? room.creator.username
      : "Unknown";

  // Determine button text based on user status and room status
  const getButtonText = () => {
    if (isUserInRoom) {
      return room.status === RoomStatus.LIVE ? "Enter Room" : "View Room";
    }
    return room.status === RoomStatus.LIVE ? "Join Now" : "View Details";
  };

  return (
    <StyledCard
      sx={{
        width: "100%",
        position: "relative",
        overflow: "visible",
        background: `linear-gradient(145deg, ${
          theme.palette.background.paper
        } 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`,
        backdropFilter: "blur(10px)",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.15)}`,
          borderColor: alpha(theme.palette.primary.main, 0.2),
        },
        "&::before":
          room.status === RoomStatus.LIVE
            ? {
                content: '""',
                position: "absolute",
                top: -4,
                right: -4,
                width: 12,
                height: 12,
                backgroundColor: "success.main",
                borderRadius: "50%",
                boxShadow: "0 0 0 3px rgba(76, 175, 80, 0.3)",
                animation: "pulse 1.5s infinite",
                "@keyframes pulse": {
                  "0%": {
                    boxShadow: "0 0 0 0 rgba(76, 175, 80, 0.6)",
                  },
                  "70%": {
                    boxShadow: "0 0 0 6px rgba(76, 175, 80, 0)",
                  },
                  "100%": {
                    boxShadow: "0 0 0 0 rgba(76, 175, 80, 0)",
                  },
                },
              }
            : {},
      }}
    >
      {/* Card header with room title and status */}
      <CardContent sx={{ p: 0 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTopLeftRadius: "inherit",
            borderTopRightRadius: "inherit",
            p: 2,
            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            background: `linear-gradient(145deg, ${alpha(
              theme.palette.primary.main,
              0.05
            )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            backdropFilter: "blur(10px)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", maxWidth: "70%" }}>
            <Typography variant="h6" component="h2" fontWeight="600" noWrap>
              {room.title}
            </Typography>
            {room.roomType === RoomType.PRIVATE && (
              <Chip
                label="PRIVATE"
                size="small"
                sx={{
                  ml: 1,
                  backgroundColor: theme.palette.secondary.main,
                  color: theme.palette.secondary.contrastText,
                  fontWeight: 600,
                  fontSize: "0.6rem",
                  height: 20,
                }}
              />
            )}
          </Box>
          <Chip
            label={room.status.toUpperCase()}
            size="small"
            sx={{
              background: `linear-gradient(135deg, ${
                statusColor.bg
              } 0%, ${alpha(statusColor.bg, 0.8)} 100%)`,
              color: statusColor.text,
              fontWeight: 700,
              fontSize: "0.7rem",
              borderRadius: 2,
              boxShadow: `0 2px 8px ${alpha(statusColor.bg, 0.3)}`,
              border: `1px solid ${alpha(statusColor.bg, 0.2)}`,
            }}
          />
        </Box>

        {/* Card content with room details */}
        <Box sx={{ p: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Created by: {creatorName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Max participants: {room.maxParticipants}
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            gutterBottom
            sx={{
              minHeight: "40px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              mb: 2,
            }}
          >
            {room.description}
          </Typography>

          <Stack spacing={1} sx={{ mt: 2 }}>
            <Typography
              variant="body2"
              sx={{ display: "flex", justifyContent: "space-between" }}
            >
              <span style={{ fontWeight: 500 }}>Start:</span>
              <span>{formatDate(room.startTime)}</span>
            </Typography>
            <Typography
              variant="body2"
              sx={{ display: "flex", justifyContent: "space-between" }}
            >
              <span style={{ fontWeight: 500 }}>End:</span>
              <span>{formatDate(room.endTime)}</span>
            </Typography>
          </Stack>

          {/* Room tags */}
          {room.tags.length > 0 && (
            <Box mt={2} display="flex" flexWrap="wrap" gap={0.5}>
              {room.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  sx={{
                    background: `linear-gradient(135deg, ${alpha(
                      theme.palette.primary.main,
                      0.1
                    )} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                    color: theme.palette.primary.main,
                    fontSize: "0.7rem",
                    height: 24,
                    fontWeight: 600,
                    border: `1px solid ${alpha(
                      theme.palette.primary.main,
                      0.2
                    )}`,
                    borderRadius: 2,
                    "&:hover": {
                      background: `linear-gradient(135deg, ${alpha(
                        theme.palette.primary.main,
                        0.15
                      )} 0%, ${alpha(
                        theme.palette.secondary.main,
                        0.15
                      )} 100%)`,
                      transform: "translateY(-1px)",
                    },
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
      </CardContent>

      {/* Card actions */}
      <CardActions sx={{ p: 2, pt: 0 }}>
        <StyledButton
          size="large"
          color="primary"
          variant={
            room.status === RoomStatus.LIVE || isUserInRoom
              ? "contained"
              : "outlined"
          }
          onClick={() => onJoin(room)}
          fullWidth
          sx={{
            mt: 1,
            py: 1.5,
            borderRadius: 3,
            fontWeight: 600,
            fontSize: "0.95rem",
            textTransform: "none",
            transition: "all 0.3s ease",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: "-100%",
              width: "100%",
              height: "100%",
              background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)`,
              transition: "left 0.5s ease",
            },
            "&:hover::before": {
              left: "100%",
            },
            ...(room.status === RoomStatus.LIVE || isUserInRoom
              ? {
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  boxShadow: `0 6px 20px ${alpha(
                    theme.palette.primary.main,
                    0.3
                  )}`,
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: `0 8px 25px ${alpha(
                      theme.palette.primary.main,
                      0.4
                    )}`,
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                  },
                  "&:active": {
                    transform: "translateY(0px)",
                    boxShadow: `0 4px 15px ${alpha(
                      theme.palette.primary.main,
                      0.3
                    )}`,
                  },
                }
              : {
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  color: theme.palette.primary.main,
                  "&:hover": {
                    background: `linear-gradient(135deg, ${alpha(
                      theme.palette.primary.main,
                      0.1
                    )} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                    borderColor: theme.palette.primary.main,
                    transform: "translateY(-1px)",
                    boxShadow: `0 4px 15px ${alpha(
                      theme.palette.primary.main,
                      0.2
                    )}`,
                  },
                }),
            ...(room.status === RoomStatus.CLOSED && {
              opacity: 0.7,
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.grey[500],
                0.1
              )} 0%, ${alpha(theme.palette.grey[500], 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.grey[500], 0.2)}`,
              color: theme.palette.text.secondary,
              "&:hover": {
                background: `linear-gradient(135deg, ${alpha(
                  theme.palette.grey[500],
                  0.15
                )} 0%, ${alpha(theme.palette.grey[500], 0.1)} 100%)`,
                transform: "translateY(-1px)",
              },
            }),
          }}
        >
          {room.status === RoomStatus.LIVE && "�� "}
          {room.status === RoomStatus.SCHEDULED && "⏰ "}
          {room.status === RoomStatus.CLOSED && "📋 "}
          {getButtonText()}
        </StyledButton>
      </CardActions>
    </StyledCard>
  );
};

export default Explore;
