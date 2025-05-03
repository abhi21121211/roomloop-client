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
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useRoom } from "../contexts/RoomContext";
import { Room, RoomStatus } from "../types";
import Loading from "../components/common/Loading";
import ErrorMessage from "../components/common/ErrorMessage";
import GridItem from "../components/common/GridItem";
import { useAuth } from "../contexts/AuthContext";
import StyledTextField from "../components/common/StyledTextField";
import StyledCard from "../components/common/StyledCard";
import StyledButton from "../components/common/StyledButton";

/**
 * Explore Component - Browse and join public rooms
 */
const Explore = () => {
  const { publicRooms, loading, error, fetchPublicRooms, joinRoom } = useRoom();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useMuiTheme();

  // Fetch public rooms only once when component mounts
  useEffect(() => {
    fetchPublicRooms();
  }, [fetchPublicRooms]); // fetchPublicRooms is memoized with useCallback

  // Filter rooms when publicRooms or searchTerm changes
  useEffect(() => {
    if (publicRooms) {
      const filtered = publicRooms.filter((room) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          room.title.toLowerCase().includes(searchLower) ||
          room.description.toLowerCase().includes(searchLower) ||
          room.tags.some((tag) => tag.toLowerCase().includes(searchLower))
        );
      });
      setFilteredRooms(filtered);
    }
  }, [publicRooms, searchTerm]);

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

  // Check if the user is already part of the room
  const isUserInRoom = (room: Room) => {
    if (!user) return false;

    // Check if user is the creator
    if (typeof room.creator === "object") {
      // Handle the case where creator is an object that might have _id or id
      const creatorId = (room.creator as any)._id || room.creator.id;
      if (creatorId === user.id) return true;
    }

    // Check if user is a participant
    return room.participants.some(
      (participant) =>
        typeof participant === "object" && participant.id === user.id
    );
  };

  // Memoize the join handler
  const handleJoin = useCallback(
    async (room: Room) => {
      try {
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
    [joinRoom, navigate, user]
  );

  if (loading) return <Loading message="Loading public rooms..." />;

  return (
    <Box mb={4}>
      {/* Page Header */}
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        fontWeight="bold"
        color="primary"
        sx={{
          backgroundImage:
            theme.palette.mode === "dark"
              ? "linear-gradient(45deg, #7986cb 30%, #5c6bc0 90%)"
              : "linear-gradient(45deg, #3f51b5 30%, #303f9f 90%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        Explore Public Rooms
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Discover and join public events and meetups.
      </Typography>

      <ErrorMessage message={error} />

      {/* Search Bar */}
      <Box mb={4} mt={2}>
        <StyledTextField
          fullWidth
          variant="outlined"
          placeholder="Search by title, description, or tag"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
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
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Showing {filteredRooms.length}{" "}
        {filteredRooms.length === 1 ? "room" : "rooms"}
      </Typography>

      {/* Rooms Grid */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room) => (
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
              No rooms found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search or check back later for new events.
            </Typography>
          </Box>
        )}
      </Box>
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
    typeof room.creator === "object" ? room.creator.username : "Unknown";

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
            borderBottom: `1px solid ${
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.05)"
            }`,
            bgcolor:
              theme.palette.mode === "dark"
                ? "rgba(15, 15, 15, 0.6)"
                : "rgba(245, 245, 245, 0.5)",
          }}
        >
          <Typography
            variant="h6"
            component="h2"
            fontWeight="600"
            noWrap
            sx={{ maxWidth: "70%" }}
          >
            {room.title}
          </Typography>
          <Chip
            label={room.status.toUpperCase()}
            size="small"
            sx={{
              backgroundColor: statusColor.bg,
              color: statusColor.text,
              fontWeight: 600,
              fontSize: "0.7rem",
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
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    fontSize: "0.7rem",
                    height: 24,
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
          size="small"
          color="primary"
          variant={
            room.status === RoomStatus.LIVE || isUserInRoom
              ? "contained"
              : "outlined"
          }
          onClick={() => onJoin(room)}
          disabled={room.status === RoomStatus.CLOSED}
          fullWidth
          sx={{
            mt: 1,
            opacity: room.status === RoomStatus.CLOSED ? 0.6 : 1,
          }}
        >
          {getButtonText()}
        </StyledButton>
      </CardActions>
    </StyledCard>
  );
};

export default Explore;
