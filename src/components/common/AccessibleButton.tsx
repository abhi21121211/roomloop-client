import React from "react";
import { Button, ButtonProps, styled, Tooltip } from "@mui/material";
import { useTheme } from "../../contexts/ThemeContext";

// Enhanced styled button with accessibility features
const AccessibleButtonRoot = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: "12px 24px",
  textTransform: "none",
  fontWeight: 600,
  fontSize: "0.95rem",
  letterSpacing: "0.5px",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",

  // Focus styles for keyboard navigation
  "&:focus-visible": {
    outline: `3px solid ${theme.palette.primary.main}`,
    outlineOffset: "2px",
    transform: "scale(1.02)",
  },

  // Hover effects
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 8px 25px rgba(0,0,0,0.4)"
        : "0 8px 25px rgba(0,0,0,0.15)",
  },

  // Active state
  "&:active": {
    transform: "translateY(0px)",
    transition: "transform 0.1s ease",
  },

  // Contained button styles
  "&.MuiButton-contained": {
    background:
      theme.palette.mode === "dark"
        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#ffffff",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 4px 15px rgba(0,0,0,0.3)"
        : "0 4px 15px rgba(0,0,0,0.1)",

    "&:hover": {
      background:
        theme.palette.mode === "dark"
          ? "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)"
          : "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
    },

    "&:disabled": {
      background:
        theme.palette.mode === "dark"
          ? "rgba(255,255,255,0.12)"
          : "rgba(0,0,0,0.12)",
      color:
        theme.palette.mode === "dark"
          ? "rgba(255,255,255,0.38)"
          : "rgba(0,0,0,0.38)",
    },
  },

  // Outlined button styles
  "&.MuiButton-outlined": {
    borderWidth: 2,
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,

    "&:hover": {
      borderWidth: 2,
      backgroundColor:
        theme.palette.mode === "dark"
          ? "rgba(255,255,255,0.08)"
          : "rgba(0,0,0,0.04)",
    },
  },

  // Text button styles
  "&.MuiButton-text": {
    color: theme.palette.primary.main,

    "&:hover": {
      backgroundColor:
        theme.palette.mode === "dark"
          ? "rgba(255,255,255,0.08)"
          : "rgba(0,0,0,0.04)",
    },
  },

  // Loading state
  "&.MuiButton-loading": {
    pointerEvents: "none",
    opacity: 0.7,
  },

  // Ripple effect
  "&::before": {
    content: '""',
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 0,
    height: 0,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.3)",
    transform: "translate(-50%, -50%)",
    transition: "width 0.6s, height 0.6s",
  },

  "&:active::before": {
    width: "300px",
    height: "300px",
  },
}));

// Enhanced button props interface
interface AccessibleButtonProps extends Omit<ButtonProps, "aria-label"> {
  ariaLabel?: string;
  tooltipText?: string;
  loading?: boolean;
  children: React.ReactNode;
}

const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  ariaLabel,
  tooltipText,
  loading = false,
  disabled,
  ...props
}) => {
  const { actualTheme } = useTheme();

  // Generate default aria-label if not provided
  const defaultAriaLabel = typeof children === "string" ? children : "Button";
  const finalAriaLabel = ariaLabel || defaultAriaLabel;

  // Handle loading state
  const isDisabled = disabled || loading;

  // Button content
  const buttonContent = (
    <AccessibleButtonRoot
      {...props}
      disabled={isDisabled}
      aria-label={finalAriaLabel}
      aria-busy={loading}
      aria-describedby={tooltipText ? `${finalAriaLabel}-tooltip` : undefined}
      className={loading ? "MuiButton-loading" : ""}
      // Enhanced keyboard navigation
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (props.onClick && !isDisabled) {
            props.onClick(e as any);
          }
        }
        // Call original onKeyDown if provided
        if (props.onKeyDown) {
          props.onKeyDown(e);
        }
      }}
    >
      {children}
    </AccessibleButtonRoot>
  );

  // Wrap with tooltip if tooltip text is provided
  if (tooltipText) {
    return (
      <Tooltip
        title={tooltipText}
        arrow
        placement="top"
        id={`${finalAriaLabel}-tooltip`}
        PopperProps={{
          sx: {
            "& .MuiTooltip-tooltip": {
              backgroundColor: actualTheme === "dark" ? "#333" : "#666",
              color: "#fff",
              fontSize: "0.875rem",
              padding: "8px 12px",
              borderRadius: "6px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            },
            "& .MuiTooltip-arrow": {
              color: actualTheme === "dark" ? "#333" : "#666",
            },
          },
        }}
      >
        {buttonContent}
      </Tooltip>
    );
  }

  return buttonContent;
};

export default AccessibleButton;
