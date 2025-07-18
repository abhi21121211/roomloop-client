import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Grid,
  CardContent,
  CardActions,
  Chip,
  Divider,
  Stack,
  alpha,
  useTheme as useMuiTheme,
  Tabs,
  Tab,
  Pagination,
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
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchUserRooms();
  }, [fetchUserRooms]);

  useEffect(() => {
    // Reset pagination when tab changes
    setPage(1);
  }, [tabValue]);

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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
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
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "visible",
          background: `linear-gradient(145deg, ${
            theme.palette.background.paper
          } 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
          transition: "all 0.3s ease-in-out",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.15)}`,
          },
          "&::before":
            room.status === RoomStatus.LIVE
              ? {
                  content: '""',
                  position: "absolute",
                  top: -6,
                  right: -6,
                  width: 16,
                  height: 16,
                  background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.light} 100%)`,
                  borderRadius: "50%",
                  boxShadow: `0 0 0 4px ${alpha(
                    theme.palette.success.main,
                    0.3
                  )}`,
                  animation: "pulse 1.5s infinite",
                  zIndex: 1,
                  "@keyframes pulse": {
                    "0%": {
                      boxShadow: `0 0 0 0 ${alpha(
                        theme.palette.success.main,
                        0.6
                      )}`,
                    },
                    "70%": {
                      boxShadow: `0 0 0 8px ${alpha(
                        theme.palette.success.main,
                        0
                      )}`,
                    },
                    "100%": {
                      boxShadow: `0 0 0 0 ${alpha(
                        theme.palette.success.main,
                        0
                      )}`,
                    },
                  },
                }
              : {},
        }}
      >
        {/* Card header with title and status */}
        <CardContent sx={{ p: 0, flexGrow: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTopLeftRadius: "inherit",
              borderTopRightRadius: "inherit",
              p: 2.5,
              borderBottom: `1px solid ${alpha(
                theme.palette.primary.main,
                0.1
              )}`,
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.1
              )} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
              backdropFilter: "blur(10px)",
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
              size="medium"
              sx={{
                background: `linear-gradient(135deg, ${
                  statusColor.bg
                } 0%, ${alpha(statusColor.bg, 0.8)} 100%)`,
                color: statusColor.text,
                fontWeight: 700,
                fontSize: "0.75rem",
                px: 1.5,
                py: 0.5,
                boxShadow: `0 4px 12px ${alpha(
                  theme.palette.common.black,
                  0.15
                )}`,
                "& .MuiChip-label": {
                  px: 1,
                },
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
        <CardActions sx={{ p: 2.5, pt: 0 }}>
          <StyledButton
            size="medium"
            color="primary"
            variant={room.status === RoomStatus.LIVE ? "contained" : "outlined"}
            onClick={() => handleJoinRoom(room._id)}
            // disabled={room.status === RoomStatus.CLOSED}
            fullWidth
            sx={{
              mt: 1,
              opacity: room.status === RoomStatus.CLOSED ? 0.6 : 1,
              borderRadius: 3,
              py: 1.5,
              fontWeight: 600,
              background:
                room.status === RoomStatus.LIVE
                  ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                  : undefined,
              boxShadow:
                room.status === RoomStatus.LIVE
                  ? "0 6px 20px rgba(0,0,0,0.15)"
                  : undefined,
              transition: "all 0.3s ease",
              "&:hover": {
                transform:
                  room.status === RoomStatus.LIVE
                    ? "translateY(-2px)"
                    : undefined,
                boxShadow:
                  room.status === RoomStatus.LIVE
                    ? "0 8px 25px rgba(0,0,0,0.2)"
                    : undefined,
              },
            }}
          >
            {room.status === RoomStatus.LIVE ? "🚀 Join Now" : "👁️ View"}
          </StyledButton>
        </CardActions>
      </StyledCard>
    );
  };

  /**
   * Empty Message Component
   */
  const EmptyMessage = ({ message }: { message: string }) => (
    <Box py={4} display="flex" justifyContent="center" width="100%">
      <Typography variant="body1" color="text.secondary" textAlign="center">
        {message}
      </Typography>
    </Box>
  );

  if (loading) return <Loading message="Loading your rooms..." />;

  // Filter rooms based on the selected tab
  const getFilteredRooms = () => {
    switch (tabValue) {
      case 0: // All rooms
        return [
          ...rooms.live,
          ...rooms.upcoming,
          ...rooms.past,
          ...rooms.invites,
        ];
      case 1: // Live rooms
        return rooms.live;
      case 2: // Upcoming rooms
        return rooms.upcoming;
      case 3: // Past rooms
        return rooms.past;
      case 4: // Invitations
        return rooms.invites;
      default:
        return [];
    }
  };

  const filteredRooms = getFilteredRooms();

  // Calculate pagination
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const displayedRooms = filteredRooms.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

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
      {/* Dashboard Header */}
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
        🚀 Your Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage your upcoming, live, and past events.
      </Typography>

      <ErrorMessage message={error} />

      {/* Room Filter Tabs */}
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
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
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
          <Tab label="All Rooms" />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {rooms.live.length > 0 && (
                  <Box
                    component="span"
                    sx={{
                      backgroundColor: "success.main",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      display: "inline-block",
                      mr: 1,
                      animation: "pulse 1.5s infinite",
                    }}
                  />
                )}
                Live
              </Box>
            }
          />
          <Tab label="Upcoming" />
          <Tab label="Past" />
          <Tab
            label={`Invitations${
              rooms.invites.length > 0 ? ` (${rooms.invites.length})` : ""
            }`}
            disabled={rooms.invites.length === 0}
          />
        </Tabs>
      </Box>

      {/* Room Grid */}
      {displayedRooms.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {displayedRooms.map((room, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={`room-${room._id}-${index}`}
              >
                <RoomCard room={room} />
              </Grid>
            ))}
          </Grid>

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
                boxShadow: `0 4px 20px ${alpha(
                  theme.palette.common.black,
                  0.08
                )}`,
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
        </>
      ) : (
        <EmptyMessage
          message={`No ${
            tabValue === 0
              ? ""
              : tabValue === 1
              ? "live"
              : tabValue === 2
              ? "upcoming"
              : tabValue === 3
              ? "past"
              : "invitation"
          } rooms found`}
        />
      )}
    </Box>
  );
};

export default Dashboard;
