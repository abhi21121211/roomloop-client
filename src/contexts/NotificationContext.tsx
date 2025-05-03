import React, { createContext, useContext, useState, useEffect } from "react";
import { useRoom } from "./RoomContext";
import { useAuth } from "./AuthContext";
import { Room } from "../types";
import socketService from "../services/socket";

export interface Notification {
  id: string;
  type: "invite" | "live" | "upcoming";
  title: string;
  message: string;
  timestamp: Date;
  roomId: string;
  isRead: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  totalUnread: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (notificationId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { rooms } = useRoom();
  const { isAuthenticated, user } = useAuth();

  // Calculate total unread notifications
  const totalUnread = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  // Initialize socket connection and listen for events
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Initialize socket
    const socket = socketService.initSocket();

    // Listen for room invitation events
    socket.on(
      "room_invitation",
      (data: { roomId: string; roomTitle: string }) => {
        // Add a new notification for the invite
        const newNotification: Notification = {
          id: `socket-invite-${data.roomId}-${Date.now()}`,
          type: "invite",
          title: "New Room Invitation",
          message: `You've been invited to join "${data.roomTitle}"`,
          timestamp: new Date(),
          roomId: data.roomId,
          isRead: false,
        };

        setNotifications((prev) => [newNotification, ...prev]);
      }
    );

    // Listen for room status changes
    socket.on(
      "room_status_changed",
      (data: { roomId: string; roomTitle: string; status: string }) => {
        // Only notify for 'live' status
        if (data.status === "live") {
          const newNotification: Notification = {
            id: `socket-status-${data.roomId}-${Date.now()}`,
            type: "live",
            title: "Room Is Now Live",
            message: `"${data.roomTitle}" has just started!`,
            timestamp: new Date(),
            roomId: data.roomId,
            isRead: false,
          };

          setNotifications((prev) => [newNotification, ...prev]);
        }
      }
    );

    return () => {
      // Remove listeners when component unmounts
      socket.off("room_invitation");
      socket.off("room_status_changed");
    };
  }, [isAuthenticated, user]);

  // Generate notifications from room data
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }

    const newNotifications: Notification[] = [];

    // Add notifications for invites
    rooms.invites.forEach((room) => {
      newNotifications.push({
        id: `invite-${room._id}`,
        type: "invite",
        title: "Room Invitation",
        message: `You've been invited to join "${room.title}"`,
        timestamp: new Date(),
        roomId: room._id,
        isRead: false,
      });
    });

    // Add notifications for live rooms
    rooms.live.forEach((room) => {
      newNotifications.push({
        id: `live-${room._id}`,
        type: "live",
        title: "Room Is Live",
        message: `"${room.title}" is now live! Join the conversation.`,
        timestamp: new Date(),
        roomId: room._id,
        isRead: false,
      });
    });

    // Add notifications for upcoming rooms about to start (in the next hour)
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    rooms.upcoming.forEach((room) => {
      const roomStartTime = new Date(room.startTime);
      if (roomStartTime > now && roomStartTime < oneHourLater) {
        newNotifications.push({
          id: `upcoming-${room._id}`,
          type: "upcoming",
          title: "Room Starting Soon",
          message: `"${room.title}" will start in ${Math.round(
            (roomStartTime.getTime() - now.getTime()) / (60 * 1000)
          )} minutes`,
          timestamp: new Date(),
          roomId: room._id,
          isRead: false,
        });
      }
    });

    // Merge with existing notifications, preserving read status
    setNotifications((prev) => {
      const existingNotificationsMap = new Map(prev.map((n) => [n.id, n]));

      return newNotifications.map((notification) => {
        const existing = existingNotificationsMap.get(notification.id);
        return existing
          ? { ...notification, isRead: existing.isRead }
          : notification;
      });
    });
  }, [rooms, isAuthenticated]);

  // Mark a notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  };

  // Dismiss a notification
  const dismissNotification = (notificationId: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        totalUnread,
        markAsRead,
        markAllAsRead,
        dismissNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};
