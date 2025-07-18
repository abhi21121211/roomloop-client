import React from "react";
import {
  Skeleton,
  SkeletonProps,
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import { useTheme } from "../../contexts/ThemeContext";
import { styled } from "@mui/material/styles";

// Enhanced skeleton with theme-aware styling
const EnhancedSkeleton = styled(Skeleton)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(255,255,255,0.08)"
      : "rgba(0,0,0,0.08)",
  "&::after": {
    background:
      theme.palette.mode === "dark"
        ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)"
        : "linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent)",
  },
}));

// Skeleton types
type SkeletonType =
  | "text"
  | "circular"
  | "rectangular"
  | "card"
  | "list-item"
  | "room-card"
  | "message"
  | "profile";

// Enhanced skeleton props interface
interface LoadingSkeletonProps extends Omit<SkeletonProps, "variant"> {
  type?: SkeletonType;
  lines?: number;
  height?: number | string;
  width?: number | string;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showDescription?: boolean;
  showTags?: boolean;
  showActions?: boolean;
  count?: number;
  spacing?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = "text",
  lines = 3,
  height,
  width,
  showTitle = true,
  showSubtitle = true,
  showDescription = true,
  showTags = true,
  showActions = true,
  count = 1,
  spacing = 2,
  ...props
}) => {
  const { actualTheme } = useTheme();

  // Text skeleton with multiple lines
  const renderTextSkeleton = () => (
    <Box>
      {Array.from({ length: lines }).map((_, index) => (
        <EnhancedSkeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? "60%" : "100%"}
          height={20}
          sx={{ mb: index < lines - 1 ? 1 : 0 }}
          {...props}
        />
      ))}
    </Box>
  );

  // Card skeleton
  const renderCardSkeleton = () => (
    <Card
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        boxShadow:
          actualTheme === "dark"
            ? "0 4px 12px rgba(0,0,0,0.3)"
            : "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      {/* Card media skeleton */}
      <EnhancedSkeleton
        variant="rectangular"
        height={200}
        width="100%"
        {...props}
      />

      <CardContent sx={{ p: 3 }}>
        {/* Title skeleton */}
        {showTitle && (
          <EnhancedSkeleton
            variant="text"
            width="80%"
            height={28}
            sx={{ mb: 1 }}
            {...props}
          />
        )}

        {/* Subtitle skeleton */}
        {showSubtitle && (
          <EnhancedSkeleton
            variant="text"
            width="60%"
            height={20}
            sx={{ mb: 2 }}
            {...props}
          />
        )}

        {/* Description skeleton */}
        {showDescription && (
          <Box sx={{ mb: 2 }}>
            <EnhancedSkeleton
              variant="text"
              width="100%"
              height={16}
              sx={{ mb: 0.5 }}
              {...props}
            />
            <EnhancedSkeleton
              variant="text"
              width="90%"
              height={16}
              sx={{ mb: 0.5 }}
              {...props}
            />
            <EnhancedSkeleton
              variant="text"
              width="70%"
              height={16}
              {...props}
            />
          </Box>
        )}

        {/* Tags skeleton */}
        {showTags && (
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <EnhancedSkeleton
              variant="rectangular"
              width={60}
              height={24}
              sx={{ borderRadius: 1 }}
              {...props}
            />
            <EnhancedSkeleton
              variant="rectangular"
              width={80}
              height={24}
              sx={{ borderRadius: 1 }}
              {...props}
            />
            <EnhancedSkeleton
              variant="rectangular"
              width={50}
              height={24}
              sx={{ borderRadius: 1 }}
              {...props}
            />
          </Box>
        )}

        {/* Actions skeleton */}
        {showActions && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <EnhancedSkeleton
              variant="rectangular"
              width={80}
              height={36}
              sx={{ borderRadius: 2 }}
              {...props}
            />
            <EnhancedSkeleton
              variant="rectangular"
              width={100}
              height={36}
              sx={{ borderRadius: 2 }}
              {...props}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );

  // Room card skeleton
  const renderRoomCardSkeleton = () => (
    <Card
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        boxShadow:
          actualTheme === "dark"
            ? "0 4px 12px rgba(0,0,0,0.3)"
            : "0 4px 12px rgba(0,0,0,0.1)",
        position: "relative",
      }}
    >
      {/* Status indicator skeleton */}
      <Box
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 1,
        }}
      >
        <EnhancedSkeleton
          variant="circular"
          width={12}
          height={12}
          {...props}
        />
      </Box>

      {/* Room image skeleton */}
      <EnhancedSkeleton
        variant="rectangular"
        height={160}
        width="100%"
        {...props}
      />

      <CardContent sx={{ p: 2.5 }}>
        {/* Room title */}
        <EnhancedSkeleton
          variant="text"
          width="85%"
          height={24}
          sx={{ mb: 1 }}
          {...props}
        />

        {/* Room description */}
        <Box sx={{ mb: 2 }}>
          <EnhancedSkeleton
            variant="text"
            width="100%"
            height={16}
            sx={{ mb: 0.5 }}
            {...props}
          />
          <EnhancedSkeleton variant="text" width="75%" height={16} {...props} />
        </Box>

        {/* Room stats */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <EnhancedSkeleton variant="text" width={60} height={16} {...props} />
          <EnhancedSkeleton variant="text" width={80} height={16} {...props} />
        </Box>

        {/* Join button */}
        <EnhancedSkeleton
          variant="rectangular"
          width="100%"
          height={40}
          sx={{ borderRadius: 2 }}
          {...props}
        />
      </CardContent>
    </Card>
  );

  // List item skeleton
  const renderListItemSkeleton = () => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2 }}>
      <EnhancedSkeleton variant="circular" width={48} height={48} {...props} />
      <Box sx={{ flex: 1 }}>
        <EnhancedSkeleton
          variant="text"
          width="60%"
          height={20}
          sx={{ mb: 0.5 }}
          {...props}
        />
        <EnhancedSkeleton variant="text" width="40%" height={16} {...props} />
      </Box>
      <EnhancedSkeleton
        variant="rectangular"
        width={80}
        height={32}
        sx={{ borderRadius: 2 }}
        {...props}
      />
    </Box>
  );

  // Message skeleton
  const renderMessageSkeleton = () => (
    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
      <EnhancedSkeleton variant="circular" width={40} height={40} {...props} />
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <EnhancedSkeleton variant="text" width={100} height={16} {...props} />
          <EnhancedSkeleton variant="text" width={60} height={14} {...props} />
        </Box>
        <EnhancedSkeleton
          variant="text"
          width="90%"
          height={16}
          sx={{ mb: 0.5 }}
          {...props}
        />
        <EnhancedSkeleton variant="text" width="70%" height={16} {...props} />
      </Box>
    </Box>
  );

  // Profile skeleton
  const renderProfileSkeleton = () => (
    <Box sx={{ textAlign: "center", p: 3 }}>
      <EnhancedSkeleton
        variant="circular"
        width={120}
        height={120}
        sx={{ mx: "auto", mb: 2 }}
        {...props}
      />
      <EnhancedSkeleton
        variant="text"
        width="60%"
        height={28}
        sx={{ mx: "auto", mb: 1 }}
        {...props}
      />
      <EnhancedSkeleton
        variant="text"
        width="40%"
        height={20}
        sx={{ mx: "auto", mb: 2 }}
        {...props}
      />
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
        <EnhancedSkeleton
          variant="rectangular"
          width={100}
          height={36}
          sx={{ borderRadius: 2 }}
          {...props}
        />
        <EnhancedSkeleton
          variant="rectangular"
          width={100}
          height={36}
          sx={{ borderRadius: 2 }}
          {...props}
        />
      </Box>
    </Box>
  );

  // Render based on type
  const renderSkeleton = () => {
    switch (type) {
      case "text":
        return renderTextSkeleton();
      case "card":
        return renderCardSkeleton();
      case "room-card":
        return renderRoomCardSkeleton();
      case "list-item":
        return renderListItemSkeleton();
      case "message":
        return renderMessageSkeleton();
      case "profile":
        return renderProfileSkeleton();
      case "circular":
        return (
          <EnhancedSkeleton
            variant="circular"
            width={width || 40}
            height={height || 40}
            {...props}
          />
        );
      case "rectangular":
        return (
          <EnhancedSkeleton
            variant="rectangular"
            width={width || "100%"}
            height={height || 200}
            {...props}
          />
        );
      default:
        return (
          <EnhancedSkeleton
            variant="text"
            width={width || "100%"}
            height={height || 20}
            {...props}
          />
        );
    }
  };

  // Render multiple skeletons if count > 1
  if (count > 1) {
    return (
      <Grid container spacing={spacing}>
        {Array.from({ length: count }).map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            {renderSkeleton()}
          </Grid>
        ))}
      </Grid>
    );
  }

  return renderSkeleton();
};

export default LoadingSkeleton;
