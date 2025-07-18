import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Avatar,
  Chip,
  Divider,
  alpha,
  useTheme as useMuiTheme,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Groups as GroupsIcon,
  Event as EventIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useRoom } from "../contexts/RoomContext";
import { Room, RoomStatus } from "../types";
import Loading from "../components/common/Loading";
import ErrorMessage from "../components/common/ErrorMessage";
import StyledTextField from "../components/common/StyledTextField";
import StyledButton from "../components/common/StyledButton";
import StyledCard from "../components/common/StyledCard";

const Profile: React.FC = () => {
  const { user, updateProfile, loading: authLoading } = useAuth();
  const { userRooms, loading: roomsLoading, fetchUserRooms } = useRoom();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "",
  });
  const [error, setError] = useState("");
  const theme = useMuiTheme();

  useEffect(() => {
    if (user) {
      fetchUserRooms();
    }
  }, [user, fetchUserRooms]);

  const handleEdit = () => {
    setEditData({
      username: user?.username || "",
      email: user?.email || "",
      bio: user?.bio || "",
    });
    setIsEditing(true);
    setError("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError("");
  };

  const handleSave = async () => {
    try {
      await updateProfile(editData);
      setIsEditing(false);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case RoomStatus.LIVE:
        return "success";
      case RoomStatus.SCHEDULED:
        return "info";
      case RoomStatus.CLOSED:
        return "default";
      default:
        return "default";
    }
  };

  const getStatusText = (status: RoomStatus) => {
    switch (status) {
      case RoomStatus.LIVE:
        return "🟢 Live";
      case RoomStatus.SCHEDULED:
        return "⏰ Scheduled";
      case RoomStatus.CLOSED:
        return "🔴 Closed";
      default:
        return "Unknown";
    }
  };

  if (authLoading || roomsLoading) {
    return <Loading message="Loading profile..." />;
  }

  if (!user) {
    return <ErrorMessage message="User not found" />;
  }

  const stats = {
    totalRooms: userRooms?.length || 0,
    liveRooms:
      userRooms?.filter((room: Room) => room.status === RoomStatus.LIVE)
        .length || 0,
    scheduledRooms:
      userRooms?.filter((room: Room) => room.status === RoomStatus.SCHEDULED)
        .length || 0,
    closedRooms:
      userRooms?.filter((room: Room) => room.status === RoomStatus.CLOSED)
        .length || 0,
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.05
        )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        py: 2,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
            textAlign: "center",
            mb: 4,
          }}
        >
          👤 User Profile
        </Typography>

        <ErrorMessage message={error} />

        <Grid container spacing={4}>
          {/* Profile Header */}
          <Grid item xs={12}>
            <StyledCard
              sx={{
                background: `linear-gradient(145deg, ${
                  theme.palette.background.paper
                } 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                boxShadow: `0 8px 32px ${alpha(
                  theme.palette.common.black,
                  0.1
                )}`,
                backdropFilter: "blur(10px)",
                p: 4,
                position: "relative",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: "3rem",
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    boxShadow: `0 8px 25px ${alpha(
                      theme.palette.primary.main,
                      0.3
                    )}`,
                    mr: 3,
                  }}
                >
                  {user.username?.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    {user.username}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 1,
                    }}
                  >
                    <EmailIcon color="action" />
                    <Typography variant="body1" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <CalendarIcon color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Member since {formatDate(user.createdAt || new Date())}
                    </Typography>
                  </Box>
                </Box>
                <Tooltip title={isEditing ? "Save changes" : "Edit profile"}>
                  <IconButton
                    onClick={isEditing ? handleSave : handleEdit}
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      color: "white",
                      "&:hover": {
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    {isEditing ? <SaveIcon /> : <EditIcon />}
                  </IconButton>
                </Tooltip>
                {isEditing && (
                  <Tooltip title="Cancel">
                    <IconButton
                      onClick={handleCancel}
                      sx={{
                        ml: 1,
                        border: `2px solid ${theme.palette.error.main}`,
                        color: theme.palette.error.main,
                        "&:hover": {
                          background: alpha(theme.palette.error.main, 0.1),
                        },
                      }}
                    >
                      <CancelIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              {isEditing ? (
                <Box sx={{ mt: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        fullWidth
                        label="Username"
                        name="username"
                        value={editData.username}
                        onChange={handleChange}
                        placeholder="Enter your username"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={editData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <StyledTextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Bio"
                        name="bio"
                        value={editData.bio}
                        onChange={handleChange}
                        placeholder="Tell us about yourself..."
                      />
                    </Grid>
                  </Grid>
                </Box>
              ) : (
                <Box sx={{ mt: 3 }}>
                  {user.bio && (
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {user.bio}
                    </Typography>
                  )}
                </Box>
              )}
            </StyledCard>
          </Grid>

          {/* Stats Cards */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    background: `linear-gradient(145deg, ${alpha(
                      theme.palette.primary.main,
                      0.1
                    )} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                    border: `1px solid ${alpha(
                      theme.palette.primary.main,
                      0.2
                    )}`,
                    textAlign: "center",
                    p: 2,
                  }}
                >
                  <CardContent>
                    <EventIcon
                      sx={{
                        fontSize: 40,
                        color: theme.palette.primary.main,
                        mb: 1,
                      }}
                    />
                    <Typography variant="h4" fontWeight={700} color="primary">
                      {stats.totalRooms}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Rooms
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    background: `linear-gradient(145deg, ${alpha(
                      theme.palette.success.main,
                      0.1
                    )} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                    border: `1px solid ${alpha(
                      theme.palette.success.main,
                      0.2
                    )}`,
                    textAlign: "center",
                    p: 2,
                  }}
                >
                  <CardContent>
                    <GroupsIcon
                      sx={{
                        fontSize: 40,
                        color: theme.palette.success.main,
                        mb: 1,
                      }}
                    />
                    <Typography
                      variant="h4"
                      fontWeight={700}
                      color="success.main"
                    >
                      {stats.liveRooms}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Live Rooms
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    background: `linear-gradient(145deg, ${alpha(
                      theme.palette.info.main,
                      0.1
                    )} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                    textAlign: "center",
                    p: 2,
                  }}
                >
                  <CardContent>
                    <CalendarIcon
                      sx={{
                        fontSize: 40,
                        color: theme.palette.info.main,
                        mb: 1,
                      }}
                    />
                    <Typography variant="h4" fontWeight={700} color="info.main">
                      {stats.scheduledRooms}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Scheduled
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    background: `linear-gradient(145deg, ${alpha(
                      theme.palette.grey[500],
                      0.1
                    )} 0%, ${alpha(theme.palette.grey[500], 0.05)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.grey[500], 0.2)}`,
                    textAlign: "center",
                    p: 2,
                  }}
                >
                  <CardContent>
                    <PersonIcon
                      sx={{
                        fontSize: 40,
                        color: theme.palette.grey[500],
                        mb: 1,
                      }}
                    />
                    <Typography
                      variant="h4"
                      fontWeight={700}
                      color="text.secondary"
                    >
                      {stats.closedRooms}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Closed
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* User's Rooms */}
          <Grid item xs={12}>
            <StyledCard
              sx={{
                background: `linear-gradient(145deg, ${
                  theme.palette.background.paper
                } 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                boxShadow: `0 8px 32px ${alpha(
                  theme.palette.common.black,
                  0.1
                )}`,
                backdropFilter: "blur(10px)",
                p: 4,
              }}
            >
              <Typography
                variant="h5"
                fontWeight={600}
                gutterBottom
                sx={{ mb: 3 }}
              >
                🏠 My Rooms
              </Typography>

              {userRooms && userRooms.length > 0 ? (
                <Grid container spacing={3}>
                  {userRooms.map((room: Room) => (
                    <Grid item xs={12} sm={6} md={4} key={room._id}>
                      <Card
                        sx={{
                          height: "100%",
                          background: `linear-gradient(145deg, ${
                            theme.palette.background.paper
                          } 0%, ${alpha(
                            theme.palette.primary.main,
                            0.02
                          )} 100%)`,
                          border: `1px solid ${alpha(
                            theme.palette.primary.main,
                            0.1
                          )}`,
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: `0 12px 40px ${alpha(
                              theme.palette.common.black,
                              0.15
                            )}`,
                          },
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            gutterBottom
                          >
                            {room.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                          >
                            {room.description}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 1,
                              mb: 2,
                            }}
                          >
                            {room.tags
                              .slice(0, 3)
                              .map((tag: string, index: number) => (
                                <Chip
                                  key={index}
                                  label={tag}
                                  size="small"
                                  sx={{
                                    background: `linear-gradient(135deg, ${alpha(
                                      theme.palette.primary.main,
                                      0.1
                                    )} 0%, ${alpha(
                                      theme.palette.secondary.main,
                                      0.1
                                    )} 100%)`,
                                    border: `1px solid ${alpha(
                                      theme.palette.primary.main,
                                      0.2
                                    )}`,
                                  }}
                                />
                              ))}
                          </Box>
                          <Chip
                            label={getStatusText(room.status)}
                            color={getStatusColor(room.status) as any}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No rooms created yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Start by creating your first room!
                  </Typography>
                </Box>
              )}
            </StyledCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Profile;
