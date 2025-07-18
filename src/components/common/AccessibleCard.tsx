import React from "react";
import {
  Card,
  CardProps,
  styled,
  CardContent,
  CardActions,
  CardMedia,
  Box,
  Chip,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useTheme } from "../../contexts/ThemeContext";

// Enhanced styled card with accessibility features
const AccessibleCardRoot = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  overflow: "hidden",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  cursor: "pointer",

  // Focus styles for keyboard navigation
  "&:focus-visible": {
    outline: `3px solid ${theme.palette.primary.main}`,
    outlineOffset: "4px",
    transform: "scale(1.02)",
  },

  // Hover effects
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 20px 40px rgba(0,0,0,0.4)"
        : "0 20px 40px rgba(0,0,0,0.15)",
  },

  // Active state
  "&:active": {
    transform: "translateY(-4px)",
    transition: "transform 0.1s ease",
  },

  // Default shadow
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 8px 20px rgba(0,0,0,0.3)"
      : "0 8px 20px rgba(0,0,0,0.08)",

  // Background with subtle gradient
  background:
    theme.palette.mode === "dark"
      ? "linear-gradient(145deg, #1e1e1e 0%, #2a2a2a 100%)"
      : "linear-gradient(145deg, #ffffff 0%, #fafafa 100%)",

  // Border
  border: `1px solid ${
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"
  }`,

  // Interactive elements
  "& .card-actions": {
    opacity: 0,
    transform: "translateY(10px)",
    transition: "all 0.3s ease",
  },

  "&:hover .card-actions": {
    opacity: 1,
    transform: "translateY(0)",
  },

  // Status indicators
  "& .status-indicator": {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
  },

  // Loading state
  "&.MuiCard-loading": {
    pointerEvents: "none",
    opacity: 0.7,
  },

  // Disabled state
  "&.MuiCard-disabled": {
    opacity: 0.5,
    cursor: "not-allowed",
    "&:hover": {
      transform: "none",
      boxShadow:
        theme.palette.mode === "dark"
          ? "0 8px 20px rgba(0,0,0,0.3)"
          : "0 8px 20px rgba(0,0,0,0.08)",
    },
  },
}));

// Enhanced card props interface
interface AccessibleCardProps extends Omit<CardProps, "aria-label"> {
  ariaLabel?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  status?: "online" | "offline" | "busy" | "away";
  tags?: string[];
  actions?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  children?: React.ReactNode;
}

const AccessibleCard: React.FC<AccessibleCardProps> = ({
  ariaLabel,
  title,
  subtitle,
  description,
  image,
  imageAlt,
  status,
  tags = [],
  actions,
  loading = false,
  disabled = false,
  onClick,
  onKeyDown,
  children,
  ...props
}) => {
  const { actualTheme } = useTheme();

  // Generate default aria-label if not provided
  const defaultAriaLabel = title || "Card";
  const finalAriaLabel = ariaLabel || defaultAriaLabel;

  // Handle loading and disabled states
  const isDisabled = disabled || loading;

  // Status color mapping
  const statusColors = {
    online: "#4caf50",
    offline: "#9e9e9e",
    busy: "#f44336",
    away: "#ff9800",
  };

  // Card content
  const cardContent = (
    <AccessibleCardRoot
      {...props}
      className={`${loading ? "MuiCard-loading" : ""} ${
        isDisabled ? "MuiCard-disabled" : ""
      }`}
      onClick={!isDisabled ? onClick : undefined}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (onClick && !isDisabled) {
            onClick();
          }
        }
        if (onKeyDown) {
          onKeyDown(e);
        }
      }}
      tabIndex={!isDisabled ? 0 : -1}
      role={onClick ? "button" : undefined}
      aria-label={finalAriaLabel}
      aria-disabled={isDisabled}
      aria-busy={loading}
      sx={{
        ...props.sx,
        // Custom styles based on props
        ...(onClick && {
          cursor: isDisabled ? "not-allowed" : "pointer",
        }),
      }}
    >
      {/* Status indicator */}
      {status && (
        <Box
          className="status-indicator"
          sx={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: statusColors[status],
            border: `2px solid ${
              actualTheme === "dark" ? "#1e1e1e" : "#ffffff"
            }`,
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
          aria-label={`Status: ${status}`}
        />
      )}

      {/* Card media */}
      {image && (
        <CardMedia
          component="img"
          height="200"
          image={image}
          alt={imageAlt || `${finalAriaLabel} image`}
          sx={{
            objectFit: "cover",
            transition: "transform 0.3s ease",
            "&:hover": {
              transform: "scale(1.05)",
            },
          }}
        />
      )}

      {/* Card content */}
      {(title || subtitle || description || tags.length > 0) && (
        <CardContent sx={{ p: 3 }}>
          {/* Title */}
          {title && (
            <Typography
              variant="h6"
              component="h3"
              gutterBottom
              sx={{
                fontWeight: 600,
                fontSize: "1.25rem",
                lineHeight: 1.3,
                color: "text.primary",
              }}
            >
              {title}
            </Typography>
          )}

          {/* Subtitle */}
          {subtitle && (
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{
                fontSize: "0.9rem",
                fontWeight: 500,
                mb: 1,
              }}
            >
              {subtitle}
            </Typography>
          )}

          {/* Description */}
          {description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                lineHeight: 1.6,
                mb: tags.length > 0 ? 2 : 0,
              }}
            >
              {description}
            </Typography>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: "0.75rem",
                    height: 24,
                    "& .MuiChip-label": {
                      px: 1,
                    },
                  }}
                />
              ))}
            </Box>
          )}
        </CardContent>
      )}

      {/* Custom children content */}
      {children}

      {/* Card actions */}
      {actions && (
        <CardActions
          className="card-actions"
          sx={{
            p: 2,
            pt: 0,
            justifyContent: "flex-end",
            gap: 1,
          }}
        >
          {actions}
        </CardActions>
      )}
    </AccessibleCardRoot>
  );

  return cardContent;
};

export default AccessibleCard;
