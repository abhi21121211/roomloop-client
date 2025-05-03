import React, { useState } from "react";
import {
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Divider,
  Button,
  ListItemAvatar,
  Avatar,
  ListSubheader,
  Tooltip,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  LiveTv as LiveTvIcon,
  MailOutline as MailOutlineIcon,
  AccessTime as AccessTimeIcon,
  Close as CloseIcon,
  DoNotDisturbOff as EmptyIcon,
  DoneAll as DoneAllIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  useNotifications,
  Notification,
} from "../../contexts/NotificationContext";
import { useTheme } from "../../contexts/ThemeContext";

const NotificationBell: React.FC = () => {
  const {
    notifications,
    totalUnread,
    markAsRead,
    markAllAsRead,
    dismissNotification,
  } = useNotifications();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const navigate = useNavigate();
  const { actualTheme } = useTheme();
  const isDark = actualTheme === "dark";

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    navigate(`/room/${notification.roomId}`);
    handleClose();
  };

  console.log(notifications, "fffffffffff notification");

  const getNotificationIcon = (type: "invite" | "live" | "upcoming") => {
    switch (type) {
      case "invite":
        return <MailOutlineIcon color="secondary" />;
      case "live":
        return <LiveTvIcon style={{ color: "#4caf50" }} />;
      case "upcoming":
        return <AccessTimeIcon color="primary" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getNotificationColor = (type: "invite" | "live" | "upcoming") => {
    switch (type) {
      case "invite":
        return isDark ? "#9c27b0" : "#e1bee7";
      case "live":
        return isDark ? "#4caf50" : "#c8e6c9";
      case "upcoming":
        return isDark ? "#2196f3" : "#bbdefb";
      default:
        return "inherit";
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? "notification-popover" : undefined;

  return (
    <>
      <IconButton
        size="large"
        aria-label={`show ${totalUnread} new notifications`}
        color="inherit"
        onClick={handleClick}
        sx={{
          position: "relative",
          transition: "transform 0.2s",
          "&:hover": {
            transform: "scale(1.05)",
          },
        }}
      >
        <Badge
          badgeContent={totalUnread}
          color="error"
          overlap="circular"
          sx={{
            "& .MuiBadge-badge": {
              right: -3,
              top: 3,
              padding: "0 4px",
              height: 16,
              minWidth: 16,
              fontSize: "0.65rem",
            },
          }}
        >
          {totalUnread > 0 ? (
            <NotificationsActiveIcon
              sx={{
                animation: totalUnread > 0 ? "pulse 1.5s infinite" : "none",
                "@keyframes pulse": {
                  "0%": { opacity: 1 },
                  "50%": { opacity: 0.6 },
                  "100%": { opacity: 1 },
                },
              }}
            />
          ) : (
            <NotificationsIcon />
          )}
        </Badge>
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{
          "& .MuiPopover-paper": {
            width: 320,
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
          {totalUnread > 0 && (
            <Tooltip title="Mark all as read">
              <IconButton onClick={markAllAsRead} size="small">
                <DoneAllIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Divider />

        {notifications.length > 0 ? (
          <List sx={{ p: 0, maxHeight: 360, overflow: "auto" }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                alignItems="flex-start"
                sx={{
                  px: 2,
                  pt: 1.5,
                  pb: 1.5,
                  cursor: "pointer",
                  borderLeft: notification.isRead
                    ? "none"
                    : `4px solid ${getNotificationColor(notification.type)}`,
                  backgroundColor: notification.isRead
                    ? "transparent"
                    : (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.05)"
                          : "rgba(0, 0, 0, 0.02)",
                  "&:hover": {
                    backgroundColor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.04)",
                  },
                }}
                onClick={() => handleNotificationClick(notification)}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="dismiss"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissNotification(notification.id);
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: getNotificationColor(notification.type),
                      color: (theme) =>
                        theme.palette.getContrastText(
                          getNotificationColor(notification.type)
                        ),
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: notification.isRead ? 400 : 600 }}
                    >
                      {notification.title}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(notification.timestamp).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </Typography>
                    </>
                  }
                  sx={{ m: 0 }}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box
            sx={{
              py: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.7,
            }}
          >
            <EmptyIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
            <Typography color="textSecondary">No notifications</Typography>
          </Box>
        )}

        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1.5, display: "flex", justifyContent: "center" }}>
              <Button
                variant="text"
                size="small"
                onClick={() => navigate("/dashboard")}
                sx={{ textTransform: "none" }}
              >
                View all rooms
              </Button>
            </Box>
          </>
        )}
      </Popover>
    </>
  );
};

export default NotificationBell;
