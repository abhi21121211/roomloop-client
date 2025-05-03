import React, { useEffect } from "react";
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useRoom } from "../contexts/RoomContext";
import { Room, RoomStatus } from "../types";
import MainLayout from "../components/layout/MainLayout";
import Loading from "../components/common/Loading";
import ErrorMessage from "../components/common/ErrorMessage";
import GridItem from "../components/common/GridItem";

const Dashboard: React.FC = () => {
  const { rooms, loading, error, fetchUserRooms } = useRoom();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserRooms();
  }, [fetchUserRooms]);

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleJoinRoom = (roomId: string) => {
    navigate(`/rooms/${roomId}`);
  };

  // Render a single room card
  const RoomCard = ({ room }: { room: Room }) => {
    const statusColor = {
      [RoomStatus.SCHEDULED]: "info",
      [RoomStatus.LIVE]: "success",
      [RoomStatus.CLOSED]: "default",
    }[room.status] as "info" | "success" | "default";

    return (
      <Card variant="outlined" sx={{ mb: 2, width: "100%" }}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={1}
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
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {room.description}
          </Typography>
          <Box mt={2}>
            <Typography variant="body2">
              <strong>Start:</strong> {formatDate(room.startTime)}
            </Typography>
            <Typography variant="body2">
              <strong>End:</strong> {formatDate(room.endTime)}
            </Typography>
            <Typography variant="body2">
              <strong>Room Code:</strong> {room.code}
            </Typography>
          </Box>
          {room.tags.length > 0 && (
            <Box mt={1} display="flex" flexWrap="wrap" gap={0.5}>
              {room.tags.map((tag, index) => (
                <Chip key={index} label={tag} size="small" />
              ))}
            </Box>
          )}
        </CardContent>
        <CardActions>
          <Button
            size="small"
            color="primary"
            onClick={() => handleJoinRoom(room._id)}
            disabled={room.status === RoomStatus.CLOSED}
          >
            {room.status === RoomStatus.LIVE ? "Join Now" : "View"}
          </Button>
        </CardActions>
      </Card>
    );
  };

  // Show empty message if no rooms in a category
  const EmptyMessage = ({ message }: { message: string }) => (
    <Box py={2}>
      <Typography variant="body1" color="text.secondary" textAlign="center">
        {message}
      </Typography>
    </Box>
  );

  if (loading) return <Loading message="Loading your rooms..." />;

  return (
    <MainLayout>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Your Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Manage your upcoming, live, and past events.
        </Typography>

        <ErrorMessage message={error} />

        <Grid container spacing={4} sx={{ mt: 2 }}>
          {/* Live Rooms */}
          <GridItem xs={12} md={4}>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Box
                component="span"
                sx={{
                  backgroundColor: "success.main",
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  display: "inline-block",
                  mr: 1,
                }}
              />
              Live Now
            </Typography>
            <Divider />
            {rooms.live.length > 0 ? (
              <List>
                {rooms.live.map((room) => (
                  <ListItem key={room._id} disablePadding sx={{ mb: 2 }}>
                    <RoomCard room={room} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <EmptyMessage message="No live rooms" />
            )}
          </GridItem>

          {/* Upcoming Rooms */}
          <GridItem xs={12} md={4}>
            <Typography variant="h5" component="h2" gutterBottom>
              Upcoming
            </Typography>
            <Divider />
            {rooms.upcoming.length > 0 ? (
              <List>
                {rooms.upcoming.map((room) => (
                  <ListItem key={room._id} disablePadding sx={{ mb: 2 }}>
                    <RoomCard room={room} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <EmptyMessage message="No upcoming rooms" />
            )}
          </GridItem>

          {/* Past Rooms */}
          <GridItem xs={12} md={4}>
            <Typography variant="h5" component="h2" gutterBottom>
              Past
            </Typography>
            <Divider />
            {rooms.past.length > 0 ? (
              <List>
                {rooms.past.map((room) => (
                  <ListItem key={room._id} disablePadding sx={{ mb: 2 }}>
                    <RoomCard room={room} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <EmptyMessage message="No past rooms" />
            )}
          </GridItem>
        </Grid>

        {/* Invitations */}
        {rooms.invites.length > 0 && (
          <Box mt={4}>
            <Typography variant="h5" component="h2" gutterBottom>
              Room Invitations
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {rooms.invites.map((room) => (
                <GridItem xs={12} sm={6} md={4} key={room._id}>
                  <RoomCard room={room} />
                </GridItem>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </MainLayout>
  );
};

export default Dashboard;
