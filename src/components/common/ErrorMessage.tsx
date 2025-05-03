import React from "react";
import { Alert, AlertTitle, Box } from "@mui/material";

interface ErrorMessageProps {
  message: string | null;
  title?: string;
  severity?: "error" | "warning" | "info" | "success";
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  title = "Error",
  severity = "error",
}) => {
  if (!message) return null;

  return (
    <Box sx={{ my: 2 }}>
      <Alert severity={severity}>
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
    </Box>
  );
};

export default ErrorMessage;
