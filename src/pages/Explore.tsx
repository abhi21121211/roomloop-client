import React, { useEffect, useState, useCallback } from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Grid,
  Divider,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useRoom } from "../contexts/RoomContext";
import { Room, RoomStatus } from "../types";
import MainLayout from "../components/layout/MainLayout";
import Loading from "../components/common/Loading";
import ErrorMessage from "../components/common/ErrorMessage";
import GridItem from "../components/common/GridItem";

const Explore: React.FC = () => {
  const { publicRooms, loading, error, fetchPublicRooms, joinRoom } = useRoom();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const navigate = useNavigate();

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

  // Memoize the join handler
  const handleJoin = useCallback(
    async (roomId: string) => {
      try {
        await joinRoom(roomId);
        navigate(`/rooms/${roomId}`);
      } catch (error) {
        console.error("Error joining room:", error);
      }
    },
    [joinRoom, navigate]
  );

  if (loading) return <Loading message="Loading public rooms..." />;

  return (
    <MainLayout>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Explore Public Rooms
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Discover and join public events and meetups.
        </Typography>

        <ErrorMessage message={error} />

        {/* Search Bar */}
        <Box mb={4} mt={2}>
          <TextField
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

        <Divider sx={{ mb: 4 }} />

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
    </MainLayout>
  );
};

// Room Card Component
const RoomCard = ({
  room,
  onJoin,
  formatDate,
}: {
  room: Room;
  onJoin: (roomId: string) => void;
  formatDate: (date: string | Date) => string;
}) => {
  const statusColor = {
    [RoomStatus.SCHEDULED]: "info",
    [RoomStatus.LIVE]: "success",
    [RoomStatus.CLOSED]: "default",
  }[room.status] as "info" | "success" | "default";

  const creatorName =
    typeof room.creator === "object" ? room.creator.username : "Unknown";

  return (
    <Card variant="outlined">
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6" component="h2">
            {room.title}
          </Typography>
          <Chip
            label={room.status.toUpperCase()}
            color={statusColor}
            size="small"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          {room.description}
        </Typography>

        <Grid container spacing={2}>
          <GridItem xs={12} md={4}>
            <Typography variant="body2">
              <strong>Host:</strong> {creatorName}
            </Typography>
          </GridItem>
          <GridItem xs={12} md={4}>
            <Typography variant="body2">
              <strong>Start:</strong> {formatDate(room.startTime)}
            </Typography>
          </GridItem>
          <GridItem xs={12} md={4}>
            <Typography variant="body2">
              <strong>End:</strong> {formatDate(room.endTime)}
            </Typography>
          </GridItem>
        </Grid>

        {room.tags.length > 0 && (
          <Box mt={2} display="flex" flexWrap="wrap" gap={0.5}>
            {room.tags.map((tag, index) => (
              <Chip key={index} label={tag} size="small" variant="outlined" />
            ))}
          </Box>
        )}
      </CardContent>

      <CardActions>
        <Button
          size="small"
          color="primary"
          onClick={() => onJoin(room._id)}
          disabled={room.status === RoomStatus.CLOSED}
          variant={room.status === RoomStatus.LIVE ? "contained" : "outlined"}
        >
          {room.status === RoomStatus.LIVE ? "Join Now" : "View Details"}
        </Button>

        {room.maxParticipants && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ ml: "auto" }}
          >
            {room.participants.length}/{room.maxParticipants} participants
          </Typography>
        )}
      </CardActions>
    </Card>
  );
};

export default Explore;
