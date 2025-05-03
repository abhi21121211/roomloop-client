import React from "react";
import {
  Box,
  Typography,
  Paper,
  useTheme,
  alpha,
  Alert,
  AlertTitle,
} from "@mui/material";
import { ErrorOutline as ErrorIcon } from "@mui/icons-material";

interface ErrorMessageProps {
  message: string | null;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  const theme = useTheme();

  if (!message) return null;

  return (
    <Alert
      severity="error"
      icon={<ErrorIcon fontSize="inherit" />}
      sx={{
        mb: 3,
        borderRadius: 2,
        backgroundColor: alpha(theme.palette.error.main, 0.12),
        border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
        "& .MuiAlert-icon": {
          color: theme.palette.error.main,
          opacity: 0.9,
          fontSize: "1.5rem",
        },
        color:
          theme.palette.mode === "dark"
            ? theme.palette.error.light
            : theme.palette.error.dark,
        boxShadow: `0 2px 8px ${alpha(theme.palette.error.main, 0.15)}`,
        fontWeight: 500,
      }}
    >
      <AlertTitle sx={{ fontWeight: "bold", fontSize: "1rem" }}>
        Error
      </AlertTitle>
      {message}
    </Alert>
  );
};

export default ErrorMessage;
