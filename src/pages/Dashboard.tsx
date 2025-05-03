import React, { useEffect } from "react";
import {
  Typography,
  Box,
  Grid,
  CardContent,
  CardActions,
  Chip,
  Divider,
  List,
  ListItem,
  Stack,
  alpha,
  useTheme as useMuiTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useRoom } from "../contexts/RoomContext";
import { Room, RoomStatus } from "../types";
import Loading from "../components/common/Loading";
import ErrorMessage from "../components/common/ErrorMessage";
import GridItem from "../components/common/GridItem";
import StyledCard from "../components/common/StyledCard";
import StyledButton from "../components/common/StyledButton";

/**
 * Dashboard Component
 */
const Dashboard = () => {
  const { rooms, loading, error, fetchUserRooms } = useRoom();
  const navigate = useNavigate();
  const theme = useMuiTheme();

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

  /**
   * Room Card Component
   */
  const RoomCard = ({ room }: { room: Room }) => {
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
        {/* Card header with title and status */}
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
              <Typography
                variant="body2"
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <span style={{ fontWeight: 500 }}>Room Code:</span>
                <span style={{ fontFamily: "monospace", letterSpacing: 1 }}>
                  {room.code}
                </span>
              </Typography>
            </Stack>

            {/* Tags */}
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
            variant={room.status === RoomStatus.LIVE ? "contained" : "outlined"}
            onClick={() => handleJoinRoom(room._id)}
            disabled={room.status === RoomStatus.CLOSED}
            fullWidth
            sx={{
              mt: 1,
              opacity: room.status === RoomStatus.CLOSED ? 0.6 : 1,
            }}
          >
            {room.status === RoomStatus.LIVE ? "Join Now" : "View"}
          </StyledButton>
        </CardActions>
      </StyledCard>
    );
  };

  /**
   * Empty Message Component
   */
  const EmptyMessage = ({ message }: { message: string }) => (
    <Box py={2}>
      <Typography variant="body1" color="text.secondary" textAlign="center">
        {message}
      </Typography>
    </Box>
  );

  if (loading) return <Loading message="Loading your rooms..." />;

  return (
    <Box mb={4}>
      {/* Dashboard Header */}
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
        Your Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage your upcoming, live, and past events.
      </Typography>

      <ErrorMessage message={error} />

      {/* Room Categories Grid */}
      <Grid container spacing={4} sx={{ mt: 2 }}>
        {/* Live Rooms */}
        <GridItem xs={12} md={4}>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{
              display: "flex",
              alignItems: "center",
              fontWeight: 600,
              color:
                theme.palette.mode === "dark"
                  ? theme.palette.success.light
                  : theme.palette.success.main,
            }}
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
              }}
            />
            Live Now
          </Typography>
          <Divider
            sx={{
              borderColor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.1)",
              mb: 2,
            }}
          />
          {rooms.live.length > 0 ? (
            <List>
              {rooms.live.map((room, index) => (
                <ListItem
                  key={`live-${room._id}-${index}`}
                  disablePadding
                  sx={{ mb: 3 }}
                >
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
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 600,
              color:
                theme.palette.mode === "dark"
                  ? theme.palette.info.light
                  : theme.palette.info.main,
            }}
          >
            Upcoming
          </Typography>
          <Divider
            sx={{
              borderColor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.1)",
              mb: 2,
            }}
          />
          {rooms.upcoming.length > 0 ? (
            <List>
              {rooms.upcoming.map((room, index) => (
                <ListItem
                  key={`upcoming-${room._id}-${index}`}
                  disablePadding
                  sx={{ mb: 3 }}
                >
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
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 600,
              color: theme.palette.text.secondary,
            }}
          >
            Past
          </Typography>
          <Divider
            sx={{
              borderColor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.1)",
              mb: 2,
            }}
          />
          {rooms.past.length > 0 ? (
            <List>
              {rooms.past.map((room, index) => (
                <ListItem
                  key={`past-${room._id}-${index}`}
                  disablePadding
                  sx={{ mb: 3 }}
                >
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
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 600,
              color:
                theme.palette.mode === "dark"
                  ? theme.palette.secondary.light
                  : theme.palette.secondary.main,
            }}
          >
            Room Invitations
          </Typography>
          <Divider
            sx={{
              borderColor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.1)",
              mb: 2,
            }}
          />
          <Grid container spacing={2}>
            {rooms.invites.map((room, index) => (
              <GridItem
                xs={12}
                sm={6}
                md={4}
                key={`invite-${room._id}-${index}`}
              >
                <RoomCard room={room} />
              </GridItem>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;
